import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { generatePublicToken } from "./_tokens";
import { performTransfer } from "./ticket";

const ADMIN_ACTIONS = {
  grantAdmin: "admin.grant",
  revokeAdmin: "admin.revoke",
  deactivateUser: "user.deactivate",
  reactivateUser: "user.reactivate",
  updateUser: "user.update",
  resetOnboarding: "user.reset_onboarding",
  createClaimCode: "claim_code.create",
  revokeClaimCode: "claim_code.revoke",
  redeemClaimCode: "claim_code.redeem",
} as const;

async function requireSelf(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  if (user.deactivatedAt) throw new Error("Account deactivated");
  return user;
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await requireSelf(ctx);
  if (user.accessLevel !== "admin") throw new Error("Admin only");
  return user;
}

async function writeAudit(
  ctx: MutationCtx,
  actor: Doc<"users">,
  action: string,
  targetUserId?: Id<"users">,
  targetClaimCodeId?: Id<"claimCodes">,
  metadata?: Record<string, unknown>,
) {
  await ctx.db.insert("auditLog", {
    actorUserId: actor._id,
    action,
    targetUserId,
    targetClaimCodeId,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
    createdAt: Date.now(),
  });
}

// --- bootstrap (script-only, via `npx convex run`) -------------------------

export const bootstrapGrantByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) throw new Error(`No user with email ${normalized}`);
    await ctx.db.patch(user._id, { accessLevel: "admin" });
    return { userId: user._id, email: normalized };
  },
});

// Bootstrap a specific access level (admin / member / vendor) for a user.
// Used to grant vendor accessLevel to lunch-table operators ahead of the event
// without needing a UI for it.
export const bootstrapSetAccessLevel = internalMutation({
  args: {
    email: v.string(),
    accessLevel: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("vendor"),
    ),
  },
  handler: async (ctx, { email, accessLevel }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) throw new Error(`No user with email ${normalized}`);
    await ctx.db.patch(user._id, { accessLevel });
    return { userId: user._id, email: normalized, accessLevel };
  },
});

// Mint a claim code from CLI without needing admin auth. Used to provision a
// code for a non-Luma test account so we can exercise the /app/link-ticket
// flow. The first existing admin is used as the audit actor.
export const bootstrapCreateClaimCode = internalMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    kind: v.optional(
      v.union(
        v.literal("speaker"),
        v.literal("walkin"),
        v.literal("guest"),
        v.literal("staff"),
      ),
    ),
    note: v.optional(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_access_level", (q) => q.eq("accessLevel", "admin"))
      .first();
    if (!admin) throw new Error("No admin user exists yet.");
    const normalizedEmail = args.email.toLowerCase().trim();
    const pendingId = await ctx.db.insert("pendingAttendees", {
      email: normalizedEmail,
      name: args.name,
      kind: args.kind ?? "guest",
      note: args.note,
      createdByUserId: admin._id,
      createdAt: Date.now(),
    });
    // 8-char alphanumeric, ambiguous chars skipped.
    const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const make = () => {
      const b = new Uint8Array(8);
      crypto.getRandomValues(b);
      let out = "";
      for (let i = 0; i < 8; i++) out += ALPHABET[b[i] % ALPHABET.length];
      return out;
    };
    let code = make();
    for (let i = 0; i < 5; i++) {
      const clash = await ctx.db
        .query("claimCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!clash) break;
      code = make();
    }
    const codeId = await ctx.db.insert("claimCodes", {
      code,
      pendingAttendeeId: pendingId,
      createdByUserId: admin._id,
      createdAt: Date.now(),
      expiresAt: args.expiresInDays
        ? Date.now() + args.expiresInDays * 86_400_000
        : undefined,
    });
    return { code, codeId, pendingAttendeeId: pendingId };
  },
});

// Promote a freshly-created user to admin if there's an unconsumed
// `adminInvites` row matching their email. Called from ensureFromWorkos
// after every sign-in.
export async function consumeAdminInviteIfAny(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<void> {
  if (!user.email) return;
  if (user.accessLevel === "admin") return;
  const invite = await ctx.db
    .query("adminInvites")
    .withIndex("by_email", (q) => q.eq("email", user.email))
    .filter((q) => q.eq(q.field("consumedAt"), undefined))
    .first();
  if (!invite) return;
  await ctx.db.patch(user._id, { accessLevel: "admin" });
  await ctx.db.patch(invite._id, {
    consumedAt: Date.now(),
    consumedByUserId: user._id,
  });
  await ctx.db.insert("auditLog", {
    actorUserId: user._id,
    action: ADMIN_ACTIONS.grantAdmin,
    targetUserId: user._id,
    metadata: JSON.stringify({ via: "admin_invite", inviteId: invite._id }),
    createdAt: Date.now(),
  });
}

// Queue an admin grant by email. If the user already exists, promotes
// immediately and skips the invite row. Returns the state so the caller
// can decide whether to fire an email (always — even for immediate
// promotions, since the recipient may not realise yet).
export const bootstrapQueueAdminInvite = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    if (!normalized) throw new Error("Empty email");
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) {
      if (existing.accessLevel !== "admin") {
        await ctx.db.patch(existing._id, { accessLevel: "admin" });
        await ctx.db.insert("auditLog", {
          actorUserId: existing._id,
          action: ADMIN_ACTIONS.grantAdmin,
          targetUserId: existing._id,
          metadata: JSON.stringify({ via: "bootstrap_queue_immediate" }),
          createdAt: Date.now(),
        });
      }
      return {
        outcome: "granted_existing_user" as const,
        email: normalized,
        userId: existing._id,
      };
    }
    // Skip if already queued.
    const dup = await ctx.db
      .query("adminInvites")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .filter((q) => q.eq(q.field("consumedAt"), undefined))
      .first();
    if (dup) {
      return { outcome: "already_queued" as const, email: normalized, inviteId: dup._id };
    }
    const inviteId = await ctx.db.insert("adminInvites", {
      email: normalized,
      createdAt: Date.now(),
    });
    return { outcome: "queued" as const, email: normalized, inviteId };
  },
});

const ADMIN_INVITE_REVOKE_ACTION = "admin.invite_revoke";

// Pull an unclaimed invite (e.g. typo). No-op if already consumed.
export const bootstrapRevokeAdminInvite = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const rows = await ctx.db
      .query("adminInvites")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .filter((q) => q.eq(q.field("consumedAt"), undefined))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
    return { removed: rows.length };
  },
});

void ADMIN_INVITE_REVOKE_ACTION;

export const bootstrapRevokeByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) throw new Error(`No user with email ${normalized}`);
    await ctx.db.patch(user._id, { accessLevel: "member" });
    return { userId: user._id, email: normalized };
  },
});

export const listAdminsBootstrap = internalQuery({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .withIndex("by_access_level", (q) => q.eq("accessLevel", "admin"))
      .collect();
    return admins.map((a) => ({ _id: a._id, email: a.email, name: a.name }));
  },
});

export const purgeStagingArtifacts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const removed = { users: 0, ticketLinks: 0, contacts: 0, codes: 0, pending: 0 };
    // Orphan staging user.
    const orphan = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", "user_01KRVWC1FQMF5JNK21MHEA0865"))
      .first();
    if (orphan) {
      const link = await ctx.db
        .query("ticketLinks")
        .withIndex("by_user", (q) => q.eq("userId", orphan._id))
        .first();
      if (link) {
        await ctx.db.delete(link._id);
        removed.ticketLinks += 1;
      }
      const contacts = await ctx.db
        .query("contacts")
        .withIndex("by_contacted", (q) => q.eq("contactedUserId", orphan._id))
        .collect();
      for (const c of contacts) {
        await ctx.db.delete(c._id);
        removed.contacts += 1;
      }
      await ctx.db.delete(orphan._id);
      removed.users += 1;
    }
    // Test pending attendee + linked code.
    const testPending = await ctx.db
      .query("pendingAttendees")
      .withIndex("by_email", (q) => q.eq("email", "anna.speaker@example.com"))
      .collect();
    for (const p of testPending) {
      const codes = await ctx.db
        .query("claimCodes")
        .withIndex("by_pending_attendee", (q) => q.eq("pendingAttendeeId", p._id))
        .collect();
      for (const c of codes) {
        await ctx.db.delete(c._id);
        removed.codes += 1;
      }
      await ctx.db.delete(p._id);
      removed.pending += 1;
    }
    return removed;
  },
});

export const bootstrapGrantByWorkosUserId = internalMutation({
  args: { workosUserId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, { workosUserId, email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (!user) throw new Error(`No user with workosUserId ${workosUserId}`);
    const patch: Record<string, unknown> = { accessLevel: "admin" };
    if (email && (!user.email || user.email !== email.toLowerCase())) {
      patch.email = email.toLowerCase().trim();
    }
    await ctx.db.patch(user._id, patch);
    return { userId: user._id, email: patch.email ?? user.email };
  },
});

// --- admin queries ---------------------------------------------------------

export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    onlyDeactivated: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, onlyDeactivated, limit = 200 }) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("users").take(limit * 2);
    const term = search?.toLowerCase().trim() ?? "";
    return all
      .filter((u) => !u.deletedAt)
      .filter((u) => (onlyDeactivated ? !!u.deactivatedAt : true))
      .filter((u) => {
        if (!term) return true;
        return (
          u.email.toLowerCase().includes(term) ||
          u.name.toLowerCase().includes(term) ||
          (u.company ?? "").toLowerCase().includes(term) ||
          (u.role ?? "").toLowerCase().includes(term)
        );
      })
      .slice(0, limit)
      .map((u) => ({
        _id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        company: u.company,
        accessLevel: u.accessLevel ?? "member",
        isSpeaker: u.isSpeaker,
        deactivatedAt: u.deactivatedAt,
        claimCodeId: u.claimCodeId,
        createdAt: u._creationTime,
      }));
  },
});

// Full attendee export for post-event reporting. Returns every user
// (including admins / deactivated / deleted, flagged in the `status`
// column) enriched with their Luma ticket state, lunch voucher
// (publicToken + externalUrl + redeemed?), partner team, and lifecycle
// timestamps. The frontend turns this into a CSV; the column order is
// fixed so the downloaded file is stable across exports.
//
// `status` collapses the user's lifecycle into a single readable label:
//   deleted | deactivated | onboarded | ticket_linked_not_onboarded |
//   signed_up_no_ticket
// Prefixed with `admin:` for accessLevel=admin so they're easy to filter
// out in the spreadsheet.
export const exportAttendees = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const lumaRows = await ctx.db.query("lumaAttendees").collect();
    const lumaByGuestId = new Map(lumaRows.map((r) => [r.lumaGuestId, r]));
    const ticketLinks = await ctx.db.query("ticketLinks").collect();
    const linkByUser = new Map(ticketLinks.map((l) => [String(l.userId), l]));
    const teams = await ctx.db.query("teams").collect();
    const teamById = new Map(teams.map((t) => [String(t._id), t]));
    const vouchers = await ctx.db.query("vouchers").collect();
    const vouchersByUser = new Map<string, typeof vouchers>();
    for (const v of vouchers) {
      const k = String(v.userId);
      const arr = vouchersByUser.get(k) ?? [];
      arr.push(v);
      vouchersByUser.set(k, arr);
    }
    const contacts = await ctx.db.query("contacts").collect();
    const contactsByUser = new Map<string, number>();
    for (const c of contacts) {
      if (c.ownerType !== "user") continue;
      contactsByUser.set(c.ownerId, (contactsByUser.get(c.ownerId) ?? 0) + 1);
    }
    const teamContactsByTeam = new Map<string, number>();
    for (const c of contacts) {
      if (c.ownerType !== "team") continue;
      teamContactsByTeam.set(
        c.ownerId,
        (teamContactsByTeam.get(c.ownerId) ?? 0) + 1,
      );
    }
    const scanEvents = await ctx.db.query("scanEvents").collect();
    const scannedCount = new Map<string, number>();
    const scannerCount = new Map<string, number>();
    for (const s of scanEvents) {
      scannedCount.set(
        String(s.scannedUserId),
        (scannedCount.get(String(s.scannedUserId)) ?? 0) + 1,
      );
      scannerCount.set(
        String(s.scannerUserId),
        (scannerCount.get(String(s.scannerUserId)) ?? 0) + 1,
      );
    }

    const iso = (ms?: number) => (ms ? new Date(ms).toISOString() : "");

    const rows = users.map((u) => {
      const luma = u.lumaGuestId ? lumaByGuestId.get(u.lumaGuestId) : null;
      const link = linkByUser.get(String(u._id));
      const team = u.teamId ? teamById.get(String(u.teamId)) : null;
      const userVouchers = vouchersByUser.get(String(u._id)) ?? [];
      const lunch = userVouchers.find((v) => v.kind === "lunch");

      // Compact lifecycle status — collapses every meaningful state into
      // one label the spreadsheet can filter on.
      let status: string;
      if (u.deletedAt) status = "deleted";
      else if (u.deactivatedAt) status = "deactivated";
      else if (u.onboardingCompletedAt) status = "onboarded";
      else if (u.ticketLinkedAt) status = "ticket_linked_not_onboarded";
      else status = "signed_up_no_ticket";
      if (u.accessLevel === "admin") status = `admin:${status}`;
      else if (u.accessLevel === "vendor") status = `vendor:${status}`;

      return {
        userId: u._id,
        status,
        accessLevel: u.accessLevel ?? "member",
        isSpeaker: u.isSpeaker ? "yes" : "",
        accountCreatedAt: iso(u._creationTime),
        onboardingCompletedAt: iso(u.onboardingCompletedAt),
        ticketLinkedAt: iso(u.ticketLinkedAt),
        deactivatedAt: iso(u.deactivatedAt),
        deactivatedReason: u.deactivatedReason ?? "",
        deletedAt: iso(u.deletedAt),
        termsAcceptedAt: iso(u.termsAcceptedAt),
        name: u.name,
        email: u.email,
        role: u.role ?? "",
        company: u.company ?? "",
        linkedinUrl: u.linkedinUrl ?? "",
        headline: u.headline ?? "",
        bio: u.bio ?? "",
        publicToken: u.publicToken ?? "",
        // Luma side
        lumaEmail: luma?.email ?? link?.lumaEmail ?? "",
        lumaGuestId: u.lumaGuestId ?? "",
        lumaApprovalStatus: luma?.approvalStatus ?? "",
        lumaTicketType: luma?.ticketType ?? "",
        lumaRegisteredAt: iso(luma?.registeredAt),
        lumaCheckedInAt: iso(luma?.checkedInAt),
        ticketLinkMethod: link?.method ?? "",
        // Partner team
        teamSlug: team?.slug ?? "",
        teamName: team?.name ?? "",
        teamTier: team?.partnerTier ?? "",
        // Lunch voucher
        lunchVoucherToken: lunch?.publicToken ?? "",
        lunchVoucherExternalLabel: lunch?.externalLabel ?? "",
        lunchVoucherExternalUrl: lunch?.externalUrl ?? "",
        lunchVoucherIssuedAt: iso(lunch?.issuedAt),
        lunchVoucherRedeemedAt: iso(lunch?.redeemedAt),
        // Activity
        // `personalContactsAdded` counts contacts the user saved to their
        // own list (ownerType="user") — meaningful only for solo
        // attendees. Partner team members' scans create team contacts
        // (ownerType="team"), so `teamLeadsTotal` reports the size of
        // their team's lead pool (same number for every member of the
        // same team, which is the right answer). `timesScanning` is the
        // raw count of QRs they personally scanned, regardless of where
        // the contact landed.
        personalContactsAdded: contactsByUser.get(String(u._id)) ?? 0,
        teamLeadsTotal: team
          ? (teamContactsByTeam.get(String(team._id)) ?? 0)
          : 0,
        timesScanned: scannedCount.get(String(u._id)) ?? 0,
        timesScanning: scannerCount.get(String(u._id)) ?? 0,
      };
    });
    return rows;
  },
});

// Overview funnel for the admin dashboard: how many people actually have an
// app account and finished onboarding, how many linked a ticket, and how many
// of those linked tickets are approved on Luma. Distinct from the Luma page,
// which counts raw Luma approvals regardless of whether the person ever signed
// into the app.
//
// Staff (accessLevel "admin") are excluded everywhere here: they get app access
// via their role, not a real ticket, so counting them inflates "registered" and
// leaves phantom gaps in "ticket linked". This is the attendee picture only.
export const overviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const adminIds = new Set(
      users
        .filter((u) => !u.deletedAt && u.accessLevel === "admin")
        .map((u) => String(u._id)),
    );
    const attendees = users.filter(
      (u) => !u.deletedAt && !adminIds.has(String(u._id)),
    );
    const registered = attendees.filter((u) => u.onboardingCompletedAt).length;

    const links = (await ctx.db.query("ticketLinks").collect()).filter(
      (l) => !adminIds.has(String(l.userId)),
    );

    // Guest ids that hold an approved Luma ticket. lumaAttendees has no index
    // on approvalStatus, so we scan the cached set (small, synced every 5 min)
    // and build a lookup to cross against the ticket links.
    const lumaRows = await ctx.db.query("lumaAttendees").collect();
    const approvedGuestIds = new Set(
      lumaRows
        .filter((r) => r.approvalStatus === "approved")
        .map((r) => r.lumaGuestId),
    );

    // Decompose the "not linked" count into actionable vs. noise so the
    // dashboard doesn't trip alarms for users we can't / shouldn't auto-link:
    //   - needsAttention: has an approved Luma row that's NOT claimed by
    //     anyone yet. These should have auto-linked but didn't — investigate.
    //   - noLumaRow:      not on Luma at all. Walk-in, wrong email at signup,
    //     or non-attendee. Needs a claim code; the link gate is the right UX.
    //   - notApproved:    on Luma but invited/declined/waitlist. Their RSVP
    //     to handle.
    //   - duplicateAccount: their Luma ticket is already linked to another
    //     active account — they have a working account elsewhere (typically
    //     personal vs. work email). This row is dead weight, not a problem.
    const linkedUserIds = new Set(links.map((l) => String(l.userId)));
    const claimedGuestIds = new Set(links.map((l) => l.lumaGuestId));
    const lumaByEmail = new Map(lumaRows.map((r) => [r.email, r]));
    const unlinked = attendees.filter(
      (u) => !linkedUserIds.has(String(u._id)),
    );
    let needsAttention = 0;
    let noLumaRow = 0;
    let notApproved = 0;
    let duplicateAccount = 0;
    for (const u of unlinked) {
      const luma = lumaByEmail.get(u.email);
      if (!luma) {
        noLumaRow++;
        continue;
      }
      if (luma.approvalStatus !== "approved") {
        notApproved++;
        continue;
      }
      if (claimedGuestIds.has(luma.lumaGuestId)) {
        duplicateAccount++;
        continue;
      }
      needsAttention++;
    }

    return {
      accounts: attendees.length,
      registered,
      ticketLinked: links.length,
      linkedApproved: links.filter((l) => approvedGuestIds.has(l.lumaGuestId))
        .length,
      lumaApproved: approvedGuestIds.size,
      // Unlinked breakdown — see comment above.
      unlinkedNeedsAttention: needsAttention,
      unlinkedNoLumaRow: noLumaRow,
      unlinkedNotApproved: notApproved,
      unlinkedDuplicateAccount: duplicateAccount,
    };
  },
});

// Diagnostic: surface attendees who have a ticketLinks row but never finished
// onboarding. Explains the apparent paradox where "ticket linked" can exceed
// "onboarded" in the dashboard (auto-link, walk-in code, or partner invite can
// set the link before the user submits the onboarding form). Runnable via
// `npx convex run admin:findTicketLinkedNotOnboarded --prod`.
export const findTicketLinkedNotOnboarded = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const adminIds = new Set(
      users
        .filter((u) => !u.deletedAt && u.accessLevel === "admin")
        .map((u) => String(u._id)),
    );
    const links = await ctx.db.query("ticketLinks").collect();
    const linkedUserIds = new Set(links.map((l) => String(l.userId)));
    const gap = users
      .filter((u) => !u.deletedAt && !adminIds.has(String(u._id)))
      .filter((u) => linkedUserIds.has(String(u._id)) && !u.onboardingCompletedAt)
      .map((u) => ({
        _id: u._id,
        email: u.email,
        name: u.name,
        ticketLinkedAt: u.ticketLinkedAt,
        onboardingRequired: u.onboardingRequired,
        accessLevel: u.accessLevel,
        isSpeaker: u.isSpeaker,
      }));
    return { count: gap.length, users: gap };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return user;
  },
});

export const getUserActivity = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 100 }) => {
    await requireAdmin(ctx);
    const [scansBy, scansOf, contactsBy, audit] = await Promise.all([
      ctx.db
        .query("scanEvents")
        .withIndex("by_scanner", (q) => q.eq("scannerUserId", userId))
        .order("desc")
        .take(limit),
      ctx.db
        .query("scanEvents")
        .withIndex("by_scanned", (q) => q.eq("scannedUserId", userId))
        .order("desc")
        .take(limit),
      ctx.db
        .query("contacts")
        .withIndex("by_owner", (q) => q.eq("ownerType", "user").eq("ownerId", userId as string))
        .order("desc")
        .take(limit),
      ctx.db
        .query("auditLog")
        .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
        .order("desc")
        .take(limit),
    ]);
    return { scansBy, scansOf, contactsBy, audit };
  },
});

// Shared enrichment for a team's shared lead pool: scanner attribution, the
// full per-author note thread, plus lead status + qualification (on the
// contact row). Used by both the partner-facing `partners.myTeamLeads` and the
// admin `teamLeads` view + CSV export so the two never diverge.
export async function buildTeamLeads(ctx: QueryCtx, teamId: Id<"teams">) {
  // Map every team member's userId → name once, so scanner + note-author
  // attribution doesn't cost a user lookup per row.
  const memberRows = await ctx.db
    .query("partnerMembers")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
  const teamMemberIds = new Set(
    memberRows.map((m) => m.userId as unknown as string),
  );
  const nameById = new Map<string, string>();
  for (const m of memberRows) {
    const u = await ctx.db.get(m.userId);
    if (u) nameById.set(u._id as unknown as string, u.name ?? "Unknown");
  }
  const nameFor = async (uid: Id<"users">): Promise<string> => {
    const key = uid as unknown as string;
    const cached = nameById.get(key);
    if (cached) return cached;
    const u = await ctx.db.get(uid);
    const name = u?.name ?? "Unknown";
    nameById.set(key, name);
    return name;
  };

  const contacts = await ctx.db
    .query("contacts")
    .withIndex("by_owner", (q) =>
      q.eq("ownerType", "team").eq("ownerId", teamId as string),
    )
    .order("desc")
    .collect();

  return await Promise.all(
    contacts.map(async (c) => {
      const lead = await ctx.db.get(c.contactedUserId);

      // Everyone on the team who scanned this lead, oldest first.
      const scanRows = await ctx.db
        .query("scanEvents")
        .withIndex("by_scanned", (q) =>
          q.eq("scannedUserId", c.contactedUserId),
        )
        .collect();
      const teamScans = scanRows
        .filter((s) => teamMemberIds.has(s.scannerUserId as unknown as string))
        .sort((a, b) => a.ts - b.ts);
      const scanners = await Promise.all(
        teamScans.map(async (s) => ({
          name: await nameFor(s.scannerUserId),
          ts: s.ts,
        })),
      );

      // Full note thread, oldest first, each with its author — so the admin
      // view and CSV export can show who wrote what.
      const noteRows = await ctx.db
        .query("contactNotes")
        .withIndex("by_contact", (q) => q.eq("contactId", c._id))
        .collect();
      const notes: { author: string; text: string; createdAt: number }[] = [];
      const commenters: string[] = [];
      const seenAuthors = new Set<string>();
      for (const n of noteRows) {
        const author = await nameFor(n.byUserId);
        notes.push({ author, text: n.text, createdAt: n.createdAt });
        const key = n.byUserId as unknown as string;
        if (!seenAuthors.has(key)) {
          seenAuthors.add(key);
          commenters.push(author);
        }
      }

      return {
        contact: c,
        lead,
        scanners,
        firstScan: scanners[0] ?? null,
        notes,
        commenters,
        noteCount: noteRows.length,
      };
    }),
  );
}

// Admin-only view of any team's shared lead pool.
export const teamLeads = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    await requireAdmin(ctx);
    return await buildTeamLeads(ctx, teamId);
  },
});

export const auditFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 100 }) => {
    await requireAdmin(ctx);
    const items = await ctx.db
      .query("auditLog")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
    // Enrich actor name
    const result: Array<Doc<"auditLog"> & { actorName?: string; actorEmail?: string; targetName?: string }> = [];
    for (const item of items) {
      const actor = await ctx.db.get(item.actorUserId);
      const target = item.targetUserId ? await ctx.db.get(item.targetUserId) : null;
      result.push({
        ...item,
        actorName: actor?.name,
        actorEmail: actor?.email,
        targetName: target?.name,
      });
    }
    return result;
  },
});

// --- admin mutations -------------------------------------------------------

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    patch: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.string()),
      company: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      headline: v.optional(v.string()),
      isSpeaker: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { userId, patch }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    await ctx.db.patch(userId, patch);
    await writeAudit(ctx, admin, ADMIN_ACTIONS.updateUser, userId, undefined, patch);
    return userId;
  },
});

export const resetOnboarding = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    await ctx.db.patch(userId, { onboardingRequired: true });
    await writeAudit(ctx, admin, ADMIN_ACTIONS.resetOnboarding, userId);
    return userId;
  },
});

export const rotateUserToken = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    let token = "";
    for (let i = 0; i < 8; i++) {
      const candidate = generatePublicToken();
      const clash = await ctx.db
        .query("users")
        .withIndex("by_public_token", (q) => q.eq("publicToken", candidate))
        .first();
      if (!clash) {
        token = candidate;
        break;
      }
    }
    if (!token) throw new Error("Could not generate a unique token");
    await ctx.db.patch(userId, { publicToken: token });
    await writeAudit(ctx, admin, "user.rotate_token", userId, undefined, { token });
    return token;
  },
});

export const deactivateUser = mutation({
  args: { userId: v.id("users"), reason: v.optional(v.string()) },
  handler: async (ctx, { userId, reason }) => {
    const admin = await requireAdmin(ctx);
    if (userId === admin._id) throw new Error("Cannot deactivate yourself");
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    if (target.accessLevel === "admin") throw new Error("Cannot deactivate another admin");
    await ctx.db.patch(userId, {
      deactivatedAt: Date.now(),
      deactivatedBy: admin._id,
      deactivatedReason: reason,
    });
    await writeAudit(ctx, admin, ADMIN_ACTIONS.deactivateUser, userId, undefined, { reason });
    return userId;
  },
});

export const getTicketLink = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    const link = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!link) return null;
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", link.lumaGuestId))
      .first();
    return { link, luma };
  },
});

export const manualLinkTicket = mutation({
  args: { userId: v.id("users"), lumaEmail: v.string() },
  handler: async (ctx, { userId, lumaEmail }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");

    const existing = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("User is already linked");

    const normalized = lumaEmail.toLowerCase().trim();
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!luma) throw new Error("No Luma attendee with that email in the cache");
    if (luma.approvalStatus !== "approved") {
      throw new Error(
        `That Luma attendee is "${luma.approvalStatus}", not approved. Admin override only via the dashboard.`,
      );
    }

    const claimedByAnother = await ctx.db
      .query("ticketLinks")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", luma.lumaGuestId))
      .first();
    if (claimedByAnother) {
      throw new Error("That Luma guest is already linked to another account");
    }

    const now = Date.now();
    const linkId = await ctx.db.insert("ticketLinks", {
      userId,
      lumaGuestId: luma.lumaGuestId,
      lumaEmail: luma.email,
      method: "admin_link",
      verifiedAt: now,
      verifiedByUserId: admin._id,
    });
    const patch: Record<string, unknown> = {
      ticketLinkedAt: now,
      lumaGuestId: luma.lumaGuestId,
    };
    if (luma.name && (!target.name || target.name === "Unnamed" || target.name === target.email)) {
      patch.name = luma.name;
    }
    await ctx.db.patch(userId, patch);
    await writeAudit(ctx, admin, "ticket.manual_link", userId, undefined, {
      lumaEmail: luma.email,
      lumaGuestId: luma.lumaGuestId,
    });
    return { linkId };
  },
});

// Admin-only force transfer. Bypasses holder approval — used when the
// current holder can't be reached (lost inbox, left the company, etc.).
// Atomic swap, moves unredeemed vouchers, audits both sides.
export const transferTicket = mutation({
  args: {
    toUserId: v.id("users"),
    lumaEmail: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { toUserId, lumaEmail, reason }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(toUserId);
    if (!target) throw new Error("Destination user not found");
    if (target.deactivatedAt) throw new Error("Destination account deactivated");

    const normalized = lumaEmail.toLowerCase().trim();
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!luma) throw new Error("No Luma attendee with that email in the cache");
    if (luma.approvalStatus !== "approved") {
      throw new Error(
        `That Luma attendee is "${luma.approvalStatus}", not approved.`,
      );
    }

    const existing = await ctx.db
      .query("ticketLinks")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", luma.lumaGuestId))
      .first();
    if (!existing) {
      throw new Error(
        "This Luma guest isn't linked to any account — use the normal Link button instead.",
      );
    }
    if (existing.userId === toUserId) {
      throw new Error("Destination user already holds this ticket");
    }

    const fromUserId = existing.userId;
    const { movedVoucherIds } = await performTransfer(ctx, {
      fromUserId,
      toUserId,
      lumaGuestId: luma.lumaGuestId,
      method: "admin_link",
      verifiedByUserId: admin._id,
    });

    await writeAudit(ctx, admin, "ticket.transfer_admin", toUserId, undefined, {
      fromUserId,
      lumaEmail: luma.email,
      lumaGuestId: luma.lumaGuestId,
      movedVouchers: movedVoucherIds.length,
      reason,
    });
    return { ok: true, movedVouchers: movedVoucherIds.length };
  },
});

export const unlinkTicket = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireAdmin(ctx);
    const link = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!link) throw new Error("No ticket link to remove");
    await ctx.db.delete(link._id);
    await ctx.db.patch(userId, {
      ticketLinkedAt: undefined,
      lumaGuestId: undefined,
    });
    await writeAudit(ctx, admin, "ticket.unlink", userId, undefined, {
      lumaEmail: link.lumaEmail,
      lumaGuestId: link.lumaGuestId,
      previousMethod: link.method,
    });
    return { ok: true };
  },
});

export const reactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    await ctx.db.patch(userId, {
      deactivatedAt: undefined,
      deactivatedBy: undefined,
      deactivatedReason: undefined,
    });
    await writeAudit(ctx, admin, ADMIN_ACTIONS.reactivateUser, userId);
    return userId;
  },
});

// --- claim codes -----------------------------------------------------------

const CLAIM_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/1/I/L/O

function generateCode(): string {
  // crypto.getRandomValues — claim codes grant ticket-link + (for
  // staff/speaker kinds) elevated rights. The 8-char/31-alphabet ≈ 40 bits
  // of entropy is fine; using Math.random for it isn't.
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 4; i++) out += CLAIM_ALPHABET[bytes[i] % CLAIM_ALPHABET.length];
  out += "-";
  for (let i = 0; i < 4; i++) out += CLAIM_ALPHABET[bytes[i + 4] % CLAIM_ALPHABET.length];
  return out;
}

export const createClaimCode = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    jobRole: v.optional(v.string()),
    kind: v.union(v.literal("speaker"), v.literal("walkin"), v.literal("guest"), v.literal("staff")),
    note: v.optional(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const normalizedEmail = args.email.toLowerCase().trim();

    const pendingId = await ctx.db.insert("pendingAttendees", {
      email: normalizedEmail,
      name: args.name,
      company: args.company,
      jobRole: args.jobRole,
      kind: args.kind,
      note: args.note,
      createdByUserId: admin._id,
      createdAt: Date.now(),
    });

    // Pick a unique code (retry on collision; collisions are astronomically rare).
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const clash = await ctx.db
        .query("claimCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!clash) break;
      code = generateCode();
    }

    const codeId = await ctx.db.insert("claimCodes", {
      code,
      pendingAttendeeId: pendingId,
      createdByUserId: admin._id,
      createdAt: Date.now(),
      expiresAt: args.expiresInDays ? Date.now() + args.expiresInDays * 86400_000 : undefined,
    });

    await writeAudit(ctx, admin, ADMIN_ACTIONS.createClaimCode, undefined, codeId, {
      email: normalizedEmail,
      kind: args.kind,
    });

    return { codeId, code, pendingAttendeeId: pendingId };
  },
});

export const listClaimCodes = query({
  args: { includeRevoked: v.optional(v.boolean()), limit: v.optional(v.number()) },
  handler: async (ctx, { includeRevoked, limit = 200 }) => {
    await requireAdmin(ctx);
    const codes = await ctx.db
      .query("claimCodes")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
    const out = [] as Array<Doc<"claimCodes"> & { pending?: Doc<"pendingAttendees"> | null }>;
    for (const c of codes) {
      if (!includeRevoked && c.revokedAt) continue;
      const pending = await ctx.db.get(c.pendingAttendeeId);
      out.push({ ...c, pending });
    }
    return out;
  },
});

export const createClaimCodesBulk = mutation({
  args: {
    entries: v.array(
      v.object({
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        jobRole: v.optional(v.string()),
        kind: v.union(
          v.literal("speaker"),
          v.literal("walkin"),
          v.literal("guest"),
          v.literal("staff"),
        ),
        note: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    const admin = await requireAdmin(ctx);
    const created: Array<{ email: string; code: string; codeId: Id<"claimCodes"> }> = [];
    for (const entry of entries) {
      const normalizedEmail = entry.email.toLowerCase().trim();
      const pendingId = await ctx.db.insert("pendingAttendees", {
        email: normalizedEmail,
        name: entry.name,
        company: entry.company,
        jobRole: entry.jobRole,
        kind: entry.kind,
        note: entry.note,
        createdByUserId: admin._id,
        createdAt: Date.now(),
      });
      let code = generateCode();
      for (let i = 0; i < 5; i++) {
        const clash = await ctx.db
          .query("claimCodes")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();
        if (!clash) break;
        code = generateCode();
      }
      const codeId = await ctx.db.insert("claimCodes", {
        code,
        pendingAttendeeId: pendingId,
        createdByUserId: admin._id,
        createdAt: Date.now(),
      });
      created.push({ email: normalizedEmail, code, codeId });
    }
    await writeAudit(ctx, admin, "claim_code.bulk_create", undefined, undefined, {
      count: created.length,
    });
    return created;
  },
});

export const getClaimCodeForEmail = query({
  args: { codeId: v.id("claimCodes") },
  handler: async (ctx, { codeId }) => {
    await requireAdmin(ctx);
    const code = await ctx.db.get(codeId);
    if (!code) return null;
    const pending = await ctx.db.get(code.pendingAttendeeId);
    return { code, pending };
  },
});

export const revokeClaimCode = mutation({
  args: { codeId: v.id("claimCodes") },
  handler: async (ctx, { codeId }) => {
    const admin = await requireAdmin(ctx);
    const code = await ctx.db.get(codeId);
    if (!code) throw new Error("Code not found");
    if (code.revokedAt) return codeId;
    if (code.claimedAt) throw new Error("Already claimed");
    await ctx.db.patch(codeId, {
      revokedAt: Date.now(),
      revokedByUserId: admin._id,
    });
    await writeAudit(ctx, admin, ADMIN_ACTIONS.revokeClaimCode, undefined, codeId);
    return codeId;
  },
});
