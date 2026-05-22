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

/**
 * Debug clock override. Reads `?__now=HH:MM` from the URL on the client and
 * stashes it in sessionStorage so subsequent navigations keep the override.
 * `?__now=off` clears it. No effect on the server or on production users who
 * never visit a URL with the param.
 */
const DEMO_KEY = "aac:demo-now";

export function applyDemoClockFromUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("__now");
  if (v === null) return;
  try {
    if (v === "off" || v === "") {
      window.sessionStorage.removeItem(DEMO_KEY);
    } else if (/^\d{1,2}:\d{2}$/.test(v)) {
      window.sessionStorage.setItem(DEMO_KEY, v);
    }
  } catch {
    /* sessionStorage disabled — ignore */
  }
}

function parseHHMM(v: string | null | undefined): { nowMinutes: number; nowHHMM: string } | null {
  if (!v || !/^\d{1,2}:\d{2}$/.test(v)) return null;
  const [hRaw, mRaw] = v.split(":");
  const h = Math.min(23, parseInt(hRaw, 10));
  const min = Math.min(59, parseInt(mRaw, 10));
  return {
    nowMinutes: h * 60 + min,
    nowHHMM: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
  };
}

function readDemoClock(): { nowMinutes: number; nowHHMM: string } | null {
  if (typeof window === "undefined") return null;
  // 1. Query param wins (synchronous, no effect required).
  try {
    const fromUrl = parseHHMM(new URLSearchParams(window.location.search).get("__now"));
    if (fromUrl) return fromUrl;
  } catch {
    /* malformed url — fall through */
  }
  // 2. Sticky session value, set on any prior visit with ?__now=…
  try {
    return parseHHMM(window.sessionStorage.getItem(DEMO_KEY));
  } catch {
    return null;
  }
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

  const demo = readDemoClock();
  if (demo) {
    return {
      isConferenceDay: true,
      daysUntil: 0,
      nowMinutes: demo.nowMinutes,
      nowHHMM: demo.nowHHMM,
    };
  }

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
