#!/usr/bin/env node
/**
 * push-business-to-attio.mjs - Classify subscriber emails and push business contacts to Attio
 *
 * Fetches Beehiiv subscribers, classifies as business vs personal email,
 * and upserts business contacts into Attio CRM.
 *
 * Usage:
 *   node scripts/push-business-to-attio.mjs [options]
 *
 * Options:
 *   --dry-run        Classify emails but skip Attio push (default: false)
 *   --format         Output format: table or json (default: table)
 *   --help, -h       Show this help message
 *
 * Environment:
 *   BEEHIIV_API_KEY
 *   BEEHIIV_PUBLICATION_ID
 *   ATTIO_API_KEY
 */

import "./lib/env.mjs";
import { fetchAllSubscribers } from "./lib/beehiiv.mjs";
import { isBusinessEmail, getDomain } from "./lib/free-email-domains.mjs";

const ATTIO_BASE_URL = "https://api.attio.com/v2";

function showHelp() {
  console.log(`
push-business-to-attio.mjs - Classify emails and push business contacts to Attio

USAGE:
  node scripts/push-business-to-attio.mjs [options]

OPTIONS:
  --dry-run        Classify emails but skip Attio upsert
  --format <fmt>   Output format: table (default) or json
  --help, -h       Show this help message

ENVIRONMENT:
  BEEHIIV_API_KEY          Beehiiv API key
  BEEHIIV_PUBLICATION_ID   Beehiiv publication ID
  ATTIO_API_KEY            Attio API key
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
 * Build Attio record values for a subscriber.
 * Structured so we can easily add fields once Nima confirms Attio list/fields.
 */
function buildAttioValues(subscriber) {
  return {
    email_addresses: [{ email_address: subscriber.email }],
  };
}

/**
 * Upsert a single contact into Attio.
 * Uses PUT with matching_attribute=email_addresses to avoid duplicates.
 */
async function upsertToAttio(subscriber, apiKey) {
  const res = await fetch(
    `${ATTIO_BASE_URL}/objects/people/records?matching_attribute=email_addresses`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { values: buildAttioValues(subscriber) } }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    return { success: false, email: subscriber.email, error: `${res.status}: ${body}` };
  }

  const json = await res.json();
  return { success: true, email: subscriber.email, id: json.data?.id?.record_id };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log("Fetching Beehiiv subscribers...");
  const subscribers = await fetchAllSubscribers();
  console.log(`  Total active subscribers: ${subscribers.length}`);

  // Classify emails
  const business = [];
  const personal = [];

  for (const sub of subscribers) {
    const email = (sub.email || "").trim();
    if (!email) continue;

    if (isBusinessEmail(email)) {
      business.push(sub);
    } else {
      personal.push(sub);
    }
  }

  console.log(`\nClassification:`);
  console.log(`  Business emails: ${business.length}`);
  console.log(`  Personal emails: ${personal.length}`);

  // Domain summary for business emails
  const domainCounts = {};
  for (const sub of business) {
    const domain = getDomain(sub.email);
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  }
  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\nTop 10 business domains:`);
  for (const [domain, count] of topDomains) {
    console.log(`  ${domain.padEnd(30)} ${count}`);
  }

  if (args.format === "json") {
    const output = business.map((sub) => ({
      email: sub.email,
      domain: getDomain(sub.email),
      created_at: sub.created_at || null,
    }));
    console.log(JSON.stringify(output, null, 2));
  } else if (args.format === "table") {
    console.log(`\n${"EMAIL".padEnd(40)} ${"DOMAIN".padEnd(30)} SIGNED UP`);
    console.log("-".repeat(85));
    for (const sub of business) {
      const date = sub.created_at
        ? new Date(sub.created_at).toISOString().split("T")[0]
        : "N/A";
      console.log(
        `${(sub.email || "").padEnd(40)} ${getDomain(sub.email).padEnd(30)} ${date}`
      );
    }
  }

  if (args.dryRun) {
    console.log(`\n[DRY RUN] Would push ${business.length} business contacts to Attio.`);
    return;
  }

  // Push to Attio
  const apiKey = process.env.ATTIO_API_KEY;
  if (!apiKey) {
    console.error("ERROR: ATTIO_API_KEY not found in environment");
    process.exit(1);
  }

  console.log(`\nPushing ${business.length} business contacts to Attio...`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < business.length; i++) {
    const sub = business[i];
    const result = await upsertToAttio(sub, apiKey);

    if (result.success) {
      success++;
    } else {
      errors++;
      console.error(`  FAILED: ${result.email} - ${result.error}`);
    }

    process.stderr.write(
      `  Progress: ${i + 1}/${business.length} (${success} ok, ${errors} errors)\r`
    );

    // Rate limit safety: 100ms between requests
    if (i < business.length - 1) {
      await sleep(100);
    }
  }

  process.stderr.write("\n");
  console.log(`\nDone! Pushed ${success} contacts to Attio (${errors} errors).`);
}

main();
