import { query } from "./_generated/server";
import { requireActiveUser } from "./_auth";

// Returns everything a user has produced in our system, for GDPR-style
// data export. Read-only; no PII about OTHER users beyond what's already
// on contacts (the people they scanned).
export const exportMyData = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireActiveUser(ctx);

    const [
      consents,
      goals,
      ticketLink,
      partnerMemberships,
      favorites,
      contactsAsOwner,
      scansBy,
      scansOf,
      auditEntries,
    ] = await Promise.all([
      ctx.db
        .query("consents")
        .withIndex("by_user_key", (q) => q.eq("userId", me._id))
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_user", (q) => q.eq("userId", me._id))
        .collect(),
      ctx.db
        .query("ticketLinks")
        .withIndex("by_user", (q) => q.eq("userId", me._id))
        .first(),
      ctx.db
        .query("partnerMembers")
        .withIndex("by_user", (q) => q.eq("userId", me._id))
        .collect(),
      ctx.db
        .query("favoriteSessions")
        .withIndex("by_user", (q) => q.eq("userId", me._id))
        .collect(),
      ctx.db
        .query("contacts")
        .withIndex("by_owner", (q) =>
          q.eq("ownerType", "user").eq("ownerId", me._id as string),
        )
        .collect(),
      ctx.db
        .query("scanEvents")
        .withIndex("by_scanner", (q) => q.eq("scannerUserId", me._id))
        .collect(),
      ctx.db
        .query("scanEvents")
        .withIndex("by_scanned", (q) => q.eq("scannedUserId", me._id))
        .collect(),
      ctx.db
        .query("auditLog")
        .withIndex("by_target_user", (q) => q.eq("targetUserId", me._id))
        .collect(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      user: {
        id: me._id,
        email: me.email,
        name: me.name,
        role: me.role,
        company: me.company,
        linkedinUrl: me.linkedinUrl,
        bio: me.bio,
        headline: me.headline,
        isSpeaker: me.isSpeaker,
        accessLevel: me.accessLevel ?? "member",
        publicToken: me.publicToken,
        ticketLinkedAt: me.ticketLinkedAt,
        lumaGuestId: me.lumaGuestId,
        teamId: me.teamId,
        onboardingCompletedAt: me.onboardingCompletedAt,
        createdAt: me._creationTime,
      },
      consents,
      goals,
      ticketLink,
      partnerMemberships,
      favorites: favorites.map((f) => f.sessionSlug),
      contacts: contactsAsOwner,
      scans: { by: scansBy, of: scansOf },
      auditMentions: auditEntries,
    };
  },
});

// Speakers: returns the agenda slot ids the user is presenting at by matching
// AGENDA[].speakerName === user.name. Caller passes the slot list (since
// agenda is static, no need to read it on the server).
export const speakerSlotsByName = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireActiveUser(ctx);
    return { isSpeaker: me.isSpeaker, name: me.name };
  },
});
