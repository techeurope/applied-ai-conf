import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

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

// Accept a public token (aac_xxxx) OR a raw user _id. Older QR codes
// (pre-publicToken backfill) still encode the bare _id; everything
// minted now uses the token. Convex's v.id() validator rejects token
// strings outright, which is what was breaking partner scanning in
// production.
export const record = mutation({
  args: {
    token: v.string(),
    clientId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, { token, clientId, eventId }) => {
    const scanner = await getMe(ctx);
    if (!scanner.ticketLinkedAt && scanner.accessLevel !== "admin") {
      throw new Error("Ticket not verified");
    }

    const byToken = await ctx.db
      .query("users")
      .withIndex("by_public_token", (q) => q.eq("publicToken", token))
      .first();
    let scannedUserId: Id<"users"> | null = byToken?._id ?? null;
    if (!scannedUserId && /^[a-z0-9]{32}$/.test(token)) {
      const byId = await ctx.db.get(token as Id<"users">);
      if (byId) scannedUserId = byId._id;
    }
    if (!scannedUserId) throw new Error("Scanned user not found");

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

    // Scanning is standard conference behaviour, covered by the Terms every
    // attendee accepts during onboarding — there is no separate opt-out. The
    // only gate is that the scanned user actually finished onboarding (i.e.
    // accepted the Terms); pre-onboarding users haven't agreed yet and aren't
    // exposed. To stop being scanned a user simply doesn't show their QR, or
    // deletes their account.
    if (!scanned.onboardingCompletedAt) {
      throw new Error("This user hasn't finished onboarding yet.");
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
