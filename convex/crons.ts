import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh the Luma attendees cache every 15 minutes. On event day this keeps
// last-minute registrations + check-ins reflected within ~15 min without anyone
// having to run `scripts/sync-luma-attendees.mjs` manually.
//
// Partner-team auto-attach is NOT cron'd on purpose — sponsor team membership
// is a human decision; run `scripts/sync-partner-teams.mjs` when new partner
// staff get tickets.
crons.interval(
  "luma sync",
  { minutes: 15 },
  internal.luma.sync,
  {},
);

// WorkOS signup recovery — every 5 minutes, find users WorkOS created but
// who never finished email verification (and never signed in), delete the
// ghost record, and send them an Invitation email (7-day valid link). This
// rescues attendees who get the "email not available" wall on retry.
// See `convex/workos_recovery.ts` for the rationale.
crons.interval(
  "workos signup recovery",
  { minutes: 5 },
  internal.workos_recovery.sweepUnverified,
  {},
);

// Sweep #2: rescue users who got past WorkOS auth but whose Convex user-insert
// rolled back (silent throw in tryAutoLink / consumePartnerInviteIfAny /
// consumeAdminInviteIfAny). Without this they're signed in but locked out of
// /app forever. See `convex/workos_recovery.ts`.
crons.interval(
  "workos missing convex user recovery",
  { minutes: 5 },
  internal.workos_recovery.sweepMissingConvexUsers,
  {},
);

// Sweep #3: find non-admin users with no ticketLinkedAt but an approved Luma
// row, and auto-link them. Catches the case where ensureFromWorkos's
// tryAutoLink failed (silent throw) or where the Luma cache hadn't synced
// yet at signup time.
crons.interval(
  "workos auto-link approved tickets",
  { minutes: 5 },
  internal.workos_recovery.sweepUnlinkedWithApprovedTicket,
  {},
);

export default crons;
