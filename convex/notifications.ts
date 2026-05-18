import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const unread = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return [];

    const notifs = await ctx.db
      .query("scannedNotifications")
      .withIndex("by_recipient_unread", (q) => q.eq("recipientUserId", user._id).eq("readAt", undefined))
      .collect();

    return Promise.all(
      notifs.map(async (n) => {
        const scanner = await ctx.db.get(n.scannerUserId);
        return { notification: n, scanner };
      }),
    );
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("scannedNotifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { readAt: Date.now() });
  },
});
