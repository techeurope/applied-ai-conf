#!/usr/bin/env node
/**
 * Seed partner teams in Convex from app/data/partners.ts.
 * Idempotent: skips any team whose slug already exists.
 *
 * Usage:
 *   CONVEX_DEPLOY_KEY=<dev_key>  node scripts/seed-partner-teams.mjs
 *   CONVEX_DEPLOY_KEY=<prod_key> node scripts/seed-partner-teams.mjs --prod
 */
import { spawnSync } from "node:child_process";
import { PARTNERS } from "../app/data/partners.ts";

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const entries = [];
for (const tier of ["premium", "gold", "community"]) {
  for (const p of PARTNERS[tier] ?? []) {
    entries.push({
      name: p.name,
      slug: slugify(p.name),
      tier,
      website: p.url,
    });
  }
}

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const r = spawnSync(
  "npx",
  [
    "convex",
    "run",
    "partners:bootstrapSeedPartners",
    JSON.stringify({ entries }),
    ...flags,
  ],
  { stdio: "inherit" },
);
process.exit(r.status ?? 1);
