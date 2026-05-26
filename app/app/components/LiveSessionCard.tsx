"use client";

import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";
import { timeToMinutes } from "@/lib/conference-time";
import type { Speaker } from "@/types";

// Minimum shape the card needs. Works with both static AGENDA entries (id =
// slug) and the Convex api.agenda.list shape (which also has id + _id, etc).
export type LiveSessionSlot = {
  id: string;
  startTime: string;
  endTime: string;
  stage: string;
  title: string;
  speakerName?: string;
  speakerNames?: string[];
};

function speakerLines(slot: Pick<LiveSessionSlot, "speakerName" | "speakerNames">) {
  const names =
    slot.speakerNames && slot.speakerNames.length > 0
      ? slot.speakerNames
      : slot.speakerName
        ? [slot.speakerName]
        : [];
  if (names.length === 0) return { speaker: "", company: "" };
  const last = (SPEAKERS as Speaker[]).find((s) => s.name === names[names.length - 1]);
  return { speaker: names.join(" & "), company: last?.company ?? "" };
}

type Props = {
  slot: LiveSessionSlot;
  nowMinutes: number;
  // When true the card shows the LIVE pill + progress bar. When false it
  // shows an "in N min" hint (used for the up-next slot on the home).
  isLive: boolean;
} & (
  | {
      // Behaviour 1: in-page scroll handler (used inside AgendaList's right-now
      // widget to jump to the row in the same page).
      variant: "button";
      onClick: () => void;
    }
  | {
      // Behaviour 2: navigation link (used on the home → session detail page).
      variant?: "link";
      href?: string;
      onClick?: () => void;
    }
);

export function LiveSessionCard(props: Props) {
  const { slot, nowMinutes, isLive } = props;
  const { speaker, company } = speakerLines(slot);
  const stageRing =
    slot.stage === "main"
      ? "ring-emerald-300/30"
      : slot.stage === "side"
        ? "ring-violet-300/30"
        : "ring-amber-300/30";
  const stageText =
    slot.stage === "main"
      ? "text-emerald-200"
      : slot.stage === "side"
        ? "text-violet-200"
        : "text-amber-200";
  const upcomingMinutes = !isLive
    ? Math.max(0, timeToMinutes(slot.startTime) - nowMinutes)
    : 0;

  const inner = (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
            <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
            Live
          </span>
        )}
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${stageText}`}
        >
          {slot.stage}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-white/50">
          {slot.startTime}–{slot.endTime}
        </span>
        {!isLive && (
          <span className="font-mono text-[10px] tracking-widest text-white/40 ml-auto">
            in {upcomingMinutes}m
          </span>
        )}
      </div>
      <p className="text-sm sm:text-base text-white leading-snug">
        {slot.title}
      </p>
      {speaker && (
        <div className="flex items-baseline gap-1.5 text-xs min-w-0">
          <span className="truncate text-white/70 min-w-0">
            <span className="font-mono text-white/30">› </span>
            {speaker}
          </span>
          {company && (
            <>
              <span className="text-white/30 shrink-0">·</span>
              <span className="truncate text-white/50 min-w-0">{company}</span>
            </>
          )}
        </div>
      )}
      {isLive && (
        <ProgressBar
          start={timeToMinutes(slot.startTime)}
          end={timeToMinutes(slot.endTime)}
          now={nowMinutes}
        />
      )}
    </>
  );

  const baseClass = `w-full text-left rounded-2xl bg-white/[0.03] ring-1 p-4 space-y-2 transition-colors hover:bg-white/[0.05] ${stageRing}`;

  if (props.variant === "button") {
    return (
      <button type="button" onClick={props.onClick} className={baseClass}>
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={props.href ?? `/app/agenda/${slot.id}`}
      onClick={props.onClick}
      className={`block ${baseClass}`}
    >
      {inner}
    </Link>
  );
}

function ProgressBar({
  start,
  end,
  now,
}: {
  start: number;
  end: number;
  now: number;
}) {
  const pct = Math.max(0, Math.min(1, (now - start) / (end - start))) * 100;
  return (
    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full bg-rose-400/80 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
