"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";

// Favicon standard sizes
const FAVICON_SIZES = [
  { label: "16×16 (Classic)", size: 16 },
  { label: "32×32 (Standard)", size: 32 },
  { label: "48×48 (Windows)", size: 48 },
  { label: "180×180 (Apple Touch)", size: 180 },
  { label: "192×192 (Android)", size: 192 },
  { label: "512×512 (PWA)", size: 512 },
];

const BACKGROUND_COLOR = "#05070f";
const TEXT_COLOR = "#ffffff";

export default function FaviconPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontScale, setFontScale] = useState(50);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Wait for Kode Mono font to load
  useEffect(() => {
    document.fonts.ready.then(() => {
      const testCanvas = document.createElement("canvas");
      const ctx = testCanvas.getContext("2d");
      if (ctx) {
        ctx.font = '700 100px "Kode Mono", monospace';
        setFontLoaded(true);
      }
    });
  }, []);

  const renderFavicon = useCallback((
    ctx: CanvasRenderingContext2D,
    size: number,
    scale: number = fontScale,
    xOff: number = offsetX,
    yOff: number = offsetY
  ) => {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, size, size);

    const fontSize = Math.floor(size * (scale / 100));
    const x = size / 2 + (size * xOff / 100);
    const y = size / 2 + (size * yOff / 100) + fontSize * 0.05;

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `700 ${fontSize}px "Kode Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", x, y);
  }, [fontScale, offsetX, offsetY]);

  useEffect(() => {
    if (!canvasRef.current || !fontLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderFavicon(ctx, canvas.width);
  }, [fontLoaded, fontScale, offsetX, offsetY, renderFavicon]);

  const handleExport = (size: number) => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;
    renderFavicon(ctx, size, fontScale, offsetX, offsetY);
    const link = document.createElement("a");
    link.download = `favicon-${size}x${size}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const handleExportAll = () => {
    FAVICON_SIZES.forEach(({ size }, i) => {
      setTimeout(() => handleExport(size), i * 100);
    });
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="font-mono text-xl tracking-tight">Favicon Generator</h1>
        <p className="text-sm text-gray-500 mt-1">
          "AI" in Kode Mono • Dark background • White text
        </p>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Preview Panel (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 overflow-hidden">
          {/* Main Preview */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-400">Preview (512×512)</p>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={512}
                height={512}
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Size Previews */}
          <div className="flex flex-wrap justify-center gap-4">
            {[16, 32, 48].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500">{size}px</p>
                <div
                  className="border border-white/20 rounded"
                  style={{ width: size, height: size, background: BACKGROUND_COLOR }}
                >
                  <canvas
                    ref={(el) => {
                      if (el && fontLoaded) {
                        el.width = size;
                        el.height = size;
                        const ctx = el.getContext("2d");
                        if (ctx) renderFavicon(ctx, size, fontScale, offsetX, offsetY);
                      }
                    }}
                    width={size}
                    height={size}
                    className="w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Panel (Right) */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            {/* Settings */}
            <div>
              <h2 className="text-sm font-mono text-gray-400 mb-4">Settings</h2>
              <div className="flex flex-col gap-4">
                {/* Font Size */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">Font Size</label>
                    <span className="text-sm font-mono text-white">{fontScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={fontScale}
                    onChange={(e) => setFontScale(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* X Position */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">X Position</label>
                    <span className="text-sm font-mono text-white">{offsetX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Y Position */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">Y Position</label>
                    <span className="text-sm font-mono text-white">{offsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Export */}
            <div>
              <h2 className="text-sm font-mono text-gray-400 mb-4">Export</h2>
              <div className="flex flex-col gap-3">
                {FAVICON_SIZES.map(({ label, size }) => (
                  <button
                    key={size}
                    onClick={() => handleExport(size)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white text-sm font-mono transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                <button
                  onClick={handleExportAll}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-mono font-semibold rounded-md hover:bg-gray-200 transition-colors mt-2"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
