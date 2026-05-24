"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { Heart, ChevronLeft, Linkedin, ExternalLink, Ban } from "lucide-react";
import { api } from "@convex/_generated/api";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";
import {
  getConferenceClock,
  isLive,
  minutesUntilStart,
  timeToMinutes,
} from "@/lib/conference-time";

const STAGE_STYLES: Record<string, string> = {
  main: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  side: "bg-violet-400/15 text-violet-200 ring-violet-300/30",
};

function matchSpeaker(name: string | undefined | null): Speaker | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return SPEAKERS.find((s) => s.name.toLowerCase().trim() === lower);
}

export function AgendaDetailClient({
  slug,
  preloadedSlots,
  preloadedFavorites,
}: {
  slug: string;
  // usePreloadedQuery returns the server-fetched value immediately AND
  // subscribes on the client for live updates. No loading flash, and
  // admin edits in /app/admin/agenda push to all open clients live.
  preloadedSlots: Preloaded<typeof api.agenda.list>;
  // Preloading favorites too keeps the "Add to my agenda" /
  // "On your agenda" button in the correct state on first paint.
  preloadedFavorites: Preloaded<typeof api.favorites.list>;
}) {
  const slots = usePreloadedQuery(preloadedSlots);
  const favorites = usePreloadedQuery(preloadedFavorites);
  const addFavorite = useMutation(api.favorites.add);
  const removeFavorite = useMutation(api.favorites.remove);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const me = useQuery(api.users.me);
  const slot = useMemo(
    () => slots?.find((s) => s.id === slug || s.slug === slug),
    [slots, slug],
  );

  if (!slot) {
    return (
      <div className="space-y-3 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // AGENDA
        </p>
        <p className="text-sm text-white/70">Session not found.</p>
        <Link
          href="/app/agenda"
          className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          ‹ back to agenda
        </Link>
      </div>
    );
  }

  // Other favorited slots that overlap with this one (talks only — breaks
  // and logistics aren't a real either/or). Only computed for the signed-in
  // user; visiting unauthed never shows a conflict.
  const conflicts = (() => {
    if (!favorites || !slots) return [];
    if (slot.format === "break" || slot.format === "logistics") return [];
    if (!favorites.includes(slot.id)) return [];
    const myStart = timeToMinutes(slot.startTime);
    const myEnd = timeToMinutes(slot.endTime);
    return slots.filter((s) => {
      if (s.id === slot.id) return false;
      if (s.format === "break" || s.format === "logistics") return false;
      if (!favorites.includes(s.id)) return false;
      const sStart = timeToMinutes(s.startTime);
      const sEnd = timeToMinutes(s.endTime);
      return myStart < sEnd && sStart < myEnd;
    });
  })();

  const cancelled = !!slot.cancelledAt;
  const live = clock.isConferenceDay && isLive(slot, clock.nowMinutes);
  const startsIn = clock.isConferenceDay
    ? minutesUntilStart(slot, clock.nowMinutes)
    : null;
  const isFav = favorites?.includes(slot.id) ?? false;

  const speakerNames =
    slot.speakerNames && slot.speakerNames.length > 0
      ? slot.speakerNames
      : slot.speakerName
        ? [slot.speakerName]
        : [];
  const speakers = speakerNames.map((n) => ({
    name: n,
    profile: matchSpeaker(n),
  }));
  const stageClass = STAGE_STYLES[slot.stage] ?? "bg-white/10 text-white/60 ring-white/15";

  async function toggleFav() {
    if (isFav) await removeFavorite({ sessionSlug: slot!.id });
    else await addFavorite({ sessionSlug: slot!.id });
  }

  return (
    <div className="space-y-6 pt-1">
      <Link
        href="/app/agenda"
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.75} />
        agenda
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 ${stageClass}`}
          >
            {slot.stage}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
            {slot.startTime}–{slot.endTime}
          </span>
          {live && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
              <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
              Live
            </span>
          )}
          {!live && startsIn !== null && startsIn > 0 && startsIn <= 60 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200">
              in {startsIn} min
            </span>
          )}
          {cancelled && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-zinc-500/25 text-zinc-100 ring-1 ring-zinc-400/30">
              <Ban className="size-3" strokeWidth={2} />
              Cancelled
            </span>
          )}
        </div>

        <h1
          className={`font-mono font-bold text-2xl sm:text-3xl tracking-tighter leading-tight ${
            cancelled ? "line-through opacity-60" : ""
          }`}
        >
          {slot.title}
        </h1>

        {me === null ? (
          <a
            href={`/api/auth/sign-in?return_to=${encodeURIComponent(`/app/agenda/${slot!.id}`)}`}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ring-1 text-white/60 ring-white/15 hover:text-white hover:ring-white/30 transition-colors"
          >
            <Heart className="size-3.5" strokeWidth={1.75} />
            Sign in to favorite
          </a>
        ) : (
          <button
            type="button"
            onClick={toggleFav}
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ring-1 transition-colors ${
              isFav
                ? "bg-rose-500/15 text-rose-200 ring-rose-300/40"
                : "text-white/60 ring-white/15 hover:text-white hover:ring-white/30"
            }`}
          >
            <Heart
              className="size-3.5"
              strokeWidth={1.75}
              fill={isFav ? "currentColor" : "none"}
            />
            {isFav ? "On your agenda" : "Add to my agenda"}
          </button>
        )}
      </header>

      {conflicts.length > 0 && (
        <section className="rounded-xl ring-1 ring-amber-300/40 bg-amber-400/[0.06] p-4 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">
            ⚠ // OVERLAPPING FAVORITE{conflicts.length > 1 ? "S" : ""}
          </p>
          <p className="text-xs text-white/70 leading-relaxed">
            You&apos;ve also favorited the following talk
            {conflicts.length > 1 ? "s" : ""} at the same time. You can&apos;t be in two places at once.
          </p>
          <ul className="space-y-1">
            {conflicts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/agenda/${c.id}`}
                  className="flex items-baseline gap-2 text-xs hover:text-white"
                >
                  <span className="font-mono text-white/30">›</span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                      c.stage === "main" ? "text-emerald-200" : "text-violet-200"
                    }`}
                  >
                    {c.stage}
                  </span>
                  <span className="font-mono text-white/50">
                    {c.startTime}–{c.endTime}
                  </span>
                  <span className="text-white/85 truncate">{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {slot.description && (
        <section className="space-y-2">
          <Heading>// ABOUT THIS SESSION</Heading>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-line">
            {slot.description}
          </p>
        </section>
      )}

      {speakers.length > 0 && (
        <section className="space-y-3">
          <Heading>
            // {speakers.length === 1 ? "SPEAKER" : `SPEAKERS · ${speakers.length}`}
          </Heading>
          <div className="space-y-3">
            {speakers.map(({ name, profile }) => (
              <SpeakerCard key={name} name={name} profile={profile} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SpeakerCard({
  name,
  profile,
}: {
  name: string;
  profile: Speaker | undefined;
}) {
  return (
    <article className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-4">
        {profile?.imageTransparent || profile?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.imageTransparent ?? profile.image!}
            alt={profile.imageAlt ?? name}
            className="size-16 sm:size-20 rounded-2xl object-cover bg-white/5 shrink-0"
          />
        ) : (
          <div className="size-16 sm:size-20 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center font-mono text-lg text-white/60 shrink-0">
            {profile?.initial ??
              name
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base text-white">{name}</p>
          {profile?.title && (
            <p className="text-sm text-white/70">{profile.title}</p>
          )}
          {profile?.company && (
            <p className="text-xs text-white/60">
              {profile.companyUrl ? (
                <a
                  href={profile.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  {profile.company}
                  <ExternalLink className="size-3" strokeWidth={1.75} />
                </a>
              ) : (
                profile.company
              )}
            </p>
          )}
        </div>
      </div>

      {profile && (profile.building || profile.vertical) && (
        <dl className="grid grid-cols-1 gap-2">
          {profile.building && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Building
              </dt>
              <dd className="text-sm text-white/80 mt-0.5">{profile.building}</dd>
            </div>
          )}
          {profile.vertical && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                Vertical
              </dt>
              <dd className="text-sm text-white/80 mt-0.5">{profile.vertical}</dd>
            </div>
          )}
        </dl>
      )}

      {profile?.bio && (
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
          {profile.bio}
        </p>
      )}

      {profile?.linkedinUrl && (
        <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white"
        >
          <Linkedin className="size-3.5" strokeWidth={1.75} />
          LinkedIn
        </a>
      )}

      {!profile && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          No profile available
        </p>
      )}
    </article>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
      {children}
    </p>
  );
}
