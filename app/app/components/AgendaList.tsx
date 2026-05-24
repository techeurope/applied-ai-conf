"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Mic } from "lucide-react";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@convex/_generated/api";
import { SPEAKERS } from "@/data/speakers";
import {
  findSpeakerSlots,
  getConferenceClock,
  isLive,
  minutesUntilStart,
  nextSlotsByStage,
  timeToMinutes,
} from "@/lib/conference-time";
import { LiveSessionCard } from "./LiveSessionCard";

type Slot = NonNullable<ReturnType<typeof useQuery<typeof api.agenda.list>>>[number];
type StageFilter = "all" | "main" | "side";

const STAGE_STYLES: Record<string, string> = {
  main: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  side: "bg-violet-400/15 text-violet-200 ring-violet-300/30",
  expo: "bg-amber-400/15 text-amber-200 ring-amber-300/30",
};

// Distinct hues cycled per conflict group so paired cards share a color
// at a glance. Solid stripe + translucent pill keep dark-bg cohesion.
const CONFLICT_COLORS = [
  {
    stripe: "bg-amber-400",
    pill: "bg-amber-500/30 text-amber-50 ring-amber-300/60 hover:bg-amber-500/50",
  },
  {
    stripe: "bg-cyan-400",
    pill: "bg-cyan-500/30 text-cyan-50 ring-cyan-300/60 hover:bg-cyan-500/50",
  },
  {
    stripe: "bg-fuchsia-400",
    pill: "bg-fuchsia-500/30 text-fuchsia-50 ring-fuchsia-300/60 hover:bg-fuchsia-500/50",
  },
  {
    stripe: "bg-lime-400",
    pill: "bg-lime-500/30 text-lime-50 ring-lime-300/60 hover:bg-lime-500/50",
  },
  {
    stripe: "bg-orange-400",
    pill: "bg-orange-500/30 text-orange-50 ring-orange-300/60 hover:bg-orange-500/50",
  },
] as const;

const SCROLL_KEY = "agenda:last-opened-slot";

// Derive `Speaker Name(s)`, `Company`, and per-speaker photos for a slot.
// Company comes from the last speaker (matches the marketing site
// convention for joint talks). Images are returned as an array (one entry
// per speaker that has a photo) so the render layer can show 1, 2, or
// more side-by-side inside the same outer avatar box — no layout shift
// between solo and joint sessions.
function speakerLines(slot: Pick<Slot, "speakerName" | "speakerNames">): {
  speaker: string;
  company: string;
  images: Array<{ src: string; alt: string }>;
} {
  const names = slot.speakerNames ?? (slot.speakerName ? [slot.speakerName] : []);
  if (names.length === 0) return { speaker: "", company: "", images: [] };
  const profiles = names.map((n) => SPEAKERS.find((s) => s.name === n));
  const lastProfile = profiles[profiles.length - 1];
  const images: Array<{ src: string; alt: string }> = [];
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    const src = p?.imageTransparent || p?.image;
    if (src) images.push({ src, alt: p?.imageAlt ?? names[i] });
  }
  return {
    speaker: names.join(" & "),
    company: lastProfile?.company ?? "",
    images,
  };
}

// Match by lowercase substring so renamed-but-recognisable titles
// ("Lunch Break", "Lunch & Networking") still resolve. Order matters —
// most specific match first.
function venueImage(title: string): { src: string; alt: string } | null {
  const t = title.toLowerCase();
  if (t.includes("lunch")) return { src: "/agenda/lunch.png", alt: "Lunch" };
  if (t.includes("coffee")) return { src: "/agenda/coffee.png", alt: "Coffee" };
  if (t.includes("registration") || t.includes("doors"))
    return { src: "/agenda/badge.png", alt: "Registration" };
  if (t.includes("remarks") || t.includes("opening") || t.includes("closing"))
    return { src: "/agenda/mic.png", alt: "Remarks" };
  return null;
}

export function AgendaList({
  preloadedSlots,
  preloadedFavorites,
}: {
  // Optional — when the parent server component preloaded the agenda we
  // hydrate from that (no loading flash, no Convex round-trip on first
  // paint). The reactive subscription still fires under the hood so
  // edits in /app/admin/agenda push to every open browser within ~100ms.
  // When omitted (e.g. AgendaList used inside other client components),
  // we fall back to a plain useQuery.
  preloadedSlots?: Preloaded<typeof api.agenda.list>;
  // Same pattern for the signed-in user's favorites — without this the
  // heart fill state pops in after first paint and causes a 1px layout
  // shift (the conflict-pill on overlapping favorites only renders once
  // `fav` resolves true). Preloading on the server keeps the first paint
  // visually identical to the final hydrated state.
  preloadedFavorites?: Preloaded<typeof api.favorites.list>;
}) {
  const queriedSlots = useQuery(api.agenda.list, preloadedSlots ? "skip" : {});
  const preloaded = preloadedSlots ? usePreloadedQuery(preloadedSlots) : null;
  const slots = preloaded ?? queriedSlots ?? [];
  const queriedFavorites = useQuery(
    api.favorites.list,
    preloadedFavorites ? "skip" : {},
  );
  const preloadedFavs = preloadedFavorites
    ? usePreloadedQuery(preloadedFavorites)
    : null;
  const favorites = preloadedFavs ?? queriedFavorites;
  const me = useQuery(api.users.me);
  const addFavorite = useMutation(api.favorites.add);
  const removeFavorite = useMutation(api.favorites.remove);

  const [stage, setStage] = useState<StageFilter>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 15s so the LIVE indicator + progress bar stay live.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const liveSlots = clock.isConferenceDay
    ? slots.filter((s) => isLive(s, clock.nowMinutes))
    : [];
  const liveTalks = liveSlots.filter(
    (s) => s.format !== "break" && s.format !== "logistics",
  );
  const liveVenueRaw = liveSlots.filter(
    (s) => s.format === "break" || s.format === "logistics",
  );
  const liveVenue: typeof liveVenueRaw = [];
  const seenVenue = new Set<string>();
  for (const s of liveVenueRaw) {
    const key = `${s.title}|${s.startTime}`;
    if (seenVenue.has(key)) continue;
    seenVenue.add(key);
    liveVenue.push(s);
  }
  const nextByStage = clock.isConferenceDay
    ? nextSlotsByStage(
        slots.filter((s) => s.format !== "logistics" && s.format !== "break"),
        clock.nowMinutes,
        90,
      )
    : {};
  const upNext = Object.values(nextByStage).filter((s) => !liveTalks.includes(s));

  const scrollToSlot = (slotId: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(`agenda-${slotId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-white/40");
    window.setTimeout(() => {
      el.classList.remove("ring-2", "ring-white/40");
    }, 1500);
  };

  const favSet = useMemo(() => new Set(favorites ?? []), [favorites]);

  const visible = useMemo(() => {
    return slots.filter((s) => {
      // expo events (breaks, lunch, registration) are venue-wide — they show
      // regardless of which stage filter is active.
      if (stage !== "all" && s.stage !== stage && s.stage !== "expo") {
        return false;
      }
      if (onlyFavorites && !favSet.has(s.id)) return false;
      return true;
    });
  }, [slots, stage, onlyFavorites, favSet]);

  // Group visible slots by (startTime, endTime) so parallel main + side
  // sessions share one time header on top — no duplicate "14:05–14:35"
  // when both stages are showing. Solo time slots render the same header
  // with just one card underneath.
  const visibleGroups = useMemo(() => {
    const order: string[] = [];
    const buckets = new Map<
      string,
      { startTime: string; endTime: string; slots: Slot[] }
    >();
    for (const s of visible) {
      const key = `${s.startTime}-${s.endTime}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { startTime: s.startTime, endTime: s.endTime, slots: [] };
        buckets.set(key, bucket);
        order.push(key);
      }
      bucket.slots.push(s);
    }
    return order.map((k) => buckets.get(k)!);
  }, [visible]);

  // Restore scroll position to the last-opened session when we come back to
  // this page from /app/agenda/[slug]. Stash the slug on click below, then
  // scroll it into view (centered) once Convex data has loaded.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (slots.length === 0) return;
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(SCROLL_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    const el = document.getElementById(`agenda-${raw}`);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    try {
      window.sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      /* ignore */
    }
  }, [slots]);

  const favoritesCount = useMemo(
    () => slots.filter((s) => favSet.has(s.id)).length,
    [slots, favSet],
  );

  // Map of slot.id -> other favorited slots that overlap in time. Breaks /
  // logistics never count as conflicts (venue-wide, not a choice).
  const conflicts = useMemo(() => {
    const out = new Map<string, Slot[]>();
    const competing = slots.filter(
      (s) => favSet.has(s.id) && s.format !== "break" && s.format !== "logistics",
    );
    for (const a of competing) {
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      const overlaps = competing.filter((b) => {
        if (b.id === a.id) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return aStart < bEnd && bStart < aEnd;
      });
      if (overlaps.length > 0) out.set(a.id, overlaps);
    }
    return out;
  }, [slots, favSet]);

  // Assign a hue per *conflict group* (connected component) so two cards
  // that clash share the same color and the eye can pair them while
  // scrolling. Groups are computed deterministically by start-time so
  // toggling an unrelated favorite doesn't reshuffle existing colors.
  const conflictColorBySlot = useMemo(() => {
    const out = new Map<string, (typeof CONFLICT_COLORS)[number]>();
    const competing = slots
      .filter(
        (s) => favSet.has(s.id) && s.format !== "break" && s.format !== "logistics",
      )
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const adj = new Map<string, string[]>();
    for (const s of competing) adj.set(s.id, []);
    for (let i = 0; i < competing.length; i++) {
      for (let j = i + 1; j < competing.length; j++) {
        const a = competing[i];
        const b = competing[j];
        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        if (aStart < bEnd && bStart < aEnd) {
          adj.get(a.id)!.push(b.id);
          adj.get(b.id)!.push(a.id);
        }
      }
    }
    const seen = new Set<string>();
    let groupIdx = 0;
    for (const s of competing) {
      if (seen.has(s.id) || adj.get(s.id)!.length === 0) continue;
      const color = CONFLICT_COLORS[groupIdx % CONFLICT_COLORS.length];
      const queue = [s.id];
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        out.set(id, color);
        for (const next of adj.get(id) ?? []) {
          if (!seen.has(next)) queue.push(next);
        }
      }
      groupIdx++;
    }
    return out;
  }, [slots, favSet]);

  async function toggle(slot: Slot) {
    if (favSet.has(slot.id)) {
      await removeFavorite({ sessionSlug: slot.id });
    } else {
      await addFavorite({ sessionSlug: slot.id });
    }
  }

  const hasRightNow =
    clock.isConferenceDay &&
    (liveTalks.length > 0 || liveVenue.length > 0 || upNext.length > 0);

  // Speaker callout: if the signed-in user is a speaker with a talk live now
  // or starting within 2h, surface it above everything else.
  const upcomingSpeakerSlot = (() => {
    if (!me?.isSpeaker || !clock.isConferenceDay) return null;
    const mine = findSpeakerSlots(slots, me.name ?? "").sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
    if (mine.length === 0) return null;
    const liveOne = mine.find((s) => isLive(s, clock.nowMinutes));
    if (liveOne) return liveOne;
    const next = mine.find((s) => minutesUntilStart(s, clock.nowMinutes) > 0);
    return next ?? null;
  })();
  const speakerMinutesUntil = upcomingSpeakerSlot
    ? minutesUntilStart(upcomingSpeakerSlot, clock.nowMinutes)
    : null;
  const showSpeakerCallout =
    upcomingSpeakerSlot !== null &&
    speakerMinutesUntil !== null &&
    speakerMinutesUntil <= 120;

  return (
    <div className="space-y-3">
      {showSpeakerCallout && upcomingSpeakerSlot && (
        <Link
          href={`/app/agenda/${upcomingSpeakerSlot.id}`}
          className="block rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/40 p-4 space-y-2 [box-shadow:0_0_40px_-12px_rgba(52,211,153,0.45)] hover:bg-emerald-400/15 transition-colors"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200 flex items-center gap-1.5">
            <Mic className="size-3" strokeWidth={2.25} />
            {speakerMinutesUntil! <= 0
              ? "You're speaking right now"
              : `You're speaking in ${formatMinutes(speakerMinutesUntil!)}`}
          </p>
          <p className="text-base sm:text-lg text-white font-medium leading-snug">
            {upcomingSpeakerSlot.title}
          </p>
          <p className="text-xs text-white/70">
            {upcomingSpeakerSlot.startTime}–{upcomingSpeakerSlot.endTime} · {upcomingSpeakerSlot.stage} stage
          </p>
        </Link>
      )}

      {hasRightNow && (
        <section className="space-y-2 pb-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            // RIGHT NOW · {clock.nowHHMM}
          </p>
          <div className="space-y-2">
            {liveTalks.map((s) => (
              <LiveSessionCard
                key={s._id}
                slot={s}
                nowMinutes={clock.nowMinutes}
                isLive
                variant="button"
                onClick={() => scrollToSlot(s.id)}
              />
            ))}
            {liveVenue.map((s) => (
              <article
                key={s._id}
                className="rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/30 p-4 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30">
                    <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
                    Now
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-white/50">
                    {s.startTime}–{s.endTime}
                  </span>
                </div>
                <p className="text-sm text-white leading-snug">{s.title}</p>
              </article>
            ))}
          </div>

          {upNext.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                Up next · in {formatMinutes(minutesUntilStart(upNext[0], clock.nowMinutes))}
              </p>
              <ul className="space-y-1">
                {upNext.map((s) => (
                  <li key={s._id}>
                    <button
                      type="button"
                      onClick={() => scrollToSlot(s.id)}
                      className="w-full text-left flex items-baseline gap-2 text-xs hover:text-white transition-colors"
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
                      {s.speakerName && (
                        <span className="text-white/40 truncate">· {s.speakerName}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div
        className="sticky z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/85 backdrop-blur-xl border-b border-white/5"
        style={{
          // AppShell sets --app-header-h on the page wrapper after it
          // measures the sticky header at runtime. Falls back to a sane
          // hardcoded value before measurement lands so the bar sticks
          // somewhere reasonable on the very first paint.
          top: "calc(var(--app-header-h, 92px) + env(safe-area-inset-top))",
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <FilterPill active={stage === "all"} onClick={() => setStage("all")}>
            All stages
          </FilterPill>
          <FilterPill active={stage === "main"} onClick={() => setStage("main")}>
            Main
          </FilterPill>
          <FilterPill active={stage === "side"} onClick={() => setStage("side")}>
            Side
          </FilterPill>
          <span className="mx-1 h-5 w-px bg-white/10 shrink-0" aria-hidden />
          <FilterPill
            active={onlyFavorites}
            onClick={() => setOnlyFavorites((v) => !v)}
            icon
          >
            <Heart
              className="size-3.5"
              strokeWidth={1.75}
              fill={onlyFavorites ? "currentColor" : "none"}
            />
            Favorites{favoritesCount ? ` (${favoritesCount})` : ""}
          </FilterPill>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-white/60 px-1 pt-4">
          {onlyFavorites && favoritesCount === 0
            ? "No favorites yet. Tap the heart on a session to add it."
            : "No sessions match the current filter."}
        </p>
      ) : (
        <ol className="space-y-5">
          {visibleGroups.map((group) => (
            <li key={`${group.startTime}-${group.endTime}`} className="space-y-2">
              <h2 className="font-mono text-base sm:text-lg font-semibold tabular-nums text-white px-1">
                {group.startTime}
                <span className="text-white/60 mx-2">–</span>
                {group.endTime}
              </h2>
              <div className="space-y-2">
                {group.slots.map((slot) => {
            const fav = favSet.has(slot.id);
            const isVenueFormat =
              slot.format === "break" || slot.format === "logistics";
            const stageClass = STAGE_STYLES[slot.stage] ?? "bg-white/10 text-white/60 ring-white/15";
            const live = clock.isConferenceDay && isLive(slot, clock.nowMinutes);
            const liveTalk = live && !isVenueFormat;
            const liveVenue = live && isVenueFormat;
            const { speaker, company, images: speakerImages } = speakerLines(slot);
            const fallbackImage =
              speakerImages.length === 0 ? venueImage(slot.title) : null;
            const images = fallbackImage ? [fallbackImage] : speakerImages;
            const slotConflicts = fav ? conflicts.get(slot.id) : undefined;
            const conflictColor = fav ? conflictColorBySlot.get(slot.id) : undefined;
            return (
              <article
                key={slot.id}
                id={`agenda-${slot.id}`}
                className={`glass-card rounded-xl p-4 transition-shadow relative ${
                  liveTalk
                    ? "ring-2 ring-rose-400/60"
                    : liveVenue
                      ? "ring-2 ring-amber-400/40"
                      : ""
                }`}
              >
                <Link
                  href={`/app/agenda/${slot.id}`}
                  onClick={() => {
                    try {
                      window.sessionStorage.setItem(SCROLL_KEY, slot.id);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label={`Open ${slot.title}`}
                />

                {/* Conflict signals — absolute, no layout impact. The stripe
                    ties paired cards together; the pill is the explicit label
                    and click target. Both share one color per conflict group. */}
                {conflictColor && (
                  <>
                    <span
                      aria-hidden
                      className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${conflictColor.stripe}`}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const partner = slotConflicts?.[0];
                        if (partner) scrollToSlot(partner.id);
                      }}
                      title={
                        slotConflicts
                          ? `Clashes with: ${slotConflicts.map((c) => c.title).join(" · ")}`
                          : "Conflict"
                      }
                      aria-label={
                        slotConflicts
                          ? `Clashes with ${slotConflicts.length} favorited session${slotConflicts.length > 1 ? "s" : ""}`
                          : "Conflict"
                      }
                      className={`absolute z-20 -top-2 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] ring-1 transition-colors cursor-pointer ${conflictColor.pill}`}
                    >
                      Conflict
                      {slotConflicts && slotConflicts.length > 1 && (
                        <span className="font-mono text-[10px] leading-none tabular-nums">
                          {slotConflicts.length}
                        </span>
                      )}
                    </button>
                  </>
                )}

                <div className="flex gap-3 sm:gap-4">
                  {/* Speaker photo(s) — joint talks render two photos
                      split inside the same outer box so the row height
                      stays identical between solo and joint sessions.
                      Venue/break rows have no photos and skip the column. */}
                  {images.length > 0 && (
                    <div className="size-20 sm:size-24 rounded-lg ring-1 ring-white/10 overflow-hidden shrink-0 bg-white/[0.03] flex">
                      {images.slice(0, 2).map((img, i) => (
                        <div
                          key={i}
                          className={`h-full ${
                            images.length === 1 ? "w-full" : "w-1/2"
                          } ${i > 0 ? "border-l border-white/10" : ""}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Meta row — stage pill (or live/now), then speaker
                        name, then company. Heart sits on the right. Order
                        intentionally: identity comes first, the talk title
                        is the focus below. */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                        {liveTalk ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30 shrink-0">
                            <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
                            Live
                          </span>
                        ) : liveVenue ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30 shrink-0">
                            <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
                            Now
                          </span>
                        ) : (
                          <span
                            className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 shrink-0 ${stageClass}`}
                          >
                            {slot.stage}
                          </span>
                        )}
                        {speaker && (
                          <span className="text-sm text-white truncate min-w-0">
                            {speaker}
                          </span>
                        )}
                        {company && (
                          <>
                            <span className="text-white/30 shrink-0">·</span>
                            <span className="text-xs sm:text-sm text-white/55 truncate min-w-0">
                              {company}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {me === null ? (
                          <a
                            href={`/api/auth/sign-in?return_to=${encodeURIComponent("/app/agenda")}`}
                            title="Sign in to favorite"
                            className="relative z-10 p-1 rounded-full text-white/20 hover:text-white/60 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="size-4" strokeWidth={1.75} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggle(slot)}
                            aria-label={fav ? "Remove from my agenda" : "Add to my agenda"}
                            className={`relative z-10 p-1 rounded-full transition-colors ${
                              fav
                                ? "text-rose-400 hover:text-rose-300"
                                : "text-white/30 hover:text-white/70"
                            }`}
                          >
                            <Heart
                              className="size-4"
                              strokeWidth={1.75}
                              fill={fav ? "currentColor" : "none"}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Title — on mobile (< sm) lets it wrap as many lines
                        as it needs so the user always sees the full title.
                        On sm+ we constrain to 2 lines with ellipsis so the
                        card stays compact and visually uniform; max-width
                        ~80% leaves breathing room for the right column +
                        any future trailing actions. */}
                    <h3 className="text-lg sm:text-xl font-medium text-white leading-snug sm:line-clamp-2 sm:max-w-[80%]">
                      {slot.title}
                    </h3>
                  </div>
                </div>
              </article>
            );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function formatMinutes(min: number): string {
  if (min < 0) return `${-min} min ago`;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

function FilterPill({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] ring-1 transition-colors ${
        active
          ? "bg-white text-black ring-white"
          : "text-white/60 ring-white/15 hover:text-white hover:ring-white/30"
      } ${icon ? "" : ""}`}
    >
      {children}
    </button>
  );
}
