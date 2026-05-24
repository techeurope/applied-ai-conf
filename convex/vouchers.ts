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
  // crypto.getRandomValues — vouchers redeem to real goods (lunch), so the
  // token has to resist guessing.
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += VCH_ALPHABET[bytes[i] % VCH_ALPHABET.length];
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

// Reserve a voucher token for (email, kind). If the log already has one
// (the email previously received this voucher kind, even under a deleted
// user), return the same token + bump reissuance metadata. Otherwise mint
// a fresh token and create a new log entry. The voucher row itself is
// inserted by the caller after this returns.
async function reserveVoucherToken(
  ctx: MutationCtx,
  email: string,
  kind: string,
): Promise<{ token: string; reissued: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) {
    return { token: await uniqueVoucherToken(ctx), reissued: false };
  }
  const log = await ctx.db
    .query("voucherIssuanceLog")
    .withIndex("by_email_kind", (q) =>
      q.eq("email", normalizedEmail).eq("kind", kind),
    )
    .first();
  if (log) {
    await ctx.db.patch(log._id, {
      lastReissuedAt: Date.now(),
      reissuanceCount: log.reissuanceCount + 1,
    });
    return { token: log.publicToken, reissued: true };
  }
  const token = await uniqueVoucherToken(ctx);
  await ctx.db.insert("voucherIssuanceLog", {
    email: normalizedEmail,
    kind,
    publicToken: token,
    firstIssuedAt: Date.now(),
    reissuanceCount: 0,
  });
  return { token, reissued: false };
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
    const { token, reissued } = await reserveVoucherToken(ctx, email, kind);
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
      reissued,
    });
    return { id, publicToken: token, reissued };
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
      const { token } = await reserveVoucherToken(ctx, email, kind);
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

// Nuke every voucher of the given kind. Also clears the matching
// voucherIssuanceLog rows so a future re-issue gets a fresh token (rather
// than re-using a token an attendee might already have screenshotted).
// Re-runnable. Audited.
export const bootstrapRevokeAllVouchers = internalMutation({
  args: { kind: v.string() },
  handler: async (ctx, { kind }) => {
    const all = await ctx.db.query("vouchers").collect();
    const vouchersRemoved = all.filter((v) => v.kind === kind);
    for (const v of vouchersRemoved) {
      await ctx.db.delete(v._id);
    }
    const logs = await ctx.db.query("voucherIssuanceLog").collect();
    const logsRemoved = logs.filter((l) => l.kind === kind);
    for (const l of logsRemoved) {
      await ctx.db.delete(l._id);
    }
    const admin = await ctx.db
      .query("users")
      .withIndex("by_access_level", (q) => q.eq("accessLevel", "admin"))
      .first();
    if (admin) {
      await ctx.db.insert("auditLog", {
        actorUserId: admin._id,
        action: "voucher.bulk_revoke",
        metadata: JSON.stringify({
          kind,
          vouchersRemoved: vouchersRemoved.length,
          logsRemoved: logsRemoved.length,
        }),
        createdAt: Date.now(),
      });
    }
    return {
      kind,
      vouchersRemoved: vouchersRemoved.length,
      logsRemoved: logsRemoved.length,
    };
  },
});

// Backfill the `email` column on legacy voucher rows + create a
// voucherIssuanceLog entry for each (so re-issuance returns the same
// token). Re-runnable.
export const bootstrapBackfillVoucherEmails = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("vouchers").collect();
    let patched = 0;
    let logged = 0;
    let skipped = 0;
    for (const v of all) {
      let email = v.email;
      if (!email) {
        const u = await ctx.db.get(v.userId);
        const candidate = (u?.email ?? "").toLowerCase().trim();
        if (!candidate) {
          skipped += 1;
          continue;
        }
        email = candidate;
        await ctx.db.patch(v._id, { email });
        patched += 1;
      }
      const existingLog = await ctx.db
        .query("voucherIssuanceLog")
        .withIndex("by_email_kind", (q) =>
          q.eq("email", email).eq("kind", v.kind),
        )
        .first();
      if (existingLog) continue;
      await ctx.db.insert("voucherIssuanceLog", {
        email,
        kind: v.kind,
        publicToken: v.publicToken,
        firstIssuedAt: v.issuedAt,
        reissuanceCount: 0,
      });
      logged += 1;
    }
    return { patched, logged, skipped, total: all.length };
  },
});
