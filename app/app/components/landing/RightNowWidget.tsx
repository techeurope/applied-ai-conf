"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  getConferenceClock,
  isLive,
  minutesUntilStart,
  nextSlotsByStage,
  timeToMinutes,
} from "@/lib/conference-time";

// Slim "what's on now" card for the landing page. Reactive (Convex), lives at
// the top of /app. Always tappable through to /app/agenda for the full view.
export function RightNowWidget() {
  const slots = useQuery(api.agenda.list);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  if (!slots) return null;
  if (!clock.isConferenceDay) return null;

  const live = slots.filter((s) => isLive(s, clock.nowMinutes));
  const liveTalks = live.filter(
    (s) => s.format !== "break" && s.format !== "logistics",
  );
  const liveVenue = live.find(
    (s) => s.format === "break" || s.format === "logistics",
  );
  const nextByStage = nextSlotsByStage(
    slots.filter((s) => s.format !== "break" && s.format !== "logistics"),
    clock.nowMinutes,
    120,
  );
  const upNext = Object.values(nextByStage)
    .filter((s) => !liveTalks.includes(s))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (liveTalks.length === 0 && !liveVenue && upNext.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // RIGHT NOW
        </p>
        <Link
          href="/app/agenda"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          full agenda ›
        </Link>
      </div>

      <div className="space-y-2">
        {liveTalks.map((s) => (
          <Link
            key={s._id}
            href={`/app/agenda/${s.id}`}
            className={`block rounded-2xl bg-white/[0.03] ring-1 p-3.5 space-y-1.5 hover:bg-white/[0.05] transition-colors ${
              s.stage === "main" ? "ring-emerald-300/30" : "ring-violet-300/30"
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
                <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
                Live
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                  s.stage === "main" ? "text-emerald-200" : "text-violet-200"
                }`}
              >
                {s.stage}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-white/50">
                {s.startTime}–{s.endTime}
              </span>
            </div>
            <p className="text-sm text-white leading-snug">{s.title}</p>
            {s.speakerName && (
              <p className="text-xs text-white/60">{s.speakerName}</p>
            )}
          </Link>
        ))}
        {liveVenue && (
          <article className="rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/30 p-3.5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30">
                <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
                Now
              </span>
              <span className="font-mono text-[10px] tracking-widest text-white/50">
                {liveVenue.startTime}–{liveVenue.endTime}
              </span>
            </div>
            <p className="text-sm text-white">{liveVenue.title}</p>
          </article>
        )}
      </div>

      {upNext.length > 0 && (
        <div className="pt-1.5 space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Up next · in {formatMinutes(minutesUntilStart(upNext[0], clock.nowMinutes))}
          </p>
          <ul className="space-y-1">
            {upNext.slice(0, 2).map((s) => (
              <li key={s._id}>
                <Link
                  href={`/app/agenda/${s.id}`}
                  className="flex items-baseline gap-2 text-xs hover:text-white transition-colors"
                >
                  <span className="font-mono text-white/30">›</span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                      s.stage === "main" ? "text-emerald-200" : "text-violet-200"
                    }`}
                  >
                    {s.stage}
                  </span>
                  <span className="font-mono text-white/50">{s.startTime}</span>
                  <span className="text-white/80 truncate">{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function formatMinutes(min: number): string {
  if (min < 0) return `${-min} min ago`;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}
