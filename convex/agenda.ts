import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./admin";

// ---- helpers ---------------------------------------------------------------

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseHHMM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function toClientSlot(s: Doc<"sessions">) {
  return {
    _id: s._id,
    id: s.slug,
    slug: s.slug,
    title: s.title,
    speakerName: s.speakerName,
    speakerNames: s.speakerNames,
    startTime: toHHMM(s.startMinutes),
    endTime: toHHMM(s.endMinutes),
    startMinutes: s.startMinutes,
    endMinutes: s.endMinutes,
    stage: s.stage,
    format: s.format,
    description: s.description,
    cancelledAt: s.cancelledAt,
  };
}

// ---- public read -----------------------------------------------------------

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("sessions").withIndex("by_start").collect();
    return all
      .sort((a, b) => {
        if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
        if (a.stage !== b.stage) return a.stage === "main" ? -1 : 1;
        return a.slug.localeCompare(b.slug);
      })
      .map(toClientSlot);
  },
});

// ---- admin write -----------------------------------------------------------

const sessionPatchArgs = {
  title: v.optional(v.string()),
  speakerName: v.optional(v.string()),
  speakerNames: v.optional(v.array(v.string())),
  startTime: v.optional(v.string()), // "HH:MM"
  endTime: v.optional(v.string()),
  stage: v.optional(v.union(v.literal("main"), v.literal("side"), v.literal("expo"))),
  format: v.optional(
    v.union(
      v.literal("keynote"),
      v.literal("talk"),
      v.literal("workshop"),
      v.literal("break"),
      v.literal("logistics"),
    ),
  ),
  description: v.optional(v.string()),
};

async function writeAudit(
  ctx: MutationCtx,
  actorUserId: Doc<"users">["_id"],
  action: string,
  meta?: Record<string, unknown>,
) {
  await ctx.db.insert("auditLog", {
    actorUserId,
    action,
    metadata: meta ? JSON.stringify(meta) : undefined,
    createdAt: Date.now(),
  });
}

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    stage: v.union(v.literal("main"), v.literal("side"), v.literal("expo")),
    format: v.union(
      v.literal("keynote"),
      v.literal("talk"),
      v.literal("workshop"),
      v.literal("break"),
      v.literal("logistics"),
    ),
    speakerName: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const clash = await ctx.db
      .query("sessions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (clash) throw new Error(`Session with slug "${args.slug}" already exists`);
    const startMinutes = parseHHMM(args.startTime);
    const endMinutes = parseHHMM(args.endTime);
    if (endMinutes <= startMinutes) throw new Error("End must be after start");
    const id = await ctx.db.insert("sessions", {
      slug: args.slug,
      title: args.title,
      speakerName: args.speakerName,
      startMinutes,
      endMinutes,
      stage: args.stage,
      format: args.format,
      description: args.description,
    });
    await writeAudit(ctx, admin._id, "agenda.create", {
      slug: args.slug,
      title: args.title,
    });
    return id;
  },
});

export const update = mutation({
  args: { sessionId: v.id("sessions"), patch: v.object(sessionPatchArgs) },
  handler: async (ctx, { sessionId, patch }) => {
    const admin = await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.speakerName !== undefined) dbPatch.speakerName = patch.speakerName;
    if (patch.speakerNames !== undefined) dbPatch.speakerNames = patch.speakerNames;
    if (patch.startTime !== undefined) dbPatch.startMinutes = parseHHMM(patch.startTime);
    if (patch.endTime !== undefined) dbPatch.endMinutes = parseHHMM(patch.endTime);
    if (patch.stage !== undefined) dbPatch.stage = patch.stage;
    if (patch.format !== undefined) dbPatch.format = patch.format;
    if (patch.description !== undefined) dbPatch.description = patch.description;

    const start =
      (dbPatch.startMinutes as number | undefined) ?? session.startMinutes;
    const end = (dbPatch.endMinutes as number | undefined) ?? session.endMinutes;
    if (end <= start) throw new Error("End must be after start");

    await ctx.db.patch(sessionId, dbPatch);
    await writeAudit(ctx, admin._id, "agenda.update", {
      sessionId,
      slug: session.slug,
      patch,
    });
    return sessionId;
  },
});

export const remove = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const admin = await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    await ctx.db.delete(sessionId);
    await writeAudit(ctx, admin._id, "agenda.delete", {
      sessionId,
      slug: session.slug,
    });
  },
});

export const setCancelled = mutation({
  args: { sessionId: v.id("sessions"), cancelled: v.boolean() },
  handler: async (ctx, { sessionId, cancelled }) => {
    const admin = await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    await ctx.db.patch(sessionId, {
      cancelledAt: cancelled ? Date.now() : undefined,
      cancelledByUserId: cancelled ? admin._id : undefined,
    });
    await writeAudit(ctx, admin._id, cancelled ? "agenda.cancel" : "agenda.uncancel", {
      sessionId,
      slug: session.slug,
    });
  },
});

// ---- bootstrap -------------------------------------------------------------

// Patch speakerNames (the joint-talk array field) onto existing session
// rows by slug. bootstrapSeed didn't take speakerNames, so joint talks
// imported with both speakerName + speakerNames undefined — which made
// them render with no name + no cover image. Idempotent: only patches
// rows where the array isn't already set.
export const bootstrapPatchSpeakerNames = internalMutation({
  args: {
    entries: v.array(
      v.object({
        slug: v.string(),
        speakerNames: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    const summary: Array<{ slug: string; outcome: "patched" | "not_found" | "already_set" }> = [];
    for (const e of entries) {
      const row = await ctx.db
        .query("sessions")
        .withIndex("by_slug", (q) => q.eq("slug", e.slug))
        .first();
      if (!row) {
        summary.push({ slug: e.slug, outcome: "not_found" });
        continue;
      }
      if (row.speakerNames && row.speakerNames.length > 0) {
        summary.push({ slug: e.slug, outcome: "already_set" });
        continue;
      }
      await ctx.db.patch(row._id, { speakerNames: e.speakerNames });
      summary.push({ slug: e.slug, outcome: "patched" });
    }
    return summary;
  },
});

// Collapses duplicated per-stage break rows down to a single expo-hall row.
// Idempotent: deletes any `*-side` break/lunch dupes, patches the surviving
// primary row to stage="expo". Re-runnable safely. Audited.
export const collapseExpoBreaks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const removed: string[] = [];
    const promoted: string[] = [];
    const all = await ctx.db.query("sessions").collect();
    // Group by (title, startMinutes) — venue events share both.
    const groups = new Map<string, Doc<"sessions">[]>();
    for (const s of all) {
      if (s.format !== "break" && s.format !== "logistics") continue;
      const key = `${s.title}|${s.startMinutes}|${s.endMinutes}`;
      const arr = groups.get(key) ?? [];
      arr.push(s);
      groups.set(key, arr);
    }
    for (const [, rows] of groups) {
      // Only collapse if there's an actual duplicate. Solo logistics rows
      // (Opening Remarks, Closing Remarks) genuinely happen on the main
      // stage, so leave them alone.
      if (rows.length < 2) continue;
      // Pick the row to keep: shortest slug (e.g. "break-1" over
      // "break-1-side"). Drop the rest, promote the survivor to expo.
      rows.sort((a, b) => a.slug.length - b.slug.length);
      const keep = rows[0];
      const drop = rows.slice(1);
      for (const d of drop) {
        await ctx.db.delete(d._id);
        removed.push(d.slug);
      }
      if (keep.stage !== "expo") {
        await ctx.db.patch(keep._id, { stage: "expo" });
        promoted.push(keep.slug);
      }
    }
    return { removed, promoted };
  },
});

// One-shot fix for the over-eager initial run of collapseExpoBreaks: it
// promoted solo logistics rows to "expo" by mistake. This puts Opening +
// Closing Remarks back on the main stage. Idempotent.
export const fixSoloLogisticsStage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fixed: string[] = [];
    const all = await ctx.db.query("sessions").collect();
    for (const s of all) {
      if (s.format !== "logistics") continue;
      // "Doors Open · Registration & Coffee" actually IS venue-wide (the
      // foyer / expo floor), so leave that as expo. Anything else logistics
      // belongs on main.
      if (s.slug === "doors") continue;
      if (s.stage !== "main") {
        await ctx.db.patch(s._id, { stage: "main" });
        fixed.push(s.slug);
      }
    }
    return { fixed };
  },
});

export const bootstrapSeed = internalMutation({
  args: {
    entries: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        speakerName: v.optional(v.string()),
        startTime: v.string(),
        endTime: v.string(),
        stage: v.union(v.literal("main"), v.literal("side"), v.literal("expo")),
        format: v.union(
          v.literal("keynote"),
          v.literal("talk"),
          v.literal("workshop"),
          v.literal("break"),
          v.literal("logistics"),
        ),
        description: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    const summary: Record<string, "created" | "exists"> = {};
    for (const e of entries) {
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_slug", (q) => q.eq("slug", e.slug))
        .first();
      if (existing) {
        summary[e.slug] = "exists";
        continue;
      }
      await ctx.db.insert("sessions", {
        slug: e.slug,
        title: e.title,
        speakerName: e.speakerName,
        startMinutes: parseHHMM(e.startTime),
        endMinutes: parseHHMM(e.endTime),
        stage: e.stage,
        format: e.format,
        description: e.description,
      });
      summary[e.slug] = "created";
    }
    return summary;
  },
});
