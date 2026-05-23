"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Notify a queued admin that they've been granted access. Idempotent —
// every call sends a fresh email regardless of whether they've signed in.
export const sendAdminInvite = action({
  args: { email: v.string(), inviterName: v.optional(v.string()) },
  handler: async (_ctx, { email, inviterName }): Promise<{ sentTo: string }> => {
    const normalized = email.toLowerCase().trim();
    const from = inviterName ? `${inviterName} from Tech Europe` : "Tech Europe";
    const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 12px;">You're an admin on Applied AI Conf</h1>
      <p style="font-size:14px;color:#444;">${from} just gave you admin access to the Applied AI Conf platform — the internal tools for managing the event, attendees, agenda, partners, and vouchers.</p>
      <p style="font-size:14px;color:#444;">Two steps to get in:</p>
      <ol style="font-size:14px;color:#444;line-height:1.6;">
        <li>Go to <a href="https://conference.techeurope.io/app">conference.techeurope.io/app</a></li>
        <li>Sign in (or sign up) with <b>${normalized}</b>.</li>
      </ol>
      <p style="font-size:14px;color:#444;">That's it — admin access is granted automatically on your first sign-in with this email. You won't need a Luma ticket.</p>
      <p style="font-size:12px;color:#888;">If you weren't expecting this, you can ignore the email; nothing happens until you sign in.</p>
    </div>`;
    const text = `You're an admin on Applied AI Conf.\n\n${from} just granted you admin access. Sign in at https://conference.techeurope.io/app with ${normalized} — admin access activates automatically on first sign-in. No Luma ticket needed.`;
    await _ctx.runAction(internal.email.send, {
      to: normalized,
      subject: "You're an admin on Applied AI Conf",
      html,
      text,
    });
    return { sentTo: normalized };
  },
});

void api;

// Resend an attendee a team invite. Called by ownerInviteMember (first send)
// and resendTeamInvite (re-send / post-decline). The accept link points at
// /app/team/accept/<inviteId> so the invitee gets an explicit consent step.
export const sendTeamInvite = internalAction({
  args: {
    email: v.string(),
    inviteId: v.string(),
    teamName: v.string(),
    inviterName: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { email, inviteId, teamName, inviterName },
  ): Promise<{ sentTo: string }> => {
    const normalized = email.toLowerCase().trim();
    const acceptUrl = `https://conference.techeurope.io/app/team/accept/${inviteId}`;
    const from = inviterName
      ? `${inviterName} (${teamName})`
      : `the ${teamName} team`;
    const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 12px;">You're invited to ${teamName} on Applied AI Conf</h1>
      <p style="font-size:14px;color:#444;">${from} invited you to join the <b>${teamName}</b> partner team on the Applied AI Conf platform. As a teammate you'll share leads, see what your team scans during the event, and have access to your team's analytics.</p>
      <p style="font-size:14px;color:#444;">Click below to accept (or decline) the invite:</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${acceptUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 24px;border-radius:999px;text-decoration:none;font-family:ui-monospace,monospace;font-size:14px;font-weight:600;">Open invite</a>
      </p>
      <p style="font-size:12px;color:#888;">Link: <a href="${acceptUrl}">${acceptUrl}</a></p>
      <p style="font-size:12px;color:#888;">You'll need to sign in (or sign up) with <b>${normalized}</b>. The link expires when the team owner revokes it.</p>
    </div>`;
    const text = `You're invited to ${teamName} on Applied AI Conf.\n\nOpen the invite: ${acceptUrl}\n\nSign in with ${normalized} to accept (or decline).`;
    await _ctx.runAction(internal.email.send, {
      to: normalized,
      subject: `Invite to join ${teamName} on Applied AI Conf`,
      html,
      text,
    });
    return { sentTo: normalized };
  },
});

interface ClaimCodeForEmail {
  code: { code: string; expiresAt?: number } | null;
  pending: { email: string; name?: string; kind: string } | null;
}

export const emailClaimCode = action({
  args: { codeId: v.id("claimCodes") },
  handler: async (ctx, { codeId }): Promise<{ sentTo: string }> => {
    const data = (await ctx.runQuery(api.admin.getClaimCodeForEmail, {
      codeId,
    })) as ClaimCodeForEmail | null;
    if (!data?.code || !data.pending) {
      throw new Error("Code or pending attendee not found");
    }
    const { code, pending } = data;
    const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 12px;">Applied AI Conf — your access code</h1>
      <p style="font-size:14px;color:#444;">${pending.name ? `Hi ${pending.name}, ` : ""}use this code to claim your spot on the conference platform:</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700;text-align:center;background:#f3f3f3;padding:16px;border-radius:8px;font-family:ui-monospace,monospace;">${code.code}</p>
      <p style="font-size:14px;color:#444;">
        1. Sign up at <a href="https://conference.techeurope.io/app">conference.techeurope.io/app</a><br>
        2. Open Settings (or the verification screen) and paste the code above.
      </p>
      <p style="font-size:12px;color:#888;">If you didn't expect this email, you can ignore it.</p>
    </div>`;
    const text = `Your Applied AI Conf access code: ${code.code}\n\nSign up at https://conference.techeurope.io/app, then paste the code on the verification screen or in Settings.`;
    await ctx.runAction(internal.email.send, {
      to: pending.email,
      subject: "Your Applied AI Conf access code",
      html,
      text,
    });
    return { sentTo: pending.email };
  },
});
