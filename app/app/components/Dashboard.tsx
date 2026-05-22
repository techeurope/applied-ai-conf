"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Mic, Pencil, Shield, X } from "lucide-react";
import { api } from "@convex/_generated/api";
import {
  CONFERENCE_DATE,
  findSpeakerSlots,
  getConferenceClock,
  isLive,
  minutesUntilStart,
  nextSlotsByStage,
  timeToMinutes,
} from "@/lib/conference-time";
import { UserQR } from "./UserQR";
import { VoucherCard } from "./VoucherCard";

type Slot = NonNullable<ReturnType<typeof useQuery<typeof api.agenda.list>>>[number];

export function Dashboard() {
  const me = useQuery(api.users.me);
  const myTeam = useQuery(api.partners.myTeam);
  const agenda = useQuery(api.agenda.list) ?? [];
  const vouchers = useQuery(api.vouchers.myVouchers) ?? [];
  const favorites = useQuery(api.favorites.list);

  // Re-tick every 15s so progress bars + countdowns stay live.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const [qrExpanded, setQrExpanded] = useState(false);

  const speakerSlots = useMemo(
    () => (me?.isSpeaker ? findSpeakerSlots(agenda, me.name ?? "") : []),
    [me?.isSpeaker, me?.name, agenda],
  );
  // The speaker's next-upcoming talk (or live one) — for the prominent callout.
  const upcomingSpeakerSlot = useMemo(() => {
    if (!speakerSlots.length || !clock.isConferenceDay) return null;
    const sorted = [...speakerSlots].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
    const liveOne = sorted.find((s) => isLive(s, clock.nowMinutes));
    if (liveOne) return liveOne;
    const next = sorted.find((s) => minutesUntilStart(s, clock.nowMinutes) > 0);
    return next ?? null;
  }, [speakerSlots, clock.isConferenceDay, clock.nowMinutes]);
  const speakerCalloutMinutesUntil = upcomingSpeakerSlot
    ? minutesUntilStart(upcomingSpeakerSlot, clock.nowMinutes)
    : null;
  // Show callout only if their talk is live now OR within 2h.
  const showSpeakerCallout =
    upcomingSpeakerSlot &&
    speakerCalloutMinutesUntil !== null &&
    speakerCalloutMinutesUntil <= 120;

  const liveSlotsAll = clock.isConferenceDay
    ? agenda.filter((s) => isLive(s, clock.nowMinutes))
    : [];
  const liveTalks = liveSlotsAll.filter(
    (s) => s.format !== "break" && s.format !== "logistics",
  );
  const liveVenueRaw = liveSlotsAll.filter(
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
        agenda.filter((s) => s.format !== "logistics" && s.format !== "break"),
        clock.nowMinutes,
        90,
      )
    : {};
  const upNext = Object.values(nextByStage).filter((s) => !liveTalks.includes(s));

  const favoriteSlots = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    const set = new Set(favorites);
    return agenda
      .filter((s) => set.has(s.id))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [favorites, agenda]);

  if (me === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }
  if (me === null) return null;

  return (
    <div className="space-y-5 pt-1">
      {/* Status header — clock + day state */}
      <StatusHeader clock={clock} />

      {/* Speaker callout (only if speaker has a talk within 2h) */}
      {showSpeakerCallout && upcomingSpeakerSlot && (
        <SpeakerCallout
          slot={upcomingSpeakerSlot}
          minutesUntil={speakerCalloutMinutesUntil!}
          live={speakerCalloutMinutesUntil! <= 0}
        />
      )}

      {/* Right now */}
      {clock.isConferenceDay &&
        (liveTalks.length > 0 || liveVenue.length > 0 || upNext.length > 0) && (
          <RightNowPanel
            liveTalks={liveTalks}
            liveVenue={liveVenue}
            upNext={upNext}
            nowMinutes={clock.nowMinutes}
          />
        )}

      {/* Badge */}
      <BadgePanel
        me={me}
        myTeam={myTeam ?? null}
        onExpand={() => setQrExpanded(true)}
      />

      {/* Vouchers */}
      {vouchers.length > 0 && (
        <section className="space-y-2">
          <Heading>// VOUCHERS</Heading>
          <div className="space-y-2">
            {vouchers.map((v) => (
              <VoucherCard key={v._id} voucher={v} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites preview when NOT conference day */}
      {!clock.isConferenceDay && favoriteSlots.length > 0 && (
        <section className="space-y-2">
          <Heading>// FAVORITES · {favoriteSlots.length}</Heading>
          <ul className="space-y-1 rounded-2xl ring-1 ring-white/5 overflow-hidden">
            {favoriteSlots.slice(0, 5).map((s) => (
              <li
                key={s._id}
                className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-white/40">
                    {s.startTime}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {s.stage}
                  </span>
                  <span className="text-sm text-white/80 truncate flex-1">
                    {s.title}
                  </span>
                </div>
                {s.speakerName && (
                  <p className="text-xs text-white/50 mt-0.5">{s.speakerName}</p>
                )}
              </li>
            ))}
          </ul>
          <Link
            href="/app/agenda"
            className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
          >
            see full agenda ›
          </Link>
        </section>
      )}

      {/* QR full-screen modal */}
      {qrExpanded && (
        <QrFullscreen
          token={me.publicToken ?? me._id}
          name={me.name}
          subtitle={[me.role, me.company].filter(Boolean).join(" · ")}
          onClose={() => setQrExpanded(false)}
        />
      )}
    </div>
  );
}

// --- subcomponents -----------------------------------------------------------

function StatusHeader({
  clock,
}: {
  clock: ReturnType<typeof getConferenceClock>;
}) {
  return (
    <section className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        // STATUS · CEST
      </p>
      {clock.isConferenceDay ? (
        <>
          <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tighter tabular-nums leading-none">
            {clock.nowHHMM}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
            Conference day · {CONFERENCE_DATE}
          </p>
        </>
      ) : clock.daysUntil > 0 ? (
        <>
          <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tighter leading-none">
            {clock.daysUntil}
            <span className="text-2xl sm:text-3xl text-white/40 ml-2 font-normal">
              {clock.daysUntil === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            to conference · {CONFERENCE_DATE}
          </p>
        </>
      ) : (
        <p className="font-mono text-3xl font-bold tracking-tighter">
          Conference complete
        </p>
      )}
    </section>
  );
}

function SpeakerCallout({
  slot,
  minutesUntil,
  live,
}: {
  slot: Slot;
  minutesUntil: number;
  live: boolean;
}) {
  return (
    <section className="rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/40 p-4 space-y-2 [box-shadow:0_0_40px_-12px_rgba(52,211,153,0.45)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200 flex items-center gap-1.5">
        <Mic className="size-3" strokeWidth={2.25} />
        {live
          ? "You're speaking right now"
          : `You're speaking in ${formatMinutes(minutesUntil)}`}
      </p>
      <p className="text-base sm:text-lg text-white font-medium leading-snug">
        {slot.title}
      </p>
      <p className="text-xs text-white/70">
        {slot.startTime}–{slot.endTime} · {slot.stage} stage
      </p>
      <Link
        href="/app/agenda"
        className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-200/80 hover:text-emerald-100"
      >
        see in agenda ›
      </Link>
    </section>
  );
}

function RightNowPanel({
  liveTalks,
  liveVenue,
  upNext,
  nowMinutes,
}: {
  liveTalks: Slot[];
  liveVenue: Slot[];
  upNext: Slot[];
  nowMinutes: number;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Heading>// RIGHT NOW</Heading>
        <Link
          href="/app/agenda"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          full agenda ›
        </Link>
      </div>

      {liveTalks.length === 0 && liveVenue.length === 0 && (
        <p className="text-xs text-white/50 px-1">Between sessions.</p>
      )}

      <div className="space-y-2">
        {liveTalks.map((s) => (
          <LiveCard key={s._id} slot={s} nowMinutes={nowMinutes} />
        ))}
        {liveVenue.map((s) => (
          <VenueCard key={s._id} slot={s} />
        ))}
      </div>

      {upNext.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Up next · in {formatMinutes(minutesUntilStart(upNext[0], nowMinutes))}
          </p>
          <ul className="space-y-1">
            {upNext.map((s) => (
              <li key={s._id} className="flex items-baseline gap-2 text-xs">
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function LiveCard({ slot, nowMinutes }: { slot: Slot; nowMinutes: number }) {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  const progress = Math.max(0, Math.min(1, (nowMinutes - start) / (end - start)));
  const ring = slot.stage === "main" ? "ring-emerald-300/30" : "ring-violet-300/30";
  const stageColor =
    slot.stage === "main" ? "text-emerald-200" : "text-violet-200";
  return (
    <article
      className={`rounded-2xl bg-white/[0.03] ring-1 ${ring} p-4 space-y-2`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
          <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
          Live
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${stageColor}`}>
          {slot.stage}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-white/50">
          {slot.startTime}–{slot.endTime}
        </span>
      </div>
      <p className="text-sm sm:text-base text-white leading-snug">{slot.title}</p>
      {slot.speakerName && (
        <p className="text-xs text-white/60">
          <span className="font-mono text-white/30">› </span>
          {slot.speakerName}
        </p>
      )}
      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-rose-400/80 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </article>
  );
}

function VenueCard({ slot }: { slot: Slot }) {
  return (
    <article className="rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/30 p-4 space-y-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30">
          <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" />
          Now
        </span>
        <span className="font-mono text-[10px] tracking-widest text-white/50">
          {slot.startTime}–{slot.endTime}
        </span>
      </div>
      <p className="text-sm text-white leading-snug">{slot.title}</p>
    </article>
  );
}

function BadgePanel({
  me,
  myTeam,
  onExpand,
}: {
  me: NonNullable<ReturnType<typeof useQuery<typeof api.users.me>>>;
  myTeam: NonNullable<ReturnType<typeof useQuery<typeof api.partners.myTeam>>> | null;
  onExpand: () => void;
}) {
  return (
    <section className="space-y-3">
      <Heading>// YOUR BADGE</Heading>
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <button
          type="button"
          onClick={onExpand}
          className="block mx-auto group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-2xl"
          aria-label="Tap to enlarge QR"
        >
          <div className="w-44 sm:w-52">
            <UserQR
              token={me.publicToken ?? me._id}
              size={260}
              showUrl={false}
              maxWidthClass="max-w-none"
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1 group-hover:text-white/70 transition-colors">
            Tap to enlarge
          </p>
        </button>
        <div className="text-center space-y-1.5">
          <p className="font-mono text-base text-white">{me.name || "Unnamed"}</p>
          {(me.role || me.company) && (
            <p className="text-xs text-white/60">
              {[me.role, me.company].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 justify-center pt-1">
            {me.isSpeaker && (
              <PillBadge tone="emerald" icon={Mic}>
                Speaker
              </PillBadge>
            )}
            {myTeam?.team && (
              <PillBadge tone="violet">
                {myTeam.team.name} · {myTeam.role}
              </PillBadge>
            )}
            {me.accessLevel === "admin" && (
              <PillBadge tone="white" icon={Shield}>
                Admin
              </PillBadge>
            )}
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
          >
            <Pencil className="size-3.5" strokeWidth={1.75} />
            Edit profile
          </Link>
        </div>
      </div>
    </section>
  );
}

function QrFullscreen({
  token,
  name,
  subtitle,
  onClose,
}: {
  token: string;
  name: string;
  subtitle: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 gap-6"
      onClick={onClose}
      role="dialog"
      aria-label="Your QR code"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 p-2 rounded-full ring-1 ring-white/20 hover:ring-white/40 transition-colors"
      >
        <X className="size-5" strokeWidth={1.75} />
      </button>
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <UserQR
          token={token}
          size={600}
          showUrl={false}
          maxWidthClass="max-w-none"
        />
      </div>
      <div className="text-center space-y-1">
        <p className="font-mono text-lg text-white">{name}</p>
        {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
        Tap anywhere to close
      </p>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
      {children}
    </p>
  );
}

function PillBadge({
  tone,
  children,
  icon: Icon,
}: {
  tone: "emerald" | "violet" | "white";
  children: React.ReactNode;
  icon?: typeof Mic;
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30"
      : tone === "violet"
        ? "bg-violet-400/15 text-violet-200 ring-violet-300/30"
        : "bg-white/10 text-white/80 ring-white/20";
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 ${cls}`}
    >
      {Icon && <Icon className="size-3" strokeWidth={2} />}
      {children}
    </span>
  );
}

function formatMinutes(min: number): string {
  if (min < 0) return `${-min} min ago`;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}
