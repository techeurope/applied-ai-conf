/**
 * Receives one print tile from /print and writes it to disk.
 *
 * Used during the headless 300 DPI render — the browser POSTs each
 * 5,906 px PNG tile here as it's produced, so we don't depend on
 * browser download mechanics (which Chrome silently blocks for large
 * programmatic downloads from localhost).
 *
 * Tiles land in: public/print/_tiles/<variant>/tile_YY_XX.png
 *
 * The "clear" action (POST with action=clear&variant=...) wipes the
 * variant directory before a fresh render.
 *
 * This route is for local print production only. It writes inside the
 * project's public/ directory and trusts the caller. Don't ship this
 * to a public deployment without auth / removing it.
 */
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, rm } from "fs/promises"
import { existsSync } from "fs"
import { join, resolve } from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Tiles can be ~30 MB; make sure the body parser allows them.
export const maxDuration = 60

const PROJECT_ROOT = process.cwd()
const TILES_ROOT = resolve(PROJECT_ROOT, "public/print/_tiles")

function isSafeVariant(v: string): boolean {
  // Allow letters, digits, dash, underscore, dot — but block any path
  // traversal. The leading-dot check kills `.` and `..` and dotfiles.
  return /^[a-zA-Z0-9_.-]+$/.test(v) && v.length <= 96 && !v.startsWith(".")
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const action = form.get("action")
  const variant = form.get("variant")

  if (typeof variant !== "string" || !isSafeVariant(variant)) {
    return NextResponse.json({ error: "invalid variant" }, { status: 400 })
  }

  const variantDir = join(TILES_ROOT, variant)

  if (action === "clear") {
    if (existsSync(variantDir)) await rm(variantDir, { recursive: true, force: true })
    await mkdir(variantDir, { recursive: true })
    return NextResponse.json({ ok: true, cleared: variant })
  }

  if (action === "tile") {
    const x = Number(form.get("x"))
    const y = Number(form.get("y"))
    const file = form.get("file")
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x > 99 || y > 99) {
      return NextResponse.json({ error: "invalid x/y" }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing file" }, { status: 400 })
    }
    await mkdir(variantDir, { recursive: true })
    const name = `tile_${String(y).padStart(2, "0")}_${String(x).padStart(2, "0")}.png`
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(join(variantDir, name), buf)
    return NextResponse.json({ ok: true, name, bytes: buf.length })
  }

  if (action === "metadata") {
    const meta = form.get("meta")
    if (typeof meta !== "string") {
      return NextResponse.json({ error: "missing meta" }, { status: 400 })
    }
    await mkdir(variantDir, { recursive: true })
    await writeFile(join(variantDir, "metadata.json"), meta)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 })
}
