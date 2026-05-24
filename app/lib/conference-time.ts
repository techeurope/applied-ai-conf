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
 * Debug clock override. Two sticky URL params (stashed in sessionStorage):
 *
 *   ?__now=HH:MM        — fakes the wall clock (used to preview live state)
 *   ?__date=YYYY-MM-DD  — fakes today's date (preview "in N days" or post-conf)
 *
 * Either can be set with `=off` (or empty) to clear it. They compose freely —
 * `?__date=2026-05-26&__now=10:15` previews two days before, at 10:15. Pre-set
 * `__now` with no `__date` still implies conference day (legacy behaviour).
 *
 * No effect on the server or on production users who never visit a URL with
 * the param.
 */
const DEMO_TIME_KEY = "aac:demo-now";
const DEMO_DATE_KEY = "aac:demo-date";

export function applyDemoClockFromUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);

  const t = params.get("__now");
  if (t !== null) {
    try {
      if (t === "off" || t === "") {
        window.sessionStorage.removeItem(DEMO_TIME_KEY);
      } else if (/^\d{1,2}:\d{2}$/.test(t)) {
        window.sessionStorage.setItem(DEMO_TIME_KEY, t);
      }
    } catch {
      /* sessionStorage disabled — ignore */
    }
  }

  const d = params.get("__date");
  if (d !== null) {
    try {
      if (d === "off" || d === "") {
        window.sessionStorage.removeItem(DEMO_DATE_KEY);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        window.sessionStorage.setItem(DEMO_DATE_KEY, d);
      }
    } catch {
      /* ignore */
    }
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

function parseDate(v: string | null | undefined): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return v;
}

function readDemoClock(): { nowMinutes: number; nowHHMM: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = parseHHMM(new URLSearchParams(window.location.search).get("__now"));
    if (fromUrl) return fromUrl;
  } catch {
    /* malformed url — fall through */
  }
  try {
    return parseHHMM(window.sessionStorage.getItem(DEMO_TIME_KEY));
  } catch {
    return null;
  }
}

function readDemoDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = parseDate(new URLSearchParams(window.location.search).get("__date"));
    if (fromUrl) return fromUrl;
  } catch {
    /* fall through */
  }
  try {
    return parseDate(window.sessionStorage.getItem(DEMO_DATE_KEY));
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
  const realDate = `${get("year")}-${get("month")}-${get("day")}`;
  const realHour = parseInt(get("hour"), 10) || 0;
  const realMinute = parseInt(get("minute"), 10) || 0;

  const demoTime = readDemoClock();
  const demoDate = readDemoDate();

  // Effective date: explicit __date wins → otherwise, if only __now is set we
  // treat it as a conference-day preview (legacy) → otherwise real today.
  const effectiveDate = demoDate ?? (demoTime ? CONFERENCE_DATE : realDate);

  // Effective time: __now wins; otherwise real.
  const effectiveMinutes = demoTime ? demoTime.nowMinutes : realHour * 60 + realMinute;
  const effectiveHHMM = demoTime
    ? demoTime.nowHHMM
    : `${String(realHour).padStart(2, "0")}:${String(realMinute).padStart(2, "0")}`;

  const today = new Date(`${effectiveDate}T00:00:00Z`);
  const conf = new Date(`${CONFERENCE_DATE}T00:00:00Z`);
  const daysUntil = Math.round((conf.getTime() - today.getTime()) / 86_400_000);

  return {
    isConferenceDay: effectiveDate === CONFERENCE_DATE,
    daysUntil,
    nowMinutes: effectiveMinutes,
    nowHHMM: effectiveHHMM,
  };
}

// Generic slot shape — works with the static `AgendaSlot` AND the Convex
// `api.agenda.list` return type (which adds _id, slug, startMinutes, etc).
type TimedSlot = Pick<AgendaSlot, "startTime" | "endTime" | "stage" | "speakerName">;

export function isLive<S extends Pick<AgendaSlot, "startTime" | "endTime">>(
  slot: S,
  nowMinutes: number,
): boolean {
  return (
    nowMinutes >= timeToMinutes(slot.startTime) &&
    nowMinutes < timeToMinutes(slot.endTime)
  );
}

export function minutesUntilStart<S extends Pick<AgendaSlot, "startTime">>(
  slot: S,
  nowMinutes: number,
): number {
  return timeToMinutes(slot.startTime) - nowMinutes;
}

// Pick the slot per stage that's currently live (or null).
export function liveSlots<S extends TimedSlot>(slots: S[], nowMinutes: number): S[] {
  return slots.filter((s) => isLive(s, nowMinutes));
}

// Per stage, the next slot starting > now, optionally within a horizon.
export function nextSlotsByStage<S extends TimedSlot>(
  slots: S[],
  nowMinutes: number,
  withinMinutes = 999,
): Record<string, S> {
  const result: Record<string, S> = {};
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

export function findSpeakerSlots<S extends Pick<AgendaSlot, "speakerName">>(
  slots: S[],
  speakerName: string,
): S[] {
  if (!speakerName) return [];
  const lower = speakerName.toLowerCase().trim();
  return slots.filter((s) => (s.speakerName ?? "").toLowerCase().trim() === lower);
}
