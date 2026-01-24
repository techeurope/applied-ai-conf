"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
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

const STORAGE_KEY_SPEAKER_INDEX = "speaker-assets-selected-speaker-index";

export default function SpeakerAssetsPage() {
  // Load selected speaker from localStorage on mount
  const [selectedSpeakerIndex, setSelectedSpeakerIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_SPEAKER_INDEX);
      if (stored !== null) {
        const index = parseInt(stored, 10);
        if (!isNaN(index) && index >= 0 && index < SPEAKERS.length) {
          return index;
        }
      }
    }
    return 0;
  });
  
  // Save to localStorage when speaker changes
  const handleSpeakerChange = (index: number) => {
    setSelectedSpeakerIndex(index);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SPEAKER_INDEX, index.toString());
    }
  };
  
  const [selectedResolution, setSelectedResolution] =
    useState<ResolutionKey>("2K");
  const [isExporting, setIsExporting] = useState(false);
  const rendererRef = useRef<RendererRef | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const {
    previewMode,
    setPreviewMode,
    config,
    updateConfig,
    resetConfig,
    setSelectedElement,
    clearSelection,
    undo,
    redo,
  } = useSpeakerAssetStore();

  const selectedSpeaker = SPEAKERS[selectedSpeakerIndex];

  // Deselect when clicking outside the preview (but keep selection while using controls)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const previewEl = previewRef.current;
      if (previewEl && previewEl.contains(target)) return;

      const controlsEl = document.querySelector(
        "[data-speaker-asset-controls]"
      ) as HTMLElement | null;
      if (controlsEl && controlsEl.contains(target)) return;

      clearSelection();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [clearSelection]);

  // Keyboard shortcuts: undo/redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [undo, redo]);

  const handleExport = () => {
    if (!rendererRef.current || isExporting) return;

    // Deselect element before export to hide selection indicators
    setSelectedElement(null);

    setIsExporting(true);
    
    // Small delay to allow selection indicator to be removed
    setTimeout(() => {
      try {
        const filename = selectedSpeaker.name.toLowerCase().replace(/\s+/g, "_");
        exportHighRes(
          rendererRef.current!,
          RESOLUTIONS[selectedResolution],
          filename
        );
      } finally {
        setIsExporting(false);
      }
    }, 100);
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
            Click elements to edit • Drag to reposition
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Preview Panel */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            ref={previewRef}
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
              flat // Disable tone mapping for accurate colors
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
          setSelectedSpeakerIndex={handleSpeakerChange}
          selectedResolution={selectedResolution}
          setSelectedResolution={setSelectedResolution}
          isExporting={isExporting}
          onExport={handleExport}
          showAdvanced={true}
          config={config}
          updateConfig={updateConfig}
          resetConfig={resetConfig}
        />
      </div>
    </div>
  );
}
