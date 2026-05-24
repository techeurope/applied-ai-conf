import { AGENDA } from "@/data/agenda";
import { isLive, timeToMinutes } from "@/lib/conference-time";
import type { AgendaSlot } from "@/types";

// Compact "what's happening" snapshot. NEVER returns the full agenda; just the
// minimal context the home dashboard needs (current + immediate next).
export function rightNowPeek(nowMinutes: number, isConfDay: boolean) {
  if (!isConfDay) return null;
  const visible = AGENDA.filter((s) => s.format !== "logistics");

  const liveMain = visible.find((s) => s.stage === "main" && isLive(s, nowMinutes));
  const liveSide = visible.find((s) => s.stage === "side" && isLive(s, nowMinutes));
  const liveBreak = visible.find((s) => s.format === "break" && isLive(s, nowMinutes));

  const nextMain = !liveMain
    ? visible
        .filter((s) => s.stage === "main" && s.format !== "break" && timeToMinutes(s.startTime) > nowMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    : undefined;
  const nextSide = !liveSide
    ? visible
        .filter((s) => s.stage === "side" && s.format !== "break" && timeToMinutes(s.startTime) > nowMinutes)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    : undefined;

  const hasAny =
    !!liveMain || !!liveSide || !!liveBreak || !!nextMain || !!nextSide;
  if (!hasAny) return null;

  return {
    liveMain,
    liveSide,
    liveBreak,
    nextMain,
    nextSide,
  } as {
    liveMain?: AgendaSlot;
    liveSide?: AgendaSlot;
    liveBreak?: AgendaSlot;
    nextMain?: AgendaSlot;
    nextSide?: AgendaSlot;
  };
}

export function minutesUntilStart(slot: AgendaSlot, nowMinutes: number) {
  return timeToMinutes(slot.startTime) - nowMinutes;
}
