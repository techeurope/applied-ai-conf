import { v } from "convex/values";
import { mutation } from "./_generated/server";

// `claim.lookup` removed — it was a public query that leaked
// pendingAttendees.email/name/company/jobRole for any valid code, letting
// an attacker brute-force 8-char codes to harvest VIP/speaker PII. No
// frontend caller exists; the redeem flow is one-shot. If we ever want a
// preview-before-redeem UX, build it as an auth-gated query returning
// only `kind` + `name`, not email/company/jobRole.

export const redeem = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");
    if (user.deactivatedAt) throw new Error("Account deactivated");

    if (user.claimCodeId) {
      throw new Error("This account is already linked to a claim code");
    }

    const normalized = code.toUpperCase().trim();
    const found = await ctx.db
      .query("claimCodes")
      .withIndex("by_code", (q) => q.eq("code", normalized))
      .first();

    if (!found) throw new Error("Code not found");
    if (found.revokedAt) throw new Error("Code revoked");
    if (found.claimedAt) throw new Error("Code already claimed");
    if (found.expiresAt && found.expiresAt < Date.now()) throw new Error("Code expired");

    const pending = await ctx.db.get(found.pendingAttendeeId);
    if (!pending) throw new Error("Linked attendee record missing");

    // Stamp the code as claimed.
    await ctx.db.patch(found._id, {
      claimedAt: Date.now(),
      claimedByUserId: user._id,
    });
    await ctx.db.patch(pending._id, {
      claimedByUserId: user._id,
      claimedAt: Date.now(),
    });

    // Enrich the user record from the pending row, but never overwrite existing values.
    // Also marks the user as ticket-verified so the access gate lets them in,
    // even though they never had a Luma ticket.
    const patch: Record<string, unknown> = {
      claimCodeId: found._id,
      ticketLinkedAt: Date.now(),
    };
    if (pending.name && !user.name.trim()) patch.name = pending.name;
    if (pending.company && !user.company) patch.company = pending.company;
    if (pending.jobRole && !user.role) patch.role = pending.jobRole;
    if (pending.kind === "speaker") patch.isSpeaker = true;
    await ctx.db.patch(user._id, patch);

    await ctx.db.insert("auditLog", {
      actorUserId: user._id,
      action: "claim_code.redeem",
      targetUserId: user._id,
      targetClaimCodeId: found._id,
      metadata: JSON.stringify({ kind: pending.kind, email: pending.email }),
      createdAt: Date.now(),
    });

    return { codeId: found._id, kind: pending.kind };
  },
});
