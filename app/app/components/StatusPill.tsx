"use client";

import { useEffect, useState } from "react";
import { getConferenceClock } from "@/lib/conference-time";

// Conference-day status indicator. Shows:
//   • Live · 09:10        — when today is the conference day
//   • in 4 days           — pre-conference
//   • Until next year     — post-conference
//
// The clock is read from sessionStorage (?__now demo override) on the client,
// so the pill renders an invisible-but-same-sized skeleton during SSR + the
// first client render to avoid hydration mismatches.
export function StatusPill() {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/10 px-3 py-1 text-xs text-white/0 shrink-0 select-none">
        <span className="size-1.5" />
        <span aria-hidden>placeholder</span>
      </span>
    );
  }

  const clock = getConferenceClock();

  if (clock.isConferenceDay) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-rose-300/40 bg-rose-400/10 px-3 py-1 text-xs shrink-0">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-75 animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
        </span>
        <span className="text-rose-200 font-mono tabular-nums">
          Live · {clock.nowHHMM}
        </span>
      </span>
    );
  }
  if (clock.daysUntil > 0) {
    return (
      <span className="inline-flex items-baseline gap-1.5 rounded-full ring-1 ring-white/15 px-3 py-1 text-xs text-white/70 shrink-0">
        in <span className="text-white font-medium tabular-nums">{clock.daysUntil}</span>
        {clock.daysUntil === 1 ? "day" : "days"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 px-3 py-1 text-xs text-white/55 shrink-0">
      Until next year
    </span>
  );
}
