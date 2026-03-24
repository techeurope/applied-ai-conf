"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { AGENDA } from "@/data/agenda";
import { SPEAKERS } from "@/data/speakers";
import type { AgendaSlot, SessionFormat } from "@/types";

const FORMAT_STYLES: Record<
  SessionFormat,
  { label: string; bg: string; text: string }
> = {
  keynote: {
    label: "Keynote",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
  },
  talk: { label: "Talk", bg: "bg-white/[0.06]", text: "text-gray-400" },
  panel: { label: "Panel", bg: "bg-violet-500/15", text: "text-violet-400" },
  workshop: {
    label: "Workshop",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
  },
  break: { label: "Break", bg: "bg-white/[0.04]", text: "text-gray-600" },
  logistics: {
    label: "",
    bg: "bg-white/[0.04]",
    text: "text-gray-600",
  },
};

function FormatBadge({ format }: { format: SessionFormat }) {
  const style = FORMAT_STYLES[format];
  if (!style.label) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

type Block =
  | { type: "break"; slot: AgendaSlot }
  | { type: "group"; slots: AgendaSlot[] };

function groupIntoBlocks(slots: AgendaSlot[]): Block[] {
  const blocks: Block[] = [];
  let currentGroup: AgendaSlot[] = [];

  for (const slot of slots) {
    if (slot.format === "break" || slot.format === "logistics") {
      if (currentGroup.length > 0) {
        blocks.push({ type: "group", slots: currentGroup });
        currentGroup = [];
      }
      blocks.push({ type: "break", slot });
    } else {
      currentGroup.push(slot);
    }
  }
  if (currentGroup.length > 0) {
    blocks.push({ type: "group", slots: currentGroup });
  }
  return blocks;
}

function SlotInBlock({ slot }: { slot: AgendaSlot }) {
  const speaker = slot.speakerName
    ? SPEAKERS.find((s) => s.name === slot.speakerName)
    : null;
  const isTBA = !slot.speakerName;

  return (
    <div
      className={`p-4 ${
        isTBA ? "opacity-50" : ""
      }`}
    >
      {/* Time + Format row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-gray-500 tabular-nums tracking-wide">
          {slot.startTime} – {slot.endTime}
        </span>
        {!isTBA && <FormatBadge format={slot.format} />}
      </div>

      {/* Title */}
      <h4
        className={`text-[0.95rem] leading-snug font-medium ${
          isTBA ? "text-gray-600 italic" : "text-white"
        }`}
      >
        {isTBA ? "To be announced" : slot.title}
      </h4>

      {/* Speaker */}
      {speaker && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {speaker.linkedinUrl ? (
            <Link
              href={speaker.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-gray-400 transition-colors duration-200 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {speaker.name}
            </Link>
          ) : (
            <span className="text-sm font-mono text-gray-400">
              {speaker.name}
            </span>
          )}
          {speaker.company && (
            <span className="text-xs text-gray-600">· {speaker.company}</span>
          )}
        </div>
      )}

      {/* Description (e.g. "Joint talk with Jakob Emmerling") */}
      {slot.description && (
        <p className="text-xs text-gray-600 mt-1">{slot.description}</p>
      )}
    </div>
  );
}

function BreakDivider({ slot }: { slot: AgendaSlot }) {
  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <span className="text-[11px] font-mono text-gray-600 tabular-nums whitespace-nowrap">
        {slot.startTime}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-xs text-gray-600 font-mono">{slot.title}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function StageColumn({
  blocks,
  isVisible,
  stageIndex,
}: {
  blocks: Block[];
  isVisible: boolean;
  stageIndex: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, blockIdx) => {
        const delay = 150 + (stageIndex * 5 + blockIdx) * 60;

        if (block.type === "break") {
          return (
            <div
              key={block.slot.id}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <BreakDivider slot={block.slot} />
            </div>
          );
        }

        return (
          <div
            key={block.slots.map((s) => s.id).join("-")}
            className={`rounded-xl border border-white/[0.05] bg-white/[0.02] overflow-hidden transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: `${delay}ms` }}
          >
            {block.slots.map((slot, slotIdx) => (
              <div key={slot.id}>
                <SlotInBlock slot={slot} />
                {slotIdx < block.slots.length - 1 && (
                  <div className="mx-4 border-b border-white/[0.04]" />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function Agenda() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStage, setActiveStage] = useState<"main" | "side">("main");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const mainBlocks = useMemo(
    () => groupIntoBlocks(AGENDA.filter((s) => s.stage === "main")),
    []
  );
  const sideBlocks = useMemo(
    () => groupIntoBlocks(AGENDA.filter((s) => s.stage === "side")),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="schedule"
      className="relative w-full bg-black py-28 lg:py-40"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05]">
            One day. Two stages.
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-4">
            What keeps engineers and builders up at night.
          </p>
        </div>

        {/* Mobile stage tabs */}
        <div
          className={`flex lg:hidden mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setActiveStage("main")}
              className={`rounded-md px-4 py-2 text-sm font-mono transition-all duration-200 ${
                activeStage === "main"
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Main Stage
            </button>
            <button
              onClick={() => setActiveStage("side")}
              className={`rounded-md px-4 py-2 text-sm font-mono transition-all duration-200 ${
                activeStage === "side"
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Side Stage
            </button>
          </div>
        </div>

        {/* Desktop: two columns / Mobile: single column with tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Main Stage */}
          <div
            className={`${activeStage === "main" ? "block" : "hidden"} lg:block`}
          >
            <div
              className={`hidden lg:flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06] transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="h-2 w-2 rounded-full bg-white/40" />
              <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                Main Stage
              </h3>
            </div>
            <StageColumn
              blocks={mainBlocks}
              isVisible={isVisible}
              stageIndex={0}
            />
          </div>

          {/* Side Stage */}
          <div
            className={`${activeStage === "side" ? "block" : "hidden"} lg:block`}
          >
            <div
              className={`hidden lg:flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06] transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                Side Stage
              </h3>
            </div>
            <StageColumn
              blocks={sideBlocks}
              isVisible={isVisible}
              stageIndex={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
