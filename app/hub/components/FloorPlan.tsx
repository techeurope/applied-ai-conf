"use client";

import { useState } from "react";
import {
  Map as MapIcon,
  Mic,
  Coffee,
  UtensilsCrossed,
  Users,
  DoorOpen,
  LogIn,
  Toilet,
} from "lucide-react";

type ZoneId =
  | "main-stage"
  | "side-stage"
  | "lunch"
  | "coffee-north"
  | "coffee-south"
  | "partners"
  | "toilets"
  | "registration"
  | "entrance";

interface Zone {
  id: ZoneId;
  label: string;
  short: string;
  description: string;
  // Rect for hit-target and visual
  x: number;
  y: number;
  w: number;
  h: number;
  // Label position
  lx?: number;
  ly?: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // tailwind color utility fragment (text/bg)
}

// Entrance pin (where "You Are Here" sits)
const ENTRANCE = { x: 440, y: 555 };

const ZONES: Zone[] = [
  {
    id: "main-stage",
    label: "Main Stage",
    short: "Keynotes & talks",
    description:
      "The big room. Keynotes, main talks, panels. No parallel session during keynotes.",
    x: 60,
    y: 70,
    w: 340,
    h: 210,
    icon: Mic,
    accent: "amber",
  },
  {
    id: "side-stage",
    label: "Side Stage",
    short: "Deep dives & demos",
    description:
      "Demos, workshops, teardowns, partner sessions. Smaller room, louder opinions.",
    x: 440,
    y: 70,
    w: 300,
    h: 170,
    icon: Mic,
    accent: "sky",
  },
  {
    id: "coffee-north",
    label: "Coffee",
    short: "Caffeine station",
    description: "Coffee, tea, water. Open all day between sessions.",
    x: 440,
    y: 270,
    w: 140,
    h: 90,
    icon: Coffee,
    accent: "orange",
  },
  {
    id: "partners",
    label: "Partner Booths",
    short: "Sponsors & demos",
    description: "Partner booths along the north corridor. Stop by for demos and chats.",
    x: 600,
    y: 270,
    w: 140,
    h: 230,
    icon: Users,
    accent: "violet",
  },
  {
    id: "lunch",
    label: "Lunch Area",
    short: "Food & seating",
    description:
      "Lunch served 12:30–13:30. Vegetarian, vegan, and meat options. Allergens labelled.",
    x: 60,
    y: 310,
    w: 340,
    h: 160,
    icon: UtensilsCrossed,
    accent: "emerald",
  },
  {
    id: "coffee-south",
    label: "Coffee",
    short: "Caffeine station",
    description: "Second coffee bar near the lounge. Shorter queues in the afternoon.",
    x: 220,
    y: 490,
    w: 180,
    h: 60,
    icon: Coffee,
    accent: "orange",
  },
  {
    id: "toilets",
    label: "Toilets",
    short: "Restrooms",
    description: "Accessible restrooms. Additional restrooms near the partner corridor.",
    x: 60,
    y: 490,
    w: 140,
    h: 60,
    icon: Toilet,
    accent: "rose",
  },
  {
    id: "registration",
    label: "Registration",
    short: "Badge pickup",
    description:
      "Pick up your badge here when you arrive. Team at the desk can help with anything.",
    x: 420,
    y: 490,
    w: 160,
    h: 40,
    icon: LogIn,
    accent: "cyan",
  },
  {
    id: "entrance",
    label: "Entrance",
    short: "You are here",
    description: "Main entrance to The Delta Campus. Coat check just inside on the right.",
    x: 400,
    y: 540,
    w: 80,
    h: 40,
    icon: DoorOpen,
    accent: "white",
  },
];

// Hand-drawn Manhattan paths from the entrance into each zone.
const PATHS: Record<ZoneId, string> = {
  "main-stage": `M ${ENTRANCE.x} ${ENTRANCE.y} L 420 420 L 230 420 L 230 180`,
  "side-stage": `M ${ENTRANCE.x} ${ENTRANCE.y} L 500 420 L 590 420 L 590 160`,
  lunch: `M ${ENTRANCE.x} ${ENTRANCE.y} L 420 460 L 230 460 L 230 390`,
  "coffee-north": `M ${ENTRANCE.x} ${ENTRANCE.y} L 500 420 L 510 420 L 510 315`,
  "coffee-south": `M ${ENTRANCE.x} ${ENTRANCE.y} L 420 520 L 310 520`,
  partners: `M ${ENTRANCE.x} ${ENTRANCE.y} L 500 480 L 670 480 L 670 385`,
  toilets: `M ${ENTRANCE.x} ${ENTRANCE.y} L 420 520 L 130 520`,
  registration: `M ${ENTRANCE.x} ${ENTRANCE.y} L 500 510`,
  entrance: `M ${ENTRANCE.x} ${ENTRANCE.y} L ${ENTRANCE.x} ${ENTRANCE.y}`,
};

const ACCENT_STYLES: Record<string, { fill: string; stroke: string; text: string }> = {
  amber: { fill: "fill-amber-500/10", stroke: "stroke-amber-400", text: "text-amber-300" },
  sky: { fill: "fill-sky-500/10", stroke: "stroke-sky-400", text: "text-sky-300" },
  orange: { fill: "fill-orange-500/10", stroke: "stroke-orange-400", text: "text-orange-300" },
  violet: { fill: "fill-violet-500/10", stroke: "stroke-violet-400", text: "text-violet-300" },
  emerald: { fill: "fill-emerald-500/10", stroke: "stroke-emerald-400", text: "text-emerald-300" },
  rose: { fill: "fill-rose-500/10", stroke: "stroke-rose-400", text: "text-rose-300" },
  cyan: { fill: "fill-cyan-500/10", stroke: "stroke-cyan-400", text: "text-cyan-300" },
  white: { fill: "fill-white/10", stroke: "stroke-white", text: "text-white" },
};

export function FloorPlan() {
  const [selectedId, setSelectedId] = useState<ZoneId>("main-stage");
  const selected = ZONES.find((z) => z.id === selectedId)!;
  const accent = ACCENT_STYLES[selected.accent];
  const Icon = selected.icon;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-semibold text-white">Floor Plan</h2>
            <p className="text-xs text-neutral-500">
              Tap a zone to see what&apos;s there and the walk from the entrance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Map */}
        <div className="relative rounded-xl border border-white/10 bg-[#07090f] overflow-hidden">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto block"
            role="img"
            aria-label="Applied AI Conf venue floor plan"
          >
            {/* Building outline */}
            <rect
              x="30"
              y="30"
              width="740"
              height="540"
              rx="14"
              className="fill-white/[0.015] stroke-white/10"
              strokeWidth="1.5"
            />

            {/* subtle grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  className="stroke-white/[0.04]"
                  strokeWidth="1"
                />
              </pattern>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="30" y="30" width="740" height="540" rx="14" fill="url(#grid)" />

            {/* Zones */}
            {ZONES.map((z) => {
              const isSelected = z.id === selectedId;
              const a = ACCENT_STYLES[z.accent];
              const ZIcon = z.icon;
              return (
                <g
                  key={z.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(z.id)}
                >
                  <rect
                    x={z.x}
                    y={z.y}
                    width={z.w}
                    height={z.h}
                    rx="10"
                    className={`${a.fill} ${a.stroke} transition-all duration-300 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-90"
                    }`}
                    strokeWidth={isSelected ? 2 : 1.2}
                    style={
                      isSelected ? { filter: "url(#glow)" } : undefined
                    }
                  />
                  <foreignObject
                    x={z.x + 12}
                    y={z.y + 10}
                    width={z.w - 24}
                    height={Math.min(z.h - 20, 60)}
                    style={{ pointerEvents: "none" }}
                  >
                    <div className="flex items-center gap-2 text-white/90">
                      <ZIcon className={`w-4 h-4 ${a.text}`} />
                      <span className="font-mono text-[11px] uppercase tracking-wider">
                        {z.label}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Animated path from entrance to selected zone */}
            <path
              key={selectedId}
              d={PATHS[selectedId]}
              fill="none"
              className={`${accent.stroke} floor-path`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 8"
            />

            {/* "You are here" pin at entrance */}
            <g transform={`translate(${ENTRANCE.x} ${ENTRANCE.y})`}>
              <circle r="14" className="fill-white/10">
                <animate
                  attributeName="r"
                  values="10;18;10"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.35;0;0.35"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="6" className="fill-white" />
              <circle r="2.5" className="fill-black" />
            </g>
          </svg>
        </div>

        {/* Side panel */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-5 h-5 ${accent.text}`} />
            <h3 className="font-mono text-base text-white">{selected.label}</h3>
          </div>
          <div className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-2">
            {selected.short}
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {selected.description}
          </p>

          <div className="mt-5 pt-5 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-2">
              Quick jump
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ZONES.filter((z) => z.id !== "entrance").map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelectedId(z.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors cursor-pointer ${
                    z.id === selectedId
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floor-path {
          stroke-dashoffset: 400;
          animation: drawPath 900ms ease-out forwards, marchingAnts 1.2s linear 900ms infinite;
        }
        @keyframes drawPath {
          from {
            stroke-dashoffset: 400;
            opacity: 0.3;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes marchingAnts {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </div>
  );
}
