#!/usr/bin/env node
/**
 * One-off prod cleanup. Run AFTER pushing the new phases to prod,
 * after the new schema is live on neat-coyote-777.
 *
 *   CONVEX_DEPLOY_KEY=<prod_key> node scripts/prod-cleanup.mjs
 *
 * What it does:
 * 1. Delete the orphan staging Convex user k57f58k4g6zzmfc6gc2nb3n2jx870g5s
 *    (workosUserId points at a WorkOS-staging user that doesn't exist in
 *    prod, so the record can never sign in again).
 * 2. Delete the test pending attendee anna.speaker@example.com.
 * 3. Delete the test claim code FVGK-UD6X (already claimed by the
 *    orphan user; gets removed with the orphan cleanup).
 *
 * Idempotent. Skips anything that's already gone.
 */
import { spawnSync } from "node:child_process";

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));

const r = spawnSync(
  "npx",
  ["convex", "run", "admin:purgeStagingArtifacts", "{}", ...flags],
  { stdio: "inherit" },
);
process.exit(r.status ?? 1);
