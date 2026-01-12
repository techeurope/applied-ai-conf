#!/usr/bin/env node
/**
 * crop-to-square.mjs - CLI tool for cropping images to center-square
 *
 * Usage:
 *   node scripts/crop-to-square.mjs --input image.png [options]
 *
 * Options:
 *   --input, -i       Input image path (required)
 *   --output, -o      Output path (default: same as input with _square suffix)
 *   --help, -h        Show this help message
 *
 * Output:
 *   Creates a square PNG cropped from the center of the input.
 *   For 16:9 images, this crops the left/right edges to make it square.
 *   For 9:16 images, this crops the top/bottom edges.
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { dirname, join, extname, basename } from "path";

function showHelp() {
  console.log(`
crop-to-square.mjs - Crop images to center-square

USAGE:
  node scripts/crop-to-square.mjs --input image.png [options]

OPTIONS:
  --input, -i       Input image path (required)
  --output, -o      Output path for square PNG (default: auto-generated)
  --help, -h        Show this help message

EXAMPLES:
  node scripts/crop-to-square.mjs -i public/speakers/name_fullbody_transparent.png
  node scripts/crop-to-square.mjs -i image.png -o image_square.png

OUTPUT:
  Creates <filename>_square.png in the same directory as input.
  Original file is preserved.

BEHAVIOR:
  - For 16:9 (landscape): crops left/right edges, keeps full height
  - For 9:16 (portrait): crops top/bottom edges, keeps full width
  - Square images pass through unchanged
`);
  process.exit(0);
}

function parseArgs(args) {
  const result = {
    input: null,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--help":
      case "-h":
        showHelp();
        break;
      case "--input":
      case "-i":
        result.input = next;
        i++;
        break;
      case "--output":
      case "-o":
        result.output = next;
        i++;
        break;
    }
  }

  return result;
}

function validateArgs(args) {
  if (!args.input) {
    console.error("ERROR: --input is required\n");
    console.error("Run with --help for usage information");
    process.exit(1);
  }

  if (!existsSync(args.input)) {
    console.error(`ERROR: Input image not found: ${args.input}`);
    process.exit(1);
  }
}

function generateOutputPath(inputPath, customOutput) {
  if (customOutput) {
    if (!customOutput.endsWith(".png")) {
      return customOutput + ".png";
    }
    return customOutput;
  }

  // Generate from input filename: name.png -> name_square.png
  const dir = dirname(inputPath);
  const ext = extname(inputPath);
  const name = basename(inputPath, ext);
  return join(dir, `${name}_square.png`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (process.argv.length <= 2) {
    showHelp();
  }

  validateArgs(args);

  const outputPath = generateOutputPath(args.input, args.output);
  const outputDir = dirname(outputPath);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log("Cropping to square...");
  console.log(`  Input: ${args.input}`);

  try {
    // Get image metadata
    const image = sharp(args.input);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      console.error("ERROR: Could not read image dimensions");
      process.exit(1);
    }

    console.log(`  Original size: ${width}x${height}`);

    // Calculate crop dimensions
    const size = Math.min(width, height);
    const left = Math.floor((width - size) / 2);
    const top = Math.floor((height - size) / 2);

    console.log(`  Crop region: ${size}x${size} (offset: ${left}, ${top})`);

    // Crop and save
    await image
      .extract({
        left,
        top,
        width: size,
        height: size,
      })
      .png()
      .toFile(outputPath);

    console.log(`\nSaved: ${basename(outputPath)}`);
    console.log(`Path: ${outputPath}`);
    console.log(`Size: ${size}x${size}`);
  } catch (err) {
    console.error("\nERROR:", err?.message || err);
    process.exit(1);
  }
}

main();
