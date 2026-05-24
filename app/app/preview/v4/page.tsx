"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  ArrowRight,
  Armchair,
  DoorOpen,
  LogIn,
  Mic,
  Toilet,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import {
  CONFERENCE_DATE,
  getConferenceClock,
  isLive,
  timeToMinutes,
} from "@/lib/conference-time";
import { AGENDA } from "@/data/agenda";
import { PracticalStrip } from "../_components/PracticalStrip";
import { MoreLinks } from "../_components/MoreLinks";
import { Footer } from "../_components/Footer";
import { ConferenceFacts } from "../_components/ConferenceFacts";
import type { AgendaSlot } from "@/types";

type ZoneId =
  | "main-stage"
  | "side-stage"
  | "partners"
  | "food"
  | "tables"
  | "registration"
  | "toilets"
  | "entrance";

interface Zone {
  id: ZoneId;
  label: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: string;
  stageFilter?: "main" | "side" | "expo";
}

const VIEWBOX_W = 1100;
const VIEWBOX_H = 690;
const ENTRANCE = { x: 95, y: 590 };

const ZONES: Zone[] = [
  { id: "main-stage", label: "Main Stage", description: "Keynotes and main programme. No parallel side-stage during keynotes.", x: 770, y: 410, w: 285, h: 200, icon: Mic, accent: "emerald", stageFilter: "main" },
  { id: "side-stage", label: "Side Stage", description: "Demos, workshops, teardowns and partner sessions. Smaller room, louder opinions.", x: 470, y: 140, w: 240, h: 260, icon: Mic, accent: "violet", stageFilter: "side" },
  { id: "partners", label: "Partner Booths", description: "Demos, swag, conversations along the north wall.", x: 700, y: 5, w: 370, h: 145, icon: Users, accent: "amber" },
  { id: "food", label: "Food & Drinks", description: "Lunch 12:30–13:30. Coffee, tea, snacks all day. Allergens labelled at the counter.", x: 405, y: 15, w: 290, h: 70, icon: UtensilsCrossed, accent: "rose", stageFilter: "expo" },
  { id: "tables", label: "Workshop Tables", description: "Cluster for hands-on sessions and the hallway track.", x: 255, y: 110, w: 200, h: 225, icon: Armchair, accent: "pink" },
  { id: "registration", label: "Help Desk", description: "Pick up your badge. Crew can answer anything.", x: 745, y: 100, w: 85, h: 90, icon: LogIn, accent: "orange" },
  { id: "toilets", label: "Toilets", description: "Restrooms in the south corridor. Accessible — ask Help Desk.", x: 215, y: 460, w: 175, h: 100, icon: Toilet, accent: "stone" },
  { id: "entrance", label: "Entrance", description: "You are here. Stairwell on the left, registration straight ahead.", x: 55, y: 560, w: 80, h: 60, icon: DoorOpen, accent: "white" },
];

const ACCENT: Record<string, { fill: string; stroke: string; text: string; ring: string }> = {
  emerald: { fill: "fill-emerald-500/15", stroke: "stroke-emerald-300", text: "text-emerald-200", ring: "ring-emerald-300/30" },
  violet: { fill: "fill-violet-500/15", stroke: "stroke-violet-300", text: "text-violet-200", ring: "ring-violet-300/30" },
  amber: { fill: "fill-amber-500/15", stroke: "stroke-amber-300", text: "text-amber-200", ring: "ring-amber-300/30" },
  rose: { fill: "fill-rose-500/15", stroke: "stroke-rose-300", text: "text-rose-200", ring: "ring-rose-300/30" },
  pink: { fill: "fill-pink-500/15", stroke: "stroke-pink-300", text: "text-pink-200", ring: "ring-pink-300/30" },
  orange: { fill: "fill-orange-500/15", stroke: "stroke-orange-300", text: "text-orange-200", ring: "ring-orange-300/30" },
  stone: { fill: "fill-stone-500/15", stroke: "stroke-stone-300", text: "text-stone-200", ring: "ring-stone-300/30" },
  white: { fill: "fill-white/15", stroke: "stroke-white", text: "text-white", ring: "ring-white/30" },
  sky: { fill: "fill-sky-500/15", stroke: "stroke-sky-300", text: "text-sky-200", ring: "ring-sky-300/30" },
};

export default function V4FloorPlanFirst() {
  const auth = useAuth();
  const [selected, setSelected] = useState<ZoneId>("main-stage");
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const liveByStage = useMemo(() => {
    const map = new Map<string, AgendaSlot>();
    AGENDA.forEach((s) => {
      if (clock.isConferenceDay && isLive(s, clock.nowMinutes)) {
        map.set(s.stage, s);
      }
    });
    return map;
  }, [clock.isConferenceDay, clock.nowMinutes]);

  return (
    <div className="min-h-[100dvh] w-full">
      {/* ── COMPACT STATUS BAR ────────────────────────────────── */}
      <section className="w-full border-b border-white/10 bg-[radial-gradient(circle_at_85%_-50%,rgba(125,211,252,0.15),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-5 grid sm:grid-cols-[1fr_auto] gap-3 sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sky-200/85 mb-1">
              // walk the venue
            </p>
            <p className="text-xl sm:text-2xl text-white font-medium tracking-tight">
              Eight zones. Pick one to see what's there.
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] tabular-nums text-white/55">
            {CONFERENCE_DATE} · DELTA · BLN{" "}
            {clock.isConferenceDay ? <span className="text-rose-300">· LIVE {clock.nowHHMM}</span> : <span>· T−{clock.daysUntil}</span>}
          </p>
        </div>
      </section>

      {/* ── SIGN-IN STRIP (signed-out) ───────────────────────── */}
      {!auth.user && !auth.loading && (
        <section className="w-full border-b border-white/10 bg-emerald-400/[0.04]">
          <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-5 grid sm:grid-cols-[1fr_auto] items-center gap-3">
            <p className="text-sm text-white">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200 mr-3 align-middle">// signed-out</span>
              Sign in with your Luma email to unlock your badge, lunch voucher and contacts.
            </p>
            <a
              href="/api/auth/sign-in?return_to=%2Fapp%2Fpreview%2Fv4"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] hover:scale-[1.02] transition-transform shrink-0"
            >
              Sign in
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </a>
          </div>
        </section>
      )}

      {/* ── MAP + ZONE CARDS ─────────────────────────────────── */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-7 sm:py-9 grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          {/* compact map (left) */}
          <div className="relative rounded-2xl ring-1 ring-white/10 bg-[#07090f] overflow-hidden lg:sticky lg:top-32">
            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              className="w-full h-auto block"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Applied AI Conf venue floor plan"
            >
              <defs>
                <filter id="v4-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="v4-dim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <image
                href="/venue/floorplan-bg.png"
                x="0"
                y="0"
                width={VIEWBOX_W}
                height={VIEWBOX_H}
                preserveAspectRatio="xMidYMid slice"
                style={{ filter: "brightness(0.78) saturate(0.7)" }}
              />
              <rect x="0" y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#v4-dim)" />

              {ZONES.map((z) => {
                const a = ACCENT[z.accent] ?? ACCENT.white;
                const isSelected = z.id === selected;
                const live = z.stageFilter ? liveByStage.get(z.stageFilter) : undefined;
                return (
                  <g key={z.id} className="cursor-pointer" onClick={() => setSelected(z.id)}>
                    {live && (
                      <rect
                        x={z.x - 4}
                        y={z.y - 4}
                        width={z.w + 8}
                        height={z.h + 8}
                        rx="12"
                        fill="none"
                        className={a.stroke}
                        strokeWidth={2}
                        style={{ filter: "url(#v4-glow)", animation: "v4-pulse 1.8s ease-out infinite" }}
                      />
                    )}
                    <rect
                      x={z.x}
                      y={z.y}
                      width={z.w}
                      height={z.h}
                      rx="10"
                      className={`${a.fill} ${a.stroke} transition-all duration-300 ${
                        isSelected ? "opacity-100" : "opacity-60 hover:opacity-90"
                      }`}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      style={isSelected ? { filter: "url(#v4-glow)" } : undefined}
                    />
                  </g>
                );
              })}

              <g transform={`translate(${ENTRANCE.x} ${ENTRANCE.y})`}>
                <circle r="14" className="fill-white/20">
                  <animate attributeName="r" values="10;18;10" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle r="6" className="fill-white" />
                <circle r="2.5" className="fill-black" />
              </g>
            </svg>

            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md ring-1 ring-white/15 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
                <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Entrance
              </span>
            </div>

            <style jsx global>{`
              @keyframes v4-pulse {
                0%   { opacity: 0.85; transform: scale(1); }
                70%  { opacity: 0;    transform: scale(1.04); }
                100% { opacity: 0;    transform: scale(1.04); }
              }
            `}</style>
          </div>

          {/* zone cards grid (right) */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-3">
              // zones
            </p>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {ZONES.map((z) => {
                const a = ACCENT[z.accent] ?? ACCENT.white;
                const active = z.id === selected;
                const live = z.stageFilter ? liveByStage.get(z.stageFilter) : undefined;
                const next = z.stageFilter
                  ? AGENDA.filter(
                      (s) =>
                        s.stage === z.stageFilter &&
                        s.format !== "logistics" &&
                        timeToMinutes(s.endTime) > clock.nowMinutes,
                    )[0]
                  : undefined;
                const ZIcon = z.icon;
                return (
                  <li key={z.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(z.id)}
                      className={`group text-left w-full rounded-xl ring-1 transition-colors p-3.5 space-y-2 ${
                        active
                          ? `${a.ring} bg-white/[0.05]`
                          : "ring-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:ring-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ZIcon className={`size-4 ${a.text}`} strokeWidth={1.75} />
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white truncate flex-1">
                          {z.label}
                        </span>
                        {live && (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
                            <span className="size-1 rounded-full bg-rose-300 animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/55 leading-relaxed line-clamp-2">
                        {z.description}
                      </p>
                      {next && z.stageFilter && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 tabular-nums truncate">
                          {live ? "now · " : `next · ${next.startTime} · `}
                          <span className="text-white/65 normal-case tracking-normal">
                            {next.title}
                          </span>
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 pt-2">
              tap a card to highlight its zone on the map →
            </p>
          </div>
        </div>
      </section>

      <ConferenceFacts accent="sky" />
      <PracticalStrip />
      <MoreLinks accent="sky" />
      <Footer accent="sky" />
    </div>
  );
}
