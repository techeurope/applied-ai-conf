import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    workosUserId: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    company: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    headline: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    teamId: v.optional(v.id("teams")),
    embeddingVersion: v.optional(v.number()),
    onboardingRequired: v.optional(v.boolean()),
    onboardingCompletedAt: v.optional(v.number()),
    isSpeaker: v.boolean(),
    deletedAt: v.optional(v.number()),
    accessLevel: v.optional(
      v.union(v.literal("admin"), v.literal("member"), v.literal("vendor")),
    ),
    deactivatedAt: v.optional(v.number()),
    deactivatedBy: v.optional(v.id("users")),
    deactivatedReason: v.optional(v.string()),
    claimCodeId: v.optional(v.id("claimCodes")),
    publicToken: v.optional(v.string()),
    ticketLinkedAt: v.optional(v.number()),
    lumaGuestId: v.optional(v.string()),
    // Terms & Conditions acceptance. Required to complete conference
    // onboarding (enforced in users.completeOnboarding). The version stamp
    // lets us re-prompt if the terms change. Absent on the bare worker
    // account — only the conference onboarding gate sets it.
    termsAcceptedAt: v.optional(v.number()),
    termsAcceptedVersion: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_workos_id", ["workosUserId"])
    .index("by_team", ["teamId"])
    .index("by_access_level", ["accessLevel"])
    .index("by_public_token", ["publicToken"]),

  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    createdByUserId: v.id("users"),
    kind: v.optional(v.union(v.literal("partner"), v.literal("regular"))),
    partnerTier: v.optional(v.string()),
    partnerBoothLocation: v.optional(v.string()),
    partnerBio: v.optional(v.string()),
    partnerWebsite: v.optional(v.string()),
    partnerVerifiedAt: v.optional(v.number()),
    partnerVerifiedByUserId: v.optional(v.id("users")),
    logoUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_kind", ["kind"]),

  partnerMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    invitedAt: v.number(),
    invitedByUserId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  partnerInvites: defineTable({
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    invitedAt: v.number(),
    invitedByUserId: v.id("users"),
    consumedAt: v.optional(v.number()),
    consumedByUserId: v.optional(v.id("users")),
    // Last time the owner kicked off an email to the invitee. Used to
    // throttle re-sends and to display "sent 2 min ago" on the UI.
    lastEmailedAt: v.optional(v.number()),
    // Recipient declined the invite. Owner can flip them back to active by
    // hitting "Send again" (clears declinedAt, bumps lastEmailedAt).
    declinedAt: v.optional(v.number()),
  })
    .index("by_team", ["teamId"])
    .index("by_email", ["email"]),

  // Shareable team join codes. One owner-generated code per team can be
  // distributed (link + 8-char code) to teammates so they self-attach
  // without the owner needing to know every email up front.
  teamInviteCodes: defineTable({
    teamId: v.id("teams"),
    code: v.string(),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    revokedAt: v.optional(v.number()),
    revokedByUserId: v.optional(v.id("users")),
    usesCount: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_team", ["teamId"]),

  profiles: defineTable({
    userId: v.id("users"),
    vertical: v.optional(v.string()),
    building: v.optional(v.string()),
    customFields: v.optional(v.array(v.object({ key: v.string(), value: v.string() }))),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),

  goals: defineTable({
    userId: v.id("users"),
    label: v.string(),
    order: v.number(),
  }).index("by_user", ["userId"]),

  contacts: defineTable({
    ownerType: v.union(v.literal("user"), v.literal("team")),
    ownerId: v.string(),
    contactedUserId: v.id("users"),
    firstScanAt: v.number(),
    lastScanAt: v.number(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    fitScore: v.optional(v.number()),
    fitThreads: v.optional(v.array(v.string())),
    // Partner-team-only lead qualification (ignored on personal contacts).
    leadStatus: v.optional(
      v.union(
        v.literal("hot"),
        v.literal("warm"),
        v.literal("cold"),
        v.literal("junk"),
      ),
    ),
    leadDescription: v.optional(v.string()),
  })
    .index("by_owner_contacted", ["ownerType", "ownerId", "contactedUserId"])
    .index("by_owner", ["ownerType", "ownerId"])
    .index("by_contacted", ["contactedUserId"]),

  scanEvents: defineTable({
    scannerUserId: v.id("users"),
    scannedUserId: v.id("users"),
    eventId: v.optional(v.id("events")),
    ts: v.number(),
    clientId: v.string(),
  })
    .index("by_client_id", ["clientId"])
    .index("by_scanner", ["scannerUserId"])
    .index("by_scanned", ["scannedUserId"]),

  events: defineTable({
    name: v.string(),
    slug: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    location: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  consents: defineTable({
    userId: v.id("users"),
    key: v.union(
      v.literal("visible_when_scanned"), // legacy: scanning is now governed by the Terms, no UI toggle
      v.literal("directory_listing"),
      v.literal("ai_fit_scoring"),
      v.literal("email_summaries"), // legacy, kept for existing rows; no UI
      v.literal("conference_updates"),
      v.literal("team_sharing"),
    ),
    granted: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user_key", ["userId", "key"]),

  pendingAttendees: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    jobRole: v.optional(v.string()),
    kind: v.union(
      v.literal("speaker"),
      v.literal("walkin"),
      v.literal("guest"),
      v.literal("staff"),
    ),
    note: v.optional(v.string()),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    claimedByUserId: v.optional(v.id("users")),
    claimedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_claimed", ["claimedByUserId"]),

  claimCodes: defineTable({
    code: v.string(),
    pendingAttendeeId: v.id("pendingAttendees"),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    revokedByUserId: v.optional(v.id("users")),
    claimedAt: v.optional(v.number()),
    claimedByUserId: v.optional(v.id("users")),
  })
    .index("by_code", ["code"])
    .index("by_pending_attendee", ["pendingAttendeeId"])
    .index("by_created", ["createdAt"]),

  ticketLinks: defineTable({
    userId: v.id("users"),
    lumaGuestId: v.string(),
    lumaEmail: v.string(),
    method: v.union(
      v.literal("auto"),
      v.literal("email_code"),
      v.literal("claim_code"),
      v.literal("admin_link"),
    ),
    verifiedAt: v.number(),
    verifiedByUserId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_luma_guest_id", ["lumaGuestId"]),

  // A pending request to move a ticket from one account (fromUserId) to
  // another (toUserId). Created when the email-code flow detects a conflict.
  // Approval comes from the current holder's inbox — the token in the email
  // is the auth, no signed-in session required to approve/decline.
  ticketTransferRequests: defineTable({
    token: v.string(),
    lumaGuestId: v.string(),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    requestedAt: v.number(),
    expiresAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("superseded"),
    ),
    resolvedAt: v.optional(v.number()),
    notifiedEmail: v.string(),
  })
    .index("by_token", ["token"])
    .index("by_to_user", ["toUserId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_luma_guest_id", ["lumaGuestId"]),

  // Per-email log of every voucher that's ever been issued, indexed by
  // (email, kind). Survives the cascade in cascadeDeleteUser — that's the
  // whole point — so a user who deletes and re-signs up gets the SAME
  // voucher token back rather than a fresh one. Kept under GDPR legitimate
  // interest (fraud prevention); contains only email + token, no profile.
  voucherIssuanceLog: defineTable({
    email: v.string(),
    kind: v.string(),
    publicToken: v.string(),
    firstIssuedAt: v.number(),
    lastReissuedAt: v.optional(v.number()),
    reissuanceCount: v.number(),
  }).index("by_email_kind", ["email", "kind"]),

  vouchers: defineTable({
    userId: v.id("users"),
    // Snapshot of the user's email at issue time. Used by
    // bootstrapIssueForVerifiedAttendees to dedupe across delete + re-signup
    // (which would otherwise issue a second voucher for the same person).
    // Optional for backfill of pre-existing rows.
    email: v.optional(v.string()),
    kind: v.string(), // "lunch", "coffee", "drink", etc.
    publicToken: v.string(), // vch_xxxxxxxx
    issuedAt: v.number(),
    issuedByUserId: v.optional(v.id("users")),
    redeemedAt: v.optional(v.number()),
    redeemedByUserId: v.optional(v.id("users")),
    note: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_kind", ["userId", "kind"])
    .index("by_email_kind", ["email", "kind"])
    .index("by_public_token", ["publicToken"]),

  sessions: defineTable({
    slug: v.string(),
    title: v.string(),
    speakerName: v.optional(v.string()),
    speakerNames: v.optional(v.array(v.string())),
    startMinutes: v.number(),
    endMinutes: v.number(),
    stage: v.union(v.literal("main"), v.literal("side"), v.literal("expo")),
    format: v.union(
      v.literal("keynote"),
      v.literal("talk"),
      v.literal("workshop"),
      v.literal("break"),
      v.literal("logistics"),
    ),
    description: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    cancelledByUserId: v.optional(v.id("users")),
  })
    .index("by_slug", ["slug"])
    .index("by_start", ["startMinutes"])
    .index("by_stage_start", ["stage", "startMinutes"]),

  favoriteSessions: defineTable({
    userId: v.id("users"),
    sessionSlug: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_session", ["userId", "sessionSlug"]),

  emailCodes: defineTable({
    userId: v.id("users"),
    targetEmail: v.string(),
    codeHash: v.string(),
    attempts: v.number(),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_email", ["userId", "targetEmail"]),

  lumaAttendees: defineTable({
    lumaGuestId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    ticketType: v.optional(v.string()),
    registeredAt: v.number(),
    approvalStatus: v.string(),
    checkedInAt: v.optional(v.number()),
    // The full check-in URL Luma exposes per guest (returned by get-guests).
    // Rendered as a QR on /app so attendees can scan in without opening their
    // Luma confirmation email.
    checkInQrCode: v.optional(v.string()),
    syncedAt: v.number(),
  })
    .index("by_luma_guest_id", ["lumaGuestId"])
    .index("by_email", ["email"]),

  // Pre-grant admin to an email before they've signed in. ensureFromWorkos
  // consumes a matching row on first auth and promotes the user. Set by the
  // existing admin via the bootstrap mutation.
  adminInvites: defineTable({
    email: v.string(),
    createdByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    consumedAt: v.optional(v.number()),
    consumedByUserId: v.optional(v.id("users")),
  })
    .index("by_email", ["email"])
    .index("by_consumed", ["consumedAt"]),

  auditLog: defineTable({
    actorUserId: v.id("users"),
    action: v.string(),
    targetUserId: v.optional(v.id("users")),
    targetClaimCodeId: v.optional(v.id("claimCodes")),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_actor", ["actorUserId", "createdAt"])
    .index("by_target_user", ["targetUserId", "createdAt"]),
});
