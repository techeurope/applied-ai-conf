#!/usr/bin/env node
/**
 * Batch process all speaker images to remove backgrounds
 *
 * Usage:
 *   node scripts/process-all-speakers.mjs
 *
 * Requires:
 *   FAL_API_KEY in .env.local
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const speakers = [
  "daniel_khachab.jpg",
  "jacob_lauritzen.jpg",
  "lennard_schmidt.jpg",
  "lucas_hild.jpg",
  "nico-bentenrieder.jpg",
];

console.log(`Processing ${speakers.length} speaker images...\n`);

for (const speaker of speakers) {
  const inputPath = join(projectRoot, "public", "speakers", speaker);

  if (!existsSync(inputPath)) {
    console.error(`⚠️  Skipping ${speaker} - file not found`);
    continue;
  }

  console.log(`\n📸 Processing: ${speaker}`);
  console.log("─".repeat(50));

  try {
    execSync(`node scripts/remove-background.mjs -i "${inputPath}"`, {
      stdio: "inherit",
      cwd: projectRoot,
    });
    console.log(`✅ Completed: ${speaker}\n`);
  } catch (error) {
    console.error(`❌ Failed: ${speaker}`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log("\n✨ All speaker images processed!");
