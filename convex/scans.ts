import { mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const record = mutation({
  args: {
    scannedUserId: v.id("users"),
    clientId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, { scannedUserId, clientId, eventId }) => {
    const scanner = await getMe(ctx);
    if (!scanner.ticketLinkedAt && scanner.accessLevel !== "admin") {
      throw new Error("Ticket not verified");
    }
    if (scanner._id === scannedUserId) {
      throw new Error("Cannot scan yourself");
    }

    // Dedupe by clientId — offline-sync replays will produce the same id
    const duplicate = await ctx.db
      .query("scanEvents")
      .withIndex("by_client_id", (q) => q.eq("clientId", clientId))
      .first();
    if (duplicate) return { scanEventId: duplicate._id, duplicate: true };

    const scanned = await ctx.db.get(scannedUserId);
    if (!scanned || scanned.deletedAt) throw new Error("Scanned user not found");

    // Default-deny: the scanned user must have an explicit consent row with
    // granted=true. Previously this was fail-open (missing row = allowed),
    // which silently exposed pre-onboarding users (no consent yet) and made
    // a UX inconsistency — onboarding presents `visible_when_scanned` as
    // opt-in. Users who completed onboarding have an explicit row from the
    // `consents:set` call there; users who haven't yet shouldn't appear in
    // a partner's contacts list.
    const visibility = await ctx.db
      .query("consents")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", scannedUserId).eq("key", "visible_when_scanned"),
      )
      .first();
    if (!visibility?.granted) {
      throw new Error(
        "This user has opted out of being scanned (or hasn't finished onboarding).",
      );
    }

    const now = Date.now();
    const scanEventId = await ctx.db.insert("scanEvents", {
      scannerUserId: scanner._id,
      scannedUserId,
      eventId,
      ts: now,
      clientId,
    });

    const ownerType = scanner.teamId ? "team" : "user";
    const ownerId = scanner.teamId ?? scanner._id;

    const existingContact = await ctx.db
      .query("contacts")
      .withIndex("by_owner_contacted", (q) =>
        q.eq("ownerType", ownerType).eq("ownerId", ownerId as string).eq("contactedUserId", scannedUserId),
      )
      .first();

    if (existingContact) {
      await ctx.db.patch(existingContact._id, { lastScanAt: now });
    } else {
      await ctx.db.insert("contacts", {
        ownerType,
        ownerId: ownerId as string,
        contactedUserId: scannedUserId,
        firstScanAt: now,
        lastScanAt: now,
      });
    }

    return { scanEventId, duplicate: false };
  },
});
