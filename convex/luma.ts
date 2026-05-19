import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./admin";

const LUMA_EVENT_API_ID = "evt-EFJJfPGbyKg7PYU"; // Applied AI Conf | Berlin 28 May 2026
const LUMA_API_BASE = "https://public-api.luma.com";

type LumaGuest = {
  api_id?: string;
  email?: string;
  user_email?: string;
  name?: string;
  user_first_name?: string;
  user_last_name?: string;
  registered_at?: string | null;
  approval_status?: string;
  checked_in_at?: string | null;
  event_ticket?: { name?: string } | null;
};

type LumaGetGuestsResponse = {
  entries: LumaGuest[];
  has_more?: boolean;
  next_cursor?: string;
};

function pickEmail(g: LumaGuest): string | null {
  const raw = g.email ?? g.user_email ?? "";
  const trimmed = raw.trim().toLowerCase();
  return trimmed || null;
}

function pickName(g: LumaGuest): string | undefined {
  if (g.name) return g.name;
  const joined = [g.user_first_name, g.user_last_name].filter(Boolean).join(" ").trim();
  return joined || undefined;
}

async function fetchLumaPage(cursor: string | null): Promise<LumaGetGuestsResponse> {
  const key = process.env.LUMA_API_KEY;
  if (!key) throw new Error("LUMA_API_KEY not set on this Convex deployment");
  const url = new URL(`${LUMA_API_BASE}/v1/event/get-guests`);
  url.searchParams.set("event_api_id", LUMA_EVENT_API_ID);
  url.searchParams.set("pagination_limit", "100");
  if (cursor) url.searchParams.set("pagination_cursor", cursor);
  const res = await fetch(url, { headers: { "x-luma-api-key": key } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Luma get-guests ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as LumaGetGuestsResponse;
}

// --- public admin query: list cached attendees with optional search ---------

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, limit = 500 }) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("lumaAttendees").take(limit * 2);
    const term = search?.toLowerCase().trim() ?? "";
    return all
      .filter((a) => {
        if (!term) return true;
        return (
          a.email.includes(term) ||
          (a.name ?? "").toLowerCase().includes(term) ||
          (a.ticketType ?? "").toLowerCase().includes(term)
        );
      })
      .slice(0, limit);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("lumaAttendees").collect();
    const checkedIn = all.filter((a) => a.checkedInAt).length;
    const approved = all.filter((a) => a.approvalStatus === "approved").length;
    const lastSynced = all.reduce((max, a) => Math.max(max, a.syncedAt), 0);
    return { total: all.length, checkedIn, approved, lastSynced };
  },
});

// --- internal helpers --------------------------------------------------------

export const upsertOne = internalMutation({
  args: {
    lumaGuestId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    ticketType: v.optional(v.string()),
    registeredAt: v.number(),
    approvalStatus: v.string(),
    checkedInAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", args.lumaGuestId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        ticketType: args.ticketType,
        registeredAt: args.registeredAt,
        approvalStatus: args.approvalStatus,
        checkedInAt: args.checkedInAt,
        syncedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("lumaAttendees", { ...args, syncedAt: now });
  },
});

export const findByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();
  },
});

// --- full sync (callable from CLI or cron) -----------------------------------

export const sync = internalAction({
  args: {},
  handler: async (ctx): Promise<{ pages: number; upserted: number }> => {
    let cursor: string | null = null;
    let pages = 0;
    let upserted = 0;
    do {
      const page: LumaGetGuestsResponse = await fetchLumaPage(cursor);
      for (const g of page.entries) {
        const email = pickEmail(g);
        if (!g.api_id || !email) continue;
        await ctx.runMutation(internal.luma.upsertOne, {
          lumaGuestId: g.api_id,
          email,
          name: pickName(g),
          ticketType: g.event_ticket?.name,
          registeredAt: g.registered_at ? Date.parse(g.registered_at) : 0,
          approvalStatus: g.approval_status ?? "unknown",
          checkedInAt: g.checked_in_at ? Date.parse(g.checked_in_at) : undefined,
        });
        upserted += 1;
      }
      cursor = page.has_more ? page.next_cursor ?? null : null;
      pages += 1;
      if (pages > 50) break; // safety stop
    } while (cursor);
    return { pages, upserted };
  },
});
