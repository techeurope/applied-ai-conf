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
  Armchair,
  HelpCircle,
} from "lucide-react";

type ZoneId =
  | "main-stage"
  | "side-stage"
  | "partners"
  | "food"
  | "tables"
  | "registration"
  | "lounge"
  | "toilets"
  | "entrance";

interface Zone {
  id: ZoneId;
  label: string;
  short: string;
  description: string;
  // Hit-target rectangle in viewBox coords (1100 x 690)
  x: number;
  y: number;
  w: number;
  h: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

// ViewBox matches the cropped source floor plan aspect (1102 x 689).
const VIEWBOX_W = 1100;
const VIEWBOX_H = 690;

// "You are here" pin — at the main entrance / stairwell on the south-west side.
const ENTRANCE = { x: 95, y: 590 };

const ZONES: Zone[] = [
  {
    id: "main-stage",
    label: "Main Stage",
    short: "Keynotes & talks",
    description:
      "The big room. Keynotes, main talks, panels. No parallel session during keynotes.",
    x: 770,
    y: 410,
    w: 285,
    h: 200,
    icon: Mic,
    accent: "fuchsia",
  },
  {
    id: "side-stage",
    label: "Side Stage",
    short: "Deep dives & demos",
    description:
      "Demos, workshops, teardowns, partner sessions. Smaller room, louder opinions.",
    x: 470,
    y: 140,
    w: 240,
    h: 260,
    icon: Mic,
    accent: "sky",
  },
  {
    id: "partners",
    label: "Partner Booths",
    short: "Sponsors & demos",
    description:
      "Partner booths along the north wall. Stop by for demos, swag, and conversations.",
    x: 700,
    y: 5,
    w: 370,
    h: 145,
    icon: Users,
    accent: "amber",
  },
  {
    id: "food",
    label: "Food & Drinks",
    short: "Lunch & catering",
    description:
      "Lunch served 12:30–13:30. Coffee, tea, and snacks available all day. Allergens labelled.",
    x: 405,
    y: 15,
    w: 290,
    h: 70,
    icon: UtensilsCrossed,
    accent: "emerald",
  },
  {
    id: "tables",
    label: "Workshop Tables",
    short: "Hands-on & hallway track",
    description:
      "Cluster of tables for workshops, ad-hoc working sessions, and the hallway track.",
    x: 255,
    y: 110,
    w: 200,
    h: 225,
    icon: Armchair,
    accent: "pink",
  },
  {
    id: "registration",
    label: "Registration & Help Desk",
    short: "Badge pickup",
    description:
      "Pick up your badge here when you arrive. Help Desk next to it — team can answer anything.",
    x: 745,
    y: 100,
    w: 85,
    h: 90,
    icon: LogIn,
    accent: "orange",
  },
  {
    id: "lounge",
    label: "Speaker Lounge",
    short: "Speakers & green room",
    description:
      "Quiet rooms for speakers to prep. Attendees: please leave these rooms to the speakers.",
    x: 10,
    y: 5,
    w: 215,
    h: 160,
    icon: Coffee,
    accent: "violet",
  },
  {
    id: "toilets",
    label: "Toilets",
    short: "Restrooms",
    description:
      "Restrooms in the south corridor. Accessible restroom available — ask Help Desk.",
    x: 215,
    y: 460,
    w: 175,
    h: 100,
    icon: Toilet,
    accent: "rose",
  },
  {
    id: "entrance",
    label: "Entrance",
    short: "You are here",
    description:
      "Main entrance to The Delta Campus. Stairwell on the left, registration straight ahead.",
    x: 55,
    y: 560,
    w: 80,
    h: 60,
    icon: DoorOpen,
    accent: "white",
  },
];

// Manhattan-style walking paths from the entrance pin into each zone.
const PATHS: Record<ZoneId, string> = {
  "main-stage": `M ${ENTRANCE.x} ${ENTRANCE.y} L 900 590 L 900 510`,
  "side-stage": `M ${ENTRANCE.x} ${ENTRANCE.y} L 400 590 L 400 270 L 590 270`,
  partners: `M ${ENTRANCE.x} ${ENTRANCE.y} L 400 590 L 400 90 L 880 90`,
  food: `M ${ENTRANCE.x} ${ENTRANCE.y} L 400 590 L 400 50 L 550 50`,
  tables: `M ${ENTRANCE.x} ${ENTRANCE.y} L 355 590 L 355 220`,
  registration: `M ${ENTRANCE.x} ${ENTRANCE.y} L 400 590 L 400 145 L 785 145`,
  lounge: `M ${ENTRANCE.x} ${ENTRANCE.y} L 120 590 L 120 85`,
  toilets: `M ${ENTRANCE.x} ${ENTRANCE.y} L 300 590 L 300 510`,
  entrance: `M ${ENTRANCE.x} ${ENTRANCE.y} L ${ENTRANCE.x} ${ENTRANCE.y}`,
};

const ACCENT_STYLES: Record<
  string,
  { fill: string; stroke: string; text: string }
> = {
  amber: { fill: "fill-amber-500/15", stroke: "stroke-amber-300", text: "text-amber-200" },
  sky: { fill: "fill-sky-500/15", stroke: "stroke-sky-300", text: "text-sky-200" },
  orange: { fill: "fill-orange-500/15", stroke: "stroke-orange-300", text: "text-orange-200" },
  violet: { fill: "fill-violet-500/15", stroke: "stroke-violet-300", text: "text-violet-200" },
  emerald: { fill: "fill-emerald-500/15", stroke: "stroke-emerald-300", text: "text-emerald-200" },
  rose: { fill: "fill-rose-500/15", stroke: "stroke-rose-300", text: "text-rose-200" },
  pink: { fill: "fill-pink-500/15", stroke: "stroke-pink-300", text: "text-pink-200" },
  fuchsia: { fill: "fill-fuchsia-500/15", stroke: "stroke-fuchsia-300", text: "text-fuchsia-200" },
  white: { fill: "fill-white/15", stroke: "stroke-white", text: "text-white" },
};

export function FloorPlan() {
  const [selectedId, setSelectedId] = useState<ZoneId>("main-stage");
  const selected = ZONES.find((z) => z.id === selectedId)!;
  const accent = ACCENT_STYLES[selected.accent];
  const Icon = selected.icon;

  return (
    <section className="glass-card rounded-2xl p-5 space-y-4">
      <div className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
          <MapIcon className="size-3" strokeWidth={2} />
          // FLOOR PLAN
        </p>
        <p className="text-xs text-white/50">
          Tap a zone to see what&apos;s there and the walk from the entrance.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Map */}
        <div className="relative rounded-xl border border-white/10 bg-[#07090f] overflow-hidden">
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            className="w-full h-auto block"
            role="img"
            aria-label="Applied AI Conf venue floor plan"
          >
            <defs>
              <filter id="floor-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="floor-dim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Background floor plan PNG (AI-simplified from venue plan). */}
            <image
              href="/venue/floorplan-bg.png"
              x="0"
              y="0"
              width={VIEWBOX_W}
              height={VIEWBOX_H}
              preserveAspectRatio="xMidYMid slice"
              style={{ filter: "brightness(0.85) saturate(0.85)" }}
            />
            {/* Dim overlay so the dark UI hotspots and labels read on top of the cream plan. */}
            <rect
              x="0"
              y="0"
              width={VIEWBOX_W}
              height={VIEWBOX_H}
              fill="url(#floor-dim)"
            />

            {/* Zone hotspots */}
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
                        : "opacity-50 hover:opacity-85"
                    }`}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    style={isSelected ? { filter: "url(#floor-glow)" } : undefined}
                  />
                  <foreignObject
                    x={z.x + 10}
                    y={z.y + 8}
                    width={Math.max(z.w - 20, 60)}
                    height={Math.min(z.h - 16, 28)}
                    style={{ pointerEvents: "none" }}
                  >
                    <div className="flex items-center gap-1.5 text-white">
                      <ZIcon className={`w-3.5 h-3.5 ${a.text}`} />
                      <span className="font-mono text-[10px] uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
              <circle r="14" className="fill-white/20">
                <animate
                  attributeName="r"
                  values="10;18;10"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
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
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-2 flex items-center gap-1.5">
              <HelpCircle className="size-3" strokeWidth={2} />
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
          animation:
            drawPath 900ms ease-out forwards,
            marchingAnts 1.2s linear 900ms infinite;
          filter: drop-shadow(0 0 6px currentColor);
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
    </section>
  );
}
