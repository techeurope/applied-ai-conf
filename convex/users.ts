import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { generatePublicToken } from "./_tokens";
import { tryAutoLink } from "./ticket";
import { consumePartnerInviteIfAny } from "./partners";
import { consumeAdminInviteIfAny } from "./admin";

async function ensureUniquePublicToken(ctx: any): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generatePublicToken();
    const clash = await ctx.db
      .query("users")
      .withIndex("by_public_token", (q: any) => q.eq("publicToken", candidate))
      .first();
    if (!clash) return candidate;
  }
  throw new Error("Could not generate a unique public token after 8 attempts");
}

async function requireWorkosIdentity(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string; email?: string; name?: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function requireActiveUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosUserId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  if (user.deactivatedAt) throw new Error("Account deactivated");
  if (user.deletedAt) throw new Error("Account deleted");
  return user;
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    return user;
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.deletedAt) return null;
    return user;
  },
});

export const getByPublicToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_public_token", (q) => q.eq("publicToken", token))
      .first();
    if (!user || user.deletedAt) return null;
    return user;
  },
});

// Resolves a /app/u/<x> URL where x is either a publicToken (aac_...)
// or an old Convex _id. Token match takes precedence.
export const getByTokenOrId = query({
  args: { value: v.string() },
  handler: async (ctx, { value }) => {
    const byToken = await ctx.db
      .query("users")
      .withIndex("by_public_token", (q) => q.eq("publicToken", value))
      .first();
    if (byToken && !byToken.deletedAt) return byToken;
    // Convex _id format: 32 lowercase alphanumerics.
    if (/^[a-z0-9]{32}$/.test(value)) {
      const byId = await ctx.db.get(value as Id<"users">);
      if (byId && !byId.deletedAt) return byId;
    }
    return null;
  },
});

export const rotatePublicToken = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireActiveUser(ctx);
    const token = await ensureUniquePublicToken(ctx);
    await ctx.db.patch(user._id, { publicToken: token });
    return token;
  },
});

export const ensureFromWorkos = mutation({
  args: { email: v.optional(v.string()), name: v.optional(v.string()) },
  handler: async (ctx, { email: emailArg, name: nameArg }) => {
    const identity = await requireWorkosIdentity(ctx);
    const claimedEmail = (emailArg ?? identity.email ?? "").toLowerCase().trim();
    const claimedName = nameArg ?? identity.name;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (existing) {
      const patch: Record<string, unknown> = {};
      if (claimedEmail && existing.email !== claimedEmail) patch.email = claimedEmail;
      if (claimedName && existing.name === "Unnamed") patch.name = claimedName;
      if (!existing.publicToken) patch.publicToken = await ensureUniquePublicToken(ctx);
      if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch);
      const refreshed = (await ctx.db.get(existing._id))!;
      await consumePartnerInviteIfAny(ctx, refreshed);
      await consumeAdminInviteIfAny(ctx, refreshed);
      const after = (await ctx.db.get(existing._id))!;
      await tryAutoLink(ctx, after);
      return existing._id;
    }
    const publicToken = await ensureUniquePublicToken(ctx);
    const userId = await ctx.db.insert("users", {
      email: claimedEmail,
      workosUserId: identity.subject,
      name: claimedName ?? claimedEmail ?? "Unnamed",
      onboardingRequired: true,
      isSpeaker: false,
      publicToken,
    });
    const fresh = (await ctx.db.get(userId))!;
    await consumePartnerInviteIfAny(ctx, fresh);
    await consumeAdminInviteIfAny(ctx, fresh);
    const afterInvite = (await ctx.db.get(userId))!;
    await tryAutoLink(ctx, afterInvite);
    return userId;
  },
});

// Reset a user back to "just signed in for the first time" — for QA only.
// Wipes ticketLinks + onboarding state by email. If the user has a matching
// approved row in lumaAttendees, the next sign-in will silently auto-link
// again and they'll only see /app/onboarding (not /app/link-ticket). To see
// /app/link-ticket you need a user whose email isn't in lumaAttendees.
export const bootstrapResetForOnboardingTest = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) throw new Error(`No user with email ${normalized}`);
    const links = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const l of links) {
      await ctx.db.delete(l._id);
    }
    await ctx.db.patch(user._id, {
      ticketLinkedAt: undefined,
      lumaGuestId: undefined,
      onboardingRequired: true,
      onboardingCompletedAt: undefined,
    });
    return {
      userId: user._id,
      email: normalized,
      ticketLinksRemoved: links.length,
    };
  },
});

// Backfill: assigns a publicToken to every existing user that lacks one.
// Run once after schema migration.
export const backfillPublicTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    let updated = 0;
    for (const u of all) {
      if (u.publicToken) continue;
      const token = await ensureUniquePublicToken(ctx);
      await ctx.db.patch(u._id, { publicToken: token });
      updated += 1;
    }
    return { updated, total: all.length };
  },
});

const profilePatchArgs = {
  name: v.optional(v.string()),
  role: v.optional(v.string()),
  company: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  headline: v.optional(v.string()),
  imageStorageId: v.optional(v.id("_storage")),
};

export const updateProfile = mutation({
  args: profilePatchArgs,
  handler: async (ctx, patch) => {
    const user = await requireActiveUser(ctx);
    await ctx.db.patch(user._id, patch);
    return user._id;
  },
});

export const completeOnboarding = mutation({
  args: profilePatchArgs,
  handler: async (ctx, patch) => {
    const user = await requireActiveUser(ctx);
    await ctx.db.patch(user._id, {
      ...patch,
      onboardingRequired: false,
      onboardingCompletedAt: Date.now(),
    });
    return user._id;
  },
});

// Full cascade for a user record. Used by deleteAccount and by internal
// test/admin tooling that needs to wipe a user without going through the
// WorkOS identity gate. Caller is responsible for any auth checks.
async function cascadeDeleteUser(
  ctx: MutationCtx,
  user: Doc<"users">,
  actorUserId: Doc<"users">["_id"],
  reason: "self_delete" | "admin_purge",
): Promise<void> {
  // Snapshot the email before any deletes so by-email cascades can run +
  // the audit log knows who this was.
  const email = (user.email ?? "").toLowerCase().trim();

  // Write the audit row first — referencing the user._id while the row
  // still exists. Convex Ids don't enforce referential integrity, so the
  // entry survives the subsequent deletion as a frozen record.
  await ctx.db.insert("auditLog", {
    actorUserId,
    action: reason === "self_delete" ? "user.self_delete" : "user.admin_purge",
    targetUserId: user._id,
    metadata: JSON.stringify({
      email: email || null,
      name: user.name,
      wasAdmin: user.accessLevel === "admin",
      hadTeam: !!user.teamId,
    }),
    createdAt: Date.now(),
  });

  // --- per-userId cascades --------------------------------------------------
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const p of profiles) await ctx.db.delete(p._id);

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const g of goals) await ctx.db.delete(g._id);

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_user_key", (q) => q.eq("userId", user._id))
      .collect();
    for (const c of consents) await ctx.db.delete(c._id);

    // Contacts where this user is the subject (partner / individual leads on them).
    const contactsAsSubject = await ctx.db
      .query("contacts")
      .withIndex("by_contacted", (q) => q.eq("contactedUserId", user._id))
      .collect();
    for (const c of contactsAsSubject) await ctx.db.delete(c._id);

    // Contacts owned by this user (their own contact list, when not on a team).
    const contactsAsOwner = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", "user").eq("ownerId", user._id as string),
      )
      .collect();
    for (const c of contactsAsOwner) await ctx.db.delete(c._id);

    const scansAsScanner = await ctx.db
      .query("scanEvents")
      .withIndex("by_scanner", (q) => q.eq("scannerUserId", user._id))
      .collect();
    for (const s of scansAsScanner) await ctx.db.delete(s._id);
    const scansAsScanned = await ctx.db
      .query("scanEvents")
      .withIndex("by_scanned", (q) => q.eq("scannedUserId", user._id))
      .collect();
    for (const s of scansAsScanned) await ctx.db.delete(s._id);

    const vouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const vch of vouchers) await ctx.db.delete(vch._id);

    const favorites = await ctx.db
      .query("favoriteSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const fav of favorites) await ctx.db.delete(fav._id);

    const ticketLinks = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const tl of ticketLinks) await ctx.db.delete(tl._id);

    const partnerMemberships = await ctx.db
      .query("partnerMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const pm of partnerMemberships) await ctx.db.delete(pm._id);

    const emailCodes = await ctx.db
      .query("emailCodes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const ec of emailCodes) await ctx.db.delete(ec._id);

    // Claim codes claimed by this user + their associated pendingAttendees
    // rows (which carry name/email/jobRole — personal data about them).
    if (user.claimCodeId) {
      const code = await ctx.db.get(user.claimCodeId);
      if (code) {
        if (code.pendingAttendeeId) {
          const pending = await ctx.db.get(code.pendingAttendeeId);
          if (pending) await ctx.db.delete(pending._id);
        }
        await ctx.db.delete(code._id);
      }
    }

    // --- per-email cascades ---------------------------------------------------
    if (email) {
      const partnerInvites = await ctx.db
        .query("partnerInvites")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();
      for (const pi of partnerInvites) await ctx.db.delete(pi._id);

      const adminInvites = await ctx.db
        .query("adminInvites")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();
      for (const ai of adminInvites) await ctx.db.delete(ai._id);

      // Standalone pendingAttendees keyed by this email (e.g. desk pre-
      // registered them but they never claimed). The claimed-by-user path
      // above handles the ones tied via claimCodeId.
      const standalonePending = await ctx.db
        .query("pendingAttendees")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();
      for (const p of standalonePending) {
        // Skip the one we already deleted via the claimCode branch.
        if (await ctx.db.get(p._id)) {
          // Also delete any claim codes pointing at it.
          const codes = await ctx.db
            .query("claimCodes")
            .withIndex("by_pending_attendee", (q) =>
              q.eq("pendingAttendeeId", p._id),
            )
            .collect();
          for (const c of codes) await ctx.db.delete(c._id);
          await ctx.db.delete(p._id);
        }
      }
    }

  if (user.imageStorageId) await ctx.storage.delete(user.imageStorageId);
  await ctx.db.delete(user._id);
}

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireWorkosIdentity(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return;

    // Block delete-and-recreate as kick-evasion. A deactivated user trying
    // to wipe their row and start over with a fresh account is exactly the
    // attack we want to prevent.
    if (user.deactivatedAt) {
      throw new Error(
        "This account has been deactivated by an admin. Talk to the conference team if you need to be reinstated.",
      );
    }

    await cascadeDeleteUser(ctx, user, user._id, "self_delete");
  },
});

// Test helper: wipe a user by email without auth. Used by the abuse-test
// harness in convex/_abuse_tests.ts. Refuses to act on a real-looking
// account by requiring the email to match a test-only suffix so it can't
// be misused to nuke a real attendee.
export const bootstrapPurgeUserByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    if (!normalized.endsWith("@example.local") && !normalized.endsWith("@test.local")) {
      throw new Error(
        "Refusing to purge a non-test email. Test addresses must end with @example.local or @test.local.",
      );
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) return { found: false };
    await cascadeDeleteUser(ctx, user, user._id, "admin_purge");
    return { found: true };
  },
});

export const directoryList = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 200 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me || (!me.ticketLinkedAt && me.accessLevel !== "admin")) return [];

    const speakers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isSpeaker"), true))
      .take(limit);

    const consents = await ctx.db
      .query("consents")
      .filter((q) => q.eq(q.field("key"), "directory_listing"))
      .filter((q) => q.eq(q.field("granted"), true))
      .take(limit);
    const optedInIds = new Set(consents.map((c) => c.userId));
    const others: Doc<"users">[] = [];
    for (const id of optedInIds) {
      const u = await ctx.db.get(id as Id<"users">);
      if (u && !u.deletedAt && !u.isSpeaker) others.push(u);
    }

    return [...speakers, ...others].filter((u) => !u.deletedAt);
  },
});
