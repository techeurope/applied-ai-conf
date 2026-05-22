"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

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
