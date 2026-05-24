#!/usr/bin/env node
// Import vouchers from a CSV into Convex.
//
// Usage:
//   CONVEX_DEPLOY_KEY=<prod_key> node scripts/import-vouchers.mjs \
//     --csv path/to/lunch.csv --kind lunch [--column email] [--prod] [--dry-run]
//
// The CSV must have a header row. Defaults: first column named "email"
// is treated as the address. Override with --column.
//
// Skips blank rows. Trims + lowercases emails. Prints a per-row summary
// at the end (issued / re-issued same token / already had voucher /
// user not found / user inactive). Re-runnable.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";

function parseArgs(argv) {
  const args = {
    csv: null,
    kind: null,
    column: "email",
    prod: false,
    dryRun: false,
    note: undefined,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--csv") args.csv = argv[++i];
    else if (a === "--kind") args.kind = argv[++i];
    else if (a === "--column") args.column = argv[++i];
    else if (a === "--note") args.note = argv[++i];
    else if (a === "--prod") args.prod = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: node scripts/import-vouchers.mjs --csv FILE --kind KIND [--column NAME] [--note TEXT] [--prod] [--dry-run]",
      );
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(1);
    }
  }
  if (!args.csv) {
    console.error("Missing --csv path");
    process.exit(1);
  }
  if (!args.kind) {
    console.error("Missing --kind (e.g. lunch, coffee)");
    process.exit(1);
  }
  return args;
}

function parseCsv(text) {
  // Minimal CSV: split on newlines, comma-separated. Doesn't handle quoted
  // commas — fine for email lists.
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((s) => s.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((s) => s.trim());
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const csvPath = resolve(process.cwd(), args.csv);
  const text = readFileSync(csvPath, "utf8");
  const rows = parseCsv(text);
  const emails = rows.map((r) => r[args.column]).filter(Boolean);
  console.log(
    `\nRead ${rows.length} rows from ${csvPath}, found ${emails.length} non-empty "${args.column}" values.`,
  );
  console.log(`Sample: ${emails.slice(0, 5).join(", ")}${emails.length > 5 ? "…" : ""}\n`);

  if (args.dryRun) {
    console.log("--dry-run: not calling Convex. Stopping here.");
    return;
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    console.error(
      "CONVEX_DEPLOY_KEY not set. Export it before running this script.",
    );
    process.exit(1);
  }
  // ConvexHttpClient takes a URL; derive from deploy key (prefix tells us
  // which deployment). prod:neat-coyote-777 → https://neat-coyote-777.convex.cloud
  const deploymentName = deployKey.split("|")[0].split(":")[1];
  const url = `https://${deploymentName}.convex.cloud`;
  console.log(`Targeting ${url}`);

  const client = new ConvexHttpClient(url);
  client.setAdminAuth(deployKey);

  const result = await client.mutation(
    "vouchers:bootstrapImportVouchersByEmails",
    { kind: args.kind, emails, note: args.note },
  );

  console.log("\n=== Summary ===");
  console.log(`Kind:           ${result.kind}`);
  console.log(`Total rows:     ${result.totalRows}`);
  console.log(`Issued:         ${result.issued}`);
  console.log(`Already had:    ${result.alreadyHad}`);
  console.log(`User not found: ${result.userNotFound}`);
  console.log(`User inactive:  ${result.userInactive}`);

  const notFound = result.results.filter((r) => r.outcome === "user_not_found");
  if (notFound.length > 0) {
    console.log(`\nThese emails aren't yet on the platform (they'll get vouchers next time you re-run after they sign in):`);
    for (const r of notFound) console.log(`  - ${r.email}`);
  }
  const inactive = result.results.filter((r) => r.outcome === "user_inactive");
  if (inactive.length > 0) {
    console.log(`\nThese accounts are deactivated/deleted — skipped:`);
    for (const r of inactive) console.log(`  - ${r.email}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
