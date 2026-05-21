import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { requireAdmin } from "./admin";
import { requireActiveUser } from "./_auth";
import type { Doc, Id } from "./_generated/dataModel";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function requirePartnerMembership(
  ctx: MutationCtx,
  teamId: Id<"teams">,
): Promise<{ team: Doc<"teams">; member: Doc<"partnerMembers">; user: Doc<"users"> }> {
  const user = await requireActiveUser(ctx);
  const team = await ctx.db.get(teamId);
  if (!team) throw new Error("Team not found");
  const member = await ctx.db
    .query("partnerMembers")
    .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", user._id))
    .first();
  if (!member && user.accessLevel !== "admin") {
    throw new Error("Not a member of this team");
  }
  if (!member) {
    // Admin override — synthesize a virtual owner record for permission checks.
    return { team, member: { _id: "" as Id<"partnerMembers">, _creationTime: 0, teamId, userId: user._id, role: "owner", invitedAt: 0, invitedByUserId: user._id, joinedAt: 0 }, user };
  }
  return { team, member, user };
}

async function writeAudit(
  ctx: MutationCtx,
  actorUserId: Id<"users">,
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

// --- admin: list / get / create / update / verify ---------------------------

export const listTeams = query({
  args: { includeUnverified: v.optional(v.boolean()) },
  handler: async (ctx, { includeUnverified }) => {
    await requireAdmin(ctx);
    const all = await ctx.db
      .query("teams")
      .withIndex("by_kind", (q) => q.eq("kind", "partner"))
      .collect();
    const filtered = includeUnverified ? all : all.filter((t) => t.partnerVerifiedAt);
    return filtered.sort((a, b) => (b.partnerVerifiedAt ?? 0) - (a.partnerVerifiedAt ?? 0));
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") return null;
    const members = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
    const memberDetails = await Promise.all(
      members.map(async (m) => ({
        membership: m,
        user: await ctx.db.get(m.userId),
      })),
    );
    const invites = await ctx.db
      .query("partnerInvites")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
    return { team, members: memberDetails, invites };
  },
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    partnerTier: v.optional(v.string()),
    partnerBoothLocation: v.optional(v.string()),
    partnerBio: v.optional(v.string()),
    partnerWebsite: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const slug = slugify(args.slug || args.name);
    const clash = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (clash) throw new Error("A team with that slug already exists");
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      slug,
      createdByUserId: admin._id,
      kind: "partner",
      partnerTier: args.partnerTier,
      partnerBoothLocation: args.partnerBoothLocation,
      partnerBio: args.partnerBio,
      partnerWebsite: args.partnerWebsite,
    });
    await writeAudit(ctx, admin._id, "partner.create", { teamId, slug, name: args.name });
    return teamId;
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    patch: v.object({
      name: v.optional(v.string()),
      partnerTier: v.optional(v.string()),
      partnerBoothLocation: v.optional(v.string()),
      partnerBio: v.optional(v.string()),
      partnerWebsite: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { teamId, patch }) => {
    const admin = await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");
    await ctx.db.patch(teamId, patch);
    await writeAudit(ctx, admin._id, "partner.update", { teamId, patch });
    return teamId;
  },
});

export const verifyTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const admin = await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");
    if (team.partnerVerifiedAt) return teamId;
    await ctx.db.patch(teamId, {
      partnerVerifiedAt: Date.now(),
      partnerVerifiedByUserId: admin._id,
    });
    await writeAudit(ctx, admin._id, "partner.verify", { teamId });
    return teamId;
  },
});

export const unverifyTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const admin = await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");
    await ctx.db.patch(teamId, {
      partnerVerifiedAt: undefined,
      partnerVerifiedByUserId: undefined,
    });
    await writeAudit(ctx, admin._id, "partner.unverify", { teamId });
    return teamId;
  },
});

// --- admin: members + invites ------------------------------------------------

export const inviteMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
  },
  handler: async (ctx, { teamId, email, role }) => {
    const admin = await requireAdmin(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");
    const normalized = email.toLowerCase().trim();

    // If a user with that email already exists, attach immediately.
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();

    if (existingUser) {
      const existingMember = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team_user", (q) =>
          q.eq("teamId", teamId).eq("userId", existingUser._id),
        )
        .first();
      if (existingMember) throw new Error("Already a member");
      await ctx.db.insert("partnerMembers", {
        teamId,
        userId: existingUser._id,
        role,
        invitedAt: Date.now(),
        invitedByUserId: admin._id,
        joinedAt: Date.now(),
      });
      const userPatch: Record<string, unknown> = { teamId };
      if (!existingUser.ticketLinkedAt) userPatch.ticketLinkedAt = Date.now();
      await ctx.db.patch(existingUser._id, userPatch);
      await writeAudit(ctx, admin._id, "partner.member_add", {
        teamId,
        userId: existingUser._id,
        method: "existing_user",
      });
      return { kind: "attached" as const, userId: existingUser._id };
    }

    // Otherwise create a pending invite.
    const dupInvite = await ctx.db
      .query("partnerInvites")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .filter((q) => q.eq(q.field("consumedAt"), undefined))
      .first();
    if (dupInvite) throw new Error("Already invited");
    const inviteId = await ctx.db.insert("partnerInvites", {
      teamId,
      email: normalized,
      role,
      invitedAt: Date.now(),
      invitedByUserId: admin._id,
    });
    await writeAudit(ctx, admin._id, "partner.invite", { teamId, email: normalized });
    return { kind: "invited" as const, inviteId };
  },
});

export const removeMember = mutation({
  args: { teamId: v.id("teams"), userId: v.id("users") },
  handler: async (ctx, { teamId, userId }) => {
    const admin = await requireAdmin(ctx);
    const member = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
      .first();
    if (!member) throw new Error("Not a member");
    await ctx.db.delete(member._id);
    const user = await ctx.db.get(userId);
    if (user?.teamId === teamId) {
      await ctx.db.patch(userId, { teamId: undefined });
    }
    await writeAudit(ctx, admin._id, "partner.member_remove", { teamId, userId });
    return true;
  },
});

export const revokeInvite = mutation({
  args: { inviteId: v.id("partnerInvites") },
  handler: async (ctx, { inviteId }) => {
    const admin = await requireAdmin(ctx);
    const invite = await ctx.db.get(inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.consumedAt) throw new Error("Already consumed");
    await ctx.db.delete(inviteId);
    await writeAudit(ctx, admin._id, "partner.invite_revoke", {
      teamId: invite.teamId,
      email: invite.email,
    });
    return true;
  },
});

// --- bootstrap: idempotent seed for known sponsor teams --------------------

export const bootstrapSeedPartners = internalMutation({
  args: {
    entries: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        tier: v.string(),
        website: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    // Use the first admin we find as the createdBy/verifiedBy actor.
    const admin = await ctx.db
      .query("users")
      .withIndex("by_access_level", (q) => q.eq("accessLevel", "admin"))
      .first();
    if (!admin) {
      throw new Error("No admin user exists. Grant admin first.");
    }
    const result: Array<{ slug: string; status: "created" | "exists" }> = [];
    for (const entry of entries) {
      const existing = await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", entry.slug))
        .first();
      if (existing) {
        result.push({ slug: entry.slug, status: "exists" });
        continue;
      }
      const now = Date.now();
      await ctx.db.insert("teams", {
        name: entry.name,
        slug: entry.slug,
        createdByUserId: admin._id,
        kind: "partner",
        partnerTier: entry.tier,
        partnerWebsite: entry.website,
        partnerVerifiedAt: now,
        partnerVerifiedByUserId: admin._id,
      });
      result.push({ slug: entry.slug, status: "created" });
    }
    return result;
  },
});

// --- consumed by ensureFromWorkos to auto-attach a signed-up invitee --------

export async function consumePartnerInviteIfAny(ctx: MutationCtx, user: Doc<"users">) {
  if (!user.email) return null;
  if (user.teamId) return null;
  const invite = await ctx.db
    .query("partnerInvites")
    .withIndex("by_email", (q) => q.eq("email", user.email))
    .filter((q) => q.eq(q.field("consumedAt"), undefined))
    .first();
  if (!invite) return null;
  await ctx.db.patch(invite._id, {
    consumedAt: Date.now(),
    consumedByUserId: user._id,
  });
  await ctx.db.insert("partnerMembers", {
    teamId: invite.teamId,
    userId: user._id,
    role: invite.role,
    invitedAt: invite.invitedAt,
    invitedByUserId: invite.invitedByUserId,
    joinedAt: Date.now(),
  });
  const patch: Record<string, unknown> = { teamId: invite.teamId };
  if (!user.ticketLinkedAt) patch.ticketLinkedAt = Date.now();
  await ctx.db.patch(user._id, patch);
  return invite.teamId;
}

// --- partner-member-facing queries -------------------------------------------

export const myTeam = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user?.teamId) return null;
    const team = await ctx.db.get(user.teamId);
    if (!team || team.kind !== "partner") return null;
    const member = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", team._id).eq("userId", user._id))
      .first();
    return { team, role: member?.role ?? null };
  },
});

export const myTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me?.teamId) return [];
    const rows = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team", (q) => q.eq("teamId", me.teamId!))
      .collect();
    return await Promise.all(
      rows.map(async (r) => ({
        membership: r,
        user: await ctx.db.get(r.userId),
      })),
    );
  },
});

export const myTeamLeads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me?.teamId) return [];
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", "team").eq("ownerId", me.teamId as string),
      )
      .order("desc")
      .collect();
    return await Promise.all(
      contacts.map(async (c) => {
        const lead = await ctx.db.get(c.contactedUserId);
        return { contact: c, lead };
      }),
    );
  },
});

// --- public profile (anyone can view) ----------------------------------------

export const publicProfile = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!team || team.kind !== "partner" || !team.partnerVerifiedAt) return null;
    // Show members who opted into the public directory.
    const members = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();
    const visibleMembers: Array<{ name: string; role?: string; publicToken?: string }> = [];
    for (const m of members) {
      const u = await ctx.db.get(m.userId);
      if (!u || u.deletedAt || u.deactivatedAt) continue;
      const consent = await ctx.db
        .query("consents")
        .withIndex("by_user_key", (q) =>
          q.eq("userId", u._id).eq("key", "directory_listing"),
        )
        .first();
      if (consent?.granted) {
        visibleMembers.push({
          name: u.name,
          role: u.role,
          publicToken: u.publicToken,
        });
      }
    }
    return {
      name: team.name,
      slug: team.slug,
      tier: team.partnerTier,
      booth: team.partnerBoothLocation,
      bio: team.partnerBio,
      website: team.partnerWebsite,
      members: visibleMembers,
    };
  },
});
