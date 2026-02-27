/**
 * env.mjs - Shared dotenv loading for scripts
 *
 * Loads .env.local (preferred) or .env from project root.
 * Import this module before accessing process.env in any script.
 */

import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

const envLocalPath = join(projectRoot, ".env.local");
const envPath = join(projectRoot, ".env");

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, quiet: true });
} else {
  dotenv.config({ path: envPath, quiet: true });
}
