#!/usr/bin/env node
/**
 * sync-attio-partners.mjs - Sync confirmed conference partners from Attio to Google Sheets
 *
 * Reads deals from Attio (READ-ONLY, never writes to Attio), filters to conference
 * deals with confirmed stages, resolves company names, and appends any missing
 * companies to the Partner Companies spreadsheet.
 *
 * Conference deal filter:
 *   - deal_type == "Conference" OR deal name contains "conf" (case-insensitive)
 *   - Stage is one of: Closed Won, Done, Verbal Commit
 *   - Excludes ticket-purchase deals (name contains "ticket")
 *
 * Tier logic — uses the Attio `tier` field directly:
 *   - "Premium"   → Premium Partner
 *   - "Gold"      → Gold Partner
 *   - "Community" → Community Partner
 *   - "Custom"    → "NEEDS REVIEW" (Custom is non-standard, human must decide)
 *   - not set     → "NEEDS REVIEW" (data gap in Attio)
 *
 * When a partner is added with tier "NEEDS REVIEW", the Notes column gets a
 * prominent warning so other agents reading the spreadsheet know NOT to blindly
 * add the partner to the website and must ask the user for clarification.
 *
 * Existing rows in the spreadsheet are NEVER modified or deleted.
 *
 * Usage:
 *   node scripts/sync-attio-partners.mjs [options]
 *
 * Options:
 *   --dry-run     Show what would be added without writing to the sheet
 *   --help, -h    Show this help message
 *
 * Environment:
 *   ATTIO_API_KEY
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 */

import "./lib/env.mjs";
import { getAccessToken, readSheet, writeToSheet } from "./lib/google-sheets.mjs";

const ATTIO_BASE = "https://api.attio.com/v2";
const SPREADSHEET_ID = "1iEFn8ArYGWXMAQrPJT0adEg9xBkOTY1uNBf3NSLODLg";
const SHEET_RANGE = "companies!A1:G500";

const CONFIRMED_STAGES = new Set(["Closed Won", "Done", "Verbal Commit"]);
const TIER_NEEDS_REVIEW = "NEEDS REVIEW";
const REVIEW_WARNING =
  "⚠️ TIER UNCLEAR — DO NOT add to website until a human confirms the tier. " +
  "Check Attio deal tier field (may be 'Custom' or empty).";

function showHelp() {
  console.log(`
sync-attio-partners.mjs - Sync confirmed conference partners from Attio to Google Sheets

USAGE:
  node scripts/sync-attio-partners.mjs [options]

OPTIONS:
  --dry-run     Show what would be added without writing to the sheet
  --help, -h    Show this help message

ENVIRONMENT:
  ATTIO_API_KEY            Attio API key (read-only access)
  GOOGLE_CLIENT_ID         Google OAuth client ID
  GOOGLE_CLIENT_SECRET     Google OAuth client secret
  GOOGLE_REFRESH_TOKEN     Google OAuth refresh token
`);
  process.exit(0);
}

function parseArgs(args) {
  const result = { dryRun: false };
  for (const arg of args) {
    if (arg === "--help" || arg === "-h") showHelp();
    if (arg === "--dry-run") result.dryRun = true;
  }
  return result;
}

/**
 * GET/POST helper for the Attio API (read-only operations only).
 */
async function attioFetch(path, { method = "GET", body } = {}) {
  const apiKey = process.env.ATTIO_API_KEY;
  if (!apiKey) {
    console.error("ERROR: ATTIO_API_KEY not set");
    process.exit(1);
  }

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${ATTIO_BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Attio ${method} ${path} failed ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch all deals from Attio (single page, up to 500).
 */
async function fetchAllDeals() {
  const resp = await attioFetch("/objects/deals/records/query", {
    method: "POST",
    body: { limit: 500 },
  });
  return resp.data;
}

/**
 * Resolve a company record ID to its name.
 */
async function fetchCompanyName(recordId) {
  const resp = await attioFetch(`/objects/companies/records/${recordId}`);
  const nameValues = resp.data?.values?.name;
  return nameValues?.[0]?.value || null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a deal is a conference partnership.
 * Includes: deal_type == "Conference" OR deal name contains "conf".
 * Excludes: deals that look like ticket purchases (name contains "ticket").
 */
function isConferencePartnerDeal(deal) {
  const vals = deal.values || {};
  const dealType = vals.deal_type?.[0]?.option?.title || "";
  const dealName = (vals.name?.[0]?.value || "").toLowerCase();

  // Exclude ticket purchases — these aren't partnerships
  if (dealName.includes("ticket")) return false;

  return dealType === "Conference" || dealName.includes("conf");
}

/**
 * Extract deal fields from raw Attio deal record.
 */
function parseDeal(deal) {
  const vals = deal.values || {};
  return {
    name: vals.name?.[0]?.value || "N/A",
    stage: vals.stage?.[0]?.status?.title || "N/A",
    value: vals.value?.[0]?.currency_value ?? null,
    companyId: vals.associated_company?.[0]?.target_record_id || null,
    attioTier: vals.tier?.[0]?.option?.title || null,
  };
}

/**
 * Map Attio's tier field to spreadsheet tier.
 * Custom and unset tiers become "NEEDS REVIEW" so humans must decide.
 */
function mapTier(attioTier) {
  switch (attioTier) {
    case "Premium":
      return "Premium";
    case "Gold":
      return "Gold Partner";
    case "Community":
      return "Community Partner";
    case "Custom":
    case null:
    case undefined:
    default:
      return TIER_NEEDS_REVIEW;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // 1. Fetch all deals from Attio
  console.log("Fetching deals from Attio...");
  const allDeals = await fetchAllDeals();
  console.log(`  Total deals: ${allDeals.length}`);

  // 2. Filter to confirmed conference deals
  const conferenceDeals = allDeals.filter((d) => {
    const parsed = parseDeal(d);
    return isConferencePartnerDeal(d) && CONFIRMED_STAGES.has(parsed.stage);
  });
  console.log(`  Confirmed conference deals: ${conferenceDeals.length}`);

  // 3. Group by company, keep the highest-value deal per company
  const byCompany = new Map();
  for (const deal of conferenceDeals) {
    const parsed = parseDeal(deal);
    if (!parsed.companyId) continue;

    // Prefer deals with a set tier over those without, then by value
    const existing = byCompany.get(parsed.companyId);
    const existingHasTier = existing?.attioTier != null;
    const currentHasTier = parsed.attioTier != null;

    if (!existing) {
      byCompany.set(parsed.companyId, parsed);
    } else if (currentHasTier && !existingHasTier) {
      byCompany.set(parsed.companyId, parsed);
    } else if (currentHasTier === existingHasTier && (parsed.value ?? 0) > (existing.value ?? 0)) {
      byCompany.set(parsed.companyId, parsed);
    }
  }

  // 4. Resolve company names
  console.log(`\nResolving ${byCompany.size} company names...`);
  const confirmedPartners = [];

  for (const [companyId, deal] of byCompany) {
    const companyName = await fetchCompanyName(companyId);
    if (!companyName) continue;

    confirmedPartners.push({
      company: companyName,
      tier: mapTier(deal.attioTier),
      attioTier: deal.attioTier,
      dealName: deal.name,
      dealStage: deal.stage,
      dealValue: deal.value,
    });

    // Rate limit: 50ms between API calls
    await sleep(50);
  }

  console.log(`\nConfirmed conference partners: ${confirmedPartners.length}`);
  for (const p of confirmedPartners) {
    const val = p.dealValue !== null ? `€${p.dealValue.toLocaleString()}` : "N/A";
    const flag = p.tier === TIER_NEEDS_REVIEW ? " ⚠️" : "";
    console.log(`  ${p.company.padEnd(25)} ${p.tier.padEnd(20)} ${p.dealStage.padEnd(15)} ${val}${flag}`);
  }

  // Report partners that need human review
  const needsReview = confirmedPartners.filter((p) => p.tier === TIER_NEEDS_REVIEW);
  if (needsReview.length > 0) {
    console.log(`\n⚠️  ${needsReview.length} partner(s) need tier review in Attio:`);
    for (const p of needsReview) {
      const attioTierLabel = p.attioTier ? `"${p.attioTier}"` : "not set";
      console.log(`  - ${p.company}: Attio tier is ${attioTierLabel} (deal: "${p.dealName}")`);
    }
    console.log(`  Fix by setting the 'tier' field on the deal in Attio to Gold/Community/Premium.`);
  }

  // 5. Read existing spreadsheet
  console.log("\nReading Partner Companies spreadsheet...");
  const accessToken = await getAccessToken();
  const rows = await readSheet(SPREADSHEET_ID, SHEET_RANGE, accessToken);

  if (rows.length === 0) {
    console.error("ERROR: Spreadsheet appears empty (no header row)");
    process.exit(1);
  }

  // Header: Company | Partner Tier | On Website | On Socials | Website | Notes | Status
  const header = rows[0];
  console.log(`  Header: ${header.join(" | ")}`);
  console.log(`  Existing rows: ${rows.length - 1}`);

  // Build list of existing company names (case-insensitive)
  const existingNames = rows
    .slice(1)
    .map((row) => (row[0] || "").trim().toLowerCase())
    .filter(Boolean);

  /**
   * Check if a company name already exists in the sheet.
   * Uses substring matching (min 3 chars) to handle Attio name variants
   * (e.g., "Peec" matches "Peec AI", "Google" matches "Google DeepMind").
   * Names shorter than 3 chars fall back to exact match to avoid false positives.
   */
  function alreadyInSheet(name) {
    const lower = name.trim().toLowerCase();
    if (lower.length < 3) {
      return existingNames.some((existing) => existing === lower);
    }
    return existingNames.some(
      (existing) => existing.includes(lower) || lower.includes(existing)
    );
  }

  // 6. Find new partners not yet in the sheet
  const newPartners = confirmedPartners.filter((p) => !alreadyInSheet(p.company));

  if (newPartners.length === 0) {
    console.log("\nNo new partners to add. Spreadsheet is up to date.");
    return;
  }

  console.log(`\nNew partners to add: ${newPartners.length}`);
  for (const p of newPartners) {
    console.log(`  + ${p.company} (${p.tier}) — deal: ${p.dealName}, stage: ${p.dealStage}`);
  }

  if (args.dryRun) {
    console.log("\n[DRY RUN] No changes written to the spreadsheet.");
    return;
  }

  // 7. Append new rows to the spreadsheet
  const nextRow = rows.length + 1;
  const newRows = newPartners.map((p) => {
    const needsReview = p.tier === TIER_NEEDS_REVIEW;
    const attioTierLabel = p.attioTier ? `"${p.attioTier}"` : "not set";
    const notes = needsReview
      ? `${REVIEW_WARNING} Attio tier: ${attioTierLabel}. Deal: "${p.dealName}".`
      : `Auto-synced from Attio deal "${p.dealName}"`;

    return [
      p.company,    // Company
      p.tier,       // Partner Tier (may be "NEEDS REVIEW")
      "FALSE",      // On Website
      "FALSE",      // On Socials
      "",           // Website
      notes,        // Notes
      p.dealStage,  // Status
    ];
  });

  const appendRange = `companies!A${nextRow}:G${nextRow + newRows.length - 1}`;
  console.log(`\nAppending ${newRows.length} rows at ${appendRange}...`);
  await writeToSheet(SPREADSHEET_ID, appendRange, newRows, accessToken);

  console.log("Done! New partners added to the spreadsheet.");
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
