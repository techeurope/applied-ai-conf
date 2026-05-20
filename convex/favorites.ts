import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireActiveUser } from "./_auth";

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
    const rows = await ctx.db
      .query("favoriteSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return rows.map((r) => r.sessionSlug);
  },
});

export const add = mutation({
  args: { sessionSlug: v.string() },
  handler: async (ctx, { sessionSlug }) => {
    const user = await requireActiveUser(ctx);
    const existing = await ctx.db
      .query("favoriteSessions")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", user._id).eq("sessionSlug", sessionSlug),
      )
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("favoriteSessions", {
      userId: user._id,
      sessionSlug,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { sessionSlug: v.string() },
  handler: async (ctx, { sessionSlug }) => {
    const user = await requireActiveUser(ctx);
    const existing = await ctx.db
      .query("favoriteSessions")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", user._id).eq("sessionSlug", sessionSlug),
      )
      .first();
    if (!existing) return null;
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});
