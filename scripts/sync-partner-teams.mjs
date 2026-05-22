#!/usr/bin/env node
/**
 * One-shot re-sync: pull latest Luma attendees + attach any new Speaker/Partner
 * ticket holders to their partner team by email domain.
 *
 * Run this whenever new partner staff get Luma tickets:
 *
 *   CONVEX_DEPLOY_KEY=<dev_key>  node scripts/sync-partner-teams.mjs
 *   CONVEX_DEPLOY_KEY=<prod_key> node scripts/sync-partner-teams.mjs --prod
 *
 * Idempotent. Safe to re-run as often as you like.
 *
 * Stages:
 *   1. luma:sync                       — refresh lumaAttendees cache from Luma.
 *   2. partners:bootstrapAttachByDomain — match approved Speaker/Partner
 *                                          ticket holders by email host, then
 *                                          auto-attach as owner (or pre-invite
 *                                          if the user hasn't signed up yet).
 *
 * Edit DOMAIN_MAP below if you add or rename a paid-tier partner team.
 */
import { spawnSync } from "node:child_process";

const DOMAIN_MAP = [
  { domain: "nebius.com", slug: "nebius" },
  { domain: "openai.com", slug: "openai" },
  { domain: "runpod.io", slug: "runpod" },
  { domain: "stripe.com", slug: "stripe" },
  { domain: "modal.com", slug: "modal" },
  { domain: "dust.tt", slug: "dust" },
  { domain: "dlthub.com", slug: "dlthub" },
  { domain: "elastic.co", slug: "elastic" },
];

const TICKETS = ["Speaker", "Partner"];

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));

function run(label, fn, payload) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(
    "npx",
    ["convex", "run", fn, payload ?? "{}", ...flags],
    { stdio: "inherit" },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("1/2 Sync Luma attendees", "luma:sync");

const attachPayload = JSON.stringify({
  domainMap: DOMAIN_MAP,
  tickets: TICKETS,
});
run("2/2 Attach by domain", "partners:bootstrapAttachByDomain", attachPayload);

console.log("\nDone.");
