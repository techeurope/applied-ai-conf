"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  ArrowRight,
  ArrowUpRight,
  Coffee,
  LifeBuoy,
  Mail,
  MapPin,
  PlaneTakeoff,
  Ticket,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import {
  getConferenceClock,
  timeToMinutes,
} from "@/lib/conference-time";
import { SPEAKERS } from "@/data/speakers";
import { rightNowPeek } from "../_lib/right-now";
import type { AgendaSlot, Speaker } from "@/types";

// Stage pill colors must match the agenda (AgendaList.tsx STAGE_STYLES).
const STAGE_STYLES: Record<string, string> = {
  main: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  side: "bg-violet-400/15 text-violet-200 ring-violet-300/30",
  expo: "bg-amber-400/15 text-amber-200 ring-amber-300/30",
};

function speakerLines(slot: Pick<AgendaSlot, "speakerName" | "speakerNames">) {
  const names = slot.speakerNames ?? (slot.speakerName ? [slot.speakerName] : []);
  if (names.length === 0) return { speaker: "", company: "" };
  const last = (SPEAKERS as Speaker[]).find((s) => s.name === names[names.length - 1]);
  return { speaker: names.join(" & "), company: last?.company ?? "" };
}

export default function V1Bento() {
  const auth = useAuth();
  // Gate clock-dependent UI behind a mounted flag. getConferenceClock() reads
  // sessionStorage (?__now demo override), which only exists on the client —
  // computing it during SSR causes a hydration mismatch on the status pill.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setMounted((m) => m), 30_000);
    return () => clearInterval(id);
  }, []);
  // Re-tick every 30s so the live state stays current.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [mounted]);
  const clock = mounted ? getConferenceClock() : null;
  const peek = clock ? rightNowPeek(clock.nowMinutes, clock.isConferenceDay) : null;

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6">
        {/* Header — title + date + countdown pill */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tighter leading-none">
              <span className="text-glow">Applied AI Conf</span>
            </h1>
            <p className="text-white/55 mt-2 text-sm sm:text-base">
              May 28, 2026 · The Delta Campus, Berlin
            </p>
          </div>
          <StatusPill clock={clock} />
        </header>

        {/* Today snapshot — conference day only */}
        {peek && <TodayCard peek={peek} now={clock.nowMinutes} />}

        {/* Sign-in — signed-out only */}
        {!auth.user && !auth.loading && <SignInCard />}

        {/* Bento grid of info cards. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <VenueCard />
          <TravelCard />
          <WiFiCard />
          <LunchCard />
          <HelpCard />
        </div>

        <footer className="pt-4 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
          <Link href="/app/faq" className="hover:text-white">FAQ</Link>
          <Link href="/app/about" className="hover:text-white">About</Link>
          <Link href="/code-of-conduct" className="hover:text-white">Code of conduct</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/imprint" className="hover:text-white">Imprint</Link>
          <Link href="/" className="hover:text-white ml-auto">‹ techeurope.io</Link>
        </footer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Top bits

function StatusPill({ clock }: { clock: ReturnType<typeof getConferenceClock> }) {
  if (clock.isConferenceDay) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-rose-300/40 bg-rose-400/10 px-3.5 py-1.5 text-sm shrink-0">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-75 animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
        </span>
        <span className="text-rose-200 font-mono tabular-nums">Live · {clock.nowHHMM}</span>
      </span>
    );
  }
  if (clock.daysUntil > 0) {
    return (
      <span className="inline-flex items-baseline gap-1.5 rounded-full ring-1 ring-white/15 px-3.5 py-1.5 text-sm text-white/70 shrink-0">
        in <span className="text-white font-medium tabular-nums">{clock.daysUntil}</span>
        {clock.daysUntil === 1 ? "day" : "days"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 px-3.5 py-1.5 text-sm text-white/55 shrink-0">
      Until next year
    </span>
  );
}

function TodayCard({
  peek,
  now,
}: {
  peek: NonNullable<ReturnType<typeof rightNowPeek>>;
  now: number;
}) {
  const lines: { stage: "main" | "side"; slot: AgendaSlot; isLive: boolean }[] = [];
  if (peek.liveMain) lines.push({ stage: "main", slot: peek.liveMain, isLive: true });
  else if (peek.nextMain) lines.push({ stage: "main", slot: peek.nextMain, isLive: false });
  if (peek.liveSide) lines.push({ stage: "side", slot: peek.liveSide, isLive: true });
  else if (peek.nextSide) lines.push({ stage: "side", slot: peek.nextSide, isLive: false });

  return (
    <section className="rounded-2xl ring-1 ring-rose-300/20 bg-rose-400/[0.04] p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base text-white font-medium tracking-tight">
          {peek.liveMain || peek.liveSide ? "On stage now" : "Up next"}
        </h2>
        <Link href="/app/agenda" className="text-sm text-white/55 hover:text-white inline-flex items-center gap-1">
          Agenda
          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
        </Link>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2">
        {lines.map(({ stage, slot, isLive }) => {
          const minutes = isLive
            ? timeToMinutes(slot.endTime) - now
            : timeToMinutes(slot.startTime) - now;
          const stageClass = STAGE_STYLES[stage] ?? "";
          const { speaker, company } = speakerLines(slot);
          return (
            <li key={slot.id}>
              <Link
                href={`/app/agenda/${slot.id}`}
                className="block rounded-lg hover:bg-white/[0.04] -mx-2 px-2 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 ${stageClass}`}
                  >
                    {stage}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
                      <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
                      Live
                    </span>
                  )}
                  <span className="font-mono text-[11px] tabular-nums text-white/45">
                    {isLive ? `${minutes}m left` : `in ${minutes}m`}
                  </span>
                </div>
                <p className="text-sm text-white line-clamp-2 leading-snug">
                  {slot.title}
                </p>
                {speaker && (
                  <p className="mt-1 flex items-baseline gap-1.5 text-xs min-w-0">
                    <span className="text-zinc-300 truncate min-w-0">{speaker}</span>
                    {company && (
                      <>
                        <span className="text-zinc-600 shrink-0">·</span>
                        <span className="text-zinc-500 truncate min-w-0">{company}</span>
                      </>
                    )}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SignInCard() {
  return (
    <section className="rounded-2xl ring-1 ring-emerald-300/25 bg-emerald-400/[0.04] p-4 sm:p-5 grid sm:grid-cols-[1fr_auto] items-center gap-4">
      <div>
        <h2 className="text-base sm:text-lg text-white font-medium tracking-tight">
          Sign in to unlock your badge.
        </h2>
        <p className="text-sm text-white/60 mt-1 max-w-md leading-relaxed">
          Use the email on your Luma ticket. You'll get your QR badge, lunch
          voucher, and contact capture.
        </p>
      </div>
      <a
        href="/api/auth/sign-in?return_to=%2Fapp%2Fpreview%2Fv1"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform shrink-0 self-start sm:self-center"
      >
        Sign in
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </a>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────
// Bento cards

function CardShell({
  href,
  className = "",
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "group relative block rounded-2xl ring-1 ring-white/10 bg-white/[0.025] p-4 sm:p-5 transition-all hover:ring-white/25 hover:bg-white/[0.04] overflow-hidden";
  if (!href) return <section className={`${base} ${className}`}>{children}</section>;
  return (
    <Link href={href} className={`${base} ${className}`}>
      {children}
    </Link>
  );
}

function CardHeader({
  icon: Icon,
  title,
  hint,
  hasArrow = true,
}: {
  icon: typeof Wifi;
  title: string;
  hint?: string;
  hasArrow?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-2.5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-white/55 group-hover:text-white transition-colors" strokeWidth={1.75} />
        <h3 className="text-[15px] text-white font-medium tracking-tight">{title}</h3>
      </div>
      {hasArrow ? (
        <ArrowUpRight className="size-4 text-white/25 group-hover:text-white shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
      ) : (
        hint && <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">{hint}</span>
      )}
    </div>
  );
}

function VenueCard() {
  return (
    <Link
      href="/app/venue"
      className="group relative block rounded-2xl ring-1 ring-white/10 bg-white/[0.025] overflow-hidden transition-all hover:ring-sky-300/30 sm:col-span-2"
    >
      {/* Floor plan thumbnail layer */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/venue/floorplan-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070f] via-[#05070f]/85 to-[#05070f]/40" />
      </div>

      <div className="relative p-4 sm:p-5 flex items-center justify-between gap-4 min-h-[140px]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="size-4 text-sky-300/80" strokeWidth={1.75} />
            <h3 className="text-[15px] text-white font-medium tracking-tight">Venue & floor plan</h3>
          </div>
          <p className="text-lg sm:text-xl text-white font-medium tracking-tight leading-tight">
            The Delta Campus, Berlin
          </p>
          <p className="text-sm text-white/60 mt-1">
            S Westkreuz · 6 min walk · step-free access
          </p>
          <p className="text-sm text-sky-300/85 mt-2 inline-flex items-center gap-1 group-hover:text-sky-200">
            Open floor plan
            <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
          </p>
        </div>
      </div>
    </Link>
  );
}

function TravelCard() {
  return (
    <CardShell href="/app/travel">
      <CardHeader icon={PlaneTakeoff} title="Travel" />
      <p className="text-white/75 leading-snug">
        Land at <span className="font-mono">BER</span>, take the FEX to
        Hauptbahnhof, then S-Bahn to Westkreuz.
      </p>
      <p className="text-sm text-white/45 mt-2">
        About an hour door to door. Suggested hotels inside.
      </p>
    </CardShell>
  );
}

function WiFiCard() {
  return (
    <CardShell>
      <CardHeader icon={Wifi} title="Wi-Fi" hasArrow={false} hint="guest" />
      <dl className="space-y-1.5 text-sm">
        <div className="flex items-baseline gap-3">
          <dt className="text-white/45 w-[68px] shrink-0">Network</dt>
          <dd className="font-mono text-white truncate">AppliedAIConf</dd>
        </div>
        <div className="flex items-baseline gap-3">
          <dt className="text-white/45 w-[68px] shrink-0">Password</dt>
          <dd className="font-mono text-white truncate">shipit2026</dd>
        </div>
      </dl>
      <p className="text-xs text-white/40 mt-3">Open throughout the venue.</p>
    </CardShell>
  );
}

function LunchCard() {
  return (
    <CardShell>
      <CardHeader icon={UtensilsCrossed} title="Lunch" hasArrow={false} />
      <p className="font-mono text-white tabular-nums text-lg leading-none">
        12:30 — 13:30
      </p>
      <p className="text-sm text-white/60 mt-1">
        Expo Hall · veg, vegan and GF labelled at the counter.
      </p>
      <Link
        href="/app/voucher"
        className="inline-flex items-center gap-1.5 rounded-full ring-1 ring-amber-300/30 bg-amber-400/[0.06] hover:bg-amber-400/[0.10] hover:ring-amber-300/50 px-3 py-1 mt-3 text-xs text-amber-200 transition-colors"
      >
        <Ticket className="size-3" strokeWidth={1.75} />
        Show your voucher
        <ArrowRight className="size-3" strokeWidth={1.75} />
      </Link>
      <p className="flex items-center gap-1.5 text-xs text-white/40 mt-2.5">
        <Coffee className="size-3" strokeWidth={1.75} />
        Coffee breaks at <span className="font-mono tabular-nums text-white/65">10:30</span> &{" "}
        <span className="font-mono tabular-nums text-white/65">15:10</span>
      </p>
    </CardShell>
  );
}

function HelpCard() {
  return (
    <CardShell>
      <CardHeader icon={LifeBuoy} title="Help" hasArrow={false} />
      <a
        href="mailto:hello@techeurope.io"
        className="inline-flex items-center gap-1.5 text-white hover:text-emerald-200 transition-colors"
      >
        <Mail className="size-3.5" strokeWidth={1.75} />
        hello@techeurope.io
      </a>
      <p className="text-sm text-white/60 mt-2 leading-snug">
        Or grab any crew member — they're the ones in black t-shirts.
      </p>
    </CardShell>
  );
}

