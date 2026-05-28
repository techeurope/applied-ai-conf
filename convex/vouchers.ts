import { v, ConvexError } from "convex/values";
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

// Just-in-time mint + claim for the current user. If the user already has a
// voucher of this kind, returns/binds an external URL onto it. If not, mints
// a fresh voucher row first (same email-dedupe semantics as bulk issuance)
// and then binds. Only ticket-linked attendees and admins can mint — anyone
// else gets "Link your ticket first".
export const ensureAndClaimForMyVoucher = mutation({
  args: { kind: v.string() },
  handler: async (ctx, { kind }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");
    if (user.deletedAt || user.deactivatedAt) {
      throw new Error("Account is not active");
    }
    if (!user.ticketLinkedAt && user.accessLevel !== "admin") {
      throw new ConvexError("Link your ticket first to get a voucher");
    }
    return await mintAndBindVoucherForUser(ctx, user, kind);
  },
});

// Shared core: mint the voucher row if missing, then bind an external URL
// from inventory. Exported so other mutations (e.g. completeOnboarding)
// can pre-mint vouchers without going through the full user-facing
// `ensureAndClaimForMyVoucher` mutation (which does its own auth lookup).
// Caller is responsible for verifying the user can have a voucher.
//
// Throws ConvexError("Out of vouchers …") if inventory is empty for this
// kind. Callers that want to tolerate that should wrap in try/catch.
export async function mintAndBindVoucherForUser(
  ctx: MutationCtx,
  user: Doc<"users">,
  kind: string,
): Promise<{
  voucherId: Doc<"vouchers">["_id"];
  externalLabel?: string;
  externalUrl?: string;
  alreadyClaimed: boolean;
}> {
  const email = (user.email ?? "").toLowerCase().trim();

  // 1. Find or mint the voucher row.
  let voucher = await ctx.db
    .query("vouchers")
    .withIndex("by_user_kind", (q) => q.eq("userId", user._id).eq("kind", kind))
    .first();
  if (!voucher) {
    const { token } = await reserveVoucherToken(ctx, email, kind);
    const newId = await ctx.db.insert("vouchers", {
      userId: user._id,
      email: email || undefined,
      kind,
      publicToken: token,
      issuedAt: Date.now(),
    });
    voucher = await ctx.db.get(newId);
    if (!voucher) throw new Error("Voucher mint failed");
    await writeAudit(ctx, user._id, "voucher.jit_mint", {
      voucherId: voucher._id,
      kind,
    });
  }

  // 2. If already bound to an external URL, idempotent return.
  if (voucher.externalUrl) {
    return {
      voucherId: voucher._id,
      externalLabel: voucher.externalLabel,
      externalUrl: voucher.externalUrl,
      alreadyClaimed: true,
    };
  }

  // 3. Pop the next unclaimed inventory row + bind atomically.
  const inventory = await ctx.db
    .query("voucherInventory")
    .withIndex("by_kind_claimed_at", (q) =>
      q.eq("kind", kind).eq("claimedAt", undefined),
    )
    .first();
  if (!inventory) {
    throw new ConvexError("Out of vouchers for this kind. Please ask staff.");
  }
  const now = Date.now();
  await ctx.db.patch(inventory._id, {
    claimedByUserId: user._id,
    claimedByEmail: email || undefined,
    claimedAt: now,
  });
  await ctx.db.patch(voucher._id, {
    externalLabel: inventory.externalLabel,
    externalUrl: inventory.externalUrl,
    externalClaimedAt: now,
  });
  await writeAudit(ctx, user._id, "voucher.external_claim", {
    voucherId: voucher._id,
    inventoryId: inventory._id,
    externalLabel: inventory.externalLabel,
    kind,
  });
  return {
    voucherId: voucher._id,
    externalLabel: inventory.externalLabel,
    externalUrl: inventory.externalUrl,
    alreadyClaimed: false,
  };
}

// Claim an external (caterer-provided) URL onto a voucher row. Called by the
// UI on first view: if the voucher has no externalUrl yet, atomically pop the
// next unclaimed voucherInventory row of the same kind and bind it. Idempotent
// — re-calling for a voucher that already has externalUrl just returns it.
export const claimExternalForMyVoucher = mutation({
  args: { voucherId: v.id("vouchers") },
  handler: async (ctx, { voucherId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const voucher = await ctx.db.get(voucherId);
    if (!voucher) throw new Error("Voucher not found");
    if (voucher.userId !== user._id) throw new Error("Not your voucher");
    if (voucher.externalUrl) {
      return {
        externalLabel: voucher.externalLabel,
        externalUrl: voucher.externalUrl,
        alreadyClaimed: true,
      };
    }

    const inventory = await ctx.db
      .query("voucherInventory")
      .withIndex("by_kind_claimed_at", (q) =>
        q.eq("kind", voucher.kind).eq("claimedAt", undefined),
      )
      .first();
    if (!inventory) {
      throw new ConvexError("Out of vouchers for this kind. Please ask staff.");
    }

    const now = Date.now();
    const email = (user.email ?? "").toLowerCase().trim();
    await ctx.db.patch(inventory._id, {
      claimedByUserId: user._id,
      claimedByEmail: email || undefined,
      claimedAt: now,
    });
    await ctx.db.patch(voucher._id, {
      externalLabel: inventory.externalLabel,
      externalUrl: inventory.externalUrl,
      externalClaimedAt: now,
    });
    await writeAudit(ctx, user._id, "voucher.external_claim", {
      voucherId: voucher._id,
      inventoryId: inventory._id,
      externalLabel: inventory.externalLabel,
      kind: voucher.kind,
    });
    return {
      externalLabel: inventory.externalLabel,
      externalUrl: inventory.externalUrl,
      alreadyClaimed: false,
    };
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

// Import vouchers from an external list (caterer CSV, ops spreadsheet,
// etc.) — the canonical way we issue real vouchers, since we are NOT the
// source of truth for "who paid for / is entitled to lunch".
//
// For each email:
//   - look up the matching Convex user (by_email)
//   - if found and active, issue a voucher via reserveVoucherToken
//     (returns the existing token if they had one before, mints fresh
//     otherwise — same dedupe semantics as the bulk-issue path)
//   - if no matching user (haven't signed in yet), record a "pending"
//     row in the issuance log so the moment they DO sign in / verify,
//     re-running the importer issues their voucher
//
// Returns a per-email summary so the caller (script or admin) can spot
// rows that didn't land.
export const bootstrapImportVouchersByEmails = internalMutation({
  args: {
    kind: v.string(),
    emails: v.array(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { kind, emails, note }) => {
    const results: Array<{
      email: string;
      outcome:
        | "issued"
        | "reissued_same_token"
        | "already_has_voucher"
        | "user_not_found"
        | "user_inactive"
        | "skipped_blank";
      publicToken?: string;
    }> = [];

    for (const raw of emails) {
      const email = raw.toLowerCase().trim();
      if (!email) {
        results.push({ email: raw, outcome: "skipped_blank" });
        continue;
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (!user) {
        results.push({ email, outcome: "user_not_found" });
        continue;
      }
      if (user.deletedAt || user.deactivatedAt) {
        results.push({ email, outcome: "user_inactive" });
        continue;
      }
      // Existing voucher of this kind?
      const byUser = await ctx.db
        .query("vouchers")
        .withIndex("by_user_kind", (q) =>
          q.eq("userId", user._id).eq("kind", kind),
        )
        .first();
      if (byUser) {
        results.push({
          email,
          outcome: "already_has_voucher",
          publicToken: byUser.publicToken,
        });
        continue;
      }
      const byEmail = await ctx.db
        .query("vouchers")
        .withIndex("by_email_kind", (q) =>
          q.eq("email", email).eq("kind", kind),
        )
        .first();
      if (byEmail) {
        results.push({
          email,
          outcome: "already_has_voucher",
          publicToken: byEmail.publicToken,
        });
        continue;
      }
      const { token, reissued } = await reserveVoucherToken(ctx, email, kind);
      await ctx.db.insert("vouchers", {
        userId: user._id,
        email,
        kind,
        publicToken: token,
        issuedAt: Date.now(),
        note,
      });
      results.push({
        email,
        outcome: reissued ? "reissued_same_token" : "issued",
        publicToken: token,
      });
    }

    const issuedCount = results.filter(
      (r) => r.outcome === "issued" || r.outcome === "reissued_same_token",
    ).length;
    return {
      kind,
      totalRows: emails.length,
      issued: issuedCount,
      alreadyHad: results.filter((r) => r.outcome === "already_has_voucher").length,
      userNotFound: results.filter((r) => r.outcome === "user_not_found").length,
      userInactive: results.filter((r) => r.outcome === "user_inactive").length,
      results,
    };
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

// Bulk-import a pool of external claim URLs (caterer Lightspeed cards, etc.).
// Idempotent on externalLabel: rows already present are skipped, new ones are
// inserted with claimedAt=undefined so the next attendee view consumes them
// in insertion order.
export const bootstrapImportVoucherInventory = internalMutation({
  args: {
    kind: v.string(),
    rows: v.array(
      v.object({
        externalLabel: v.string(),
        externalUrl: v.string(),
      }),
    ),
  },
  handler: async (ctx, { kind, rows }) => {
    const now = Date.now();
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const clash = await ctx.db
        .query("voucherInventory")
        .withIndex("by_external_label", (q) =>
          q.eq("externalLabel", row.externalLabel),
        )
        .first();
      if (clash) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert("voucherInventory", {
        kind,
        externalLabel: row.externalLabel,
        externalUrl: row.externalUrl,
        importedAt: now,
      });
      inserted += 1;
    }
    return { kind, total: rows.length, inserted, skipped };
  },
});

export const bootstrapVoucherInventoryStats = internalMutation({
  args: { kind: v.string() },
  handler: async (ctx, { kind }) => {
    const all = await ctx.db.query("voucherInventory").collect();
    const ofKind = all.filter((r) => r.kind === kind);
    const claimed = ofKind.filter((r) => r.claimedAt !== undefined).length;
    return {
      kind,
      total: ofKind.length,
      claimed,
      unclaimed: ofKind.length - claimed,
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
