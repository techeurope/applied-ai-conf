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
    isSpeaker: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_workos_id", ["workosUserId"])
    .index("by_team", ["teamId"]),

  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    createdByUserId: v.id("users"),
  }).index("by_slug", ["slug"]),

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
      v.literal("visible_when_scanned"),
      v.literal("directory_listing"),
      v.literal("ai_fit_scoring"),
      v.literal("email_summaries"),
      v.literal("team_sharing"),
    ),
    granted: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user_key", ["userId", "key"]),

  scannedNotifications: defineTable({
    recipientUserId: v.id("users"),
    scannerUserId: v.id("users"),
    scanEventId: v.id("scanEvents"),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_recipient_unread", ["recipientUserId", "readAt"]),
});
