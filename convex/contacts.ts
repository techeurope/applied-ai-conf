import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

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

    const ownerType = user.teamId ? "team" : "user";
    const ownerId = user.teamId ?? user._id;
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) => q.eq("ownerType", ownerType).eq("ownerId", ownerId as string))
      .collect();

    const enriched = await Promise.all(
      contacts.map(async (c) => {
        const u = await ctx.db.get(c.contactedUserId);
        return { contact: c, user: u && !u.deletedAt ? u : null };
      }),
    );
    return enriched.filter((e) => e.user !== null);
  },
});

export const add = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getMe(ctx);
    if (!me.ticketLinkedAt && me.accessLevel !== "admin") {
      throw new Error("Ticket not verified");
    }
    if (me._id === userId) throw new Error("Can't add yourself");
    const target = await ctx.db.get(userId);
    if (!target || target.deletedAt) throw new Error("User not found");

    const ownerType = me.teamId ? "team" : "user";
    const ownerId = me.teamId ?? me._id;

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_owner_contacted", (q) =>
        q.eq("ownerType", ownerType).eq("ownerId", ownerId as string).eq("contactedUserId", userId),
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("contacts", {
      ownerType,
      ownerId: ownerId as string,
      contactedUserId: userId,
      firstScanAt: Date.now(),
      lastScanAt: Date.now(),
    });
  },
});

export const updateNotes = mutation({
  args: {
    contactId: v.id("contacts"),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { contactId, notes, tags }) => {
    const user = await getMe(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact not found");

    const expectedOwnerType = user.teamId ? "team" : "user";
    const expectedOwnerId = user.teamId ?? user._id;
    if (contact.ownerType !== expectedOwnerType || contact.ownerId !== expectedOwnerId) {
      throw new Error("Not your contact");
    }
    await ctx.db.patch(contactId, {
      ...(notes !== undefined ? { notes } : {}),
      ...(tags !== undefined ? { tags } : {}),
    });
  },
});
