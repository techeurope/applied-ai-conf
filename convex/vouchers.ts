import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./admin";

const VCH_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/1/I/L/O

function generateVoucherToken(): string {
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += VCH_ALPHABET[Math.floor(Math.random() * VCH_ALPHABET.length)];
  }
  return `vch_${suffix.toLowerCase()}`;
}

async function uniqueVoucherToken(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const candidate = generateVoucherToken();
    const clash = await ctx.db
      .query("vouchers")
      .withIndex("by_public_token", (q) => q.eq("publicToken", candidate))
      .first();
    if (!clash) return candidate;
  }
  throw new Error("Could not generate a unique voucher token");
}

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

// --- attendee-facing ---------------------------------------------------------

export const myVouchers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return [];
    const vouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return vouchers;
  },
});

// --- admin-facing ------------------------------------------------------------

export const adminListForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("vouchers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const adminIssueForUser = mutation({
  args: {
    userId: v.id("users"),
    kind: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { userId, kind, note }) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");
    // Dedupe by email across delete + re-signup. If this person already had
    // a voucher of this kind issued — even under a now-deleted user — refuse.
    const email = (target.email ?? "").toLowerCase().trim();
    if (email) {
      const sameEmailVoucher = await ctx.db
        .query("vouchers")
        .withIndex("by_email_kind", (q) =>
          q.eq("email", email).eq("kind", kind),
        )
        .first();
      if (sameEmailVoucher) {
        throw new Error(
          `${email} already has a ${kind} voucher (${sameEmailVoucher.publicToken}).`,
        );
      }
    }
    const token = await uniqueVoucherToken(ctx);
    const id = await ctx.db.insert("vouchers", {
      userId,
      email: email || undefined,
      kind,
      publicToken: token,
      issuedAt: Date.now(),
      issuedByUserId: admin._id,
      note,
    });
    await writeAudit(ctx, admin._id, "voucher.issue", {
      voucherId: id,
      kind,
      userId,
    });
    return { id, publicToken: token };
  },
});

// --- bulk issuance -----------------------------------------------------------

// Issue 1 voucher of the given kind to every active, verified (ticketLinkedAt)
// user who doesn't already have one. Idempotent and email-deduped — a user
// who deleted their account and re-signed up under the same email won't get
// a second voucher (the delete-then-recreate exploit).
export const bootstrapIssueForVerifiedAttendees = internalMutation({
  args: { kind: v.string() },
  handler: async (ctx, { kind }) => {
    const users = await ctx.db.query("users").collect();
    let issued = 0;
    let skipped = 0;
    for (const u of users) {
      if (u.deletedAt || u.deactivatedAt) {
        skipped += 1;
        continue;
      }
      if (!u.ticketLinkedAt && u.accessLevel !== "admin") {
        skipped += 1;
        continue;
      }
      // Belt + suspenders: skip if either (userId,kind) or (email,kind)
      // already has a voucher. Email check catches the delete + re-signup
      // case; userId check is the fast path for the common case.
      const byUser = await ctx.db
        .query("vouchers")
        .withIndex("by_user_kind", (q) => q.eq("userId", u._id).eq("kind", kind))
        .first();
      if (byUser) {
        skipped += 1;
        continue;
      }
      const email = (u.email ?? "").toLowerCase().trim();
      if (email) {
        const byEmail = await ctx.db
          .query("vouchers")
          .withIndex("by_email_kind", (q) =>
            q.eq("email", email).eq("kind", kind),
          )
          .first();
        if (byEmail) {
          skipped += 1;
          continue;
        }
      }
      const token = await uniqueVoucherToken(ctx);
      await ctx.db.insert("vouchers", {
        userId: u._id,
        email: email || undefined,
        kind,
        publicToken: token,
        issuedAt: Date.now(),
      });
      issued += 1;
    }
    return { issued, skipped, total: users.length };
  },
});

// Backfill the `email` column on legacy voucher rows (issued before the
// schema gained the column). Re-runnable; only patches missing fields.
export const bootstrapBackfillVoucherEmails = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("vouchers").collect();
    let patched = 0;
    let skipped = 0;
    for (const v of all) {
      if (v.email) {
        skipped += 1;
        continue;
      }
      const u = await ctx.db.get(v.userId);
      const email = (u?.email ?? "").toLowerCase().trim();
      if (!email) {
        skipped += 1;
        continue;
      }
      await ctx.db.patch(v._id, { email });
      patched += 1;
    }
    return { patched, skipped, total: all.length };
  },
});
