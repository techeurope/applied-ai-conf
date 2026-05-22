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

export default crons;
