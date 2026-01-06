"use client";

import {
  ChevronDown,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Undo2,
  Redo2,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MousePointer,
  Image,
  Type,
  Palette,
  MapPin,
  Play,
  Pause,
} from "lucide-react";
import { SPEAKERS } from "@/data/speakers";
import type { AssetConfig, PreviewMode, ElementType, SpeakerAssetStore, SelectableElementType } from "../store";
import { useSpeakerAssetStore } from "../store";

// Resolution options
export const RESOLUTIONS = {
  "1K": 1024,
  "2K": 2048,
  "4K": 4096,
} as const;

export type ResolutionKey = keyof typeof RESOLUTIONS;

// Slider control
function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const safeValue = value ?? min;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500 font-mono">{safeValue.toFixed(2)}</span>
      </div>
      <input
        type="range"
        value={safeValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );
}

// Color control
function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-6 rounded cursor-pointer border border-white/20"
        />
        <span className="text-xs text-gray-500 font-mono w-16">{value}</span>
      </div>
    </div>
  );
}

// Text input control
function TextControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/40"
      />
    </div>
  );
}

// Element info display
const ELEMENT_INFO: Record<
  NonNullable<ElementType>,
  { label: string; icon: typeof Type; description: string }
> = {
  image: {
    label: "Speaker Image",
    icon: Image,
    description: "The speaker's photo",
  },
  name: {
    label: "Speaker Name",
    icon: Type,
    description: "The speaker's name text",
  },
  subtitle: {
    label: "Title",
    icon: Type,
    description: "Job title text",
  },
  logo: {
    label: "Company Logo",
    icon: Image,
    description: "Company logo image",
  },
  branding: {
    label: "Conference Branding",
    icon: Type,
    description: "Conference name text",
  },
  dateLocation: {
    label: "Date & Location",
    icon: MapPin,
    description: "Event date and location",
  },
  background: {
    label: "Background",
    icon: Palette,
    description: "Background styling",
  },
};

// Contextual controls for each element type
function ElementControls({
  config,
  updateConfig,
  updatePosition,
}: {
  config: AssetConfig;
  updateConfig: <K extends keyof AssetConfig>(
    key: K,
    value: Partial<AssetConfig[K]>
  ) => void;
  updatePosition: (
    element: keyof AssetConfig,
    position: { x?: number; y?: number }
  ) => void;
}) {
  const selectedElement = useSpeakerAssetStore((s: SpeakerAssetStore) => s.selectedElement);
  const selectedElements = useSpeakerAssetStore((s: SpeakerAssetStore) => s.selectedElements);
  const alignSelectedToActive = useSpeakerAssetStore((s: SpeakerAssetStore) => s.alignSelectedToActive);

  if (!selectedElements.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MousePointer className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Click on an element in the preview to edit it</p>
        <p className="text-xs mt-1 text-gray-600">
          Drag elements to reposition them
        </p>
      </div>
    );
  }

  if (selectedElements.length > 1) {
    return (
      <div className="space-y-4">
        <div className="pb-2 border-b border-white/10">
          <h3 className="text-sm font-mono text-white">
            Multi-selection ({selectedElements.length})
          </h3>
          <p className="text-xs text-gray-500">
            Align selected elements to the active one (last clicked)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alignSelectedToActive("y")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all"
            title="align row (same y)"
            aria-label="align row (same y)"
          >
            <AlignHorizontalJustifyCenter className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => alignSelectedToActive("x")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all"
            title="align column (same x)"
            aria-label="align column (same x)"
          >
            <AlignVerticalJustifyCenter className="w-5 h-5 text-white" />
          </button>
          <span className="text-[11px] text-gray-600">
            shift-add • ctrl/cmd-toggle
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {selectedElements.map((el: SelectableElementType) => (
            <span
              key={el}
              className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-gray-300"
            >
              {el}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return null;
  }

  const elementInfo = ELEMENT_INFO[selectedElement as SelectableElementType];
  const Icon = elementInfo.icon;

  return (
    <div className="space-y-4">
      {/* Element header */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Icon className="w-4 h-4 text-amber-500" />
        <div>
          <h3 className="text-sm font-mono text-white">{elementInfo.label}</h3>
          <p className="text-xs text-gray-500">{elementInfo.description}</p>
        </div>
      </div>

      {/* Element-specific controls */}
      <div className="space-y-3">
        {selectedElement === "image" && (
          <>
            <SliderControl
              label="Size"
              value={config.image.size}
              onChange={(v) => updateConfig("image", { size: v })}
              min={0.5}
              max={4}
              step={0.1}
            />
            <SliderControl
              label="Position X"
              value={config.image.position.x}
              onChange={(v) => updatePosition("image", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.image.position.y}
              onChange={(v) => updatePosition("image", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "name" && (
          <>
            <SliderControl
              label="Font Size"
              value={config.name.fontSize}
              onChange={(v) => updateConfig("name", { fontSize: v })}
              min={0.1}
              max={0.5}
              step={0.01}
            />
            <ColorControl
              label="Color"
              value={config.name.color}
              onChange={(v) => updateConfig("name", { color: v })}
            />
            <SliderControl
              label="Letter Spacing"
              value={config.name.letterSpacing}
              onChange={(v) => updateConfig("name", { letterSpacing: v })}
              min={-0.1}
              max={0.2}
              step={0.01}
            />
            <SliderControl
              label="Position X"
              value={config.name.position.x}
              onChange={(v) => updatePosition("name", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.name.position.y}
              onChange={(v) => updatePosition("name", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "subtitle" && (
          <>
            <SliderControl
              label="Font Size"
              value={config.subtitle.fontSize}
              onChange={(v) => updateConfig("subtitle", { fontSize: v })}
              min={0.05}
              max={0.3}
              step={0.01}
            />
            <ColorControl
              label="Color"
              value={config.subtitle.color}
              onChange={(v) => updateConfig("subtitle", { color: v })}
            />
            <SliderControl
              label="Letter Spacing"
              value={config.subtitle.letterSpacing}
              onChange={(v) => updateConfig("subtitle", { letterSpacing: v })}
              min={-0.1}
              max={0.2}
              step={0.01}
            />
            <SliderControl
              label="Position X"
              value={config.subtitle.position.x}
              onChange={(v) => updatePosition("subtitle", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.subtitle.position.y}
              onChange={(v) => updatePosition("subtitle", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "logo" && (
          <>
            <SliderControl
              label="Scale"
              value={config.logo.scale}
              onChange={(v) => updateConfig("logo", { scale: v })}
              min={0.05}
              max={0.3}
              step={0.01}
            />
            <SliderControl
              label="Opacity"
              value={config.logo.opacity}
              onChange={(v) => updateConfig("logo", { opacity: v })}
              min={0.1}
              max={1}
              step={0.05}
            />
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Align</span>
                <span className="text-gray-500 font-mono">
                  {config.logo.align}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig("logo", { align: "left" })}
                  className={`flex items-center justify-center h-10 rounded-lg border font-mono text-xs transition-all ${
                    config.logo.align === "left"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                  title="logo align left"
                  aria-label="logo align left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateConfig("logo", { align: "center" })}
                  className={`flex items-center justify-center h-10 rounded-lg border font-mono text-xs transition-all ${
                    config.logo.align === "center"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                  title="logo align center"
                  aria-label="logo align center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateConfig("logo", { align: "right" })}
                  className={`flex items-center justify-center h-10 rounded-lg border font-mono text-xs transition-all ${
                    config.logo.align === "right"
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                  title="logo align right"
                  aria-label="logo align right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-gray-600 leading-snug">
                Controls which edge stays fixed when the logo width changes.
              </p>
            </div>
            <SliderControl
              label="Position X"
              value={config.logo.position.x}
              onChange={(v) => updatePosition("logo", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.logo.position.y}
              onChange={(v) => updatePosition("logo", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "branding" && (
          <>
            <TextControl
              label="Text"
              value={config.branding.text}
              onChange={(v) => updateConfig("branding", { text: v })}
            />
            <SliderControl
              label="Font Size"
              value={config.branding.fontSize}
              onChange={(v) => updateConfig("branding", { fontSize: v })}
              min={0.05}
              max={0.25}
              step={0.01}
            />
            <ColorControl
              label="Color"
              value={config.branding.color}
              onChange={(v) => updateConfig("branding", { color: v })}
            />
            <SliderControl
              label="Letter Spacing"
              value={config.branding.letterSpacing}
              onChange={(v) => updateConfig("branding", { letterSpacing: v })}
              min={0}
              max={0.2}
              step={0.01}
            />
            <SliderControl
              label="Position X"
              value={config.branding.position.x}
              onChange={(v) => updatePosition("branding", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.branding.position.y}
              onChange={(v) => updatePosition("branding", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "dateLocation" && (
          <>
            <TextControl
              label="Text"
              value={config.dateLocation.text}
              onChange={(v) => updateConfig("dateLocation", { text: v })}
            />
            <SliderControl
              label="Font Size"
              value={config.dateLocation.fontSize}
              onChange={(v) => updateConfig("dateLocation", { fontSize: v })}
              min={0.03}
              max={0.2}
              step={0.01}
            />
            <ColorControl
              label="Color"
              value={config.dateLocation.color}
              onChange={(v) => updateConfig("dateLocation", { color: v })}
            />
            <SliderControl
              label="Letter Spacing"
              value={config.dateLocation.letterSpacing}
              onChange={(v) => updateConfig("dateLocation", { letterSpacing: v })}
              min={-0.1}
              max={0.2}
              step={0.01}
            />
            <SliderControl
              label="Position X"
              value={config.dateLocation.position.x}
              onChange={(v) => updatePosition("dateLocation", { x: v })}
              min={-2}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Position Y"
              value={config.dateLocation.position.y}
              onChange={(v) => updatePosition("dateLocation", { y: v })}
              min={-2}
              max={2}
              step={0.05}
            />
          </>
        )}

        {selectedElement === "background" && (
          <>
            <SliderControl
              label="Overlay Opacity"
              value={config.background.overlayOpacity}
              onChange={(v) => updateConfig("background", { overlayOpacity: v })}
              min={0}
              max={1}
              step={0.05}
            />
            <ColorControl
              label="Grid Color"
              value={config.background.gridColor}
              onChange={(v) => updateConfig("background", { gridColor: v })}
            />

            {/* Animation controls */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Animation</span>
                <button
                  onClick={() =>
                    updateConfig("background", {
                      animationPaused: !config.background.animationPaused,
                    })
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    config.background.animationPaused
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                  title={config.background.animationPaused ? "Resume animation" : "Pause animation"}
                >
                  {config.background.animationPaused ? (
                    <>
                      <Play className="w-3 h-3" />
                      Paused
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3" />
                      Playing
                    </>
                  )}
                </button>
              </div>

              {config.background.animationPaused && (
                <SliderControl
                  label="Animation Frame"
                  value={config.background.animationTime ?? 0}
                  onChange={(v) => updateConfig("background", { animationTime: v })}
                  min={0}
                  max={100}
                  step={0.5}
                />
              )}

              <p className="text-[11px] text-gray-600 leading-snug">
                {config.background.animationPaused
                  ? "Adjust the slider to set a consistent background frame for all exports."
                  : "Pause to lock the background to a specific frame for consistent exports."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ControlPanelProps {
  // Preview mode
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  // Speaker selection
  selectedSpeakerIndex: number;
  setSelectedSpeakerIndex: (index: number) => void;
  // Resolution
  selectedResolution: ResolutionKey;
  setSelectedResolution: (resolution: ResolutionKey) => void;
  // Export
  isExporting: boolean;
  onExport: () => void;
  // Advanced controls
  showAdvanced: boolean;
  config: AssetConfig;
  updateConfig: <K extends keyof AssetConfig>(
    key: K,
    value: Partial<AssetConfig[K]>
  ) => void;
  resetConfig: () => void;
}

export function ControlPanel({
  previewMode,
  setPreviewMode,
  selectedSpeakerIndex,
  setSelectedSpeakerIndex,
  selectedResolution,
  setSelectedResolution,
  isExporting,
  onExport,
  showAdvanced,
  config,
  updateConfig,
  resetConfig,
}: ControlPanelProps) {
  const { selectedElement, selectedElements, setSelectedElement, resetElement, updatePosition, clearSelection } =
    useSpeakerAssetStore();
  const undo = useSpeakerAssetStore((s: SpeakerAssetStore) => s.undo);
  const redo = useSpeakerAssetStore((s: SpeakerAssetStore) => s.redo);
  const canUndo = useSpeakerAssetStore((s: SpeakerAssetStore) => s.historyPast.length > 0);
  const canRedo = useSpeakerAssetStore((s: SpeakerAssetStore) => s.historyFuture.length > 0);

  return (
    <div
      data-speaker-asset-controls
      className="w-full lg:w-96 border-l border-white/10 p-4 space-y-4 overflow-y-auto"
    >
      {/* Preview Mode Toggle */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-mono">Preview Size</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPreviewMode("fixed")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
              previewMode === "fixed"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white/20 hover:border-white/40"
            }`}
          >
            <Minimize2 className="w-4 h-4" />
            Fixed
          </button>
          <button
            onClick={() => setPreviewMode("auto")}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
              previewMode === "auto"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white/20 hover:border-white/40"
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Auto
          </button>
        </div>
      </div>

      {/* Speaker Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-mono">Speaker</label>
        <div className="relative">
          <select
            value={selectedSpeakerIndex}
            onChange={(e) => setSelectedSpeakerIndex(Number(e.target.value))}
            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:border-white/40 transition-colors focus:outline-none focus:border-white/60"
          >
            {SPEAKERS.map((speaker, index) => (
              <option key={index} value={index}>
                {speaker.name} - {speaker.company}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Resolution Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-mono">
          Export Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(RESOLUTIONS) as ResolutionKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedResolution(key)}
              className={`px-4 py-2 rounded-lg border font-mono text-sm transition-all ${
                selectedResolution === key
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white/20 hover:border-white/40"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono py-3 px-6 rounded-lg transition-all"
      >
        <Download className="w-4 h-4" />
        {isExporting ? "Exporting..." : "Download PNG"}
      </button>

      {/* Undo / Redo */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
            canUndo
              ? "bg-transparent text-white border-white/20 hover:border-white/40"
              : "bg-transparent text-gray-600 border-white/10 cursor-not-allowed"
          }`}
          title="Undo (Ctrl/Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
            canRedo
              ? "bg-transparent text-white border-white/20 hover:border-white/40"
              : "bg-transparent text-gray-600 border-white/10 cursor-not-allowed"
          }`}
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
          Redo
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-mono text-gray-300">
            Element Controls
          </span>
          <div className="flex gap-2">
            {selectedElements.length === 1 && selectedElement && selectedElement !== "background" && (
              <button
                onClick={() => resetElement(selectedElement)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-500 transition-colors"
                title={`Reset ${ELEMENT_INFO[selectedElement as SelectableElementType].label}`}
              >
                <RotateCcw className="w-3 h-3" />
                Reset Element
              </button>
            )}
            {selectedElements.length > 1 && (
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                title="Clear selection"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                resetConfig();
                clearSelection();
              }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
              title="Reset all elements"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        </div>

        {/* Contextual Element Controls */}
        <ElementControls
          config={config}
          updateConfig={updateConfig}
          updatePosition={updatePosition}
        />
      </div>

      {/* Quick selection buttons */}
      <div className="border-t border-white/10 pt-4">
        <span className="text-xs text-gray-500 font-mono block mb-2">
          Quick Select
        </span>
        <div className="flex flex-wrap gap-1">
          {(
            Object.keys(ELEMENT_INFO) as Array<keyof typeof ELEMENT_INFO>
          ).map((key) => {
            const info = ELEMENT_INFO[key];
            const Icon = info.icon;
            return (
              <button
                key={key}
                onClick={(e) => {
                  // Match preview behavior: ctrl/cmd toggles, shift adds, default selects single.
                  const multiToggle = e.ctrlKey || e.metaKey;
                  const multiAdd = e.shiftKey;
                  const store = useSpeakerAssetStore.getState();
                  if (multiToggle) store.toggleSelectedElement(key);
                  else if (multiAdd) store.addSelectedElement(key);
                  else store.setSelectedElement(key);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all ${
                  selectedElements.includes(key)
                    ? "bg-amber-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
                title={info.label}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
