import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const consentKey = v.union(
  v.literal("visible_when_scanned"), // legacy: scanning is now governed by the Terms, no UI toggle
  v.literal("directory_listing"),
  v.literal("ai_fit_scoring"),
  v.literal("email_summaries"), // legacy, kept for back-compat
  v.literal("conference_updates"),
  v.literal("team_sharing"),
);

async function getMe(ctx: any) {
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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return [];
    return await ctx.db.query("consents").withIndex("by_user_key", (q) => q.eq("userId", user._id)).collect();
  },
});

export const set = mutation({
  args: { key: consentKey, granted: v.boolean() },
  handler: async (ctx, { key, granted }) => {
    const user = await getMe(ctx);
    const existing = await ctx.db
      .query("consents")
      .withIndex("by_user_key", (q) => q.eq("userId", user._id).eq("key", key))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { granted, updatedAt: now });
    } else {
      await ctx.db.insert("consents", { userId: user._id, key, granted, updatedAt: now });
    }
  },
});
