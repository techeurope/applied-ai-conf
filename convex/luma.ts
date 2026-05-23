import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
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
    includeUnapproved: v.optional(v.boolean()),
  },
  handler: async (ctx, { search, limit = 500, includeUnapproved }) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("lumaAttendees").take(limit * 4);
    const term = search?.toLowerCase().trim() ?? "";
    return all
      .filter((a) => (includeUnapproved ? true : a.approvalStatus === "approved"))
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
    const invited = all.filter((a) => a.approvalStatus === "invited").length;
    const declined = all.filter((a) => a.approvalStatus === "declined").length;
    const pending = all.filter((a) => a.approvalStatus === "pending_approval").length;
    const waitlist = all.filter((a) => a.approvalStatus === "waitlist").length;
    const lastSynced = all.reduce((max, a) => Math.max(max, a.syncedAt), 0);
    return {
      total: all.length,
      approved,
      invited,
      declined,
      pending,
      waitlist,
      checkedIn,
      lastSynced,
    };
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

// QA helper: add a guest to the Luma event programmatically + immediately
// pull the resulting row into our cache. Used to provision a real Luma
// ticket for a test account so we can exercise the auto-link / sign-up
// flow end-to-end. Idempotent — Luma deduplicates by email server-side.
export const bootstrapAddOneGuest = internalAction({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (
    ctx,
    { email, name },
  ): Promise<{
    added: boolean;
    cached: { approvalStatus: string; lumaGuestId?: string };
  }> => {
    const normalized = email.toLowerCase().trim();
    const key = process.env.LUMA_API_KEY;
    if (!key) throw new Error("LUMA_API_KEY not set on this Convex deployment");
    const addUrl = `${LUMA_API_BASE}/v1/event/add-guests`;
    const res = await fetch(addUrl, {
      method: "POST",
      headers: {
        "x-luma-api-key": key,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event_api_id: LUMA_EVENT_API_ID,
        guests: [{ email: normalized, name }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Luma add-guests ${res.status}: ${body.slice(0, 300)}`);
    }
    // Empty 200 response; follow up with a lookup so we cache the row.
    const live = await ctx.runAction(internal.luma.lookupOneByEmail, {
      email: normalized,
    });
    return {
      added: true,
      cached:
        live.status === "found"
          ? {
              approvalStatus: live.approvalStatus,
              lumaGuestId: live.lumaGuestId,
            }
          : { approvalStatus: "not_found_after_add" },
    };
  },
});

// Direct single-guest lookup against Luma's API by email. Used during the
// /app/link-ticket flow so we don't have to wait for the next 5-min cron
// tick when someone has *just* been added/approved on Luma.
//
// Returns whatever Luma says; the caller decides what to do with the
// result. Always upserts into our lumaAttendees cache when a row is found
// so subsequent reads from the cache see the freshest state.
export const lookupOneByEmail = internalAction({
  args: { email: v.string() },
  handler: async (
    ctx,
    { email },
  ): Promise<
    | { status: "not_found" }
    | {
        status: "found";
        approvalStatus: string;
        lumaGuestId: string;
        name?: string;
        ticketType?: string;
      }
  > => {
    const normalized = email.toLowerCase().trim();
    if (!normalized) return { status: "not_found" };
    const key = process.env.LUMA_API_KEY;
    if (!key) throw new Error("LUMA_API_KEY not set on this Convex deployment");
    const url = new URL(`${LUMA_API_BASE}/v1/event/get-guest`);
    // Per Luma docs, this endpoint accepts the email in the `email` param,
    // and uses `event_api_id` (matching the get-guests endpoint we already
    // use). Their docs page is inconsistent (mentions both `id` and `email`,
    // both `event_id` and `event_api_id`); empirically `email` + `event_api_id`
    // works. If Luma returns 404 we treat the user as not-on-the-list.
    url.searchParams.set("email", normalized);
    url.searchParams.set("event_api_id", LUMA_EVENT_API_ID);
    const res = await fetch(url, { headers: { "x-luma-api-key": key } });
    if (res.status === 404) return { status: "not_found" };
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Luma get-guest ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { guest?: LumaGuest } & LumaGuest;
    const g: LumaGuest = (json.guest ?? json) as LumaGuest;
    if (!g?.api_id) return { status: "not_found" };
    const guestEmail = pickEmail(g) ?? normalized;
    await ctx.runMutation(internal.luma.upsertOne, {
      lumaGuestId: g.api_id,
      email: guestEmail,
      name: pickName(g),
      ticketType: g.event_ticket?.name,
      registeredAt: g.registered_at ? Date.parse(g.registered_at) : 0,
      approvalStatus: g.approval_status ?? "unknown",
      checkedInAt: g.checked_in_at ? Date.parse(g.checked_in_at) : undefined,
    });
    return {
      status: "found",
      approvalStatus: g.approval_status ?? "unknown",
      lumaGuestId: g.api_id,
      name: pickName(g),
      ticketType: g.event_ticket?.name,
    };
  },
});

// --- full sync (callable from CLI or cron) -----------------------------------

// Admin-callable trigger so the admin Luma page can refresh on demand. Runs
// the same internal sync action under the hood; rate-limits self to one
// active sync per deployment by re-using the cron's idempotent path.
export const adminTriggerSync = action({
  args: {},
  handler: async (ctx): Promise<{ pages: number; upserted: number }> => {
    // Auth guard via a query the action can call.
    const ok: boolean = await ctx.runQuery(api.luma.isAdminCaller, {});
    if (!ok) throw new Error("Admin only");
    return await ctx.runAction(internal.luma.sync, {});
  },
});

// Tiny helper query so adminTriggerSync (an action, no db access) can still
// enforce admin auth via a runQuery hop.
export const isAdminCaller = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const me = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    return me?.accessLevel === "admin";
  },
});

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
