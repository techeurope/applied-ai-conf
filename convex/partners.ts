import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import { requireAdmin } from "./admin";
import { requireActiveUser } from "./_auth";
import { internal } from "./_generated/api";
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

// Race-safe partnerMembers dedupe. Two concurrent inserts for the same
// (teamId, userId) can slip past existence checks; keep the oldest row,
// delete the rest.
async function dedupePartnerMember(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  userId: Id<"users">,
): Promise<void> {
  const rows = await ctx.db
    .query("partnerMembers")
    .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
    .collect();
  if (rows.length <= 1) return;
  const sorted = rows.sort((a, b) => a.joinedAt - b.joinedAt);
  for (const extra of sorted.slice(1)) {
    await ctx.db.delete(extra._id);
  }
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

// Team-owner-scoped invite: any member with role="owner" can invite teammates
// without needing the conference admin in the loop. Sends a Resend email so
// the invitee knows what they signed up for.
export const ownerInviteMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
  },
  handler: async (ctx, { teamId, email, role }) => {
    const me = await requireActiveUser(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");
    const myMembership = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", me._id))
      .first();
    const isOwner = myMembership?.role === "owner";
    const isAdmin = me.accessLevel === "admin";
    if (!isOwner && !isAdmin) throw new Error("Only the team owner can invite");

    const normalized = email.toLowerCase().trim();

    // Reject the obvious "they're already in" case so the owner gets a clean
    // error instead of a useless invite.
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
    }

    // Existing pending invite? Refuse — owner should hit "Send again" on the
    // team page instead, which calls resendTeamInvite and bumps lastEmailedAt
    // without inserting a duplicate row.
    const dupInvite = await ctx.db
      .query("partnerInvites")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .filter((q) => q.eq(q.field("consumedAt"), undefined))
      .first();
    if (dupInvite) {
      throw new Error(
        dupInvite.declinedAt
          ? "They previously declined. Hit Send again on the pending invite."
          : "Already invited — hit Send again on the pending invite to remind them.",
      );
    }
    const inviteId = await ctx.db.insert("partnerInvites", {
      teamId,
      email: normalized,
      role,
      invitedAt: Date.now(),
      invitedByUserId: me._id,
      lastEmailedAt: Date.now(),
    });
    await writeAudit(ctx, me._id, "partner.owner_invite", {
      teamId,
      email: normalized,
    });
    // Fire the email (best-effort — schedule, don't block).
    await ctx.scheduler.runAfter(0, internal.admin_email.sendTeamInvite, {
      email: normalized,
      inviteId: inviteId as unknown as string,
      teamName: team.name,
      inviterName: me.name,
    });
    return { kind: "invited" as const, inviteId, teamName: team.name };
  },
});

// Promote or demote a partner team member. Admin can do this on any team;
// team owners can do it within their own team. Refuses to demote the last
// owner to prevent locking the team out.
export const setMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
  },
  handler: async (ctx, { teamId, userId, role }) => {
    const me = await requireActiveUser(ctx);
    const team = await ctx.db.get(teamId);
    if (!team || team.kind !== "partner") throw new Error("Team not found");

    const myMembership = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", me._id))
      .first();
    const isAdmin = me.accessLevel === "admin";
    const isOwner = myMembership?.role === "owner";
    if (!isAdmin && !isOwner) throw new Error("Only the team owner or admin");

    const target = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", teamId).eq("userId", userId))
      .first();
    if (!target) throw new Error("Not a member");
    if (target.role === role) return target._id;

    // Don't allow demoting the last owner.
    if (target.role === "owner" && role === "member") {
      const members = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();
      const owners = members.filter((m) => m.role === "owner");
      if (owners.length <= 1) {
        throw new Error("Can't demote the last owner — promote someone else first.");
      }
    }

    await ctx.db.patch(target._id, { role });
    await writeAudit(ctx, me._id, "partner.set_role", {
      teamId,
      userId,
      newRole: role,
      previousRole: target.role,
    });
    return target._id;
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

// QA helper: move an existing user from whatever partner team they're on
// today onto a freshly-created "Tech Europe" team (creating it if missing)
// as an owner. Used so the internal team can exercise team features without
// polluting real partner team data.
// Add a list of emails to Tech Europe. Each email is handled by exact match:
//   - If a Convex user already exists → add (or upgrade) partnerMember row +
//     set their teamId. Already-an-owner stays owner.
//   - Otherwise → create a partnerInvites row keyed by email so the existing
//     consumePartnerInviteIfAny path auto-attaches them on first sign-in.
// Idempotent — won't duplicate memberships or invites.
export const bootstrapAddTechEuropeByEmails = internalMutation({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, { emails }) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", "tech-europe"))
      .first();
    if (!team) throw new Error("Tech Europe team not found");

    const out: Array<{
      email: string;
      outcome:
        | "added_user"
        | "already_member"
        | "invite_queued"
        | "invite_existed";
      detail?: string;
    }> = [];

    for (const raw of emails) {
      const email = raw.toLowerCase().trim();
      if (!email) continue;

      // 1) Existing Convex user?
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user) {
        const existing = await ctx.db
          .query("partnerMembers")
          .withIndex("by_team_user", (q) =>
            q.eq("teamId", team._id).eq("userId", user._id),
          )
          .first();
        if (existing) {
          out.push({
            email,
            outcome: "already_member",
            detail: user.name,
          });
          continue;
        }
        // Remove any membership on other partner teams first.
        const otherMemberships = await ctx.db
          .query("partnerMembers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        for (const m of otherMemberships) {
          if (m.teamId !== team._id) await ctx.db.delete(m._id);
        }
        const now = Date.now();
        await ctx.db.insert("partnerMembers", {
          teamId: team._id,
          userId: user._id,
          role: "member",
          invitedAt: now,
          invitedByUserId: team.createdByUserId,
          joinedAt: now,
        });
        await ctx.db.patch(user._id, { teamId: team._id });
        out.push({
          email,
          outcome: "added_user",
          detail: user.name,
        });
        continue;
      }

      // 2) No user yet → queue a partnerInvite. consumePartnerInviteIfAny in
      // users.ensureFromWorkos picks it up on first sign-in.
      const dup = await ctx.db
        .query("partnerInvites")
        .withIndex("by_email", (q) => q.eq("email", email))
        .filter((q) => q.eq(q.field("teamId"), team._id))
        .filter((q) => q.eq(q.field("consumedAt"), undefined))
        .first();
      if (dup) {
        out.push({ email, outcome: "invite_existed" });
        continue;
      }
      const inviteId = await ctx.db.insert("partnerInvites", {
        teamId: team._id,
        email,
        role: "member",
        invitedAt: Date.now(),
        invitedByUserId: team.createdByUserId,
        lastEmailedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(0, internal.admin_email.sendTeamInvite, {
        email,
        inviteId: inviteId as unknown as string,
        teamName: team.name,
        inviterName: undefined,
      });
      out.push({ email, outcome: "invite_queued" });
    }
    return out;
  },
});

// Internal helper: email every pending invite that hasn't been emailed yet
// (lastEmailedAt undefined). Used to retroactively notify invites created
// before the email pipeline existed. Idempotent.
export const bootstrapEmailUnemailedInvites = internalMutation({
  args: {},
  handler: async (ctx) => {
    const invites = await ctx.db.query("partnerInvites").collect();
    const emailed: Array<{ email: string; team: string }> = [];
    for (const inv of invites) {
      if (inv.consumedAt) continue;
      if (inv.lastEmailedAt) continue;
      const team = await ctx.db.get(inv.teamId);
      if (!team) continue;
      const inviter = await ctx.db.get(inv.invitedByUserId);
      await ctx.db.patch(inv._id, { lastEmailedAt: Date.now() });
      await ctx.scheduler.runAfter(0, internal.admin_email.sendTeamInvite, {
        email: inv.email,
        inviteId: inv._id as unknown as string,
        teamName: team.name,
        inviterName: inviter?.name,
      });
      emailed.push({ email: inv.email, team: team.name });
    }
    return emailed;
  },
});

export const bootstrapMoveUserToTechEurope = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!user) throw new Error(`No user with email ${normalized}`);

    // 1. Find or create the Tech Europe team.
    const slug = "tech-europe";
    let team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    let createdTeam = false;
    if (!team) {
      const now = Date.now();
      const teamId = await ctx.db.insert("teams", {
        name: "Tech Europe",
        slug,
        createdByUserId: user._id,
        kind: "partner",
        partnerTier: "internal",
        partnerWebsite: "https://techeurope.io",
        partnerVerifiedAt: now,
        partnerVerifiedByUserId: user._id,
      });
      team = (await ctx.db.get(teamId))!;
      createdTeam = true;
    }

    // 2. Remove user's existing partnerMember rows on OTHER teams.
    const removedFrom: string[] = [];
    const memberships = await ctx.db
      .query("partnerMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const m of memberships) {
      if (m.teamId === team._id) continue;
      const otherTeam = await ctx.db.get(m.teamId);
      await ctx.db.delete(m._id);
      if (otherTeam) removedFrom.push(otherTeam.name);
    }

    // 3. Insert membership on Tech Europe as owner (if not already there).
    const existing = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", team._id).eq("userId", user._id),
      )
      .first();
    if (existing) {
      if (existing.role !== "owner") {
        await ctx.db.patch(existing._id, { role: "owner" });
      }
    } else {
      const now = Date.now();
      await ctx.db.insert("partnerMembers", {
        teamId: team._id,
        userId: user._id,
        role: "owner",
        invitedAt: now,
        invitedByUserId: user._id,
        joinedAt: now,
      });
    }

    // 4. Point user.teamId at Tech Europe.
    await ctx.db.patch(user._id, { teamId: team._id });

    return {
      teamId: team._id,
      teamCreated: createdTeam,
      removedFrom,
      userId: user._id,
    };
  },
});

// QA helper: pull the internal {Tech: Europe} crew onto the Tech Europe
// partner team so Tim can scan their QRs from his phone for end-to-end
// testing. Matches each input string against:
//   1. existing Convex user (by email OR case-insensitive name contains)
//   2. lumaAttendees (by email OR name contains, approved only)
// If matched in users, adds them as partnerMembers and points teamId.
// If matched only in luma (no Convex user yet), creates a partnerInvites
// row so they auto-attach on first sign-in. Idempotent.
// Diagnostic: list every user + Luma attendee with a techeurope.io email so
// we can pick the right ones for the internal crew add.
// Cleanup: delete a specific email's partnerInvite from Tech Europe (used
// after fuzzy-match mistakes).
export const bootstrapRemoveTechEuropeInvite = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", "tech-europe"))
      .first();
    if (!team) throw new Error("Tech Europe team not found");
    const normalized = email.toLowerCase().trim();
    const invites = await ctx.db
      .query("partnerInvites")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .filter((q) => q.eq(q.field("teamId"), team._id))
      .collect();
    for (const inv of invites) {
      await ctx.db.delete(inv._id);
    }
    return { removed: invites.length };
  },
});

export const bootstrapListTechEuropeContacts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const luma = await ctx.db.query("lumaAttendees").collect();
    return {
      users: users
        .filter((u) => (u.email ?? "").endsWith("@techeurope.io"))
        .map((u) => ({
          name: u.name,
          email: u.email,
          publicToken: u.publicToken,
          teamId: u.teamId,
        })),
      luma: luma
        .filter((l) => (l.email ?? "").endsWith("@techeurope.io"))
        .map((l) => ({
          name: l.name,
          email: l.email,
          approvalStatus: l.approvalStatus,
        })),
    };
  },
});

export const bootstrapAddTechEuropeCrew = internalMutation({
  args: { names: v.array(v.string()) },
  handler: async (ctx, { names }) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", "tech-europe"))
      .first();
    if (!team) {
      throw new Error("Tech Europe team not found. Run bootstrapMoveUserToTechEurope first.");
    }

    const result: Array<{
      query: string;
      outcome:
        | "added_user"
        | "already_member"
        | "invited_via_luma"
        | "luma_no_match"
        | "no_match";
      detail?: string;
      publicToken?: string;
      lumaEmail?: string;
    }> = [];

    for (const raw of names) {
      const needle = raw.toLowerCase().trim();
      if (!needle) {
        result.push({ query: raw, outcome: "no_match" });
        continue;
      }

      // 1) Existing Convex user — email exact OR name contains.
      const allUsers = await ctx.db.query("users").collect();
      const user = allUsers.find(
        (u) =>
          u.email === needle ||
          (u.name ?? "").toLowerCase().includes(needle),
      );

      if (user) {
        const existing = await ctx.db
          .query("partnerMembers")
          .withIndex("by_team_user", (q) =>
            q.eq("teamId", team._id).eq("userId", user._id),
          )
          .first();
        if (existing) {
          result.push({
            query: raw,
            outcome: "already_member",
            detail: user.name,
            publicToken: user.publicToken,
          });
          continue;
        }
        // Remove from other partner teams first.
        const otherMemberships = await ctx.db
          .query("partnerMembers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        for (const m of otherMemberships) {
          if (m.teamId !== team._id) await ctx.db.delete(m._id);
        }
        const now = Date.now();
        await ctx.db.insert("partnerMembers", {
          teamId: team._id,
          userId: user._id,
          role: "member",
          invitedAt: now,
          invitedByUserId: team.createdByUserId,
          joinedAt: now,
        });
        await ctx.db.patch(user._id, { teamId: team._id });
        result.push({
          query: raw,
          outcome: "added_user",
          detail: user.name,
          publicToken: user.publicToken,
        });
        continue;
      }

      // 2) Luma row — make a partnerInvite by email so they auto-attach.
      const lumaRows = await ctx.db.query("lumaAttendees").collect();
      const luma = lumaRows.find(
        (l) =>
          l.email === needle ||
          (l.name ?? "").toLowerCase().includes(needle),
      );
      if (luma) {
        if (luma.approvalStatus !== "approved") {
          result.push({
            query: raw,
            outcome: "luma_no_match",
            detail: `Found in Luma but status=${luma.approvalStatus}`,
            lumaEmail: luma.email,
          });
          continue;
        }
        const dupInvite = await ctx.db
          .query("partnerInvites")
          .withIndex("by_email", (q) => q.eq("email", luma.email))
          .filter((q) => q.eq(q.field("teamId"), team._id))
          .filter((q) => q.eq(q.field("consumedAt"), undefined))
          .first();
        if (!dupInvite) {
          await ctx.db.insert("partnerInvites", {
            teamId: team._id,
            email: luma.email,
            role: "member",
            invitedAt: Date.now(),
            invitedByUserId: team.createdByUserId,
          });
        }
        result.push({
          query: raw,
          outcome: "invited_via_luma",
          detail: luma.name ?? luma.email,
          lumaEmail: luma.email,
        });
        continue;
      }

      result.push({ query: raw, outcome: "no_match" });
    }

    return result;
  },
});

export const bootstrapSeedPartners = internalMutation({
  args: {
    entries: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        tier: v.string(),
        website: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
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
    const result: Array<{ slug: string; status: "created" | "updated" | "exists" }> = [];
    for (const entry of entries) {
      const existing = await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", entry.slug))
        .first();
      if (existing) {
        // Backfill logoUrl + website on existing rows but don't touch other fields.
        const patch: Record<string, unknown> = {};
        if (entry.logoUrl && existing.logoUrl !== entry.logoUrl) patch.logoUrl = entry.logoUrl;
        if (entry.website && existing.partnerWebsite !== entry.website) patch.partnerWebsite = entry.website;
        if (Object.keys(patch).length) {
          await ctx.db.patch(existing._id, patch);
          result.push({ slug: entry.slug, status: "updated" });
        } else {
          result.push({ slug: entry.slug, status: "exists" });
        }
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
        logoUrl: entry.logoUrl,
      });
      result.push({ slug: entry.slug, status: "created" });
    }
    return result;
  },
});

// Bulk-attach Luma attendees to partner teams by matching email domain.
// For each approved Luma row whose email host is in domainMap, the row is
// either: (a) auto-attached as a partnerMember if a Convex user with that
// email already exists, or (b) recorded as a partnerInvites row so they
// auto-attach on first sign-in. Idempotent.
export const bootstrapAttachByDomain = internalMutation({
  args: {
    domainMap: v.array(
      v.object({
        domain: v.string(), // lowercase, no @
        slug: v.string(),
        role: v.optional(v.union(v.literal("owner"), v.literal("member"))),
      }),
    ),
    tickets: v.optional(v.array(v.string())), // restrict to these ticket types; empty = all approved
  },
  handler: async (ctx, { domainMap, tickets }) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_access_level", (q) => q.eq("accessLevel", "admin"))
      .first();
    if (!admin) throw new Error("No admin user exists. Grant admin first.");

    const teamBySlug = new Map<string, Doc<"teams">>();
    for (const m of domainMap) {
      const team = await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", m.slug))
        .first();
      if (!team || team.kind !== "partner") continue;
      teamBySlug.set(m.slug, team);
    }

    const allowedTickets = tickets && tickets.length > 0 ? new Set(tickets) : null;
    const summary: Record<
      string,
      { attached: number; invited: number; alreadyMember: number; skipped: number }
    > = {};

    const luma = await ctx.db.query("lumaAttendees").collect();
    for (const row of luma) {
      if (row.approvalStatus !== "approved") continue;
      if (allowedTickets && (!row.ticketType || !allowedTickets.has(row.ticketType))) continue;
      const at = row.email.indexOf("@");
      if (at < 0) continue;
      const host = row.email.slice(at + 1).toLowerCase();
      const match = domainMap.find((m) => m.domain === host);
      if (!match) continue;
      const team = teamBySlug.get(match.slug);
      if (!team) continue;
      const role = match.role ?? "owner";
      summary[match.slug] ??= { attached: 0, invited: 0, alreadyMember: 0, skipped: 0 };

      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", row.email))
        .first();

      if (existingUser) {
        const memberRow = await ctx.db
          .query("partnerMembers")
          .withIndex("by_team_user", (q) =>
            q.eq("teamId", team._id).eq("userId", existingUser._id),
          )
          .first();
        if (memberRow) {
          summary[match.slug].alreadyMember += 1;
          continue;
        }
        // Skip if user already belongs to a different team.
        if (existingUser.teamId && existingUser.teamId !== team._id) {
          summary[match.slug].skipped += 1;
          continue;
        }
        await ctx.db.insert("partnerMembers", {
          teamId: team._id,
          userId: existingUser._id,
          role,
          invitedAt: Date.now(),
          invitedByUserId: admin._id,
          joinedAt: Date.now(),
        });
        const patch: Record<string, unknown> = { teamId: team._id };
        if (!existingUser.ticketLinkedAt) patch.ticketLinkedAt = Date.now();
        await ctx.db.patch(existingUser._id, patch);
        summary[match.slug].attached += 1;
      } else {
        const dup = await ctx.db
          .query("partnerInvites")
          .withIndex("by_email", (q) => q.eq("email", row.email))
          .filter((q) => q.eq(q.field("teamId"), team._id))
          .filter((q) => q.eq(q.field("consumedAt"), undefined))
          .first();
        if (dup) {
          summary[match.slug].alreadyMember += 1;
          continue;
        }
        await ctx.db.insert("partnerInvites", {
          teamId: team._id,
          email: row.email,
          role,
          invitedAt: Date.now(),
          invitedByUserId: admin._id,
        });
        summary[match.slug].invited += 1;
      }
    }
    return summary;
  },
});

// Removes partner teams whose tier is in the given list, deleting their
// memberships + pending invites first.  Used to retire "community" tier.
export const bootstrapPurgeTeamsByTier = internalMutation({
  args: { tiers: v.array(v.string()) },
  handler: async (ctx, { tiers }) => {
    const removed: Array<{ slug: string }> = [];
    const set = new Set(tiers);
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_kind", (q) => q.eq("kind", "partner"))
      .collect();
    for (const team of teams) {
      if (!team.partnerTier || !set.has(team.partnerTier)) continue;
      const members = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const m of members) {
        const u = await ctx.db.get(m.userId);
        if (u?.teamId === team._id) await ctx.db.patch(u._id, { teamId: undefined });
        await ctx.db.delete(m._id);
      }
      const invites = await ctx.db
        .query("partnerInvites")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const i of invites) await ctx.db.delete(i._id);
      await ctx.db.delete(team._id);
      removed.push({ slug: team.slug });
    }
    return removed;
  },
});

// Called by ensureFromWorkos on first sign-in. We DON'T auto-add the user to
// the team anymore — instead we leave the partnerInvites row pending so the
// AppShell can redirect them to /app/team/accept/<id> where they explicitly
// click Accept (or Decline). That gives the invitee a consent moment + lets
// the owner see who hasn't responded yet.
//
// The function is kept around (and exported) so callers that previously
// relied on it can still ask "does this user have a pending invite?" — they
// just get the invite back instead of an auto-joined state.
export async function consumePartnerInviteIfAny(ctx: MutationCtx, user: Doc<"users">) {
  if (!user.email) return null;
  if (user.teamId) return null;
  const invite = await ctx.db
    .query("partnerInvites")
    .withIndex("by_email", (q) => q.eq("email", user.email))
    .filter((q) => q.eq(q.field("consumedAt"), undefined))
    .filter((q) => q.eq(q.field("declinedAt"), undefined))
    .first();
  return invite?.teamId ?? null;
}

// Explicit accept — called from the /app/team/accept/[inviteId] page.
export const acceptTeamInvite = mutation({
  args: { inviteId: v.id("partnerInvites") },
  handler: async (ctx, { inviteId }) => {
    const user = await requireActiveUser(ctx);
    const invite = await ctx.db.get(inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.consumedAt) throw new Error("Invite already used");
    if (invite.declinedAt) throw new Error("Invite was declined — ask the owner to send a new one");
    if (invite.email !== (user.email ?? "").toLowerCase().trim()) {
      throw new Error("This invite is for a different email");
    }
    if (user.teamId && user.teamId !== invite.teamId) {
      throw new Error("You're already on a different partner team");
    }
    const existing = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", invite.teamId).eq("userId", user._id),
      )
      .first();
    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("partnerMembers", {
        teamId: invite.teamId,
        userId: user._id,
        role: invite.role,
        invitedAt: invite.invitedAt,
        invitedByUserId: invite.invitedByUserId,
        joinedAt: now,
      });
      await dedupePartnerMember(ctx, invite.teamId, user._id);
    }
    const patch: Record<string, unknown> = { teamId: invite.teamId };
    if (!user.ticketLinkedAt) patch.ticketLinkedAt = now;
    await ctx.db.patch(user._id, patch);
    await ctx.db.patch(invite._id, {
      consumedAt: now,
      consumedByUserId: user._id,
    });
    return { teamId: invite.teamId };
  },
});

// Explicit decline — owner can re-issue by hitting "Send again".
export const declineTeamInvite = mutation({
  args: { inviteId: v.id("partnerInvites") },
  handler: async (ctx, { inviteId }) => {
    const user = await requireActiveUser(ctx);
    const invite = await ctx.db.get(inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.consumedAt) throw new Error("Invite already used");
    if (invite.email !== (user.email ?? "").toLowerCase().trim()) {
      throw new Error("This invite is for a different email");
    }
    await ctx.db.patch(invite._id, { declinedAt: Date.now() });
    return { teamId: invite.teamId };
  },
});

// Lookup a pending invite by id — used by the accept page. Returns team +
// invite info even for an unauthenticated visitor (those bits aren't
// sensitive and the visitor needs to see them in order to decide whether
// to sign up). User-specific bits (emailMatches, myEmail, signedIn) are
// only populated once the caller has an authenticated identity.
export const teamInviteForAccept = query({
  args: { inviteId: v.id("partnerInvites") },
  handler: async (ctx, { inviteId }) => {
    const invite = await ctx.db.get(inviteId);
    if (!invite) return null;
    const team = await ctx.db.get(invite.teamId);
    if (!team) return null;
    const identity = await ctx.auth.getUserIdentity();
    let myEmail: string | null = null;
    if (identity) {
      const me = await ctx.db
        .query("users")
        .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
        .first();
      myEmail = me?.email ?? null;
    }
    const emailMatches =
      !!myEmail && invite.email === myEmail.toLowerCase().trim();
    return {
      invite: {
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        consumedAt: invite.consumedAt,
        declinedAt: invite.declinedAt,
      },
      team: {
        _id: team._id,
        name: team.name,
        slug: team.slug,
        tier: team.partnerTier,
      },
      signedIn: !!identity,
      myEmail,
      emailMatches,
    };
  },
});

// First pending invite (consumedAt=undefined, declinedAt=undefined) for the
// signed-in user's email — used by AppShell to redirect a newly-arrived
// invitee to the accept page automatically on first sign-in.
export const myPendingTeamInvite = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me?.email) return null;
    if (me.teamId) return null;
    const invite = await ctx.db
      .query("partnerInvites")
      .withIndex("by_email", (q) => q.eq("email", me.email))
      .filter((q) => q.eq(q.field("consumedAt"), undefined))
      .filter((q) => q.eq(q.field("declinedAt"), undefined))
      .first();
    if (!invite) return null;
    const team = await ctx.db.get(invite.teamId);
    return { inviteId: invite._id, teamName: team?.name ?? "a team" };
  },
});

// Lists pending + declined invites for the current owner's team — drives the
// "Pending invites" section on /app/team.
export const myTeamPendingInvites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me?.teamId) return [];
    const membership = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", me.teamId!).eq("userId", me._id),
      )
      .first();
    if (membership?.role !== "owner" && me.accessLevel !== "admin") return [];
    const rows = await ctx.db
      .query("partnerInvites")
      .withIndex("by_team", (q) => q.eq("teamId", me.teamId!))
      .collect();
    return rows
      .filter((r) => !r.consumedAt)
      .map((r) => ({
        _id: r._id,
        email: r.email,
        role: r.role,
        invitedAt: r.invitedAt,
        lastEmailedAt: r.lastEmailedAt,
        declinedAt: r.declinedAt,
      }));
  },
});

// Resend the invite email (or send it for the first time). Also clears
// declinedAt so the invitee can accept on the next attempt.
export const resendTeamInvite = mutation({
  args: { inviteId: v.id("partnerInvites") },
  handler: async (ctx, { inviteId }) => {
    const me = await requireActiveUser(ctx);
    const invite = await ctx.db.get(inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.consumedAt) throw new Error("Invite already consumed");
    const team = await ctx.db.get(invite.teamId);
    if (!team) throw new Error("Team missing");
    // Owner or admin only.
    const membership = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", invite.teamId).eq("userId", me._id),
      )
      .first();
    if (membership?.role !== "owner" && me.accessLevel !== "admin") {
      throw new Error("Only the team owner or admin can resend invites");
    }
    await ctx.db.patch(invite._id, {
      lastEmailedAt: Date.now(),
      declinedAt: undefined,
    });
    await ctx.scheduler.runAfter(0, internal.admin_email.sendTeamInvite, {
      email: invite.email,
      inviteId: invite._id as unknown as string,
      teamName: team.name,
      inviterName: me.name,
    });
    return {
      inviteId: invite._id,
      email: invite.email,
      teamName: team.name,
      inviterName: me.name,
    };
  },
});

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
      logoUrl: team.logoUrl,
      members: visibleMembers,
    };
  },
});

// Email-domain → partner-team-slug map. Locked list — only these
// company emails get auto-assigned to a partner team when their Luma
// ticket type is "Partner". Everyone else (gmail, random domains)
// stays unassigned and the admin can place them manually.
const PARTNER_DOMAIN_TO_SLUG: Record<string, string> = {
  "nebius.com": "nebius",
  "nebius.ai": "nebius",
  "elastic.co": "elastic",
  "openai.com": "openai",
  "stripe.com": "stripe",
  "runpod.io": "runpod",
  "techeurope.io": "tech-europe",
};

function domainOfEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase();
}

// If a user's Luma ticket type is "Partner" AND their email domain
// matches one of the known partner companies, attach them to that
// team. Idempotent: skips if already on a team. Called from tryAutoLink
// (after the ticket link is created) so it runs on every fresh sign-in
// of a partner account.
export async function autoAssignPartnerTeam(
  ctx: MutationCtx,
  user: Doc<"users">,
  ticketType: string | undefined | null,
): Promise<Id<"teams"> | null> {
  if (user.teamId) return user.teamId;
  if ((ticketType ?? "").toLowerCase() !== "partner") return null;
  const domain = domainOfEmail(user.email);
  if (!domain) return null;
  const slug = PARTNER_DOMAIN_TO_SLUG[domain];
  if (!slug) return null;
  const team = await ctx.db
    .query("teams")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (!team || team.kind !== "partner") return null;
  // Look for an existing membership before inserting — handles the
  // case where someone was added manually before the auto-assign ran.
  const existing = await ctx.db
    .query("partnerMembers")
    .withIndex("by_team_user", (q) =>
      q.eq("teamId", team._id).eq("userId", user._id),
    )
    .first();
  if (!existing) {
    await ctx.db.insert("partnerMembers", {
      teamId: team._id,
      userId: user._id,
      role: "member",
      invitedAt: Date.now(),
      invitedByUserId: user._id,
      joinedAt: Date.now(),
    });
    await dedupePartnerMember(ctx, team._id, user._id);
  }
  await ctx.db.patch(user._id, { teamId: team._id });
  return team._id;
}

// Bootstrap: delete teams that have zero members. Used to clear out
// the unused partner stubs (Modal, Dust, dltHub) without manually
// touching the DB. Refuses if any membership exists, so it can never
// orphan a member by accident.
export const bootstrapDeleteEmptyTeamsBySlug = internalMutation({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, { slugs }) => {
    const result: Array<{ slug: string; deleted: boolean; reason?: string }> = [];
    for (const slug of slugs) {
      const team = await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!team) {
        result.push({ slug, deleted: false, reason: "not_found" });
        continue;
      }
      const members = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      if (members.length > 0) {
        result.push({
          slug,
          deleted: false,
          reason: `has_${members.length}_members`,
        });
        continue;
      }
      // Clean up any pending invites + contacts pointing at this team
      // before dropping the row.
      const invites = await ctx.db
        .query("partnerInvites")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const inv of invites) await ctx.db.delete(inv._id);
      await ctx.db.delete(team._id);
      result.push({ slug, deleted: true });
    }
    return result;
  },
});

// Bootstrap: backfill auto-assignment for existing users. Walks every
// user, looks up their Luma row, and runs autoAssignPartnerTeam if
// they're a Partner ticket holder on a known domain. Idempotent.
export const bootstrapBackfillPartnerTeams = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const assigned: Array<{
      email: string | undefined;
      teamSlug: string;
    }> = [];
    for (const user of users) {
      if (user.teamId) continue;
      if (!user.email) continue;
      const luma = await ctx.db
        .query("lumaAttendees")
        .withIndex("by_email", (q) => q.eq("email", user.email!))
        .first();
      const teamId = await autoAssignPartnerTeam(ctx, user, luma?.ticketType);
      if (teamId) {
        const team = await ctx.db.get(teamId);
        assigned.push({ email: user.email, teamSlug: team?.slug ?? "?" });
      }
    }
    return { assigned, total: users.length };
  },
});

// Per-team membership audit: every member with their email domain,
// Luma ticket type, and whether they "should" be on this team
// according to PARTNER_DOMAIN_TO_SLUG. Used to find people who were
// manually placed on a team they don't belong to.
export const auditTeamMemberships = internalQuery({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const out: Array<{
      team: string;
      teamSlug: string;
      memberCount: number;
      members: Array<{
        email: string | undefined;
        name: string;
        domain: string | null;
        lumaTicketType: string | null;
        expectedTeamSlug: string | null;
        matchesRule: boolean;
      }>;
    }> = [];
    for (const t of teams) {
      const memberships = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) => q.eq("teamId", t._id))
        .collect();
      const members = [];
      for (const m of memberships) {
        const user = await ctx.db.get(m.userId);
        if (!user) continue;
        const domain = domainOfEmail(user.email);
        const luma = user.email
          ? await ctx.db
              .query("lumaAttendees")
              .withIndex("by_email", (q) => q.eq("email", user.email!))
              .first()
          : null;
        const expectedSlug = domain ? PARTNER_DOMAIN_TO_SLUG[domain] ?? null : null;
        const isPartner = (luma?.ticketType ?? "").toLowerCase() === "partner";
        const matchesRule =
          expectedSlug === t.slug && (isPartner || t.slug === "tech-europe");
        members.push({
          email: user.email,
          name: user.name,
          domain,
          lumaTicketType: luma?.ticketType ?? null,
          expectedTeamSlug: expectedSlug,
          matchesRule,
        });
      }
      out.push({
        team: t.name,
        teamSlug: t.slug,
        memberCount: memberships.length,
        members,
      });
    }
    return out;
  },
});

// One-shot diagnostic: every team on prod with member counts and Luma
// ticket-type breakdown. Used to figure out which teams are real
// partners vs. legacy / test rows before we lock the partner list down.
export const auditTeamsSnapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const out = [];
    for (const t of teams) {
      const memberships = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) => q.eq("teamId", t._id))
        .collect();
      out.push({
        _id: t._id,
        name: t.name,
        slug: t.slug,
        kind: t.kind ?? null,
        partnerTier: t.partnerTier ?? null,
        partnerVerifiedAt: t.partnerVerifiedAt
          ? new Date(t.partnerVerifiedAt).toISOString()
          : null,
        memberCount: memberships.length,
      });
    }
    return out;
  },
});

// --- per-partner analytics ---------------------------------------------------

export const myTeamAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!me?.teamId) return null;
    const teamId = me.teamId;

    // Members.
    const memberRows = await ctx.db
      .query("partnerMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
    const memberIds = memberRows.map((m) => m.userId);
    const memberById = new Map<string, Doc<"users">>();
    for (const m of memberRows) {
      const u = await ctx.db.get(m.userId);
      if (u) memberById.set(u._id, u);
    }

    // Team-owned contacts (= unique leads).
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", "team").eq("ownerId", teamId as string),
      )
      .collect();

    // Lead-status histogram (treat undefined as "unset").
    const leadStatus = { hot: 0, warm: 0, cold: 0, junk: 0, unset: 0 };
    for (const c of contacts) {
      const s = c.leadStatus ?? "unset";
      leadStatus[s] += 1;
    }

    // Scan events by team members.
    const scansPerMember = new Map<string, { total: number; unique: Set<string> }>();
    const scansByHour = new Map<number, number>(); // hour-of-day in conf TZ → count
    const totalScans = await Promise.all(
      memberIds.map(async (uid) => {
        const events = await ctx.db
          .query("scanEvents")
          .withIndex("by_scanner", (q) => q.eq("scannerUserId", uid))
          .collect();
        const bucket = { total: events.length, unique: new Set<string>() };
        for (const e of events) {
          bucket.unique.add(e.scannedUserId as unknown as string);
          // Bucket by hour in Europe/Berlin. Doing tz math server-side keeps
          // the client free of date wrangling.
          const dt = new Date(e.ts);
          const hourStr = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Berlin",
            hour: "2-digit",
            hour12: false,
          }).format(dt);
          const h = parseInt(hourStr, 10);
          scansByHour.set(h, (scansByHour.get(h) ?? 0) + 1);
        }
        scansPerMember.set(uid as unknown as string, bucket);
        return events.length;
      }),
    ).then((arr) => arr.reduce((sum, n) => sum + n, 0));

    const leaderboard = memberRows
      .map((m) => {
        const u = memberById.get(m.userId as unknown as string);
        const bucket = scansPerMember.get(m.userId as unknown as string) ?? {
          total: 0,
          unique: new Set<string>(),
        };
        return {
          userId: m.userId,
          name: u?.name ?? "Unknown",
          role: m.role,
          totalScans: bucket.total,
          uniqueLeads: bucket.unique.size,
        };
      })
      .sort((a, b) => b.uniqueLeads - a.uniqueLeads || b.totalScans - a.totalScans);

    const activeScanners = leaderboard.filter((m) => m.totalScans > 0).length;

    const hourSeries = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: scansByHour.get(h) ?? 0,
    }));

    return {
      totalLeads: contacts.length,
      totalScans,
      activeScanners,
      memberCount: memberRows.length,
      leadStatus,
      hourSeries,
      leaderboard,
    };
  },
});
