import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

async function getMe(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosUserId", identity.subject))
    .first();
  if (!user) throw new ConvexError("User not found");
  if (user.deactivatedAt) throw new ConvexError("Account deactivated");
  if (user.deletedAt) throw new ConvexError("Account deleted");
  return user;
}

// QR codes encode user.publicToken (aac_xxxx). We resolve via the
// by_public_token index — Convex's v.id() validator would reject the
// token string outright, which is what was breaking partner scanning
// in production.
export const record = mutation({
  args: {
    token: v.string(),
    clientId: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, { token, clientId, eventId }) => {
    const scanner = await getMe(ctx);
    if (!scanner.ticketLinkedAt && scanner.accessLevel !== "admin") {
      throw new ConvexError(
        "Your ticket isn't verified yet. Visit /app/link-ticket first.",
      );
    }
    // Scanner is partner-team-only — you must be on a team to capture leads.
    // Without a teamId every scan creates a personal contact the lead-
    // qualification flow rejects, so we gate scanning here (no admin bypass).
    if (!scanner.teamId) {
      throw new ConvexError(
        "Lead-capture scanning is for partner team members only.",
      );
    }

    const byToken = await ctx.db
      .query("users")
      .withIndex("by_public_token", (q) => q.eq("publicToken", token))
      .first();
    if (!byToken) {
      throw new ConvexError(
        "That QR code doesn't match any attendee. The user may have deleted their account.",
      );
    }
    const scannedUserId = byToken._id;

    if (scanner._id === scannedUserId) {
      throw new ConvexError("That's your own QR code — try scanning someone else.");
    }

    // Dedupe by clientId — offline-sync replays will produce the same id
    const duplicate = await ctx.db
      .query("scanEvents")
      .withIndex("by_client_id", (q) => q.eq("clientId", clientId))
      .first();
    if (duplicate) return { scanEventId: duplicate._id, duplicate: true };

    const scanned = await ctx.db.get(scannedUserId);
    if (!scanned || scanned.deletedAt) {
      throw new ConvexError("That attendee's account is no longer active.");
    }

    // Scanning is standard conference behaviour, covered by the Terms every
    // attendee accepts during onboarding — there is no separate opt-out. The
    // only gate is that the scanned user actually finished onboarding (i.e.
    // accepted the Terms); pre-onboarding users haven't agreed yet and aren't
    // exposed. To stop being scanned a user simply doesn't show their QR, or
    // deletes their account.
    if (!scanned.onboardingCompletedAt) {
      throw new ConvexError(
        "This attendee hasn't finished onboarding yet — ask them to complete it and try again.",
      );
    }

    const now = Date.now();
    // Snapshot prior scan history BEFORE inserting the new row, so the
    // modal can say "already scanned N times" without having to count
    // back the current scan. For team scanners we look across the
    // whole team; for solo users it's just their own scans.
    const priorScans = await ctx.db
      .query("scanEvents")
      .withIndex("by_scanned", (q) => q.eq("scannedUserId", scannedUserId))
      .collect();
    const teamPriorScans = scanner.teamId
      ? await Promise.all(
          priorScans.map(async (s) => {
            const u = await ctx.db.get(s.scannerUserId);
            return { ev: s, scannerTeamId: u?.teamId, scannerName: u?.name };
          }),
        ).then((rows) => rows.filter((r) => r.scannerTeamId === scanner.teamId))
      : priorScans
          .filter((s) => s.scannerUserId === scanner._id)
          .map((s) => ({ ev: s, scannerName: scanner.name }));
    const priorScanCount = teamPriorScans.length;
    // Last 3 (newest first) for the modal — beyond that it's just noise.
    const recentPriorScans = teamPriorScans
      .sort((a, b) => b.ev.ts - a.ev.ts)
      .slice(0, 3)
      .map((r) => ({
        scannerName: r.scannerName ?? "Unknown",
        ts: r.ev.ts,
        isMe: r.ev.scannerUserId === scanner._id,
      }));

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

    let contactId;
    let leadStatus: string | undefined;
    if (existingContact) {
      await ctx.db.patch(existingContact._id, { lastScanAt: now });
      contactId = existingContact._id;
      leadStatus = existingContact.leadStatus;
    } else {
      contactId = await ctx.db.insert("contacts", {
        ownerType,
        ownerId: ownerId as string,
        contactedUserId: scannedUserId,
        firstScanAt: now,
        lastScanAt: now,
      });
    }

    // Profile snippet so the client can render the scan toast + recent-
    // scans list without a follow-up users.getById round trip.
    return {
      scanEventId,
      contactId,
      duplicate: false,
      scanned: {
        _id: scanned._id,
        name: scanned.name,
        role: scanned.role,
        company: scanned.company,
        publicToken: scanned.publicToken,
      },
      history: {
        priorScanCount,
        recentPriorScans,
        leadStatus: leadStatus ?? null,
      },
    };
  },
});
