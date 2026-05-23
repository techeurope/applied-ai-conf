"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Mic } from "lucide-react";
import { api } from "@convex/_generated/api";
import {
  findSpeakerSlots,
  getConferenceClock,
  isLive,
  minutesUntilStart,
  timeToMinutes,
} from "@/lib/conference-time";

// Speaker callout — the only time-bounded gate that earns a slot on the
// landing for signed-in attendees. Only renders when the user is a speaker
// AND their talk is live now or starting within 2h.
export function SignedInCallouts() {
  const me = useQuery(api.users.me);
  const agenda = useQuery(api.agenda.list);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!me || !agenda) return null;
  const clock = getConferenceClock();
  if (!me.isSpeaker || !clock.isConferenceDay) return null;

  const mine = findSpeakerSlots(agenda, me.name ?? "").sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
  const liveOne = mine.find((s) => isLive(s, clock.nowMinutes));
  const next = mine.find((s) => minutesUntilStart(s, clock.nowMinutes) > 0);
  const slot = liveOne ?? next;
  if (!slot) return null;

  const minsUntil = minutesUntilStart(slot, clock.nowMinutes);
  if (minsUntil > 120) return null;

  return (
    <Link
      href={`/app/agenda/${slot.id}`}
      className="block rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/40 p-5 space-y-2 [box-shadow:0_0_40px_-16px_rgba(52,211,153,0.45)] hover:bg-emerald-400/[0.13] transition-colors"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200 flex items-center gap-1.5">
        <Mic className="size-3" strokeWidth={2.25} />
        {minsUntil <= 0
          ? "You're speaking right now"
          : `You're speaking in ${formatMinutes(minsUntil)}`}
      </p>
      <p className="text-base sm:text-lg text-white font-medium leading-snug">
        {slot.title}
      </p>
      <p className="text-xs text-white/70">
        {slot.startTime}–{slot.endTime} · {slot.stage} stage
      </p>
    </Link>
  );
}

function formatMinutes(min: number): string {
  if (min < 0) return `${-min} min ago`;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}
