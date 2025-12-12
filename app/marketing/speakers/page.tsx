"use client";

import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Settings } from "lucide-react";
import { SPEAKERS } from "@/data/speakers";
import { useSpeakerAssetStore } from "./store";
import {
  SpeakerAssetScene,
  ControlPanel,
  RESOLUTIONS,
  type RendererRef,
  type ResolutionKey,
} from "./components";

// Export utility
function exportHighRes(
  rendererRef: RendererRef,
  resolution: number,
  filename: string
) {
  const { gl, scene, camera } = rendererRef;
  const originalSize = gl.getSize(new THREE.Vector2());
  const originalPixelRatio = gl.getPixelRatio();

  gl.setSize(resolution, resolution);
  gl.setPixelRatio(1);
  gl.render(scene, camera);

  const dataUrl = gl.domElement.toDataURL("image/png", 1.0);

  gl.setSize(originalSize.x, originalSize.y);
  gl.setPixelRatio(originalPixelRatio);

  const link = document.createElement("a");
  link.download = `${filename}_${resolution}x${resolution}.png`;
  link.href = dataUrl;
  link.click();
}

export default function SpeakerAssetsPage() {
  const [selectedSpeakerIndex, setSelectedSpeakerIndex] = useState(0);
  const [selectedResolution, setSelectedResolution] =
    useState<ResolutionKey>("2K");
  const [isExporting, setIsExporting] = useState(false);
  const rendererRef = useRef<RendererRef | null>(null);

  const {
    previewMode,
    setPreviewMode,
    config,
    updateConfig,
    resetConfig,
    showAdvanced,
    setShowAdvanced,
  } = useSpeakerAssetStore();

  const selectedSpeaker = SPEAKERS[selectedSpeakerIndex];

  const handleExport = () => {
    if (!rendererRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const filename = selectedSpeaker.name.toLowerCase().replace(/\s+/g, "_");
      exportHighRes(
        rendererRef.current,
        RESOLUTIONS[selectedResolution],
        filename
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl tracking-tight">
            Speaker Marketing Assets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate 1:1 speaker images for social media
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
            showAdvanced
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-transparent text-gray-400 border-white/20 hover:border-white/40"
          }`}
        >
          <Settings className="w-4 h-4" />
          Advanced
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Preview Panel */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            className={`relative aspect-square border border-white/10 rounded-lg overflow-hidden ${
              previewMode === "fixed"
                ? "w-full max-w-[512px]"
                : "w-full h-full max-h-full"
            }`}
            style={
              previewMode === "auto"
                ? {
                    maxWidth: "calc(100vh - 73px - 4rem)",
                    maxHeight: "calc(100vh - 73px - 4rem)",
                  }
                : undefined
            }
          >
            <Canvas
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <SpeakerAssetScene
                  speaker={selectedSpeaker}
                  rendererRef={rendererRef}
                  config={config}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Controls Panel */}
        <ControlPanel
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          selectedSpeakerIndex={selectedSpeakerIndex}
          setSelectedSpeakerIndex={setSelectedSpeakerIndex}
          selectedResolution={selectedResolution}
          setSelectedResolution={setSelectedResolution}
          isExporting={isExporting}
          onExport={handleExport}
          showAdvanced={showAdvanced}
          config={config}
          updateConfig={updateConfig}
          resetConfig={resetConfig}
        />
      </div>
    </div>
  );
}
