import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return [];

    const ownerType = user.teamId ? "team" : "user";
    const ownerId = user.teamId ?? user._id;
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) => q.eq("ownerType", ownerType).eq("ownerId", ownerId as string))
      .collect();

    const enriched = await Promise.all(
      contacts.map(async (c) => {
        const u = await ctx.db.get(c.contactedUserId);
        return { contact: c, user: u && !u.deletedAt ? u : null };
      }),
    );
    return enriched.filter((e) => e.user !== null);
  },
});

export const add = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getMe(ctx);
    if (!me.ticketLinkedAt && me.accessLevel !== "admin") {
      throw new Error("Ticket not verified");
    }
    if (me._id === userId) throw new Error("Can't add yourself");
    const target = await ctx.db.get(userId);
    if (!target || target.deletedAt) throw new Error("User not found");

    const ownerType = me.teamId ? "team" : "user";
    const ownerId = me.teamId ?? me._id;

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_owner_contacted", (q) =>
        q.eq("ownerType", ownerType).eq("ownerId", ownerId as string).eq("contactedUserId", userId),
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("contacts", {
      ownerType,
      ownerId: ownerId as string,
      contactedUserId: userId,
      firstScanAt: Date.now(),
      lastScanAt: Date.now(),
    });
  },
});

// Partner-team-only: qualify a lead with a status (hot/warm/cold/junk) and a
// longer description.  Personal contacts ignore these fields; they live on the
// contacts row but are surfaced only in the team-leads UI.
export const updateLeadQualification = mutation({
  args: {
    contactId: v.id("contacts"),
    leadStatus: v.optional(
      v.union(
        v.literal("hot"),
        v.literal("warm"),
        v.literal("cold"),
        v.literal("junk"),
        v.literal("clear"),
      ),
    ),
    leadDescription: v.optional(v.string()),
  },
  handler: async (ctx, { contactId, leadStatus, leadDescription }) => {
    const user = await getMe(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact not found");
    if (contact.ownerType !== "team") {
      throw new Error("Lead qualification only applies to team contacts");
    }
    if (!user.teamId || contact.ownerId !== user.teamId) {
      throw new Error("Not your team's lead");
    }
    const patch: Record<string, unknown> = {};
    if (leadStatus !== undefined) {
      patch.leadStatus = leadStatus === "clear" ? undefined : leadStatus;
    }
    if (leadDescription !== undefined) patch.leadDescription = leadDescription;
    await ctx.db.patch(contactId, patch);
  },
});

// Per-author note thread on a contact. Anyone who owns the contact
// (personal contact) or is a member of the team that owns it (partner
// team contact) can add a note. Authors are surfaced on read so the
// UI can show who wrote what.
export const addNote = mutation({
  args: {
    contactId: v.id("contacts"),
    text: v.string(),
  },
  handler: async (ctx, { contactId, text }) => {
    const user = await getMe(ctx);
    const trimmed = text.trim();
    if (!trimmed) throw new Error("Note can't be empty");
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact not found");
    const allowed =
      (contact.ownerType === "user" && contact.ownerId === user._id) ||
      (contact.ownerType === "team" && contact.ownerId === user.teamId);
    if (!allowed) throw new Error("Not your contact");
    const noteId = await ctx.db.insert("contactNotes", {
      contactId,
      byUserId: user._id,
      text: trimmed,
      createdAt: Date.now(),
    });
    return noteId;
  },
});

export const notesForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    const user = await getMe(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) return [];
    const allowed =
      (contact.ownerType === "user" && contact.ownerId === user._id) ||
      (contact.ownerType === "team" && contact.ownerId === user.teamId);
    if (!allowed) return [];
    const notes = await ctx.db
      .query("contactNotes")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .order("desc")
      .collect();
    const out = [];
    for (const n of notes) {
      const author = await ctx.db.get(n.byUserId);
      out.push({
        _id: n._id,
        text: n.text,
        createdAt: n.createdAt,
        byUserId: n.byUserId,
        authorName: author?.name ?? "Unknown",
        authorIsMe: n.byUserId === user._id,
      });
    }
    return out;
  },
});

// Who scanned this contact, oldest first — so the first entry is whoever
// met them first. For a team lead we count everyone on the team; for a
// personal contact only the owner (personal contacts come from the public
// "add" path and rarely have scan events, so this is usually empty).
export const scannersForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    const user = await getMe(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) return [];
    const allowed =
      (contact.ownerType === "user" && contact.ownerId === user._id) ||
      (contact.ownerType === "team" && contact.ownerId === user.teamId);
    if (!allowed) return [];

    const nameById = new Map<string, string>();
    let isRelevantScanner: (scannerUserId: Id<"users">) => boolean;
    if (contact.ownerType === "team") {
      const memberRows = await ctx.db
        .query("partnerMembers")
        .withIndex("by_team", (q) =>
          q.eq("teamId", contact.ownerId as unknown as Id<"teams">),
        )
        .collect();
      const memberIds = new Set(
        memberRows.map((m) => m.userId as unknown as string),
      );
      for (const m of memberRows) {
        const u = await ctx.db.get(m.userId);
        if (u) nameById.set(u._id as unknown as string, u.name ?? "Unknown");
      }
      isRelevantScanner = (id) => memberIds.has(id as unknown as string);
    } else {
      isRelevantScanner = (id) =>
        (id as unknown as string) === (user._id as unknown as string);
    }

    const scanRows = await ctx.db
      .query("scanEvents")
      .withIndex("by_scanned", (q) =>
        q.eq("scannedUserId", contact.contactedUserId),
      )
      .collect();
    const relevant = scanRows
      .filter((s) => isRelevantScanner(s.scannerUserId))
      .sort((a, b) => a.ts - b.ts);

    const out: Array<{ name: string; ts: number; isMe: boolean }> = [];
    for (const s of relevant) {
      const key = s.scannerUserId as unknown as string;
      let name = nameById.get(key);
      if (!name) {
        const u = await ctx.db.get(s.scannerUserId);
        name = u?.name ?? "Unknown";
        nameById.set(key, name);
      }
      out.push({ name, ts: s.ts, isMe: s.scannerUserId === user._id });
    }
    return out;
  },
});

export const updateNotes = mutation({
  args: {
    contactId: v.id("contacts"),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { contactId, notes, tags }) => {
    const user = await getMe(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact not found");

    const expectedOwnerType = user.teamId ? "team" : "user";
    const expectedOwnerId = user.teamId ?? user._id;
    if (contact.ownerType !== expectedOwnerType || contact.ownerId !== expectedOwnerId) {
      throw new Error("Not your contact");
    }
    await ctx.db.patch(contactId, {
      ...(notes !== undefined ? { notes } : {}),
      ...(tags !== undefined ? { tags } : {}),
    });
  },
});
