"use client"

/**
 * Print render page for the hero LidarScape pattern.
 *
 * Used to produce 300 DPI PNGs at 2x2m (23,624 x 23,624 px) for the
 * print studio. Renders the same shader as the live hero, but:
 *  - frameloop="never" (manual render only)
 *  - uTime is frozen (composition is deterministic per ?frame=)
 *  - 4x4 tile rendering via camera.setViewOffset() to stay under WebGL's
 *    16,384 px texture ceiling
 *  - Each tile is POSTed to /api/print-tile and saved to
 *    public/print/_tiles/<variant>/. Then `scripts/stitch-print.mjs`
 *    composites them into the final 23k x 23k PNG with sharp.
 *
 *  We POST tiles instead of using browser downloads because Chrome
 *  silently blocks programmatic multi-MB downloads from localhost.
 *
 * URL params:
 *   ?frame=0|1|2          — frozen uTime value (different terrain compositions)
 *   ?bg=dark|transparent  — black background or transparent (alpha channel)
 *   ?grid=NN              — grid density (live site: 41, denser print: 80–120)
 *   ?thickness=N.NN       — line thickness (live site: 0.01, print-visible: 0.05–0.2)
 *   ?glow=N.N             — glow intensity (live site: 2.0)
 *   ?elevColor=N.N        — how much elevation modulates line color (live: 0.5;
 *                            set to 0 for uniform-orange lines)
 *   ?auto=1               — auto-render immediately on load
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useSearchParams } from "next/navigation"

// 2m at 300 DPI = 23,622 px. Round up to a multiple of 4 for clean tile splits.
const TARGET_SIZE = 23624

// Default tiling mode (16 tiles via setViewOffset). NOTE: this path produces
// visible artifacts at tile boundaries — there's an interaction between the
// vignette/fog terms in the fragment shader and the projection setViewOffset
// applies, producing 20–30 row bands of empty content along tile edges.
// We left the code in for reference but the production path is single-tile
// (?single=N below).
const TILE_COUNT = 4
const TILE_SIZE = TARGET_SIZE / TILE_COUNT // 5906
const OVERSCAN = 0
const RENDER_SIZE = TILE_SIZE + OVERSCAN * 2

// Single-tile mode: render the entire camera view at SINGLE_DEFAULT_SIZE in
// one shot (no setViewOffset, no tile boundaries). The tile is then upscaled
// to TARGET_SIZE by the stitch script using sharp + lanczos.
//
// 5760 is empirically the largest size that this GPU/browser actually
// renders to. Even though MAX_TEXTURE_SIZE / MAX_VIEWPORT_DIMS report 16384,
// requesting any size > 5760 causes ANGLE/Metal to silently render only the
// top-left 5760×5760 region, leaving the rest transparent. Override with
// ?single=N if your machine can do better.
const SINGLE_DEFAULT_SIZE = 5760

// Frozen uTime values for each frame variant.
// uTime scrolls the noise via uSpeed (0.004), so wildly different values
// produce wildly different terrain compositions.
const FRAME_TIMES = [50, 1000, 5000] as const

// Defaults match the live LidarScape component except where noted.
// The CSS overlay (overlayOpacity, blurAmount) is intentionally omitted —
// we want the raw shader output for print.
//
// `lineThickness` differs in MEANING from the live site:
//   live site: smoothstep edge in fwidth-normalised space (≈ 1-px lines)
//   print:     line width in OUTPUT PIXELS (so it stays visible at 23k px)
//
// `gridSize` defaults denser than the live site so the print pattern is
// not over-scaled at 2 m × 2 m viewing distance.
const SHADER_DEFAULTS = {
  speed: 0.004,
  noiseScale: 0.07,
  noiseStrength: 1.7,
  gridSize: 80.0,        // live site: 41
  lineThickness: 12.0,   // live site: 0.01 (different scale — see comment above)
  colorR: 0.67,
  colorG: 0.44,
  colorB: 0.19,
  glowIntensity: 2.0,
  fogDensity: 0.9,
  elevColor: 0.5,        // live site: 0.5 (elevation→colour modulation strength)
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;

  varying vec2 vUv;
  varying float vElevation;
  varying float vDistance;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float scrollY = uTime * uSpeed;
    float noiseInputX = pos.x * uNoiseScale;
    float noiseInputY = (pos.y + scrollY) * uNoiseScale;
    float elevation = snoise(vec2(noiseInputX, noiseInputY));
    pos.z += elevation * uNoiseStrength;
    vElevation = elevation;
    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    vDistance = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`

// Print-specific fragment shader. Differs from the live LidarScape in
// one important way: line thickness is expressed in OUTPUT PIXELS, not
// as the live site's smoothstep-on-fwidth (which gives 1-px-wide lines
// regardless of resolution — invisible at 23k × 23k print scale).
const FRAGMENT_SHADER = /* glsl */ `
  uniform float uGridSize;
  uniform float uLineThickness; // line width in output pixels
  uniform vec3 uColor;
  uniform float uGlowIntensity;
  uniform float uFogDensity;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uElevColor;     // 0..1: how much elevation brightens lines

  varying vec2 vUv;
  varying float vElevation;
  varying float vDistance;

  void main() {
    float scrollY = uTime * uSpeed;
    vec2 gridUv = vUv * uGridSize;
    gridUv.y += scrollY * uGridSize;

    // Distance from nearest grid line, normalised by per-pixel UV derivative
    // — i.e. "line" is now in OUTPUT PIXELS.
    vec2 distFromLine = abs(fract(gridUv - 0.5) - 0.5);
    vec2 grid = distFromLine / fwidth(gridUv);
    float line = min(grid.x, grid.y);

    // uLineThickness = total line width in output pixels.
    // halfWidth = uLineThickness * 0.5
    // Pixels within halfWidth of a line: full opacity.
    // Pixels in (halfWidth, halfWidth+1): 1-pixel AA fade.
    // (Note: the identifier "half" is a reserved keyword in GLSL ES — do not use it.)
    float halfWidth = uLineThickness * 0.5;
    float lineStrength = 1.0 - smoothstep(halfWidth, halfWidth + 1.0, line);

    vec3 finalColor = uColor;
    finalColor += vec3(vElevation * uElevColor);
    finalColor *= lineStrength;
    finalColor *= uGlowIntensity;

    float fogFactor = smoothstep(0.0, 1.0 / uFogDensity, vDistance * 0.05);
    float opacity = (1.0 - fogFactor) * lineStrength;

    float vignette = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    opacity *= vignette;

    gl_FragColor = vec4(finalColor, opacity);
  }
`

interface RenderProgress {
  stage: "idle" | "clearing" | "rendering" | "done" | "error"
  current: number
  total: number
  message?: string
}

interface PrintSceneProps {
  frameTime: number
  transparent: boolean
  variant: string
  gridSize: number
  lineThickness: number
  glowIntensity: number
  elevColor: number
  singleSize: number // 0 = use 4x4 tiling, >0 = single-tile render at that size
  onReady: (renderTiles: (onProgress: (p: RenderProgress) => void) => Promise<void>) => void
}

function PrintScene({ frameTime, transparent, variant, gridSize, lineThickness, glowIntensity, elevColor, singleSize, onReady }: PrintSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { gl, scene, camera } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: frameTime },
      uSpeed: { value: SHADER_DEFAULTS.speed },
      uNoiseScale: { value: SHADER_DEFAULTS.noiseScale },
      uNoiseStrength: { value: SHADER_DEFAULTS.noiseStrength },
      uGridSize: { value: gridSize },
      uLineThickness: { value: lineThickness },
      uColor: {
        value: new THREE.Color(
          SHADER_DEFAULTS.colorR,
          SHADER_DEFAULTS.colorG,
          SHADER_DEFAULTS.colorB
        ),
      },
      uGlowIntensity: { value: glowIntensity },
      uFogDensity: { value: SHADER_DEFAULTS.fogDensity },
      uElevColor: { value: elevColor },
    }),
    [frameTime, gridSize, lineThickness, glowIntensity, elevColor]
  )

  // Expose the tile-render function to the parent. Renders each tile and
  // POSTs it to /api/print-tile so it lands directly on disk.
  useEffect(() => {
    const renderTiles = async (onProgress: (p: RenderProgress) => void) => {
      const isSingle = singleSize > 0
      const total = isSingle ? 1 : TILE_COUNT * TILE_COUNT

      // 1. Clear any previous tiles for this variant.
      onProgress({ stage: "clearing", current: 0, total })
      {
        const fd = new FormData()
        fd.set("action", "clear")
        fd.set("variant", variant)
        const res = await fetch("/api/print-tile", { method: "POST", body: fd })
        if (!res.ok) throw new Error(`clear failed: ${res.status}`)
      }

      // 2. Save metadata up front so the stitch script knows the layout.
      // For single-tile mode: tileCount=1 and tileSize=singleSize<TARGET_SIZE
      // signals that the stitch script should upscale the lone tile.
      {
        const meta = isSingle
          ? {
              targetSize: TARGET_SIZE,
              tileSize: singleSize,
              tileCount: 1,
              frame: variant.split("-")[0].replace("frame", ""),
              frameTime,
              background: transparent ? "transparent" : "dark",
              variant,
              generatedAt: new Date().toISOString(),
              mode: "single-upscale",
            }
          : {
              targetSize: TARGET_SIZE,
              tileSize: TILE_SIZE,
              tileCount: TILE_COUNT,
              frame: variant.split("-")[0].replace("frame", ""),
              frameTime,
              background: transparent ? "transparent" : "dark",
              variant,
              generatedAt: new Date().toISOString(),
              mode: "tiled",
            }
        const fd = new FormData()
        fd.set("action", "metadata")
        fd.set("variant", variant)
        fd.set("meta", JSON.stringify(meta, null, 2))
        const res = await fetch("/api/print-tile", { method: "POST", body: fd })
        if (!res.ok) throw new Error(`metadata save failed: ${res.status}`)
      }

      // 3. Configure renderer.
      // setSize(_, _, false) updates the drawing buffer only — CSS size stays
      // small so the preview thumbnail doesn't blow up the page layout.
      const renderSize = isSingle ? singleSize : RENDER_SIZE
      gl.setSize(renderSize, renderSize, false)
      gl.setPixelRatio(1)

      // Clear color: opaque black for "dark" baked variant; fully transparent
      // for the alpha-channel variant.
      gl.setClearColor(0x000000, transparent ? 0 : 1)

      const cam = camera as THREE.PerspectiveCamera
      cam.aspect = 1
      cam.updateProjectionMatrix()

      onProgress({ stage: "rendering", current: 0, total })

      if (isSingle) {
        // === SINGLE-TILE PATH ===
        // No setViewOffset — render the camera's full view at singleSize.
        // sharp will upscale to TARGET_SIZE during stitch.
        cam.clearViewOffset()
        gl.render(scene, cam)

        const blob = await new Promise<Blob>((resolve, reject) => {
          gl.domElement.toBlob((b) => {
            if (b) resolve(b)
            else reject(new Error("single-tile toBlob failed"))
          }, "image/png")
        })

        const fd = new FormData()
        fd.set("action", "tile")
        fd.set("variant", variant)
        fd.set("x", "0")
        fd.set("y", "0")
        fd.set("file", blob, `tile_00_00.png`)
        const res = await fetch("/api/print-tile", { method: "POST", body: fd })
        if (!res.ok) {
          const txt = await res.text().catch(() => "")
          throw new Error(`single-tile POST failed: ${res.status} ${txt}`)
        }

        onProgress({ stage: "done", current: 1, total: 1 })
        return
      }

      // === TILED PATH (legacy, has gap artifacts at boundaries) ===
      // Reusable 2D canvas for cropping the overscan border off each tile.
      const cropCanvas = document.createElement("canvas")
      cropCanvas.width = TILE_SIZE
      cropCanvas.height = TILE_SIZE
      const cropCtx = cropCanvas.getContext("2d")
      if (!cropCtx) throw new Error("could not get 2d context for crop canvas")

      let done = 0
      for (let y = 0; y < TILE_COUNT; y++) {
        for (let x = 0; x < TILE_COUNT; x++) {
          cam.setViewOffset(
            TARGET_SIZE,
            TARGET_SIZE,
            x * TILE_SIZE - OVERSCAN,
            y * TILE_SIZE - OVERSCAN,
            RENDER_SIZE,
            RENDER_SIZE
          )
          gl.render(scene, cam)

          cropCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE)
          cropCtx.drawImage(
            gl.domElement,
            OVERSCAN, OVERSCAN, TILE_SIZE, TILE_SIZE,
            0, 0, TILE_SIZE, TILE_SIZE
          )

          const blob = await new Promise<Blob>((resolve, reject) => {
            cropCanvas.toBlob((b) => {
              if (b) resolve(b)
              else reject(new Error(`tile ${x},${y} toBlob failed`))
            }, "image/png")
          })

          const fd = new FormData()
          fd.set("action", "tile")
          fd.set("variant", variant)
          fd.set("x", String(x))
          fd.set("y", String(y))
          fd.set("file", blob, `tile_${y}_${x}.png`)
          const res = await fetch("/api/print-tile", { method: "POST", body: fd })
          if (!res.ok) {
            const txt = await res.text().catch(() => "")
            throw new Error(`tile ${y},${x} POST failed: ${res.status} ${txt}`)
          }

          done += 1
          onProgress({ stage: "rendering", current: done, total })
        }
      }

      cam.clearViewOffset()
      onProgress({ stage: "done", current: done, total })
    }

    onReady(renderTiles)
  }, [gl, scene, camera, transparent, variant, frameTime, singleSize, onReady])

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -5]}>
      <planeGeometry args={[40, 40, 100, 100]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function PrintPageInner() {
  const params = useSearchParams()
  const frameParam = Math.max(0, Math.min(2, parseInt(params.get("frame") ?? "0", 10) || 0))
  const transparent = params.get("bg") === "transparent"
  const auto = params.get("auto") === "1"

  // Tunable shader params. Defaults are tuned for print (denser, thicker)
  // — see SHADER_DEFAULTS comment.
  const gridSize = Math.max(5, Math.min(300, parseFloat(params.get("grid") ?? "") || SHADER_DEFAULTS.gridSize))
  const lineThickness = Math.max(0.5, Math.min(200, parseFloat(params.get("thickness") ?? "") || SHADER_DEFAULTS.lineThickness))
  const glowIntensity = Math.max(0.1, Math.min(10, parseFloat(params.get("glow") ?? "") || SHADER_DEFAULTS.glowIntensity))
  // elevColor: parseFloat("0") is 0 (falsy), so check for the param explicitly
  // — otherwise ?elevColor=0 gets silently treated as default.
  const elevColorRaw = params.get("elevColor")
  const elevColor =
    elevColorRaw === null
      ? SHADER_DEFAULTS.elevColor
      : Math.max(0, Math.min(2, parseFloat(elevColorRaw) || 0))

  // ?single=N → render in single-tile mode at NxN. Defaults ON (=8192) since
  // the tiled path produces unfixable boundary artifacts. Pass ?single=0 to
  // force the legacy 4x4 tiled render.
  const singleRaw = params.get("single")
  const singleSize =
    singleRaw === null
      ? SINGLE_DEFAULT_SIZE
      : Math.max(0, Math.min(20000, parseInt(singleRaw, 10) || 0))

  const frameTime = FRAME_TIMES[frameParam]
  // The variant directory name encodes every shader param so different
  // configurations don't overwrite each other's tiles.
  const isDefault =
    gridSize === SHADER_DEFAULTS.gridSize &&
    lineThickness === SHADER_DEFAULTS.lineThickness &&
    glowIntensity === SHADER_DEFAULTS.glowIntensity &&
    elevColor === SHADER_DEFAULTS.elevColor
  const tweakSuffix = isDefault
    ? ""
    : `-g${gridSize}-t${lineThickness}-gl${glowIntensity}-e${elevColor}`
  // Suffix the render mode so single-tile and tiled outputs don't collide.
  const modeSuffix = singleSize > 0 ? `-s${singleSize}` : `-tiled`
  const variantName = `frame${frameParam}-${transparent ? "transparent" : "dark"}${tweakSuffix}${modeSuffix}`

  const renderTilesRef = useRef<((onProgress: (p: RenderProgress) => void) => Promise<void>) | null>(null)
  const [status, setStatus] = useState<string>("ready")
  const initialTotal = singleSize > 0 ? 1 : TILE_COUNT * TILE_COUNT
  const [progress, setProgress] = useState<RenderProgress>({ stage: "idle", current: 0, total: initialTotal })
  const triggeredRef = useRef(false)

  const handleRenderReady = useCallback(
    (fn: (onProgress: (p: RenderProgress) => void) => Promise<void>) => {
      renderTilesRef.current = fn
    },
    []
  )

  const runRender = useCallback(async () => {
    if (!renderTilesRef.current) {
      setStatus("scene not ready yet")
      return
    }
    try {
      setStatus("rendering...")
      await renderTilesRef.current((p) => {
        setProgress(p)
        if (p.stage === "rendering") {
          setStatus(`rendering tile ${p.current}/${p.total}`)
        }
      })
      // Final state. The `done — ...` prefix is what the headless watcher polls for.
      const tilesWritten = singleSize > 0 ? 1 : TILE_COUNT * TILE_COUNT
      setStatus(`done — ${tilesWritten} tiles saved to public/print/_tiles/${variantName}/`)
    } catch (e) {
      console.error(e)
      setStatus(`error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [variantName, singleSize])

  // ?auto=1 — kick off as soon as the scene exposes its render function.
  useEffect(() => {
    if (!auto) return
    if (triggeredRef.current) return
    const id = setInterval(() => {
      if (renderTilesRef.current && !triggeredRef.current) {
        triggeredRef.current = true
        clearInterval(id)
        runRender()
      }
    }, 100)
    return () => clearInterval(id)
  }, [auto, runRender])

  return (
    <div style={{ background: "#111", color: "#fff", minHeight: "100vh", padding: 24, fontFamily: "ui-monospace, monospace" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Hero pattern — print render</h1>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 16, lineHeight: 1.5 }}>
        Variant: <strong>{variantName}</strong> · uTime={frameTime} · target={TARGET_SIZE}×{TARGET_SIZE} px ·
        {singleSize > 0
          ? ` single-tile @ ${singleSize}px (upscale ${(TARGET_SIZE / singleSize).toFixed(2)}×)`
          : ` tiled ${TILE_COUNT}×${TILE_COUNT} @ ${TILE_SIZE}px`}<br />
        Status: {status} {progress.stage === "rendering" && `(${progress.current}/${progress.total})`}
      </div>
      <button
        id="render-button"
        type="button"
        onClick={runRender}
        style={{
          padding: "10px 16px",
          background: "#fff",
          color: "#000",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Render & save tiles
      </button>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
        Try other variants:&nbsp;
        {[0, 1, 2].flatMap((f) =>
          ["dark", "transparent"].map((bg) => (
            <a
              key={`${f}-${bg}`}
              href={`/print?frame=${f}&bg=${bg}`}
              style={{ color: "#7af", marginRight: 8 }}
            >
              frame{f}-{bg}
            </a>
          ))
        )}
      </div>

      {/*
        The canvas is rendered at TILE_SIZE×TILE_SIZE drawing-buffer size
        (we override via setSize). CSS keeps it small for preview purposes.
        frameloop="never" stops the auto-render — we only call gl.render()
        manually, once per tile.
      */}
      <div
        style={{
          marginTop: 24,
          width: 480,
          height: 480,
          border: "1px solid #333",
          background: transparent
            ? "repeating-conic-gradient(#222 0% 25%, #333 0% 50%) 50% / 20px 20px"
            : "#000",
        }}
      >
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          gl={{
            preserveDrawingBuffer: true, // required so toBlob() can read the canvas
            alpha: true,
            premultipliedAlpha: true,
            // antialias: false on purpose. With MSAA (4x samples on M-series),
            // the multisample buffer caps the renderable canvas size to ~5760
            // even though MAX_VIEWPORT_DIMS reports 16384. The shader already
            // does fwidth-based line anti-aliasing, so MSAA isn't needed.
            antialias: false,
          }}
          frameloop="never"
        >
          <PrintScene
            frameTime={frameTime}
            transparent={transparent}
            variant={variantName}
            gridSize={gridSize}
            lineThickness={lineThickness}
            glowIntensity={glowIntensity}
            elevColor={elevColor}
            singleSize={singleSize}
            onReady={handleRenderReady}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "#fff", background: "#111", minHeight: "100vh" }}>loading…</div>}>
      <PrintPageInner />
    </Suspense>
  )
}
