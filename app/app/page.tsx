"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarHeart,
  Coffee,
  LifeBuoy,
  Mail,
  MapPin,
  PlaneTakeoff,
  QrCode,
  Ticket,
  Users,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { getConferenceClock } from "@/lib/conference-time";
import { rightNowPeek } from "@/lib/right-now";
import { LiveSessionCard } from "@/app/components/LiveSessionCard";
import { LumaCheckInCard } from "@/app/components/LumaCheckInCard";
import type { AgendaSlot } from "@/types";

export default function AppHome() {
  const auth = useAuth();
  // Gate clock-dependent UI behind a mounted flag. getConferenceClock() reads
  // sessionStorage (?__now demo override), which only exists on the client —
  // computing it during SSR causes a hydration mismatch on the status pill.
  const [mounted, setMounted] = useState(false);
  // setTick triggers a re-render every 30s once mounted so live state ages.
  const [, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = mounted ? getConferenceClock() : null;
  const peek = clock ? rightNowPeek(clock.nowMinutes, clock.isConferenceDay) : null;

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Title bar and live pill both live in the AppShell header now.
            Body starts directly with conf-day content. */}

        {/* Today snapshot — conference day only */}
        {peek && clock && <TodayCard peek={peek} now={clock.nowMinutes} />}

        {/* Personal Luma check-in QR — signed-in only, no-op when missing. */}
        {auth.user && <LumaCheckInCard />}

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
// Body sections

function TodayCard({
  peek,
  now,
}: {
  peek: NonNullable<ReturnType<typeof rightNowPeek>>;
  now: number;
}) {
  const items: { slot: AgendaSlot; isLive: boolean }[] = [];
  if (peek.liveMain) items.push({ slot: peek.liveMain, isLive: true });
  else if (peek.nextMain) items.push({ slot: peek.nextMain, isLive: false });
  if (peek.liveSide) items.push({ slot: peek.liveSide, isLive: true });
  else if (peek.nextSide) items.push({ slot: peek.nextSide, isLive: false });

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // RIGHT NOW
        </h2>
        <Link
          href="/app/agenda"
          className="text-sm text-white/55 hover:text-white inline-flex items-center gap-1"
        >
          Agenda
          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map(({ slot, isLive }) => (
          <LiveSessionCard
            key={slot.id}
            slot={slot}
            nowMinutes={now}
            isLive={isLive}
          />
        ))}
      </div>
    </section>
  );
}

function SignInCard() {
  return (
    <section className="rounded-2xl bg-white text-stone-900 p-6 sm:p-8 shadow-[0_30px_80px_-24px_rgba(255,255,255,0.25)] ring-1 ring-white/40 select-text">
      <div className="mb-7 sm:mb-8 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          Set yourself up before the day.
        </h2>
        <p className="text-stone-600 mt-2 text-base sm:text-lg leading-relaxed">
          Sign in with the email you used on Luma. Free attendee account.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7 mb-8">
        <Benefit
          icon={CalendarHeart}
          title="Build your personal agenda"
          sub="Favorite the talks you want to see. The app flags clashes when two of your picks run in parallel."
        />
        <Benefit
          icon={Users}
          title="Save the people you meet"
          sub="Point your phone camera at someone's QR to open their profile and add them to your Leads."
        />
        <Benefit
          icon={QrCode}
          title="Your scannable badge"
          sub="A personal QR for connecting at the conference. Show it to anyone who wants to keep your details."
        />
        <Benefit
          icon={Ticket}
          title="Lunch voucher in your pocket"
          sub="A second QR you show at the lunch counter. No paper, no queueing in the wrong line."
        />
      </ul>

      <a
        href="/api/auth/sign-in?return_to=%2Fapp"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 text-white px-7 py-3.5 text-base font-medium hover:bg-stone-700 hover:scale-[1.01] transition-all"
      >
        Sign in with your Luma email
        <ArrowRight className="size-4" strokeWidth={2} />
      </a>
    </section>
  );
}

function Benefit({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof QrCode;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="size-11 rounded-xl bg-stone-100 ring-1 ring-stone-200 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-stone-700" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-stone-900 leading-tight">
          {title}
        </p>
        <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">{sub}</p>
      </div>
    </li>
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
            U Rathaus Neukölln (U7) · 4 min · also U Boddinstraße (U8) and U Karl-Marx-Straße (U7)
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
        Land at <span className="font-mono">BER</span>, take the X71 bus to U
        Rudow, then the U7 to U Karl-Marx-Straße.
      </p>
      <p className="text-sm text-white/45 mt-2">
        About 40 min door to door. Suggested hotels inside.
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
          <dd className="font-mono text-white truncate">TBA</dd>
        </div>
        <div className="flex items-baseline gap-3">
          <dt className="text-white/45 w-[68px] shrink-0">Password</dt>
          <dd className="font-mono text-white truncate">TBA</dd>
        </div>
      </dl>
      <p className="text-xs text-white/40 mt-3">
        Posted at registration on the day.
      </p>
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
