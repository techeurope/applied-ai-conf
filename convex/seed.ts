import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_WORKOS_IDS = new Set([
  "user_01KRVWC1FQMF5JNK21MHEA0865",
]);

async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  if (!ADMIN_WORKOS_IDS.has(identity.subject)) throw new Error(`Admin only (you are ${identity.subject})`);
  return identity;
}

const speakerSchema = v.object({
  slug: v.string(),
  name: v.string(),
  title: v.optional(v.string()),
  company: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  headline: v.optional(v.string()),
});

export const seedSpeakers = mutation({
  args: { speakers: v.array(speakerSchema) },
  handler: async (ctx, { speakers }) => {
    await requireAdmin(ctx);

    let inserted = 0;
    let skipped = 0;
    for (const s of speakers) {
      const workosUserId = `speaker:${s.slug}`;
      const existing = await ctx.db
        .query("users")
        .withIndex("by_workos_id", (q) => q.eq("workosUserId", workosUserId))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("users", {
        email: `${s.slug}@speakers.appliedaiconf.io`,
        workosUserId,
        name: s.name,
        role: s.title,
        company: s.company,
        linkedinUrl: s.linkedinUrl,
        bio: s.bio,
        headline: s.headline,
        isSpeaker: true,
      });
      inserted++;
    }
    return { inserted, skipped, total: speakers.length };
  },
});

export const listSpeakers = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").filter((q) => q.eq(q.field("isSpeaker"), true)).collect();
  },
});
