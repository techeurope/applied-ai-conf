"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { AGENDA } from "@/data/agenda";
import { SPEAKERS } from "@/data/speakers";
import type { AgendaSlot, SessionFormat } from "@/types";

// ── Grid math ────────────────────────────────────────────────────
// Each row = 5 minutes. Row height is fixed so blocks are proportional.
const MINUTES_PER_ROW = 5;
const ROW_HEIGHT = 30; // px — 20min talk = 4 rows = 120px
const DAY_START_H = 8;
const DAY_START_M = 0;
const DAY_START = DAY_START_H * 60 + DAY_START_M;

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Grid row number (1-based, no header row in grid anymore)
function toRow(time: string) {
  return Math.round((timeToMinutes(time) - DAY_START) / MINUTES_PER_ROW) + 1;
}

function rowSpan(start: string, end: string) {
  return Math.round((timeToMinutes(end) - timeToMinutes(start)) / MINUTES_PER_ROW);
}

// ── Classify ─────────────────────────────────────────────────────
function classify() {
  const mainSlots = AGENDA.filter((s) => s.stage === "main");
  const sideSlots = AGENDA.filter((s) => s.stage === "side");

  const sideBreakStarts = new Set(
    sideSlots.filter((s) => s.format === "break").map((s) => s.startTime)
  );

  const shared: AgendaSlot[] = [];
  const sharedBreaks: AgendaSlot[] = [];
  const main: AgendaSlot[] = [];
  const side = sideSlots.filter((s) => s.format !== "break" && s.format !== "logistics");

  for (const s of mainSlots) {
    if (s.format === "break" && sideBreakStarts.has(s.startTime)) {
      sharedBreaks.push(s);
    } else if (s.format === "break") {
      sharedBreaks.push(s); // non-shared breaks still span full width
    } else if (s.format === "logistics" || s.format === "keynote") {
      shared.push(s);
    } else {
      main.push(s);
    }
  }

  return { shared, sharedBreaks, main, side };
}

// ── Time labels ──────────────────────────────────────────────────
function buildTimeLabels() {
  const lastSlot = AGENDA.reduce((a, b) =>
    timeToMinutes(a.endTime) > timeToMinutes(b.endTime) ? a : b
  );
  const endMin = timeToMinutes(lastSlot.endTime);

  // Track which stages have a slot starting at each time
  const mainStartTimes = new Set(AGENDA.filter((s) => s.stage === "main").map((s) => s.startTime));
  const sideStartTimes = new Set(AGENDA.filter((s) => s.stage === "side").map((s) => s.startTime));

  // Build shared time ranges (logistics, keynotes, breaks) to hide time labels inside them
  const { shared: sharedSlots, sharedBreaks: breakSlots } = classify();
  const sharedRanges = [...sharedSlots, ...breakSlots].map((s) => ({
    start: timeToMinutes(s.startTime),
    end: timeToMinutes(s.endTime),
  }));

  // Shared event start times — these should still show a time label
  const sharedStartTimes = new Set([...sharedSlots, ...breakSlots].map((s) => s.startTime));

  function isInsideShared(minutes: number) {
    // Allow the START time of shared events to show
    const timeStr = `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
    if (sharedStartTimes.has(timeStr)) return false;
    return sharedRanges.some((r) => minutes >= r.start && minutes < r.end);
  }

  const labels: { time: string; row: number; isSlotStart: boolean; mainStart: boolean; sideStart: boolean }[] = [];

  for (let m = DAY_START; m <= endMin; m += MINUTES_PER_ROW) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const time = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    // Skip labels inside shared events — those events cover everything
    if (isInsideShared(m)) continue;

    const mainStart = mainStartTimes.has(time);
    const sideStart = sideStartTimes.has(time);
    const isSlotStart = mainStart || sideStart;
    labels.push({ time, row: toRow(time), isSlotStart, mainStart, sideStart });
  }
  return labels;
}

// ── Solid dark backgrounds (no opacity — hides grid lines behind) ─
const ACCENT_BG: Record<SessionFormat, string> = {
  keynote: "bg-[#0f0d08]",
  talk: "bg-[#08090d]",
  panel: "bg-[#0b080e]",
  workshop: "bg-[#080c0a]",
  break: "bg-[#0a0a0d]",
  logistics: "bg-[#0a0a0d]",
};

const ACCENT_BORDER: Record<SessionFormat, string> = {
  keynote: "border-l-amber-400",
  talk: "border-l-white/20",
  panel: "border-l-violet-400",
  workshop: "border-l-emerald-400",
  break: "",
  logistics: "",
};

// ── Cell content ─────────────────────────────────────────────────
function SlotCell({ slot }: { slot: AgendaSlot }) {
  const speaker = slot.speakerName
    ? SPEAKERS.find((s) => s.name === slot.speakerName)
    : null;
  const isTBA =
    !slot.speakerName &&
    slot.format !== "keynote" &&
    slot.format !== "logistics" &&
    slot.format !== "break";
  const isKeynote = slot.format === "keynote";
  const isCeremony = slot.format === "logistics" && (slot.title === "Welcome" || slot.title === "Closing Remarks");
  const isDoors = slot.format === "logistics" && slot.title.includes("Doors");

  // Keynote
  if (isKeynote) {
    return (
      <div className={`h-full ${ACCENT_BG.keynote} px-5 pt-0 pb-4`}>
        <span className="text-amber-400/60 text-xs font-mono uppercase tracking-widest">Main Stage</span>
        <h4 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight mt-1">
          {slot.title}
        </h4>
        {speaker && (
          <div className="flex items-center gap-2 mt-2">
            {speaker.linkedinUrl ? (
              <Link href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-base font-mono text-gray-200 hover:text-white transition-colors">
                {speaker.name}
              </Link>
            ) : (
              <span className="text-base font-mono text-gray-200">{speaker.name}</span>
            )}
            {speaker.company && <span className="text-sm text-gray-500">· {speaker.company}</span>}
          </div>
        )}
      </div>
    );
  }

  // Welcome / Closing
  if (isCeremony) {
    return (
      <div className={`h-full ${ACCENT_BG.logistics} px-5 pt-0 pb-4`}>
        <h4 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">{slot.title}</h4>
      </div>
    );
  }

  // Doors
  if (isDoors) {
    return (
      <div className={`h-full ${ACCENT_BG.logistics} px-5 pt-0 pb-4`}>
        <p className="text-sm font-mono text-gray-400">{slot.title}</p>
      </div>
    );
  }

  // Break
  if (slot.format === "break") {
    return (
      <div className={`h-full ${ACCENT_BG.break} px-5 pt-0 pb-4`}>
        <p className="text-sm font-mono text-white/50">{slot.title}</p>
      </div>
    );
  }

  // Talk / Panel / Workshop: title → speaker → length
  return (
    <div className={`h-full ${ACCENT_BG[slot.format]} px-4 pt-0 pb-3 ${
      isTBA ? "opacity-40" : ""
    }`}>
      {slot.format === "panel" && (
        <span className="text-[9px] font-mono uppercase tracking-widest bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded mb-1 inline-block">Panel</span>
      )}
      <h4 className={`text-sm leading-snug font-medium ${isTBA ? "text-gray-600 italic" : "text-white"}`}>
        {isTBA ? "To be announced" : slot.title}
      </h4>
      {speaker && (
        <div className="mt-1 flex items-center gap-1.5">
          {speaker.linkedinUrl ? (
            <Link href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-gray-300 hover:text-white transition-colors">
              {speaker.name}
            </Link>
          ) : (
            <span className="text-xs font-mono text-gray-300">{speaker.name}</span>
          )}
          {speaker.company && <span className="text-[11px] text-gray-500">· {speaker.company}</span>}
        </div>
      )}
      {slot.description && <p className="text-[10px] text-gray-500 mt-0.5">{slot.description}</p>}
    </div>
  );
}

// ── Desktop grid ─────────────────────────────────────────────────
function DesktopGrid({ isVisible }: { isVisible: boolean }) {
  const { shared, sharedBreaks, main, side } = useMemo(() => classify(), []);
  const timeLabels = useMemo(() => buildTimeLabels(), []);

  // Total rows needed
  const lastSlot = AGENDA.reduce((a, b) => timeToMinutes(a.endTime) > timeToMinutes(b.endTime) ? a : b);
  const totalRows = Math.round((timeToMinutes(lastSlot.endTime) - DAY_START) / MINUTES_PER_ROW) + 1;

  return (
    <div
      className={`hidden lg:block transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "200ms" }}
    >
      {/* Sticky stage headers — OUTSIDE the grid so sticky works */}
      {/* Grid: time | main | gap | time | side */}
      <div className="sticky top-0 z-20 bg-black border-b border-white/[0.08]"
        style={{ display: "grid", gridTemplateColumns: "4rem 1fr 2rem 4rem 1fr" }}
      >
        <div className="py-3" />
        <div className="py-3 pl-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/60" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Main Stage</span>
        </div>
        <div className="py-3" />
        <div className="py-3" />
        <div className="py-3 pl-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Side Stage</span>
        </div>
      </div>

      {/* The actual grid: time | main | gap | time | side */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "4rem 1fr 2rem 4rem 1fr",
          gridTemplateRows: `repeat(${totalRows}, ${ROW_HEIGHT}px)`,
        }}
      >

      {/* Left time column (for main stage) — only main starts are large */}
      {timeLabels.map(({ time, row, mainStart }) => (
        <div key={`tl-${time}`} style={{ gridColumn: "1", gridRow: `${row}` }} className="flex items-start justify-end pr-3">
          <span className={`font-mono tabular-nums leading-none ${
            mainStart
              ? "text-sm text-gray-300 font-semibold"
              : "text-[9px] text-gray-700"
          }`}>
            {time}
          </span>
        </div>
      ))}

      {/* Main stage slot start lines — rendered in main column */}
      {timeLabels.filter(l => l.mainStart).map(({ time, row }) => (
        <div key={`ml-${time}`} style={{ gridColumn: "2", gridRow: `${row}` }} className="border-t border-white/[0.08]" />
      ))}

      {/* Right time column (for side stage) — only side starts are large */}
      {timeLabels.map(({ time, row, sideStart }) => (
        <div key={`tr-${time}`} style={{ gridColumn: "4", gridRow: `${row}` }} className="flex items-start justify-end pr-3">
          <span className={`font-mono tabular-nums leading-none ${
            sideStart
              ? "text-sm text-gray-300 font-semibold"
              : "text-[9px] text-gray-700"
          }`}>
            {time}
          </span>
        </div>
      ))}

      {/* Side stage slot start lines — rendered in side column */}
      {timeLabels.filter(l => l.sideStart).map(({ time, row }) => (
        <div key={`sl-${time}`} style={{ gridColumn: "5", gridRow: `${row}` }} className="border-t border-white/[0.08]" />
      ))}

      {/* No full-height vertical divider — individual slot borders are enough */}

      {/* Shared events — span all 5 columns, z-10 to cover any grid artifacts */}
      {shared.map((slot) => (
        <div key={slot.id} style={{
          gridColumn: "1 / 6",
          gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
        }} className="z-10 border-b border-white/[0.06]">
          <SlotCell slot={slot} />
        </div>
      ))}

      {/* Shared breaks — span all 5 columns, z-10 */}
      {sharedBreaks.map((slot) => (
        <div key={slot.id} style={{
          gridColumn: "1 / 6",
          gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
        }} className="z-10 border-y border-white/[0.06]">
          <SlotCell slot={slot} />
        </div>
      ))}

      {/* Main stage — column 2 */}
      {main.map((slot) => (
        <div key={slot.id} style={{
          gridColumn: "2",
          gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
        }} className="border-b border-white/[0.04]">
          <SlotCell slot={slot} />
        </div>
      ))}

      {/* Side stage — column 5 */}
      {side.map((slot) => (
        <div key={slot.id} style={{
          gridColumn: "5",
          gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
        }} className="border-b border-white/[0.04]">
          <SlotCell slot={slot} />
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Mobile ───────────────────────────────────────────────────────
function MobileView({ activeStage, isVisible }: { activeStage: "main" | "side"; isVisible: boolean }) {
  const rows = useMemo(() => {
    const slots = AGENDA.filter(
      (s) => s.stage === activeStage || (s.stage === "main" && (s.format === "logistics" || s.format === "keynote" || s.format === "break"))
    ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Deduplicate breaks (both stages have same break)
    const seen = new Set<string>();
    return slots.filter((s) => {
      const key = `${s.startTime}-${s.format}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [activeStage]);

  return (
    <div className="flex flex-col lg:hidden">
      {rows.map((slot, i) => (
        <div
          key={slot.id}
          className={`border-b border-white/[0.04] transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{ transitionDelay: `${60 + i * 25}ms` }}
        >
          <SlotCell slot={slot} />
        </div>
      ))}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────
export default function Agenda() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStage, setActiveStage] = useState<"main" | "side">("main");

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold: 0.03 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="schedule" className="relative w-full bg-black py-28 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className={`mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05]">
            One day. Two stages.
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-4">What keeps engineers and builders up at night.</p>
        </div>

        {/* Mobile tabs */}
        <div className={`flex lg:hidden mb-6 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "80ms" }}>
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
            {(["main", "side"] as const).map((s) => (
              <button key={s} onClick={() => setActiveStage(s)}
                className={`rounded-md px-4 py-2 text-sm font-mono transition-all duration-200 ${activeStage === s ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                {s === "main" ? "Main Stage" : "Side Stage"}
              </button>
            ))}
          </div>
        </div>

        <DesktopGrid isVisible={isVisible} />
        <MobileView activeStage={activeStage} isVisible={isVisible} />
      </div>
    </section>
  );
}
