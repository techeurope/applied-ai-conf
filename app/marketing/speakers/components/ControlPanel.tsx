"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { SPEAKERS } from "@/data/speakers";
import type { AssetConfig, PreviewMode } from "../store";

// Resolution options
export const RESOLUTIONS = {
  "1K": 1024,
  "2K": 2048,
  "4K": 4096,
} as const;

export type ResolutionKey = keyof typeof RESOLUTIONS;

// Control section component
function ControlSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="text-sm font-mono text-gray-300">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

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
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        value={value}
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
  return (
    <div className="w-full lg:w-96 border-l border-white/10 p-4 space-y-4 overflow-y-auto">
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

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300">
              Style Controls
            </span>
            <button
              onClick={resetConfig}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Image Controls */}
          <ControlSection title="Image" defaultOpen>
            <SliderControl
              label="Size"
              value={config.image.size}
              onChange={(v) => updateConfig("image", { size: v })}
              min={1}
              max={3}
              step={0.1}
            />
            <SliderControl
              label="Position Y"
              value={config.image.positionY}
              onChange={(v) => updateConfig("image", { positionY: v })}
              min={-1}
              max={2}
              step={0.1}
            />
          </ControlSection>

          {/* Name Controls */}
          <ControlSection title="Speaker Name">
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
          </ControlSection>

          {/* Subtitle Controls */}
          <ControlSection title="Title">
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
          </ControlSection>

          {/* Branding Controls */}
          <ControlSection title="Conference Branding">
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
          </ControlSection>

          {/* Date/Location Controls */}
          <ControlSection title="Date & Location">
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
          </ControlSection>

          {/* Background Controls */}
          <ControlSection title="Background">
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
          </ControlSection>
        </div>
      )}
    </div>
  );
}



