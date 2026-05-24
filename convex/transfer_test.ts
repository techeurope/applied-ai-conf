// Throwaway test helpers for the ticket-transfer flow. Not wired into any
// UI — invoked from the CLI:
//
//   npx convex run transfer_test:seedConflict '{}'
//     -> creates two fake users + a fake Luma row + an existing link on
//        userA + a pending transfer request from userB. Returns a token
//        URL you can open in your browser to exercise /transfer/[token].
//
//   npx convex run transfer_test:cleanup '{}'
//     -> removes everything seeded above.
//
// All fixtures use the @transfer-test.local domain so they're trivially
// distinguishable from real attendee data. Safe to run repeatedly.
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";

const TEST_DOMAIN = "@transfer-test.local";
const HOLDER_EMAIL = `holder${TEST_DOMAIN}`;
const REQUESTER_EMAIL = `requester${TEST_DOMAIN}`;
const LUMA_GUEST_ID = "gst-transfer-test-fixture";

export const seedConflict = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Wipe any previous seed so we always return a fresh token.
    await cleanupInternal(ctx);

    const now = Date.now();

    const holderId = await ctx.db.insert("users", {
      email: HOLDER_EMAIL,
      workosUserId: `transfer-test-holder-${now}`,
      name: "Transfer Test Holder",
      isSpeaker: false,
      onboardingRequired: false,
      ticketLinkedAt: now,
      lumaGuestId: LUMA_GUEST_ID,
      publicToken: `aac_tth_${now}`,
    });

    const requesterId = await ctx.db.insert("users", {
      email: REQUESTER_EMAIL,
      workosUserId: `transfer-test-requester-${now}`,
      name: "Transfer Test Requester",
      isSpeaker: false,
      onboardingRequired: false,
      publicToken: `aac_ttr_${now}`,
    });

    await ctx.db.insert("lumaAttendees", {
      lumaGuestId: LUMA_GUEST_ID,
      email: HOLDER_EMAIL,
      name: "Transfer Test Holder",
      ticketType: "Test Ticket",
      registeredAt: now,
      approvalStatus: "approved",
      syncedAt: now,
    });

    await ctx.db.insert("ticketLinks", {
      userId: holderId,
      lumaGuestId: LUMA_GUEST_ID,
      lumaEmail: HOLDER_EMAIL,
      method: "auto",
      verifiedAt: now,
    });

    // Two unredeemed vouchers + one redeemed (only unredeemed should move).
    await ctx.db.insert("vouchers", {
      userId: holderId,
      email: HOLDER_EMAIL,
      kind: "lunch",
      publicToken: `vch_tt_lunch_${now}`,
      issuedAt: now,
    });
    await ctx.db.insert("vouchers", {
      userId: holderId,
      email: HOLDER_EMAIL,
      kind: "coffee",
      publicToken: `vch_tt_coffee_${now}`,
      issuedAt: now,
    });
    await ctx.db.insert("vouchers", {
      userId: holderId,
      email: HOLDER_EMAIL,
      kind: "drink",
      publicToken: `vch_tt_drink_${now}`,
      issuedAt: now,
      redeemedAt: now,
    });

    const token = `ttest${now.toString(36)}xxxxxxxxxxxxxxxxxxxx`.padEnd(32, "x");
    const requestId = await ctx.db.insert("ticketTransferRequests", {
      token,
      lumaGuestId: LUMA_GUEST_ID,
      fromUserId: holderId,
      toUserId: requesterId,
      requestedAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      status: "pending",
      notifiedEmail: HOLDER_EMAIL,
    });

    return {
      token,
      requestId,
      holderId,
      requesterId,
      lumaGuestId: LUMA_GUEST_ID,
      localUrl: `http://localhost:3000/transfer/${token}`,
      prodUrl: `https://conference.techeurope.io/transfer/${token}`,
      hint: "Open localUrl in a private window, exercise Approve/Decline, then run cleanup.",
    };
  },
});

export const inspect = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const ours = users.filter((u) => u.email.endsWith(TEST_DOMAIN));
    const links = await ctx.db
      .query("ticketLinks")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
      .collect();
    const reqs = await ctx.db
      .query("ticketTransferRequests")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
      .collect();
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
      .collect();
    const vouchers = await Promise.all(
      ours.map(async (u) => ({
        email: u.email,
        rows: await ctx.db
          .query("vouchers")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .collect(),
      })),
    );
    return { users: ours, links, requests: reqs, luma, vouchers };
  },
});

export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await cleanupInternal(ctx);
  },
});

async function cleanupInternal(ctx: MutationCtx) {
  const removed = {
    users: 0,
    links: 0,
    requests: 0,
    luma: 0,
    vouchers: 0,
  };

  // Users by test domain.
  const allUsers = await ctx.db.query("users").collect();
  const testUsers = allUsers.filter((u) => u.email.endsWith(TEST_DOMAIN));
  for (const u of testUsers) {
    const userVouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    for (const vch of userVouchers) {
      await ctx.db.delete(vch._id);
      removed.vouchers += 1;
    }
    await ctx.db.delete(u._id);
    removed.users += 1;
  }

  // Links + transfer requests + luma row keyed on the fixture guest_id.
  const links = await ctx.db
    .query("ticketLinks")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
    .collect();
  for (const l of links) {
    await ctx.db.delete(l._id);
    removed.links += 1;
  }
  const reqs = await ctx.db
    .query("ticketTransferRequests")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
    .collect();
  for (const r of reqs) {
    await ctx.db.delete(r._id);
    removed.requests += 1;
  }
  const lumas = await ctx.db
    .query("lumaAttendees")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", LUMA_GUEST_ID))
    .collect();
  for (const l of lumas) {
    await ctx.db.delete(l._id);
    removed.luma += 1;
  }

  // Also catch any stray vouchers keyed on test emails that we may have
  // missed (e.g. orphaned after a partial run).
  const allVouchers = await ctx.db.query("vouchers").collect();
  for (const v of allVouchers) {
    if (v.email && v.email.endsWith(TEST_DOMAIN)) {
      await ctx.db.delete(v._id);
      removed.vouchers += 1;
    }
  }

  return removed;
}
