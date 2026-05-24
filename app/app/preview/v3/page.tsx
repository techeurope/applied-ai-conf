"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Coffee,
  IdCard,
  LifeBuoy,
  LogIn,
  MapPin,
  ShieldCheck,
  Train,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { CONFERENCE_DATE, getConferenceClock } from "@/lib/conference-time";
import { rightNowPeek } from "../_lib/right-now";
import { MoreLinks } from "../_components/MoreLinks";
import { Footer } from "../_components/Footer";

// "Welcome — you've never been to this. Here's everything you need to know
// in one screen." No marketing copy, no duplicated nav, no filler.
export default function V3FirstTimeBriefing() {
  const auth = useAuth();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();
  const peek = rightNowPeek(clock.nowMinutes, clock.isConferenceDay);

  return (
    <div className="min-h-[100dvh] w-full">
      {/* ── COMPACT STATUS BAR ────────────────────────────────── */}
      <section className="w-full border-b border-white/10 bg-[radial-gradient(circle_at_15%_-50%,rgba(196,181,253,0.15),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-6 grid sm:grid-cols-[1fr_auto] gap-3 sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-200/85 mb-1">
              // first time? here's everything
            </p>
            <p className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              {clock.isConferenceDay
                ? "You're here. Welcome."
                : clock.daysUntil > 0
                  ? <>You're <span className="font-mono text-violet-200 tabular-nums">{clock.daysUntil}</span> {clock.daysUntil === 1 ? "day" : "days"} away.</>
                  : "Until next year, then."}
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] tabular-nums text-white/55">
            {CONFERENCE_DATE} · DELTA · BLN{" "}
            {clock.isConferenceDay ? (
              <span className="text-rose-300">· LIVE {clock.nowHHMM}</span>
            ) : null}
          </p>
        </div>
      </section>

      {/* ── ON STAGE RIGHT NOW (conf day only) ───────────────── */}
      {peek && (peek.liveMain || peek.liveSide || peek.nextMain || peek.nextSide) && (
        <section className="w-full border-b border-white/10 bg-rose-500/[0.05]">
          <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-5 grid sm:grid-cols-[auto_1fr_1fr_auto] gap-4 items-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose-300 flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-rose-400" />
              </span>
              ON NOW
            </p>
            <PeekLine slot={peek.liveMain ?? peek.nextMain} stage="main" isLive={!!peek.liveMain} />
            <PeekLine slot={peek.liveSide ?? peek.nextSide} stage="side" isLive={!!peek.liveSide} />
            <Link
              href="/app/agenda"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 hover:text-white inline-flex items-center gap-1"
            >
              agenda
              <ArrowUpRight className="size-3" strokeWidth={1.75} />
            </Link>
          </div>
        </section>
      )}

      {/* ── THE BRIEFING ──────────────────────────────────────── */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-9 sm:py-12">
          <ol className="grid lg:grid-cols-2 gap-x-12 gap-y-7">
            <Step
              n="01"
              icon={CalendarDays}
              label="WHAT IT IS"
              headline="1 day · 2 stages · 25 talks"
              accent="violet"
            >
              <p>
                Applied AI Conf is a one-day, single-track-of-conversation event
                for engineers, founders, and CTOs who already have AI in
                production. Curated, in-person. No product pitches — speakers
                only talk about real systems they shipped.
              </p>
              <FactLine k="Programme" v={<Link href="/app/programme" className="text-white/85 hover:text-violet-200 underline underline-offset-4 decoration-dotted">6 topic clusters · 2 panels</Link>} />
              <FactLine k="Audience" v="Engineers shipping AI to production" />
            </Step>

            <Step
              n="02"
              icon={MapPin}
              label="WHERE"
              headline="The Delta Campus, Berlin"
              accent="violet"
            >
              <p>
                A converted industrial space with two stages, an expo hall, and
                room to think. Step-free access; accessible restrooms; reserved
                seating on request — ask the Help Desk.
              </p>
              <FactLine
                k="Nearest"
                v={
                  <>
                    <span className="text-white/85">S Westkreuz</span>
                    <span className="text-white/40"> · 6 min walk</span>
                  </>
                }
              />
              <FactLine
                k="Walk-through"
                v={
                  <Link href="/app/venue" className="text-white/85 hover:text-violet-200 underline underline-offset-4 decoration-dotted">
                    Open floor plan ↗
                  </Link>
                }
              />
            </Step>

            <Step
              n="03"
              icon={Train}
              label="GETTING THERE"
              headline="Land → BER → Hauptbahnhof → Westkreuz"
              accent="violet"
            >
              <p>
                Only one airport in Berlin (BER). Take the FEX or RE to
                Hauptbahnhof, then S3 / S5 / S7 / S9 to Westkreuz, then walk.
                Roughly an hour door-to-door from the airport.
              </p>
              <FactLine k="Doors open" v="08:00 · be inside by 09:00" />
              <FactLine k="First session" v="09:10 · main stage" />
              <FactLine
                k="Plan"
                v={
                  <Link href="/app/travel" className="text-white/85 hover:text-violet-200 underline underline-offset-4 decoration-dotted">
                    Berlin transit & hotel notes ↗
                  </Link>
                }
              />
            </Step>

            <Step
              n="04"
              icon={auth.user ? IdCard : LogIn}
              label="GET INTO THE APP"
              headline={auth.user ? "You're signed in." : "Sign in with your Luma email"}
              accent="emerald"
            >
              {auth.user ? (
                <p>
                  Use the tabs above: <span className="font-mono text-white/85">Connect</span>{" "}
                  for your badge (your QR + scanning others),{" "}
                  <span className="font-mono text-white/85">Voucher</span> for
                  lunch + drinks, <span className="font-mono text-white/85">Contacts</span>{" "}
                  for the people you've met.
                </p>
              ) : (
                <>
                  <p>
                    Same email you used on your Luma ticket. Signing in unlocks
                    your <strong className="text-white font-medium">badge</strong>{" "}
                    (the QR), your <strong className="text-white font-medium">lunch voucher</strong>,
                    and <strong className="text-white font-medium">contact capture</strong>{" "}
                    (scan other badges to keep details).
                  </p>
                  <a
                    href="/api/auth/sign-in?return_to=%2Fapp%2Fpreview%2Fv3"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-300 text-stone-900 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] hover:scale-[1.02] transition-transform mt-3"
                  >
                    Sign in
                    <ArrowRight className="size-3.5" strokeWidth={2} />
                  </a>
                </>
              )}
            </Step>

            <Step
              n="05"
              icon={Wifi}
              label="ON THE DAY"
              headline="Wi-Fi, food, breaks, help"
              accent="violet"
              span2
            >
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-1">
                <FactLine k="Wi-Fi" v={<span className="font-mono text-white">AppliedAIConf</span>} />
                <FactLine k="Password" v={<span className="font-mono text-white">shipit2026</span>} />
                <FactLine k="Lunch" v={<><UtensilsCrossed className="inline size-3 mr-1 -mt-0.5" strokeWidth={1.75} /> 12:30 – 13:30 · Expo Hall</>} />
                <FactLine k="Breaks" v={<><Coffee className="inline size-3 mr-1 -mt-0.5" strokeWidth={1.75} /> 10:30 & 15:10 · coffee</>} />
                <FactLine k="Dietary" v="Veg / vegan / GF · labelled at counter" />
                <FactLine k="Help" v={<><LifeBuoy className="inline size-3 mr-1 -mt-0.5" strokeWidth={1.75} /> Crew · black tee · <a href="mailto:hello@techeurope.io" className="text-white/85 hover:text-violet-200 underline underline-offset-4 decoration-dotted">hello@techeurope.io</a></>} />
              </div>
            </Step>

            <Step
              n="06"
              icon={ShieldCheck}
              label="CODE OF CONDUCT"
              headline="Be decent. We'll do the same."
              accent="violet"
              span2
            >
              <p>
                Treat people the way you'd want to be treated. Ask before
                photographing other attendees. Harassment of any kind ends the
                day. Crew (black tees) are always nearby if you need someone.
              </p>
              <FactLine
                k="Full text"
                v={
                  <Link href="/code-of-conduct" className="text-white/85 hover:text-violet-200 underline underline-offset-4 decoration-dotted">
                    /code-of-conduct ↗
                  </Link>
                }
              />
            </Step>
          </ol>
        </div>
      </section>

      <MoreLinks accent="violet" />
      <Footer accent="violet" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function Step({
  n,
  icon: Icon,
  label,
  headline,
  children,
  accent,
  span2,
}: {
  n: string;
  icon: typeof MapPin;
  label: string;
  headline: ReactNode;
  children: ReactNode;
  accent: "violet" | "emerald";
  span2?: boolean;
}) {
  const text: Record<"violet" | "emerald", string> = {
    violet: "text-violet-200",
    emerald: "text-emerald-200",
  };
  return (
    <li className={`grid grid-cols-[52px_1fr] gap-4 sm:gap-5 ${span2 ? "lg:col-span-2" : ""}`}>
      <div className="flex flex-col items-center">
        <span className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums ${text[accent]} leading-none`}>
          {n}
        </span>
        <span className="mt-2 size-px h-full bg-gradient-to-b from-white/15 to-transparent" />
      </div>
      <div className="space-y-2">
        <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${text[accent]} flex items-center gap-1.5`}>
          <Icon className="size-3" strokeWidth={2} />
          {label}
        </p>
        <p className="text-lg sm:text-xl text-white font-medium leading-snug">
          {headline}
        </p>
        <div className="text-sm text-white/60 leading-relaxed space-y-1.5 max-w-prose">
          {children}
        </div>
      </div>
    </li>
  );
}

function FactLine({ k, v }: { k: string; v: ReactNode }) {
  return (
    <p className="grid grid-cols-[88px_1fr] gap-3 items-baseline text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 tabular-nums">
        {k}
      </span>
      <span className="text-white/75">{v}</span>
    </p>
  );
}

function PeekLine({
  slot,
  stage,
  isLive,
}: {
  slot: import("@/types").AgendaSlot | undefined;
  stage: "main" | "side";
  isLive: boolean;
}) {
  const palette =
    stage === "main"
      ? { text: "text-emerald-200", dot: "bg-emerald-300" }
      : { text: "text-violet-200", dot: "bg-violet-300" };
  if (!slot) {
    return (
      <div className="text-sm text-white/40 truncate flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${palette.dot}`} />
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${palette.text}`}>
          {stage}
        </span>
        <span>—</span>
      </div>
    );
  }
  return (
    <Link
      href={`/app/agenda/${slot.id}`}
      className="text-sm text-white truncate hover:text-rose-200 transition-colors flex items-baseline gap-2"
    >
      <span className={`size-1.5 rounded-full ${palette.dot} translate-y-0.5`} />
      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${palette.text}`}>
        {stage}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-white/45">
        {isLive ? `until ${slot.endTime}` : slot.startTime}
      </span>
      <span className="truncate min-w-0">{slot.title}</span>
    </Link>
  );
}
