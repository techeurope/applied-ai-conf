"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  getConferenceClock,
  isLive,
  nextSlotsByStage,
} from "@/lib/conference-time";

type StageKey = "main" | "side";

export default function StageDmcPage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage: rawStage } = use(params);
  const stage = (rawStage === "main" || rawStage === "side" ? rawStage : "main") as StageKey;
  const agenda = useQuery(api.agenda.list) ?? [];

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const stageAgenda = agenda.filter((s) => s.stage === stage && !s.cancelledAt);
  const liveSlot = clock.isConferenceDay
    ? stageAgenda.find((s) => isLive(s, clock.nowMinutes))
    : null;
  const nextSlot = clock.isConferenceDay
    ? nextSlotsByStage(stageAgenda, clock.nowMinutes)[stage]
    : null;

  const liveProgress = liveSlot
    ? Math.max(
        0,
        Math.min(
          1,
          (clock.nowMinutes -
            parseInt(liveSlot.startTime.split(":")[0], 10) * 60 -
            parseInt(liveSlot.startTime.split(":")[1], 10)) /
            (parseInt(liveSlot.endTime.split(":")[0], 10) * 60 +
              parseInt(liveSlot.endTime.split(":")[1], 10) -
              (parseInt(liveSlot.startTime.split(":")[0], 10) * 60 +
                parseInt(liveSlot.startTime.split(":")[1], 10))),
        ),
      )
    : 0;

  const stageColor =
    stage === "main" ? "text-emerald-300" : "text-violet-300";
  const stageRing =
    stage === "main" ? "ring-emerald-300/30" : "ring-violet-300/30";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-8 sm:p-12 flex flex-col">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Applied AI Conf · {stage} stage
          </p>
          <h1 className={`font-mono text-2xl sm:text-4xl font-bold mt-1 ${stageColor}`}>
            {stage === "main" ? "Main Stage" : "Side Stage"}
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">Now</p>
          <p className="font-mono text-3xl sm:text-5xl font-bold tracking-tighter tabular-nums">
            {clock.nowHHMM}
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-8 py-12">
        {!clock.isConferenceDay && (
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Conference day
            </p>
            <p className="font-mono text-6xl sm:text-8xl font-bold tracking-tighter">
              {clock.daysUntil > 0
                ? `${clock.daysUntil} ${clock.daysUntil === 1 ? "day" : "days"} to go`
                : "Conference has ended"}
            </p>
          </div>
        )}

        {clock.isConferenceDay && (
          <>
            {liveSlot ? (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="size-2.5 rounded-full bg-rose-400 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-300">
                    Live now · {liveSlot.startTime}–{liveSlot.endTime}
                  </p>
                </div>
                <h2 className="font-mono text-4xl sm:text-6xl font-bold tracking-tighter leading-[1.05] text-glow">
                  {liveSlot.title}
                </h2>
                {liveSlot.speakerName && (
                  <p className="font-mono text-2xl sm:text-3xl text-white/80">
                    {liveSlot.speakerName}
                  </p>
                )}
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mt-6">
                  <div
                    className="h-full bg-rose-400 transition-all duration-500"
                    style={{ width: `${liveProgress * 100}%` }}
                  />
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-200">
                  Between sessions
                </p>
                <h2 className="font-mono text-3xl sm:text-5xl font-bold tracking-tighter text-white/60">
                  Stand by — the next session starts soon.
                </h2>
              </section>
            )}

            {nextSlot && nextSlot !== liveSlot && (
              <section
                className={`rounded-2xl p-6 sm:p-8 ring-1 ${stageRing} bg-white/[0.02] space-y-2`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                  Up next · {nextSlot.startTime} ({startsIn(nextSlot.startTime, clock.nowMinutes)})
                </p>
                <p className="font-mono text-2xl sm:text-4xl font-bold tracking-tighter leading-[1.1]">
                  {nextSlot.title}
                </p>
                {nextSlot.speakerName && (
                  <p className="font-mono text-lg sm:text-xl text-white/70">
                    {nextSlot.speakerName}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <footer className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
        auto-refresh every 10s · conference.techeurope.io
      </footer>
    </div>
  );
}

function startsIn(startTime: string, nowMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const delta = h * 60 + m - nowMinutes;
  if (delta <= 0) return "now";
  if (delta < 60) return `in ${delta} min`;
  const hh = Math.floor(delta / 60);
  const mm = delta % 60;
  return `in ${hh}h${mm ? ` ${mm}m` : ""}`;
}
