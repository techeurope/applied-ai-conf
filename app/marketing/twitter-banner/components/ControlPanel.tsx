"use client";

import { useBannerStore, unitToPixel } from "../store";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Undo2, Redo2, RotateCcw, Copy } from "lucide-react";

// Helper to convert Three.js units to pixels for display
const toPixel = (value: number) => Math.round(value * unitToPixel);
const fromPixel = (value: number) => value / unitToPixel;

interface PixelSliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

function PixelSliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: PixelSliderControlProps) {
  const pixelValue = toPixel(value);
  const pixelMin = toPixel(min);
  const pixelMax = toPixel(max);
  const pixelStep = Math.max(1, toPixel(step));

  return (
    <div>
      <Label className="text-xs text-white/60 mb-1 block">
        {label}: {pixelValue}px
      </Label>
      <Slider
        value={[pixelValue]}
        onValueChange={([v]) => onChange(fromPixel(v))}
        min={pixelMin}
        max={pixelMax}
        step={pixelStep}
        className="w-full"
      />
    </div>
  );
}

interface RawSliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

function RawSliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  unit = "",
}: RawSliderControlProps) {
  return (
    <div>
      <Label className="text-xs text-white/60 mb-1 block">
        {label}: {value.toFixed(2)}
        {unit}
      </Label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

export function ControlPanel() {
  const {
    config,
    setSubtitle,
    setTitle,
    setDateLocation,
    setBackground,
    resetConfig,
    undo,
    redo,
    history,
  } = useBannerStore();

  const { subtitle, title, dateLocation, background } = config;

  const copySettingsToClipboard = () => {
    const settings = {
      subtitle: {
        fontSize: toPixel(subtitle.fontSize),
        color: subtitle.color,
        letterSpacing: toPixel(subtitle.letterSpacing),
        text: subtitle.text,
        position: {
          x: toPixel(subtitle.position.x),
          y: toPixel(subtitle.position.y),
        },
      },
      title: {
        fontSize: toPixel(title.fontSize),
        color: title.color,
        letterSpacing: toPixel(title.letterSpacing),
        text: title.text,
        position: {
          x: toPixel(title.position.x),
          y: toPixel(title.position.y),
        },
      },
      dateLocation: {
        fontSize: toPixel(dateLocation.fontSize),
        color: dateLocation.color,
        letterSpacing: toPixel(dateLocation.letterSpacing),
        text: dateLocation.text,
        position: {
          x: toPixel(dateLocation.position.x),
          y: toPixel(dateLocation.position.y),
        },
      },
      background: {
        fogDensity: background.fogDensity,
        gridOpacity: background.gridOpacity,
        animationPaused: background.animationPaused,
        animationTime: background.animationTime,
      },
      _meta: {
        unitToPixel,
        note: "Pixel values shown. Divide by unitToPixel (600) to get Three.js units for code.",
      },
    };

    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-mono text-white">Banner Controls</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={resetConfig}
            className="p-1.5 rounded hover:bg-white/10"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={copySettingsToClipboard}
            className="p-1.5 rounded hover:bg-white/10"
            title="Copy Settings (JSON)"
          >
            <Copy className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Background Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-white/80 uppercase tracking-wider">
          Background
        </h4>

        <RawSliderControl
          label="Fog Density"
          value={background.fogDensity}
          onChange={(v) => setBackground({ fogDensity: v })}
          min={0}
          max={4}
          step={0.1}
        />

        <RawSliderControl
          label="Grid Opacity"
          value={background.gridOpacity}
          onChange={(v) => setBackground({ gridOpacity: v })}
          min={0}
          max={1}
          step={0.01}
        />

        <div className="flex items-center justify-between">
          <Label className="text-xs text-white/60">Animation Paused</Label>
          <Switch
            checked={background.animationPaused}
            onCheckedChange={(checked) =>
              setBackground({ animationPaused: checked })
            }
          />
        </div>

        {background.animationPaused && (
          <RawSliderControl
            label="Animation Time"
            value={background.animationTime}
            onChange={(v) => setBackground({ animationTime: v })}
            min={0}
            max={100}
            step={0.5}
            unit="s"
          />
        )}
      </div>

      {/* Subtitle Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-white/80 uppercase tracking-wider">
          Subtitle ({subtitle.text})
        </h4>

        <PixelSliderControl
          label="Font Size"
          value={subtitle.fontSize}
          onChange={(v) => setSubtitle({ fontSize: v })}
          min={0.05}
          max={0.3}
          step={0.005}
        />

        <PixelSliderControl
          label="Letter Spacing"
          value={subtitle.letterSpacing}
          onChange={(v) => setSubtitle({ letterSpacing: v })}
          min={-0.1}
          max={0.2}
          step={0.005}
        />

        <PixelSliderControl
          label="Position Y"
          value={subtitle.position.y}
          onChange={(v) =>
            setSubtitle({ position: { ...subtitle.position, y: v } })
          }
          min={-0.5}
          max={0.8}
          step={0.01}
        />
      </div>

      {/* Title Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-white/80 uppercase tracking-wider">
          Title ({title.text})
        </h4>

        <PixelSliderControl
          label="Font Size"
          value={title.fontSize}
          onChange={(v) => setTitle({ fontSize: v })}
          min={0.1}
          max={0.6}
          step={0.01}
        />

        <PixelSliderControl
          label="Letter Spacing"
          value={title.letterSpacing}
          onChange={(v) => setTitle({ letterSpacing: v })}
          min={-0.1}
          max={0.1}
          step={0.005}
        />

        <PixelSliderControl
          label="Position Y"
          value={title.position.y}
          onChange={(v) => setTitle({ position: { ...title.position, y: v } })}
          min={-0.5}
          max={0.5}
          step={0.01}
        />
      </div>

      {/* Date/Location Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-white/80 uppercase tracking-wider">
          Date & Location
        </h4>

        <PixelSliderControl
          label="Font Size"
          value={dateLocation.fontSize}
          onChange={(v) => setDateLocation({ fontSize: v })}
          min={0.05}
          max={0.25}
          step={0.005}
        />

        <PixelSliderControl
          label="Letter Spacing"
          value={dateLocation.letterSpacing}
          onChange={(v) => setDateLocation({ letterSpacing: v })}
          min={-0.05}
          max={0.15}
          step={0.005}
        />

        <PixelSliderControl
          label="Position Y"
          value={dateLocation.position.y}
          onChange={(v) =>
            setDateLocation({ position: { ...dateLocation.position, y: v } })
          }
          min={-0.8}
          max={0.3}
          step={0.01}
        />
      </div>
    </div>
  );
}




