"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { BannerScene, ControlPanel } from "./components";
import { Download } from "lucide-react";

const RESOLUTIONS = [
  { label: "1500 × 500 (Twitter)", width: 1500, height: 500 },
  { label: "3000 × 1000 (2x)", width: 3000, height: 1000 },
  { label: "4500 × 1500 (3x)", width: 4500, height: 1500 },
];

export default function TwitterBannerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (width: number, height: number) => {
    if (!canvasRef.current) return;

    setIsExporting(true);

    // Small delay to ensure render is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.download = `twitter-banner-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Banner Preview */}
      <div className="flex items-center justify-center p-8 pt-20">
        <div
          className="relative w-full max-w-[1500px] border border-white/20 rounded-lg overflow-hidden"
          style={{ aspectRatio: "3 / 1" }}
        >
          <Canvas
            ref={canvasRef}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            camera={{ position: [0, 0, 1.5], fov: 50 }}
            style={{ background: "#000" }}
          >
            <BannerScene />
          </Canvas>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-center gap-3 pb-8">
        {RESOLUTIONS.map((res) => (
          <button
            key={res.label}
            onClick={() => handleExport(res.width, res.height)}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm font-mono transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {res.label}
          </button>
        ))}
      </div>

      {/* Control Panel */}
      <ControlPanel />
    </div>
  );
}

