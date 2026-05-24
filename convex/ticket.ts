import { v } from "convex/values";
import {
  mutation,
  query,
  action,
  internalMutation,
  internalQuery,
  internalAction,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 3;
const TRANSFER_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 h
const APP_BASE_URL = "https://conference.techeurope.io";

const TRANSFER_TOKEN_ALPHABET =
  "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

function generateTransferToken(): string {
  // 32 chars out of 54 = ~190 bits. Token is the only proof for an
  // approve/decline call, so it has to resist guessing.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += TRANSFER_TOKEN_ALPHABET[bytes[i] % TRANSFER_TOKEN_ALPHABET.length];
  }
  return s;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal =
    local.length <= 2 ? `${local[0] ?? "*"}*` : `${local[0]}***${local.slice(-1)}`;
  const [dHead, ...dRest] = domain.split(".");
  const tld = dRest.join(".");
  const maskedDomain =
    dHead.length <= 2
      ? `${dHead[0] ?? "*"}*`
      : `${dHead[0]}***${dHead.slice(-1)}`;
  return `${maskedLocal}@${maskedDomain}${tld ? "." + tld : ""}`;
}

function pseudoHash(code: string): string {
  // Lightweight non-cryptographic hash — codes are short-lived (15 min) and
  // single-use, so SHA family overkill.  Not security-critical.
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h << 5) - h + code.charCodeAt(i);
    h |= 0;
  }
  return `v1:${h}`;
}

function generateSixDigit(): string {
  // crypto.getRandomValues — the 6-digit code is the proof of email
  // ownership for ticket-linking, so it has to resist guessing in the
  // 15-minute expiration window.
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const n =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(100_000 + (n % 900_000));
}

// --- helper: attempt auto-link based on user's email ------------------------

// QA helper — peek at the auto-link state for a specific email on prod.
export const bootstrapInspectByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    return {
      user: user
        ? {
            _creationTime: user._creationTime,
            email: user.email,
            ticketLinkedAt: user.ticketLinkedAt,
            accessLevel: user.accessLevel,
          }
        : null,
      luma: luma
        ? {
            _creationTime: luma._creationTime,
            email: luma.email,
            approvalStatus: luma.approvalStatus,
            syncedAt: luma.syncedAt,
          }
        : null,
    };
  },
});

export async function tryAutoLink(ctx: MutationCtx, user: Doc<"users">) {
  if (user.ticketLinkedAt) return null;
  if (!user.email) return null;

  // Check existing ticketLinks row defensively.
  const existingLink = await ctx.db
    .query("ticketLinks")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();
  if (existingLink) {
    await ctx.db.patch(user._id, {
      ticketLinkedAt: existingLink.verifiedAt,
      lumaGuestId: existingLink.lumaGuestId,
    });
    return existingLink;
  }

  const luma = await ctx.db
    .query("lumaAttendees")
    .withIndex("by_email", (q) => q.eq("email", user.email))
    .first();
  if (!luma) return null;
  if (luma.approvalStatus !== "approved") return null;

  // Conflict guard: if this Luma guest is already linked to a different
  // user, silently skip. The user will see "no ticket" on /app and can
  // initiate an explicit transfer through /app/link-ticket, which routes
  // through verifyEmailCode → the holder-approval email flow.
  const claimed = await ctx.db
    .query("ticketLinks")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", luma.lumaGuestId))
    .first();
  if (claimed && claimed.userId !== user._id) return null;

  const now = Date.now();
  const linkId = await ctx.db.insert("ticketLinks", {
    userId: user._id,
    lumaGuestId: luma.lumaGuestId,
    lumaEmail: luma.email,
    method: "auto",
    verifiedAt: now,
  });
  // Race-safe cleanup: if two concurrent sign-ins for the same user both
  // passed the existingLink check and both inserted, we now have ≥2 rows.
  // Keep the earliest, delete the rest.
  const allLinks = await ctx.db
    .query("ticketLinks")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .collect();
  if (allLinks.length > 1) {
    const sorted = allLinks.sort((a, b) => a.verifiedAt - b.verifiedAt);
    const keep = sorted[0];
    for (const extra of sorted.slice(1)) {
      await ctx.db.delete(extra._id);
    }
    // Patch user to point at the survivor.
    const patch: Record<string, unknown> = {
      ticketLinkedAt: keep.verifiedAt,
      lumaGuestId: keep.lumaGuestId,
    };
    if (luma.name && (!user.name || user.name === "Unnamed" || user.name === user.email)) {
      patch.name = luma.name;
    }
    await ctx.db.patch(user._id, patch);
    return keep;
  }
  const patch: Record<string, unknown> = {
    ticketLinkedAt: now,
    lumaGuestId: luma.lumaGuestId,
  };
  if (luma.name && (!user.name || user.name === "Unnamed" || user.name === user.email)) {
    patch.name = luma.name;
  }
  await ctx.db.patch(user._id, patch);
  return await ctx.db.get(linkId);
}

// --- public queries / mutations ---------------------------------------------

export const status = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) return null;
    const link = await ctx.db
      .query("ticketLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    return {
      linked: !!user.ticketLinkedAt,
      method: link?.method ?? null,
      lumaEmail: link?.lumaEmail ?? null,
      verifiedAt: link?.verifiedAt ?? null,
    };
  },
});

// User pastes a Luma email.  We look it up in the cache; if found and it's
// the same as the user's WorkOS email, auto-link.  Otherwise we issue an
// email-code and Resend sends a 6-digit code to that Luma inbox.
export const requestEmailCode = action({
  args: { lumaEmail: v.string() },
  handler: async (
    ctx,
    { lumaEmail },
  ): Promise<{ status: "auto_linked" | "code_sent" | "not_found"; sentTo?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const normalized = lumaEmail.toLowerCase().trim();

    let found: { matched: boolean; approved: boolean; user: Doc<"users"> | null } = await ctx.runQuery(
      internal.ticket._lookupForRequest,
      { lumaEmail: normalized },
    );

    // Cache miss (or not approved) — hit Luma directly for the freshest
    // state on just this email. Faster than waiting for the cron tick.
    if (!found.matched || !found.approved) {
      const live = await ctx.runAction(internal.luma.lookupOneByEmail, {
        email: normalized,
      });
      if (live.status === "found") {
        // The action already upserted into lumaAttendees; re-run the lookup
        // so we pick up the matching Convex user (if any).
        found = await ctx.runQuery(internal.ticket._lookupForRequest, {
          lumaEmail: normalized,
        });
      }
    }

    if (!found.matched || !found.approved) {
      return { status: "not_found" };
    }
    if (!found.user) {
      throw new Error("User record missing");
    }

    // If the matched Luma email == user's WorkOS email, the user already
    // proved ownership via WorkOS sign-up — auto-link, skip code.
    if (found.user.email === normalized) {
      await ctx.runMutation(internal.ticket._autoLinkExisting, {
        userId: found.user._id,
      });
      return { status: "auto_linked" };
    }

    const code = generateSixDigit();
    await ctx.runMutation(internal.ticket._issueCode, {
      userId: found.user._id,
      targetEmail: normalized,
      codeHash: pseudoHash(code),
    });

    const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 12px;">Applied AI Conf — verify your ticket</h1>
      <p style="font-size:14px;color:#444;">Enter this 6-digit code to link your account to your Luma ticket:</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700;text-align:center;background:#f3f3f3;padding:16px;border-radius:8px;font-family:ui-monospace,monospace;">${code}</p>
      <p style="font-size:12px;color:#888;">Expires in 15 minutes. If you didn't request this, ignore it.</p>
    </div>`;
    await ctx.runAction(internal.email.send, {
      to: normalized,
      subject: "Your Applied AI Conf verification code",
      html,
      text: `Your verification code: ${code}\n\nExpires in 15 minutes.`,
    });
    return { status: "code_sent", sentTo: normalized };
  },
});

export const verifyEmailCode = mutation({
  args: { lumaEmail: v.string(), code: v.string() },
  handler: async (
    ctx,
    { lumaEmail, code },
  ): Promise<
    | { ok: true; status: "linked" }
    | {
        ok: true;
        status: "transfer_pending";
        notifiedEmail: string;
        expiresAt: number;
      }
  > => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");
    if (user.deactivatedAt) throw new Error("Account deactivated");

    const normalized = lumaEmail.toLowerCase().trim();
    const issued = await ctx.db
      .query("emailCodes")
      .withIndex("by_user_email", (q) =>
        q.eq("userId", user._id).eq("targetEmail", normalized),
      )
      .order("desc")
      .first();
    if (!issued) throw new Error("No code issued for that email");
    if (issued.consumedAt) throw new Error("Code already used");
    if (issued.expiresAt < Date.now()) throw new Error("Code expired");
    if (issued.attempts >= MAX_ATTEMPTS) throw new Error("Too many attempts");

    if (issued.codeHash !== pseudoHash(code.trim())) {
      await ctx.db.patch(issued._id, { attempts: issued.attempts + 1 });
      throw new Error("Wrong code");
    }

    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!luma) throw new Error("Luma attendee not found in cache");
    if (luma.approvalStatus !== "approved") {
      throw new Error("Your Luma registration is not approved yet");
    }

    await ctx.db.patch(issued._id, { consumedAt: Date.now() });
    const now = Date.now();

    // Conflict check: is this Luma guest already linked to someone?
    const existing = await ctx.db
      .query("ticketLinks")
      .withIndex("by_luma_guest_id", (q) =>
        q.eq("lumaGuestId", luma.lumaGuestId),
      )
      .first();

    // Same user already holds it — idempotent success.
    if (existing && existing.userId === user._id) {
      return { ok: true, status: "linked" };
    }

    // Different user holds it — start a transfer request, email the holder.
    if (existing && existing.userId !== user._id) {
      const holder = await ctx.db.get(existing.userId);
      if (!holder) throw new Error("Holder user missing");

      // Supersede any prior pending request for this guest where the
      // requester is someone else — only one in-flight at a time.
      const priorPending = await ctx.db
        .query("ticketTransferRequests")
        .withIndex("by_luma_guest_id", (q) =>
          q.eq("lumaGuestId", luma.lumaGuestId),
        )
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
      let reused: Doc<"ticketTransferRequests"> | null = null;
      for (const p of priorPending) {
        if (p.toUserId === user._id && p.fromUserId === existing.userId) {
          reused = p; // same request, idempotent
        } else {
          await ctx.db.patch(p._id, {
            status: "superseded",
            resolvedAt: now,
          });
        }
      }

      let request = reused;
      if (!request) {
        const token = generateTransferToken();
        const requestId = await ctx.db.insert("ticketTransferRequests", {
          token,
          lumaGuestId: luma.lumaGuestId,
          fromUserId: existing.userId,
          toUserId: user._id,
          requestedAt: now,
          expiresAt: now + TRANSFER_EXPIRY_MS,
          status: "pending",
          notifiedEmail: holder.email,
        });
        request = (await ctx.db.get(requestId))!;
      }

      // Schedule the email after the mutation commits.
      await ctx.scheduler.runAfter(0, internal.ticket._sendTransferEmail, {
        requestId: request._id,
      });

      await ctx.db.insert("auditLog", {
        actorUserId: user._id,
        action: "ticket.transfer_requested",
        targetUserId: existing.userId,
        metadata: JSON.stringify({
          lumaGuestId: luma.lumaGuestId,
          lumaEmail: luma.email,
          requestId: request._id,
        }),
        createdAt: now,
      });

      return {
        ok: true,
        status: "transfer_pending",
        notifiedEmail: maskEmail(holder.email),
        expiresAt: request.expiresAt,
      };
    }

    // No conflict — straightforward link.
    await ctx.db.insert("ticketLinks", {
      userId: user._id,
      lumaGuestId: luma.lumaGuestId,
      lumaEmail: luma.email,
      method: "email_code",
      verifiedAt: now,
    });
    const userPatch: Record<string, unknown> = {
      ticketLinkedAt: now,
      lumaGuestId: luma.lumaGuestId,
    };
    if (luma.name && (!user.name || user.name === "Unnamed" || user.name === user.email)) {
      userPatch.name = luma.name;
    }
    await ctx.db.patch(user._id, userPatch);
    return { ok: true, status: "linked" };
  },
});

// --- internal helpers used by the action -----------------------------------

export const _lookupForRequest = internalQuery({
  args: { lumaEmail: v.string() },
  handler: async (ctx, { lumaEmail }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_email", (q) => q.eq("email", lumaEmail))
      .first();
    return {
      matched: !!luma,
      approved: luma?.approvalStatus === "approved",
      user: user ?? null,
    };
  },
});

export const _autoLinkExisting = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.ticketLinkedAt) return null;
    return await tryAutoLink(ctx, user);
  },
});

export const _issueCode = internalMutation({
  args: {
    userId: v.id("users"),
    targetEmail: v.string(),
    codeHash: v.string(),
  },
  handler: async (ctx, args) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent = await ctx.db
      .query("emailCodes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("createdAt"), oneHourAgo))
      .collect();
    if (recent.length >= MAX_CODES_PER_HOUR) {
      throw new Error("Too many verification codes requested. Try again later.");
    }
    const now = Date.now();
    return await ctx.db.insert("emailCodes", {
      userId: args.userId,
      targetEmail: args.targetEmail,
      codeHash: args.codeHash,
      attempts: 0,
      createdAt: now,
      expiresAt: now + CODE_EXPIRY_MS,
    });
  },
});

// --- transfer flow ---------------------------------------------------------

// Atomically move a ticket link from one user to another. Also moves any
// unredeemed vouchers (redeemed ones stay on the original user as history).
// Caller is responsible for authorising the transfer (holder approval,
// admin override, etc.) and for writing the audit row with the right actor.
export async function performTransfer(
  ctx: MutationCtx,
  args: {
    fromUserId: Id<"users">;
    toUserId: Id<"users">;
    lumaGuestId: string;
    method: "email_code" | "admin_link";
    verifiedByUserId?: Id<"users">;
  },
): Promise<{ movedVoucherIds: Id<"vouchers">[] }> {
  const { fromUserId, toUserId, lumaGuestId, method, verifiedByUserId } = args;
  const now = Date.now();

  const oldLink = await ctx.db
    .query("ticketLinks")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", lumaGuestId))
    .first();
  if (!oldLink) throw new Error("Source ticket link missing");
  if (oldLink.userId !== fromUserId) {
    throw new Error("Source link no longer owned by the expected user");
  }

  const luma = await ctx.db
    .query("lumaAttendees")
    .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", lumaGuestId))
    .first();
  if (!luma) throw new Error("Luma attendee row missing");

  const toUser = await ctx.db.get(toUserId);
  if (!toUser) throw new Error("Destination user missing");

  // Delete old link, clear fields on the old user.
  await ctx.db.delete(oldLink._id);
  await ctx.db.patch(fromUserId, {
    ticketLinkedAt: undefined,
    lumaGuestId: undefined,
  });

  // Insert new link, set fields on the new user.
  await ctx.db.insert("ticketLinks", {
    userId: toUserId,
    lumaGuestId: luma.lumaGuestId,
    lumaEmail: luma.email,
    method,
    verifiedAt: now,
    verifiedByUserId,
  });
  const toPatch: Record<string, unknown> = {
    ticketLinkedAt: now,
    lumaGuestId: luma.lumaGuestId,
  };
  if (
    luma.name &&
    (!toUser.name || toUser.name === "Unnamed" || toUser.name === toUser.email)
  ) {
    toPatch.name = luma.name;
  }
  await ctx.db.patch(toUserId, toPatch);

  // Move unredeemed vouchers from old user to new user. Keep redeemed
  // history on the old user (they're a record of physical goods collected).
  const fromVouchers = await ctx.db
    .query("vouchers")
    .withIndex("by_user", (q) => q.eq("userId", fromUserId))
    .collect();
  const movedVoucherIds: Id<"vouchers">[] = [];
  for (const vch of fromVouchers) {
    if (vch.redeemedAt) continue;
    await ctx.db.patch(vch._id, { userId: toUserId, email: toUser.email });
    movedVoucherIds.push(vch._id);
  }

  return { movedVoucherIds };
}

// Public — read transfer request state for the /transfer/[token] page.
// No auth: the token is the proof. Returns masked emails only.
export const transferDetails = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const req = await ctx.db
      .query("ticketTransferRequests")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!req) return null;
    const fromUser = await ctx.db.get(req.fromUserId);
    const toUser = await ctx.db.get(req.toUserId);
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", req.lumaGuestId))
      .first();
    const now = Date.now();
    const effectiveStatus =
      req.status === "pending" && req.expiresAt < now ? "expired" : req.status;
    return {
      status: effectiveStatus,
      requestedAt: req.requestedAt,
      expiresAt: req.expiresAt,
      resolvedAt: req.resolvedAt ?? null,
      fromEmail: fromUser ? maskEmail(fromUser.email) : "***",
      toEmail: toUser ? maskEmail(toUser.email) : "***",
      ticketType: luma?.ticketType ?? null,
      lumaName: luma?.name ?? null,
    };
  },
});

// Public — holder approves the transfer from the email link. Token-auth.
export const approveTransfer = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const req = await ctx.db
      .query("ticketTransferRequests")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") {
      throw new Error(`Request already ${req.status}`);
    }
    const now = Date.now();
    if (req.expiresAt < now) {
      await ctx.db.patch(req._id, { status: "expired", resolvedAt: now });
      throw new Error("Request expired");
    }

    const { movedVoucherIds } = await performTransfer(ctx, {
      fromUserId: req.fromUserId,
      toUserId: req.toUserId,
      lumaGuestId: req.lumaGuestId,
      method: "email_code",
    });

    await ctx.db.patch(req._id, { status: "approved", resolvedAt: now });

    await ctx.db.insert("auditLog", {
      actorUserId: req.fromUserId,
      action: "ticket.transfer_approved",
      targetUserId: req.toUserId,
      metadata: JSON.stringify({
        lumaGuestId: req.lumaGuestId,
        requestId: req._id,
        movedVouchers: movedVoucherIds.length,
      }),
      createdAt: now,
    });
    return { ok: true };
  },
});

// Public — holder declines from the email link. Token-auth.
export const declineTransfer = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const req = await ctx.db
      .query("ticketTransferRequests")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") {
      throw new Error(`Request already ${req.status}`);
    }
    const now = Date.now();
    await ctx.db.patch(req._id, { status: "declined", resolvedAt: now });
    await ctx.db.insert("auditLog", {
      actorUserId: req.fromUserId,
      action: "ticket.transfer_declined",
      targetUserId: req.toUserId,
      metadata: JSON.stringify({
        lumaGuestId: req.lumaGuestId,
        requestId: req._id,
      }),
      createdAt: now,
    });
    return { ok: true };
  },
});

// Internal — fetch a transfer request + the rendered approval email content
// for the scheduled action to send.
export const _getTransferRequestForEmail = internalQuery({
  args: { requestId: v.id("ticketTransferRequests") },
  handler: async (ctx, { requestId }) => {
    const req = await ctx.db.get(requestId);
    if (!req) return null;
    const fromUser = await ctx.db.get(req.fromUserId);
    const toUser = await ctx.db.get(req.toUserId);
    const luma = await ctx.db
      .query("lumaAttendees")
      .withIndex("by_luma_guest_id", (q) => q.eq("lumaGuestId", req.lumaGuestId))
      .first();
    return {
      token: req.token,
      status: req.status,
      notifiedEmail: req.notifiedEmail,
      expiresAt: req.expiresAt,
      fromEmail: fromUser?.email ?? null,
      toEmail: toUser?.email ?? null,
      ticketType: luma?.ticketType ?? null,
    };
  },
});

export const _sendTransferEmail = internalAction({
  args: { requestId: v.id("ticketTransferRequests") },
  handler: async (ctx, { requestId }) => {
    const req: {
      token: string;
      status: string;
      notifiedEmail: string;
      expiresAt: number;
      fromEmail: string | null;
      toEmail: string | null;
      ticketType: string | null;
    } | null = await ctx.runQuery(internal.ticket._getTransferRequestForEmail, {
      requestId,
    });
    if (!req) return;
    if (req.status !== "pending") return;

    const approveUrl = `${APP_BASE_URL}/transfer/${req.token}?action=approve`;
    const declineUrl = `${APP_BASE_URL}/transfer/${req.token}?action=decline`;
    const pageUrl = `${APP_BASE_URL}/transfer/${req.token}`;
    const expiresStr = new Date(req.expiresAt).toUTCString();

    const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111;">
      <h1 style="font-size:20px;margin:0 0 12px;">Approval needed — Applied AI Conf ticket transfer</h1>
      <p style="font-size:14px;line-height:1.5;color:#333;">
        Someone signed in as <strong>${req.toEmail ?? "another account"}</strong>
        is trying to move your Applied AI Conf ticket${req.ticketType ? ` (${req.ticketType})` : ""}
        away from your account (<strong>${req.fromEmail ?? "this account"}</strong>) to theirs.
      </p>
      <p style="font-size:14px;line-height:1.5;color:#333;">
        If that's you (e.g. you're switching to a different email), approve. If
        you don't recognise this request, decline — your ticket stays put.
      </p>
      <p style="font-size:14px;text-align:center;margin:24px 0;">
        <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:8px;">Approve transfer</a>
        <a href="${declineUrl}" style="display:inline-block;padding:12px 24px;background:#eee;color:#111;text-decoration:none;border-radius:8px;font-weight:600;">Decline</a>
      </p>
      <p style="font-size:12px;color:#888;line-height:1.5;">
        Or open the page directly: <a href="${pageUrl}">${pageUrl}</a><br>
        Link expires ${expiresStr}.
      </p>
    </div>`;
    const text = `Approval needed — Applied AI Conf ticket transfer\n\n${req.toEmail ?? "Another account"} is trying to move your ticket${req.ticketType ? ` (${req.ticketType})` : ""} from ${req.fromEmail ?? "your account"} to theirs.\n\nApprove: ${approveUrl}\nDecline: ${declineUrl}\n\nExpires ${expiresStr}.`;

    await ctx.runAction(internal.email.send, {
      to: req.notifiedEmail,
      subject: "Approve your Applied AI Conf ticket transfer?",
      html,
      text,
    });
  },
});
