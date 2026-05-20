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
  return String(Math.floor(100000 + Math.random() * 900000));
}

// --- helper: attempt auto-link based on user's email ------------------------

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

  const now = Date.now();
  const linkId = await ctx.db.insert("ticketLinks", {
    userId: user._id,
    lumaGuestId: luma.lumaGuestId,
    lumaEmail: luma.email,
    method: "auto",
    verifiedAt: now,
  });
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

    const found: { matched: boolean; approved: boolean; user: Doc<"users"> | null } = await ctx.runQuery(
      internal.ticket._lookupForRequest,
      { lumaEmail: normalized },
    );

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
  handler: async (ctx, { lumaEmail, code }) => {
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
    return { ok: true };
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
