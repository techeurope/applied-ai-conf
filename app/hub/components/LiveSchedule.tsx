"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Radio } from "lucide-react";
import { AGENDA } from "@/data/agenda";
import type { AgendaSlot } from "@/types";

const CONFERENCE_DATE = "2026-05-28";

type Stage = "main" | "side";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatSpeaker(slot: AgendaSlot): string | null {
  if ("speakerNames" in slot && slot.speakerNames) {
    return slot.speakerNames.join(" & ");
  }
  if ("speakerName" in slot && slot.speakerName) {
    return slot.speakerName;
  }
  return null;
}

function getNowMinutes(): number {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (today !== CONFERENCE_DATE) {
    return 9 * 60 + 45;
  }
  return now.getHours() * 60 + now.getMinutes();
}

function statusFor(slot: AgendaSlot, nowMin: number): "past" | "live" | "upcoming" {
  const start = toMinutes(slot.startTime);
  const end = toMinutes(slot.endTime);
  if (nowMin < start) return "upcoming";
  if (nowMin >= end) return "past";
  return "live";
}

export function LiveSchedule() {
  const [nowMin, setNowMin] = useState<number>(() => getNowMinutes());
  const [stage, setStage] = useState<Stage>("main");

  useEffect(() => {
    const id = setInterval(() => setNowMin(getNowMinutes()), 30_000);
    return () => clearInterval(id);
  }, []);

  const slots = useMemo(
    () =>
      AGENDA.filter((s) => s.stage === stage).sort(
        (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
      ),
    [stage]
  );

  const liveSlot = slots.find((s) => statusFor(s, nowMin) === "live");
  const upcoming = slots.filter((s) => statusFor(s, nowMin) === "upcoming").slice(0, 4);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-mono text-lg font-semibold text-white">Schedule</h2>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
          {(["main", "side"] as Stage[]).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                stage === s
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {s === "main" ? "Main Stage" : "Side Stage"}
            </button>
          ))}
        </div>
      </div>

      {liveSlot && (
        <div className="mb-5 rounded-xl border border-green-400/30 bg-green-400/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-green-400 font-mono">
              Live now
            </span>
            <span className="text-xs text-neutral-400 font-mono ml-auto">
              {liveSlot.startTime}–{liveSlot.endTime}
            </span>
          </div>
          <div className="text-white font-medium leading-snug">{liveSlot.title}</div>
          {formatSpeaker(liveSlot) && (
            <div className="text-sm text-neutral-400 mt-1">{formatSpeaker(liveSlot)}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-3.5 h-3.5 text-neutral-500" />
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
          Up next
        </span>
      </div>

      <ul className="space-y-2">
        {upcoming.length === 0 && (
          <li className="text-sm text-neutral-500">Nothing else on this stage today.</li>
        )}
        {upcoming.map((slot) => (
          <li
            key={slot.id}
            className="flex items-start gap-4 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
          >
            <div className="font-mono text-xs text-neutral-500 w-12 shrink-0 pt-0.5">
              {slot.startTime}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white leading-snug truncate">{slot.title}</div>
              {formatSpeaker(slot) && (
                <div className="text-xs text-neutral-500 mt-0.5 truncate">
                  {formatSpeaker(slot)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
