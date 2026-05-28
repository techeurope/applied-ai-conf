import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { tryAutoLink } from "./ticket";

// WorkOS AuthKit signup leaks "ghost" unverified user records: a user enters
// email + password, AuthKit creates the user with email_verified=false, then
// the verification-code step is never completed (email delayed/lost, tab
// closed, whatever). When that same person retries signup, AuthKit sees the
// existing record and rejects with "email not available", trapping them.
//
// This action sweeps every WorkOS user, finds records older than 5 minutes
// that are still email_verified=false and have never signed in, deletes
// them, and creates an Invitation. WorkOS emails an "accept invitation"
// link (valid 7 days) — the user clicks, sets a password, gets in.
//
// Scheduled by `crons.ts` every 5 min. Also safe to invoke manually:
//   npx convex run --prod workos_recovery:sweepUnverified
//
// Each email is recorded in `workosRecoveryLog` so we never send a second
// invitation for the same address unless MAX_ATTEMPTS allows it (covers the
// case where someone retried signup after the first invite expired).

const WORKOS_API_BASE = "https://api.workos.com";
const MIN_AGE_MS = 5 * 60 * 1000; // give legit signups 5 min to verify
const MAX_ATTEMPTS = 1; // each email gets exactly one recovery invite, ever.
// Subsequent stuck retries (after 7-day invite expiry) need manual handling.

type WorkOSUser = {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string | null;
};

type WorkOSInvite = {
  id: string;
  state: string;
  email: string;
};

async function wos<T>(
  method: string,
  path: string,
  key: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data?: T; text?: string }> {
  const res = await fetch(`${WORKOS_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    return { ok: false, status: res.status, text: await res.text() };
  }
  const text = await res.text();
  return {
    ok: true,
    status: res.status,
    data: text ? (JSON.parse(text) as T) : undefined,
  };
}

// --- Convex-side log read/write helpers --------------------------------------

export const getLog = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("workosRecoveryLog")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const recordInvite = internalMutation({
  args: { email: v.string(), invitationId: v.optional(v.string()) },
  handler: async (ctx, { email, invitationId }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("workosRecoveryLog")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        attempts: existing.attempts + 1,
        lastInvitedAt: now,
        lastInvitationId: invitationId,
      });
    } else {
      await ctx.db.insert("workosRecoveryLog", {
        email,
        attempts: 1,
        firstInvitedAt: now,
        lastInvitedAt: now,
        lastInvitationId: invitationId,
      });
    }
  },
});

// --- the sweep ---------------------------------------------------------------

export const sweepUnverified = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    scanned: number;
    candidates: number;
    recovered: number;
    skippedPending: number;
    skippedTooNew: number;
    skippedAlreadyInvited: number;
    skippedMaxAttempts: number;
    errors: string[];
  }> => {
    const key = process.env.WORKOS_API_KEY;
    if (!key) {
      throw new Error("WORKOS_API_KEY not set on this Convex deployment");
    }
    const errors: string[] = [];
    const cutoff = Date.now() - MIN_AGE_MS;

    // 1. Paginate all users and find unverified, never-signed-in records.
    let scanned = 0;
    let skippedTooNew = 0;
    const candidates: WorkOSUser[] = [];
    let after: string | null = null;
    while (true) {
      const qs = new URLSearchParams({ limit: "100" });
      if (after) qs.set("after", after);
      const list = await wos<{
        data: WorkOSUser[];
        list_metadata?: { after?: string | null };
      }>("GET", `/user_management/users?${qs}`, key);
      if (!list.ok || !list.data) {
        errors.push(`list users ${list.status}: ${list.text ?? ""}`);
        break;
      }
      for (const u of list.data.data) {
        scanned++;
        if (u.email_verified) continue;
        if (u.last_sign_in_at) continue;
        const created = Date.parse(u.created_at);
        if (!Number.isFinite(created)) continue;
        if (created > cutoff) {
          skippedTooNew++;
          continue;
        }
        candidates.push(u);
      }
      after = list.data.list_metadata?.after ?? null;
      if (!after) break;
    }

    // 2. For each candidate: check our own log + pending invite, then
    //    delete + invite if both are clear.
    let recovered = 0;
    let skippedPending = 0;
    let skippedAlreadyInvited = 0;
    let skippedMaxAttempts = 0;
    for (const u of candidates) {
      // a) our own log — primary dedupe
      const log = await ctx.runQuery(internal.workos_recovery.getLog, {
        email: u.email,
      });
      if (log) {
        if (log.attempts >= MAX_ATTEMPTS) {
          skippedMaxAttempts++;
          continue;
        }
        // Already invited at least once. We only re-invite if the WorkOS
        // invitation is no longer pending (expired/revoked) AND a fresh ghost
        // record has appeared since (which is why we're here — they retried).
        // The pending-invite check below covers the "still pending" case.
        skippedAlreadyInvited++;
        continue;
      }

      // b) pending WorkOS invite — secondary dedupe (covers invites created
      //    out-of-band before we started logging)
      const invList = await wos<{ data: WorkOSInvite[] }>(
        "GET",
        `/user_management/invitations?email=${encodeURIComponent(u.email)}`,
        key,
      );
      const pending =
        invList.ok && invList.data
          ? invList.data.data.find((i) => i.state === "pending")
          : null;
      if (pending) {
        // Mirror into our log so future sweeps skip via the cheap path.
        await ctx.runMutation(internal.workos_recovery.recordInvite, {
          email: u.email,
          invitationId: pending.id,
        });
        skippedPending++;
        continue;
      }

      // c) clean: delete ghost + send invite
      const del = await wos("DELETE", `/user_management/users/${u.id}`, key);
      if (!del.ok && del.status !== 404) {
        errors.push(`delete ${u.email} ${del.status}: ${del.text ?? ""}`);
        continue;
      }
      const inv = await wos<{
        id: string;
        accept_invitation_url: string;
      }>("POST", "/user_management/invitations", key, { email: u.email });
      if (!inv.ok || !inv.data) {
        errors.push(`invite ${u.email} ${inv.status}: ${inv.text ?? ""}`);
        continue;
      }
      await ctx.runMutation(internal.workos_recovery.recordInvite, {
        email: u.email,
        invitationId: inv.data.id,
      });
      recovered++;
    }

    const summary = {
      scanned,
      candidates: candidates.length,
      recovered,
      skippedPending,
      skippedTooNew,
      skippedAlreadyInvited,
      skippedMaxAttempts,
      errors,
    };
    console.log("[workos_recovery] sweep complete", summary);
    return summary;
  },
});

// --- admin rescue: create a Convex user row from WorkOS data ----------------
// When a user authenticates via WorkOS but the AppShell's silent ensureFromWorkos
// call fails (caught + swallowed), they exist in WorkOS but not in Convex and
// can't use the app. This bootstraps the row from a known workosUserId so the
// next sign-in patches it normally.
export const bootstrapConvexUserFromWorkos = internalMutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { workosUserId, email, name }) => {
    const normalized = email.toLowerCase().trim();
    const byWorkos = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (byWorkos) return { ok: false, reason: "already exists by workos_id", id: byWorkos._id };
    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (byEmail) return { ok: false, reason: "email collision", id: byEmail._id };
    // Generate a unique publicToken
    let token = "";
    for (let i = 0; i < 10; i++) {
      const candidate = "aac_" + Math.random().toString(36).slice(2, 10);
      const clash = await ctx.db
        .query("users")
        .withIndex("by_public_token", (q) => q.eq("publicToken", candidate))
        .first();
      if (!clash) {
        token = candidate;
        break;
      }
    }
    if (!token) throw new Error("could not allocate publicToken");
    const id = await ctx.db.insert("users", {
      email: normalized,
      workosUserId,
      name: name || normalized,
      onboardingRequired: true,
      isSpeaker: false,
      publicToken: token,
    });
    return { ok: true, id };
  },
});

// Sweep #2: find WorkOS users who have signed in but have NO Convex user row.
// These are people whose AuthKit flow completed (verified + last_sign_in_at set
// in WorkOS) but where AppShell's ensureFromWorkos call failed silently
// (caught + swallowed) — e.g. a sub-mutation in tryAutoLink/consumeInvite
// threw, rolling back the user-insert. Without this they're permanently
// locked out: signed in, but no Convex profile, no /app access.
//
// Scheduled by `crons.ts` alongside sweepUnverified.
export const sweepMissingConvexUsers = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    workosSignedIn: number;
    bootstrapped: number;
    errors: string[];
  }> => {
    const key = process.env.WORKOS_API_KEY;
    if (!key) throw new Error("WORKOS_API_KEY not set on this Convex deployment");
    const errors: string[] = [];

    // Pull every WorkOS user who has signed in.
    const wsUsers: Array<{ id: string; email: string; firstName?: string; lastName?: string }> = [];
    let after: string | null = null;
    while (true) {
      const qs = new URLSearchParams({ limit: "100" });
      if (after) qs.set("after", after);
      const list = await wos<{
        data: Array<{
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          last_sign_in_at: string | null;
        }>;
        list_metadata?: { after?: string | null };
      }>("GET", `/user_management/users?${qs}`, key);
      if (!list.ok || !list.data) {
        errors.push(`list users ${list.status}: ${list.text ?? ""}`);
        break;
      }
      for (const u of list.data.data) {
        if (!u.last_sign_in_at) continue;
        wsUsers.push({
          id: u.id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
        });
      }
      after = list.data.list_metadata?.after ?? null;
      if (!after) break;
    }

    let bootstrapped = 0;
    for (const u of wsUsers) {
      const exists = await ctx.runQuery(
        internal.workos_recovery.convexUserExistsByWorkosId,
        { workosUserId: u.id },
      );
      if (exists) continue;
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
      try {
        const r = await ctx.runMutation(
          internal.workos_recovery.bootstrapConvexUserFromWorkos,
          { workosUserId: u.id, email: u.email, name: name || undefined },
        );
        if (r.ok) bootstrapped++;
        else errors.push(`bootstrap ${u.email}: ${r.reason}`);
      } catch (e) {
        errors.push(`bootstrap ${u.email}: ${String(e).slice(0, 200)}`);
      }
    }

    const summary = { workosSignedIn: wsUsers.length, bootstrapped, errors };
    console.log("[workos_recovery] sweepMissingConvexUsers", summary);
    return summary;
  },
});

export const convexUserExistsByWorkosId = internalQuery({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", workosUserId))
      .first();
    return !!u && !u.deletedAt;
  },
});

// Admin auto-link by email. Calls the same tryAutoLink that ensureFromWorkos
// uses, but in its own mutation so a throw shows up here instead of being
// silently swallowed by AppShell's catch. Returns the link row on success or
// a structured failure so the caller can see why.
export const adminLinkByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) return { ok: false, reason: "no convex user" as const };
    if (user.deletedAt) return { ok: false, reason: "user deleted" as const };
    if (user.ticketLinkedAt)
      return {
        ok: true,
        already: true,
        lumaGuestId: user.lumaGuestId,
      };
    const link = await tryAutoLink(ctx, user);
    if (!link) {
      // Surface why tryAutoLink declined (vs threw). Mirrors its early-return
      // branches: no email, claimed by another user, not approved, etc.
      const luma = await ctx.db
        .query("lumaAttendees")
        .withIndex("by_email", (q) => q.eq("email", normalized))
        .first();
      if (!luma) return { ok: false, reason: "no luma row for this email" as const };
      if (luma.approvalStatus !== "approved")
        return {
          ok: false,
          reason: `luma status=${luma.approvalStatus}` as const,
        };
      const claimed = await ctx.db
        .query("ticketLinks")
        .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", luma.lumaGuestId))
        .first();
      if (claimed && claimed.userId !== user._id) {
        return { ok: false, reason: "luma ticket already linked to another user" as const };
      }
      return { ok: false, reason: "unknown" as const };
    }
    return { ok: true, lumaGuestId: link.lumaGuestId };
  },
});

// Sweep #3: find Convex users with approved Luma tickets but no ticket link,
// and auto-link them. Catches the case where tryAutoLink couldn't fire during
// ensureFromWorkos (e.g. Luma cache hadn't synced the new approval yet) or
// where my bootstrap created a row without linking. Runs every 5 min.
export const sweepUnlinkedWithApprovedTicket = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    scanned: number;
    linked: number;
    skippedNoLumaRow: number;
    skippedNotApproved: number;
    skippedConflict: number;
    errors: string[];
  }> => {
    const r = await ctx.runMutation(
      internal.workos_recovery.sweepUnlinkedWithApprovedTicketInner,
      {},
    );
    console.log("[workos_recovery] sweepUnlinkedWithApprovedTicket", r);
    return r;
  },
});

export const sweepUnlinkedWithApprovedTicketInner = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const candidates = users.filter(
      (u) =>
        !u.deletedAt &&
        !u.ticketLinkedAt &&
        u.accessLevel !== "admin" &&
        !!u.email,
    );
    let linked = 0,
      skippedNoLumaRow = 0,
      skippedNotApproved = 0,
      skippedConflict = 0;
    const errors: string[] = [];
    for (const u of candidates) {
      const luma = await ctx.db
        .query("lumaAttendees")
        .withIndex("by_email", (q) => q.eq("email", u.email))
        .first();
      if (!luma) {
        skippedNoLumaRow++;
        continue;
      }
      if (luma.approvalStatus !== "approved") {
        skippedNotApproved++;
        continue;
      }
      const claimed = await ctx.db
        .query("ticketLinks")
        .withIndex("by_luma_guest_id", (q) =>
          q.eq("lumaGuestId", luma.lumaGuestId),
        )
        .first();
      if (claimed && claimed.userId !== u._id) {
        skippedConflict++;
        continue;
      }
      try {
        await tryAutoLink(ctx, u);
        linked++;
      } catch (e) {
        errors.push(`${u.email}: ${String(e).slice(0, 200)}`);
      }
    }
    return {
      scanned: candidates.length,
      linked,
      skippedNoLumaRow,
      skippedNotApproved,
      skippedConflict,
      errors,
    };
  },
});

// --- one-time backfill -------------------------------------------------------

// Record the 11 emails I already invited manually today (2026-05-28) so the
// first cron run doesn't re-invite them. Safe to run multiple times — the
// recordInvite mutation upserts.
export const backfillTodaysInvites = internalAction({
  args: {},
  handler: async (ctx): Promise<{ recorded: number }> => {
    const emails = [
      // 11 emails I already invited manually today (2026-05-28)
      "jakobstein.js@gmail.com",
      "michellef137@gmail.com",
      "jakob.vonlindern@zeit.de",
      "robert.durichen@arcturisdata.com",
      "tatsiana.mazouka@onethousand.ai",
      "tejaswini995@gmail.com",
      "abdallah.dorra@gmail.com",
      "pragati.shaw@wuerth.com",
      "spandan.chowdhury@wuerth.com",
      "philipp.riedi@cubeserv.com",
      "tomasz.pronobis@dkb.de",
      // Tim's signup test — exclude from auto-recovery forever
      "timpietrusky+asdf@gmail.com",
      // Permanent typo (gmai.com, missing 'l') — would bounce on every send
      "abuzinskiy@gmai.com",
    ];
    for (const email of emails) {
      await ctx.runMutation(internal.workos_recovery.recordInvite, { email });
    }
    return { recorded: emails.length };
  },
});
