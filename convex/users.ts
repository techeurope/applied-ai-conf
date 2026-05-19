import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

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
      if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    const userId = await ctx.db.insert("users", {
      email: claimedEmail,
      workosUserId: identity.subject,
      name: claimedName ?? claimedEmail ?? "Unnamed",
      onboardingRequired: true,
      isSpeaker: false,
    });
    return userId;
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

export const restartOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireActiveUser(ctx);
    await ctx.db.patch(user._id, { onboardingRequired: true });
    return user._id;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireWorkosIdentity(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return;

    // Cascade delete: profiles, goals, consents, contacts where user is subject, scan events, notifications, image
    const profiles = await ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const p of profiles) await ctx.db.delete(p._id);

    const goals = await ctx.db.query("goals").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const g of goals) await ctx.db.delete(g._id);

    const consents = await ctx.db.query("consents").withIndex("by_user_key", (q) => q.eq("userId", user._id)).collect();
    for (const c of consents) await ctx.db.delete(c._id);

    const contactsAsSubject = await ctx.db
      .query("contacts")
      .withIndex("by_contacted", (q) => q.eq("contactedUserId", user._id))
      .collect();
    for (const c of contactsAsSubject) await ctx.db.delete(c._id);

    const scansAsScanner = await ctx.db.query("scanEvents").withIndex("by_scanner", (q) => q.eq("scannerUserId", user._id)).collect();
    for (const s of scansAsScanner) await ctx.db.delete(s._id);
    const scansAsScanned = await ctx.db.query("scanEvents").withIndex("by_scanned", (q) => q.eq("scannedUserId", user._id)).collect();
    for (const s of scansAsScanned) await ctx.db.delete(s._id);

    if (user.imageStorageId) await ctx.storage.delete(user.imageStorageId);
    await ctx.db.delete(user._id);
  },
});

export const directoryList = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 200 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

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
