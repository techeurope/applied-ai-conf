import type { AgendaSlot } from "@/types";

export const CONFERENCE_DATE = "2026-05-28";
export const CONFERENCE_TZ = "Europe/Berlin";

export interface ConferenceClock {
  isConferenceDay: boolean;
  daysUntil: number; // negative if past
  nowMinutes: number; // minutes since 00:00 in CONFERENCE_TZ
  nowHHMM: string;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function getConferenceClock(now: Date = new Date()): ConferenceClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFERENCE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10) || 0;
  const minute = parseInt(get("minute"), 10) || 0;

  // Days until conference, computed in conference tz.
  const today = new Date(`${date}T00:00:00Z`);
  const conf = new Date(`${CONFERENCE_DATE}T00:00:00Z`);
  const daysUntil = Math.round((conf.getTime() - today.getTime()) / 86_400_000);

  return {
    isConferenceDay: date === CONFERENCE_DATE,
    daysUntil,
    nowMinutes: hour * 60 + minute,
    nowHHMM: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function isLive(slot: AgendaSlot, nowMinutes: number): boolean {
  return (
    nowMinutes >= timeToMinutes(slot.startTime) &&
    nowMinutes < timeToMinutes(slot.endTime)
  );
}

export function minutesUntilStart(slot: AgendaSlot, nowMinutes: number): number {
  return timeToMinutes(slot.startTime) - nowMinutes;
}

// Pick the slot per stage that's currently live (or null).
export function liveSlots(slots: AgendaSlot[], nowMinutes: number): AgendaSlot[] {
  return slots.filter((s) => isLive(s, nowMinutes));
}

// Per stage, the next slot starting > now, optionally within a horizon.
export function nextSlotsByStage(
  slots: AgendaSlot[],
  nowMinutes: number,
  withinMinutes = 999,
): Record<string, AgendaSlot> {
  const result: Record<string, AgendaSlot> = {};
  for (const s of slots) {
    const delta = minutesUntilStart(s, nowMinutes);
    if (delta <= 0 || delta > withinMinutes) continue;
    const existing = result[s.stage];
    if (!existing || timeToMinutes(s.startTime) < timeToMinutes(existing.startTime)) {
      result[s.stage] = s;
    }
  }
  return result;
}

export function findSpeakerSlots(slots: AgendaSlot[], speakerName: string): AgendaSlot[] {
  if (!speakerName) return [];
  const lower = speakerName.toLowerCase().trim();
  return slots.filter((s) => (s.speakerName ?? "").toLowerCase().trim() === lower);
}
