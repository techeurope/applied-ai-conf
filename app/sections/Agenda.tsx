"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { AGENDA } from "@/data/agenda";
import { SPEAKERS } from "@/data/speakers";
import type { AgendaSlot, SessionFormat } from "@/types";

// ── Grid constants ──────────────────────────────────────────────
const MINUTES_PER_ROW = 5;
const ROW_HEIGHT = 20; // px per 5-min row
const BREAK_ROW_HEIGHT = 8; // px per 5-min row inside logistics
// Target visual height for all breaks (matches coffee break: 4 rows × 16px)
const BREAK_TARGET_HEIGHT = 48;
// Target visual height for keynotes (enough for title + speaker)
const KEYNOTE_TARGET_HEIGHT = 64;
const DAY_START = 8 * 60; // 08:00

// Slot top gap: black space above the slot background (wrapper pt)
const SLOT_GAP = "pt-1"; // 4px black strip above background
// Slot inner padding: breathing room inside the background
const SLOT_PAD_TOP = "pt-1"; // 4px inside background before text
// Time label offset: aligns time baseline with slot title baseline
// = wrapper gap (4px) + inner padding (4px) + half-leading (~1px) ≈ 9px
const TIME_OFFSET = "pt-[9px]";
// Extra spacing after full-width shared events (slot wrapper)
const AFTER_SHARED_SLOT = "pt-3";
// Extra spacing after full-width shared events (time label)
// = shared slot gap (12px) + inner padding (4px) + half-leading (~1px) ≈ 17px
const AFTER_SHARED_TIME = "pt-[17px]";

// ── Grid math ───────────────────────────────────────────────────
function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toRow(time: string) {
  return Math.round((timeToMinutes(time) - DAY_START) / MINUTES_PER_ROW) + 1;
}

function rowSpan(start: string, end: string) {
  return Math.round((timeToMinutes(end) - timeToMinutes(start)) / MINUTES_PER_ROW);
}

// ── Classify slots ──────────────────────────────────────────────
// Full-width: logistics, keynotes, breaks (span both stages)
// Stage-specific: talks, panels, workshops (one stage column)
function classify() {
  const fullWidth: AgendaSlot[] = [];
  const main: AgendaSlot[] = [];
  const side: AgendaSlot[] = [];

  for (const s of AGENDA) {
    const isFullWidth =
      s.format === "logistics" ||
      s.format === "keynote" ||
      (s.format === "break" && s.stage === "main");

    if (isFullWidth) {
      fullWidth.push(s);
    } else if (s.format === "break") {
      // Side-stage break duplicates are skipped (main break already full-width)
      continue;
    } else if (s.stage === "main") {
      main.push(s);
    } else {
      side.push(s);
    }
  }

  return { fullWidth, main, side };
}

// ── Time labels ─────────────────────────────────────────────────
// Only show times at slot starts (no small filler labels between)
function buildTimeLabels(fullWidth: AgendaSlot[]) {
  const sharedEndMinutes = new Set(fullWidth.map((s) => timeToMinutes(s.endTime)));

  // Collect unique start times per stage (excluding full-width events)
  const stageSlots = AGENDA.filter(
    (s) => s.format !== "logistics" && s.format !== "keynote" && !(s.format === "break" && s.stage === "main")
  );

  const mainStarts = new Set(stageSlots.filter((s) => s.stage === "main").map((s) => s.startTime));
  const sideStarts = new Set(stageSlots.filter((s) => s.stage === "side").map((s) => s.startTime));
  const allTimes = new Set([...mainStarts, ...sideStarts]);

  return [...allTimes].map((time) => ({
    time,
    row: toRow(time),
    mainStart: mainStarts.has(time),
    sideStart: sideStarts.has(time),
    afterShared: sharedEndMinutes.has(timeToMinutes(time)),
  }));
}

// ── Slot backgrounds ────────────────────────────────────────────
const SLOT_BG: Record<SessionFormat, string> = {
  keynote: "bg-[#0f0d08]",
  talk: "bg-[#08090d]",
  panel: "bg-[#0b080e]",
  workshop: "bg-[#080c0a]",
  break: "bg-[#18181b]",
  logistics: "bg-[#0a0a0d]",
};

// ── Slot cell content ───────────────────────────────────────────
function SlotCell({ slot }: { slot: AgendaSlot }) {
  const speakers = (slot.speakerNames ?? (slot.speakerName ? [slot.speakerName] : []))
    .map((name) => SPEAKERS.find((s) => s.name === name))
    .filter(Boolean);
  const isTBA =
    speakers.length === 0 &&
    slot.format !== "keynote" &&
    slot.format !== "logistics" &&
    slot.format !== "break";

  // Keynote — full height, amber accent
  if (slot.format === "keynote") {
    return (
      <div className={`h-full ${SLOT_BG.keynote} px-3 ${SLOT_PAD_TOP} pb-2`}>
        <h4 className="text-sm leading-snug font-medium text-white">
          {slot.title}
        </h4>
        {speakers[0] && (
          <div className="mt-1 flex items-center gap-1.5">
            {speakers[0].linkedinUrl ? (
              <Link href={speakers[0].linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono text-gray-300 hover:text-white transition-colors">
                {speakers[0].name}
              </Link>
            ) : (
              <span className="text-xs font-mono text-gray-300">{speakers[0].name}</span>
            )}
            {speakers[0].company && <span className="text-[11px] text-gray-500">· {speakers[0].company}</span>}
          </div>
        )}
      </div>
    );
  }

  // Welcome / Closing — full height
  if (slot.format === "logistics" && (slot.title === "Welcome" || slot.title === "Closing Remarks")) {
    return (
      <div className={`h-full ${SLOT_BG.logistics} px-3 ${SLOT_PAD_TOP} pb-2`}>
        <h4 className="text-sm leading-snug font-medium text-white">{slot.title}</h4>
      </div>
    );
  }

  // Doors / Registration — same style as breaks
  if (slot.format === "logistics") {
    return (
      <div className={`h-full ${SLOT_BG.break} px-3 ${SLOT_PAD_TOP} pb-2`}>
        <p className="text-sm font-mono text-white">{slot.title}</p>
      </div>
    );
  }

  // Break — full height
  if (slot.format === "break") {
    return (
      <div className={`h-full ${SLOT_BG.break} px-3 ${SLOT_PAD_TOP} pb-2`}>
        <p className="text-sm font-mono text-white">{slot.title}</p>
      </div>
    );
  }

  // Talk / Panel / Workshop — NO h-full (background wraps content only)
  return (
    <div className={`${SLOT_BG[slot.format]} px-3 ${SLOT_PAD_TOP} pb-2 ${isTBA ? "opacity-40" : ""}`}>
      {slot.format === "panel" && (
        <span className="text-[9px] font-mono uppercase tracking-widest bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded mb-1 inline-block">Panel</span>
      )}
      <h4 className={`text-sm leading-snug font-medium ${isTBA ? "text-gray-600 italic" : "text-white"}`}>
        {isTBA ? "To be announced" : slot.title}
      </h4>
      {speakers.length > 0 && (
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {speakers.map((sp, i) => (
            <React.Fragment key={sp!.name}>
              {i > 0 && <span className="text-[11px] text-gray-600">&</span>}
              {sp!.linkedinUrl ? (
                <Link href={sp!.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono text-gray-300 hover:text-white transition-colors">
                  {sp!.name}
                </Link>
              ) : (
                <span className="text-xs font-mono text-gray-300">{sp!.name}</span>
              )}
            </React.Fragment>
          ))}
          {speakers[speakers.length - 1]!.company && (
            <span className="text-[11px] text-gray-500">· {speakers[speakers.length - 1]!.company}</span>
          )}
        </div>
      )}
      {slot.description && <p className="text-[10px] text-gray-500 mt-0.5">{slot.description}</p>}
    </div>
  );
}

// ── Time label cell ─────────────────────────────────────────────
function TimeLabel({ time, isSlotStart, afterShared }: {
  time: string;
  isSlotStart: boolean;
  afterShared: boolean;
}) {
  if (!isSlotStart) return null;
  const pad = afterShared ? AFTER_SHARED_TIME : TIME_OFFSET;
  return (
    <div className={`flex items-start justify-end pr-3 ${pad}`}>
      <span className="text-sm font-mono tabular-nums leading-none text-gray-300 font-semibold">
        {time}
      </span>
    </div>
  );
}

// ── Desktop grid ────────────────────────────────────────────────
function DesktopGrid({ isVisible }: { isVisible: boolean }) {
  const { fullWidth, main, side } = useMemo(() => classify(), []);
  const timeLabels = useMemo(() => buildTimeLabels(fullWidth), [fullWidth]);

  const lastSlot = AGENDA.reduce((a, b) =>
    timeToMinutes(a.endTime) > timeToMinutes(b.endTime) ? a : b
  );
  const totalRows = Math.round((timeToMinutes(lastSlot.endTime) - DAY_START) / MINUTES_PER_ROW) + 1;

  // Times right after full-width events need extra spacing
  const afterFullWidthTimes = useMemo(
    () => new Set(fullWidth.map((s) => s.endTime)),
    [fullWidth]
  );

  // Compressed row template: full-width events use smaller row heights
  // Breaks all get the same total height regardless of duration
  const rowTemplate = useMemo(() => {
    const compressedRows = new Map<number, number>(); // row -> height
    for (const s of fullWidth) {
      if (s.format !== "break" && s.format !== "keynote" && s.format !== "logistics") continue;
      const start = toRow(s.startTime);
      const span = rowSpan(s.startTime, s.endTime);
      const isBreakStyle = s.format === "break" ||
        (s.format === "logistics" && s.title !== "Welcome" && s.title !== "Closing Remarks");
      const height = isBreakStyle
        ? Math.round(BREAK_TARGET_HEIGHT / span)
        : s.format === "keynote"
          ? Math.round(KEYNOTE_TARGET_HEIGHT / span)
          : BREAK_ROW_HEIGHT;
      for (let i = 0; i < span; i++) compressedRows.set(start + i, height);
    }
    return Array.from({ length: totalRows }, (_, i) =>
      compressedRows.has(i + 1) ? `${compressedRows.get(i + 1)}px` : `${ROW_HEIGHT}px`
    ).join(" ");
  }, [fullWidth, totalRows]);

  const gridCols = "4rem 1fr 2rem 4rem 1fr";

  return (
    <div
      className={`hidden lg:block transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "200ms" }}
    >
      {/* Sticky stage headers */}
      <div
        className="sticky top-0 z-20 bg-black border-b border-white/[0.08]"
        style={{ display: "grid", gridTemplateColumns: gridCols }}
      >
        <div className="py-3" />
        <div className="py-3 pl-4 flex items-center">
          <span className="text-lg font-mono font-bold text-white uppercase tracking-widest">Main Stage</span>
        </div>
        <div className="py-3" />
        <div className="py-3" />
        <div className="py-3 pl-4 flex items-center">
          <span className="text-lg font-mono font-bold text-white uppercase tracking-widest">Side Stage</span>
        </div>
      </div>

      {/* The timetable grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: gridCols,
          gridTemplateRows: rowTemplate,
        }}
      >
        {/* Time labels — left column (main stage) */}
        {timeLabels.map(({ time, row, mainStart, afterShared }) => (
          <div key={`tl-${time}`} style={{ gridColumn: "1", gridRow: `${row}` }}>
            <TimeLabel time={time} isSlotStart={mainStart} afterShared={afterShared} />
          </div>
        ))}

        {/* Time labels — right column (side stage) */}
        {timeLabels.map(({ time, row, sideStart, afterShared }) => (
          <div key={`tr-${time}`} style={{ gridColumn: "4", gridRow: `${row}` }}>
            <TimeLabel time={time} isSlotStart={sideStart} afterShared={afterShared} />
          </div>
        ))}

        {/* Full-width events (keynotes, logistics, breaks) */}
        {fullWidth.map((slot) => {
          const displayTime = slot.title === "Welcome" ? "09:00" : slot.startTime;
          const rs = toRow(slot.startTime);
          const re = rs + rowSpan(slot.startTime, slot.endTime);
          return (
            <React.Fragment key={slot.id}>
              <div
                style={{ gridColumn: "1", gridRow: `${rs} / ${re}` }}
                className="z-10 flex items-start justify-end pr-3 pt-[13px] border-y border-white/[0.10]"
              >
                <span className="text-sm font-mono text-gray-300 font-semibold">{displayTime}</span>
              </div>
              <div
                style={{ gridColumn: "2 / 6", gridRow: `${rs} / ${re}` }}
                className="z-10 border-y border-white/[0.10] pt-2"
              >
                <SlotCell slot={slot} />
              </div>
            </React.Fragment>
          );
        })}

        {/* Main stage slots — column 2 */}
        {main.map((slot) => (
          <div
            key={slot.id}
            style={{
              gridColumn: "2",
              gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
            }}
            className={afterFullWidthTimes.has(slot.startTime) ? AFTER_SHARED_SLOT : SLOT_GAP}
          >
            <SlotCell slot={slot} />
          </div>
        ))}

        {/* Side stage slots — column 5 */}
        {side.map((slot) => (
          <div
            key={slot.id}
            style={{
              gridColumn: "5",
              gridRow: `${toRow(slot.startTime)} / ${toRow(slot.startTime) + rowSpan(slot.startTime, slot.endTime)}`,
            }}
            className={afterFullWidthTimes.has(slot.startTime) ? AFTER_SHARED_SLOT : SLOT_GAP}
          >
            <SlotCell slot={slot} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile view ─────────────────────────────────────────────────
function MobileView({ activeStage, isVisible }: { activeStage: "main" | "side"; isVisible: boolean }) {
  const rows = useMemo(() => {
    const slots = AGENDA.filter(
      (s) => s.stage === activeStage || (s.stage === "main" && (s.format === "logistics" || s.format === "keynote" || s.format === "break"))
    ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

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

// ── Export ───────────────────────────────────────────────────────
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
    <section ref={ref} id="schedule" className="relative w-full bg-black py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05] text-center">
            Agenda
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-2 text-center">One day. Two stages.</p>
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
