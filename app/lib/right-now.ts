import { AGENDA } from "@/data/agenda";
import { isLive, timeToMinutes } from "@/lib/conference-time";
import type { AgendaSlot } from "@/types";

// Compact "what's happening" snapshot. NEVER returns the full agenda; just the
// minimal context the home dashboard needs (current + immediate next).
//
// Includes every format — talks, keynotes, workshops, breaks, logistics
// (Doors Open, Opening Remarks, Closing Remarks). Attendees need to know
// what's actually happening on the stage *right now* and *next*, even if
// the current item isn't a talk. Stage-bound logistics (Opening Remarks
// is on main) naturally falls into liveMain / nextMain. Breaks live on
// the expo stage and surface via liveBreak.
export function rightNowPeek(nowMinutes: number, isConfDay: boolean) {
  if (!isConfDay) return null;

  const liveMain = AGENDA.find((s) => s.stage === "main" && isLive(s, nowMinutes));
  const liveSide = AGENDA.find((s) => s.stage === "side" && isLive(s, nowMinutes));
  const liveBreak = AGENDA.find((s) => s.format === "break" && isLive(s, nowMinutes));

  const nextMain = !liveMain
    ? AGENDA
        .filter((s) => s.stage === "main" && timeToMinutes(s.startTime) > nowMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    : undefined;
  const nextSide = !liveSide
    ? AGENDA
        .filter((s) => s.stage === "side" && timeToMinutes(s.startTime) > nowMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    : undefined;
  // Upcoming break, only if nothing else is live or both nextMain/nextSide
  // start AFTER this break. Avoids surfacing a coffee break as the next
  // thing when a talk also starts before it.
  const nextBreak = !liveBreak
    ? AGENDA
        .filter((s) => s.format === "break" && timeToMinutes(s.startTime) > nowMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    : undefined;

  const hasAny =
    !!liveMain || !!liveSide || !!liveBreak ||
    !!nextMain || !!nextSide || !!nextBreak;
  if (!hasAny) return null;

  return {
    liveMain,
    liveSide,
    liveBreak,
    nextMain,
    nextSide,
    nextBreak,
  } as {
    liveMain?: AgendaSlot;
    liveSide?: AgendaSlot;
    liveBreak?: AgendaSlot;
    nextMain?: AgendaSlot;
    nextSide?: AgendaSlot;
    nextBreak?: AgendaSlot;
  };
}

export function minutesUntilStart(slot: AgendaSlot, nowMinutes: number) {
  return timeToMinutes(slot.startTime) - nowMinutes;
}
