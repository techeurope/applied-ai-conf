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
  let out = "";
  for (let i = 0; i < 4; i++) out += CLAIM_ALPHABET[Math.floor(Math.random() * CLAIM_ALPHABET.length)];
  out += "-";
  for (let i = 0; i < 4; i++) out += CLAIM_ALPHABET[Math.floor(Math.random() * CLAIM_ALPHABET.length)];
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
