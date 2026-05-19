#!/usr/bin/env node
/**
 * stitch-print.mjs - Stitch hero pattern print tiles into a final PNG
 *
 * Reads tiles from public/print/_tiles/<variant>/ (produced by the
 * /print page POSTing to /api/print-tile) and assembles them into a
 * single 23,624 x 23,624 px PNG (2x2m at 300 DPI).
 *
 * The composite happens in node because the final canvas is ~2.2 GB
 * raw RGBA — browsers cap canvas size and memory; sharp handles it.
 *
 * Usage:
 *   node scripts/stitch-print.mjs --variant <name> [--out <png>] [--out-dir <dir>]
 *   node scripts/stitch-print.mjs --tiles-dir <dir>  [--out <png>] [--out-dir <dir>]
 *
 * Defaults:
 *   --out-dir = public/print
 *   --out     = derived from metadata, e.g. hero-print-frame0-dark.png
 */

import sharp from "sharp"
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from "fs"
import { dirname, join, resolve } from "path"

function parseArgs(argv) {
  const args = {
    variant: null,
    tilesDir: null,
    out: null,
    outDir: "public/print",
    gradient: true,
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--variant" || a === "-v") args.variant = argv[++i]
    else if (a === "--tiles-dir") args.tilesDir = argv[++i]
    else if (a === "--out" || a === "-o") args.out = argv[++i]
    else if (a === "--out-dir") args.outDir = argv[++i]
    else if (a === "--no-gradient") args.gradient = false
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: node scripts/stitch-print.mjs --variant <name> [--out <png>] [--out-dir <dir>] [--no-gradient]"
      )
      process.exit(0)
    }
  }
  if (!args.variant && !args.tilesDir) {
    console.error("error: --variant <name> or --tiles-dir <dir> is required")
    process.exit(1)
  }
  return args
}

/**
 * Build the dark fade-to-black gradient that the live hero applies as a CSS
 * overlay (`bg-gradient-to-b from-transparent via-black/20 to-black`) and
 * composite it on top of `inputPath`.
 *
 *  Stops:
 *    y=0    : alpha = 0    (transparent)
 *    y=50%  : alpha = 0.2  (20% black)
 *    y=100% : alpha = 1.0  (solid black)
 *
 * Built as a 1×H raw RGBA buffer so we don't fight sharp's SVG raster size
 * limits at 23k×23k. Sharp resizes the strip horizontally to fill.
 */
async function applyHeroGradient(sharp, inputPath, outputPath, size) {
  const H = 4096 // tall enough that resize-up artifacts stay invisible
  const raw = Buffer.alloc(H * 4)
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1)
    let alpha
    if (t < 0.5) alpha = (t / 0.5) * 0.2
    else alpha = 0.2 + ((t - 0.5) / 0.5) * 0.8
    const i = y * 4
    raw[i] = 0
    raw[i + 1] = 0
    raw[i + 2] = 0
    raw[i + 3] = Math.round(alpha * 255)
  }
  // 1×H raw RGBA → resize to size×size as raw bytes. Keeping it as raw
  // (instead of PNG) sidesteps sharp's pixel-limit guard on the composite
  // input — re-decoding a 23k×23k PNG would trip it, but raw doesn't need
  // a decode pass.
  const overlay = await sharp(raw, { raw: { width: 1, height: H, channels: 4 } })
    .resize(size, size, { kernel: "lanczos3", fit: "fill" })
    .raw()
    .toBuffer()
  await sharp(inputPath, { limitInputPixels: false })
    .composite([
      {
        input: overlay,
        raw: { width: size, height: size, channels: 4 },
        top: 0,
        left: 0,
        blend: "over",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

async function main() {
  const args = parseArgs(process.argv)
  const tilesDir = args.tilesDir
    ? resolve(args.tilesDir)
    : resolve(process.cwd(), "public/print/_tiles", args.variant)

  if (!existsSync(tilesDir)) {
    console.error(`error: tiles dir not found: ${tilesDir}`)
    process.exit(1)
  }
  console.log(`reading tiles from: ${tilesDir}`)

  // metadata.json describes the grid layout.
  const metaPath = join(tilesDir, "metadata.json")
  if (!existsSync(metaPath)) {
    console.error(`error: missing metadata.json in ${tilesDir}`)
    process.exit(1)
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"))
  console.log(`metadata: ${JSON.stringify(meta)}`)

  const { targetSize, tileSize, tileCount, frame, background, variant, mode } = meta

  // Output path
  const outDir = resolve(args.outDir)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const defaultName = `hero-print-${variant ?? `frame${frame}-${background}`}.png`
  const outPath = args.out ? resolve(args.out) : join(outDir, defaultName)
  console.log(`output: ${outPath}`)

  const isTransparent = background === "transparent"
  const start = Date.now()

  // === SINGLE-TILE UPSCALE PATH ===
  // tileCount=1 means the browser rendered the entire camera view in one shot.
  //
  // Pipeline:
  //   1. Read the native-resolution tile (e.g. 5760×5760).
  //   2. Composite the hero fade-to-black gradient on top — at native size,
  //      because sharp's compositor refuses 23k×23k buffer inputs (pixel
  //      limit, can't be disabled for raw composite inputs).
  //   3. Upscale the composited result to targetSize with lanczos3.
  // The gradient is smooth, so the lanczos upscale doesn't visibly hurt it.
  if (tileCount === 1) {
    const singleName = `tile_00_00.png`
    const singlePath = join(tilesDir, singleName)
    if (!existsSync(singlePath)) {
      console.error(`error: missing single tile ${singleName}`)
      process.exit(1)
    }
    console.log(
      `single-tile mode (${mode ?? "single-upscale"}): upscaling ${tileSize}→${targetSize} (${(targetSize / tileSize).toFixed(2)}×)`
    )

    let pipeline = sharp(singlePath, { limitInputPixels: false })

    if (args.gradient) {
      console.log(`compositing hero fade-to-black gradient at ${tileSize}×${tileSize}…`)
      // Build the overlay at the SAME resolution as the source tile.
      // 1×H raw RGBA → resize to tileSize×tileSize → keep as raw bytes
      // (raw avoids PNG re-decode, which sharp pixel-limits separately).
      const H = 4096
      const raw = Buffer.alloc(H * 4)
      for (let y = 0; y < H; y++) {
        const t = y / (H - 1)
        const alpha = t < 0.5 ? (t / 0.5) * 0.2 : 0.2 + ((t - 0.5) / 0.5) * 0.8
        const i = y * 4
        raw[i] = 0
        raw[i + 1] = 0
        raw[i + 2] = 0
        raw[i + 3] = Math.round(alpha * 255)
      }
      const overlay = await sharp(raw, { raw: { width: 1, height: H, channels: 4 } })
        .resize(tileSize, tileSize, { kernel: "lanczos3", fit: "fill" })
        .raw()
        .toBuffer()
      pipeline = pipeline.composite([
        {
          input: overlay,
          raw: { width: tileSize, height: tileSize, channels: 4 },
          top: 0,
          left: 0,
          blend: "over",
        },
      ])
    }

    await pipeline
      .resize(targetSize, targetSize, { kernel: "lanczos3" })
      .png({ compressionLevel: 9 })
      .toFile(outPath)

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    const sizeMb = (statSync(outPath).size / 1024 / 1024).toFixed(1)
    console.log(`done in ${elapsed}s · ${sizeMb} MB · ${outPath}`)
    return
  }

  // === LEGACY TILED COMPOSITE PATH (has gap artifacts at boundaries) ===
  const tiles = []
  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      const name = `tile_${String(y).padStart(2, "0")}_${String(x).padStart(2, "0")}.png`
      const path = join(tilesDir, name)
      if (!existsSync(path)) {
        console.error(`error: missing tile ${name}`)
        process.exit(1)
      }
      tiles.push({ x, y, name, path, buf: readFileSync(path) })
    }
  }
  console.log(`loaded ${tiles.length} tiles, ${tileSize}×${tileSize}px each`)

  // Compose. sharp.create() makes a blank canvas; composite() drops tiles in.
  // limitInputPixels:false so sharp will accept the 23k × 23k output.
  console.log(`compositing ${targetSize}×${targetSize}px output... (may take a minute)`)

  const composites = tiles.map((t) => ({
    input: t.buf,
    left: t.x * tileSize,
    top: t.y * tileSize,
  }))

  const bgFill = isTransparent
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: 0, g: 0, b: 0, alpha: 1 }

  // (Legacy tiled path skips the gradient — it would have to composite a
  // 23k×23k overlay, which sharp won't accept on raw composite inputs.
  // The single-tile path applies the gradient at native size before upscale.)
  if (args.gradient) {
    console.warn("note: --gradient is ignored in legacy tiled mode")
  }
  await sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 4,
      background: bgFill,
    },
    limitInputPixels: false,
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  const sizeMb = (statSync(outPath).size / 1024 / 1024).toFixed(1)
  console.log(`done in ${elapsed}s · ${sizeMb} MB · ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
