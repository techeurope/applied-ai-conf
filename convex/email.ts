"use node";

import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set on this Convex deployment");
  return new Resend(key);
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "Applied AI Conf <onboarding@resend.dev>";
}

export const send = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    replyTo: v.optional(v.string()),
  },
  handler: async (_ctx, { to, subject, html, text, replyTo }) => {
    const resend = client();
    const result = await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
      replyTo,
    });
    if (result.error) {
      throw new Error(`Resend: ${result.error.message ?? "send failed"}`);
    }
    return { id: result.data?.id ?? null };
  },
});
