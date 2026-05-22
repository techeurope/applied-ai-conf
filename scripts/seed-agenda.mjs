#!/usr/bin/env node
/**
 * Seed Convex `sessions` table from app/data/agenda.ts. Idempotent.
 *
 *   CONVEX_DEPLOY_KEY=<dev|prod> node scripts/seed-agenda.mjs [--prod]
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));

// Crude parse — the agenda file is a single export with literal objects, so
// we just eval it inside a sandboxed Function after stripping the import +
// the `satisfies` type assertion.
const raw = readFileSync(resolve("app/data/agenda.ts"), "utf8");
const objectsStart = raw.indexOf("[");
const objectsEnd = raw.lastIndexOf("]") + 1;
if (objectsStart === -1 || objectsEnd === 0) {
  throw new Error("Could not extract array literal from agenda.ts");
}
const arrayLiteral = raw.slice(objectsStart, objectsEnd);

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const entries = new Function(`return ${arrayLiteral};`)();

const payload = JSON.stringify({
  entries: entries.map((s) => ({
    slug: s.id,
    title: s.title,
    speakerName: s.speakerName,
    startTime: s.startTime,
    endTime: s.endTime,
    stage: s.stage,
    format: s.format,
    description: s.description,
  })),
});

const r = spawnSync(
  "npx",
  ["convex", "run", "agenda:bootstrapSeed", payload, ...flags],
  { stdio: "inherit" },
);
process.exit(r.status ?? 1);
