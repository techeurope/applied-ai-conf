#!/usr/bin/env node
/**
 * sync-luma-beehiiv.mjs - Find Beehiiv subscribers without Luma tickets
 *
 * Compares Beehiiv subscriber list against Luma guest list to find
 * newsletter subscribers who haven't purchased a ticket yet.
 *
 * Usage:
 *   node scripts/sync-luma-beehiiv.mjs [options]
 *
 * Options:
 *   --dry-run        Show what would be fetched without comparing (default: false)
 *   --format         Output format: table or json (default: table)
 *   --help, -h       Show this help message
 *
 * Environment:
 *   BEEHIIV_API_KEY
 *   BEEHIIV_PUBLICATION_ID
 *   LUMA_API_KEY
 */

import "./lib/env.mjs";
import { fetchAllSubscribers } from "./lib/beehiiv.mjs";

const LUMA_EVENT_ID = "evt-EFJJfPGbyKg7PYU";
const LUMA_BASE_URL = "https://api.lu.ma/public/v1";

function showHelp() {
  console.log(`
sync-luma-beehiiv.mjs - Find Beehiiv subscribers without Luma tickets

USAGE:
  node scripts/sync-luma-beehiiv.mjs [options]

OPTIONS:
  --dry-run        Show subscriber/guest counts without full comparison
  --format <fmt>   Output format: table (default) or json
  --help, -h       Show this help message

ENVIRONMENT:
  BEEHIIV_API_KEY          Beehiiv API key
  BEEHIIV_PUBLICATION_ID   Beehiiv publication ID
  LUMA_API_KEY             Luma API key
`);
  process.exit(0);
}

function parseArgs(args) {
  const result = { dryRun: false, format: "table" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--help":
      case "-h":
        showHelp();
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
      case "--format":
        result.format = args[++i];
        break;
    }
  }

  return result;
}

/**
 * Fetch all Luma guests for the event (cursor-paginated).
 */
async function fetchAllLumaGuests() {
  const apiKey = process.env.LUMA_API_KEY;
  if (!apiKey) {
    console.error("ERROR: LUMA_API_KEY not found in environment");
    process.exit(1);
  }

  const guests = [];
  let cursor = undefined;
  let page = 0;

  while (true) {
    page++;
    const url = new URL(`${LUMA_BASE_URL}/event/get-guests`);
    url.searchParams.set("event_api_id", LUMA_EVENT_ID);
    if (cursor) {
      url.searchParams.set("pagination_cursor", cursor);
    }

    const res = await fetch(url.toString(), {
      headers: { "x-luma-api-key": apiKey },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`ERROR: Luma API ${res.status}: ${body}`);
      process.exit(1);
    }

    const json = await res.json();
    const entries = json.entries || [];
    guests.push(...entries);

    process.stderr.write(
      `  Fetched page ${page} (${entries.length} guests, ${guests.length} total)\r`
    );

    if (!json.has_more || entries.length === 0) {
      break;
    }
    cursor = json.next_cursor;
  }

  process.stderr.write("\n");
  return guests;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log("Fetching Beehiiv subscribers...");
  const subscribers = await fetchAllSubscribers();
  console.log(`  Total active subscribers: ${subscribers.length}`);

  console.log("\nFetching Luma guests...");
  const guests = await fetchAllLumaGuests();
  console.log(`  Total guests: ${guests.length}`);

  if (args.dryRun) {
    console.log("\n[DRY RUN] Skipping comparison.");
    console.log(`  Would compare ${subscribers.length} subscribers against ${guests.length} guests.`);
    return;
  }

  // Build set of Luma guest emails (case-insensitive)
  const lumaEmails = new Set();
  for (const guest of guests) {
    const email = guest.guest?.email || guest.email;
    if (email) {
      lumaEmails.add(email.toLowerCase().trim());
    }
  }

  // Find subscribers not in Luma
  const missing = [];
  for (const sub of subscribers) {
    const email = (sub.email || "").toLowerCase().trim();
    if (email && !lumaEmails.has(email)) {
      missing.push({
        email: sub.email,
        created_at: sub.created_at,
        utm_source: sub.utm_source || "",
      });
    }
  }

  // Sort by signup date (newest first)
  missing.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  console.log(`\nSubscribers WITHOUT Luma ticket: ${missing.length} / ${subscribers.length}`);
  console.log(`Subscribers WITH Luma ticket: ${subscribers.length - missing.length}`);

  if (missing.length === 0) {
    console.log("\nAll subscribers have Luma tickets!");
    return;
  }

  if (args.format === "json") {
    console.log(JSON.stringify(missing, null, 2));
  } else {
    console.log(`\n${"EMAIL".padEnd(40)} ${"SIGNED UP".padEnd(24)} UTM SOURCE`);
    console.log("-".repeat(80));
    for (const row of missing) {
      const date = row.created_at
        ? new Date(row.created_at).toISOString().split("T")[0]
        : "N/A";
      console.log(
        `${row.email.padEnd(40)} ${date.padEnd(24)} ${row.utm_source}`
      );
    }
  }
}

main();
