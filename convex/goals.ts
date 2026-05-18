import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getMe(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosUserId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
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
    const goals = await ctx.db.query("goals").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    return goals.sort((a, b) => a.order - b.order);
  },
});

export const add = mutation({
  args: { label: v.string() },
  handler: async (ctx, { label }) => {
    const user = await getMe(ctx);
    const existing = await ctx.db.query("goals").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    const order = existing.length;
    return await ctx.db.insert("goals", { userId: user._id, label, order });
  },
});

export const remove = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, { goalId }) => {
    const user = await getMe(ctx);
    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== user._id) throw new Error("Not your goal");
    await ctx.db.delete(goalId);
  },
});
