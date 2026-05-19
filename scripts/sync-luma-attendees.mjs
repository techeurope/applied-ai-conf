#!/usr/bin/env node
/**
 * Sync Luma attendees into the Convex `lumaAttendees` table.
 *
 * Usage:
 *   node scripts/sync-luma-attendees.mjs           # dev (default convex.json)
 *   node scripts/sync-luma-attendees.mjs --prod    # production
 *
 * Auth: requires CONVEX_DEPLOY_KEY in env for the target deployment.
 * The Convex deployment must also have LUMA_API_KEY set as an env var.
 *
 * Suitable for cron — every 30 min during pre-event, every 5 min on
 * event day. Idempotent: upserts by lumaGuestId.
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));

const r = spawnSync("npx", ["convex", "run", "luma:sync", "{}", ...flags], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
