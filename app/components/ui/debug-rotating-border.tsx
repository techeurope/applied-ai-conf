"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";

export function DebugRotatingBorder() {
  const [debugOverflowHidden, setDebugOverflowHidden] = useState(false);
  const [gradientStops, setGradientStops] = useState({
    orange: 25,
    yellow: 50,
    purple: 75,
    transparent: 100,
  });
  const [useRadialGradient, setUseRadialGradient] = useState(false);

  return (
    <div className="flex flex-row items-center gap-8">
      <div 
        className={`relative group bg-gray-100 ${debugOverflowHidden ? 'overflow-hidden' : ''}`} 
        style={{ width: '250px', height: '90px' }}
      >
        
        {/* Rotating Rectangle (Beam) - rotates from bottom edge at button center */}
        <div 
          className="absolute bottom-[50%] left-[-12.5%] w-[125%] h-[150%] origin-bottom animate-[spin_4s_linear_infinite]"
          style={{
            background: useRadialGradient
              ? `radial-gradient(ellipse at 50% 100%, #ef4444 0%, #f97316 ${gradientStops.orange}%, #eab308 ${gradientStops.yellow}%, #a855f7 ${gradientStops.purple}%, transparent ${gradientStops.transparent}%)`
              : `linear-gradient(to bottom, #ef4444 0%, #f97316 ${gradientStops.orange}%, #eab308 ${gradientStops.yellow}%, #a855f7 ${gradientStops.purple}%, transparent ${gradientStops.transparent}%)`
          }}
        />
        
        {/* White Background Layer (Masks center, leaves 2px border) */}
        <div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] bg-white z-10" />

        <div className="relative z-20 w-full h-full p-5 flex items-center justify-center gap-3">
          <Ticket className="h-5 w-5 text-black shrink-0" />
          <div className="flex items-center gap-2 text-lg font-bold text-black">
            DEBUG
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 z-50 bg-black/50 p-4 rounded-lg">
        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input
            type="checkbox"
            checked={debugOverflowHidden}
            onChange={(e) => setDebugOverflowHidden(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-mono">overflow-hidden</span>
        </label>

        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input
            type="checkbox"
            checked={useRadialGradient}
            onChange={(e) => setUseRadialGradient(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-mono">radial gradient</span>
        </label>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-white">
            <span className="text-sm font-mono w-16 text-orange-500">orange</span>
            <input
              type="range"
              min="0"
              max="100"
              value={gradientStops.orange}
              onChange={(e) => setGradientStops(s => ({ ...s, orange: Number(e.target.value) }))}
              className="w-32"
            />
            <span className="text-sm font-mono w-8">{gradientStops.orange}%</span>
          </label>

          <label className="flex items-center gap-2 text-white">
            <span className="text-sm font-mono w-16 text-yellow-500">yellow</span>
            <input
              type="range"
              min="0"
              max="100"
              value={gradientStops.yellow}
              onChange={(e) => setGradientStops(s => ({ ...s, yellow: Number(e.target.value) }))}
              className="w-32"
            />
            <span className="text-sm font-mono w-8">{gradientStops.yellow}%</span>
          </label>

          <label className="flex items-center gap-2 text-white">
            <span className="text-sm font-mono w-16 text-purple-500">purple</span>
            <input
              type="range"
              min="0"
              max="100"
              value={gradientStops.purple}
              onChange={(e) => setGradientStops(s => ({ ...s, purple: Number(e.target.value) }))}
              className="w-32"
            />
            <span className="text-sm font-mono w-8">{gradientStops.purple}%</span>
          </label>

          <label className="flex items-center gap-2 text-white">
            <span className="text-sm font-mono w-16 text-gray-400">transp</span>
            <input
              type="range"
              min="0"
              max="100"
              value={gradientStops.transparent}
              onChange={(e) => setGradientStops(s => ({ ...s, transparent: Number(e.target.value) }))}
              className="w-32"
            />
            <span className="text-sm font-mono w-8">{gradientStops.transparent}%</span>
          </label>
        </div>
      </div>
    </div>
  );
}

