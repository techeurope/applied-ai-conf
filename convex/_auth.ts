import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export async function requireActiveUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  if (user.deactivatedAt) throw new Error("Account deactivated");
  if (user.deletedAt) throw new Error("Account deleted");
  return user;
}

export async function requireVerifiedUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const user = await requireActiveUser(ctx);
  if (!user.ticketLinkedAt && user.accessLevel !== "admin") {
    throw new Error("Ticket not verified");
  }
  return user;
}
