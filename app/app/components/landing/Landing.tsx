"use client";

import { useEffect, useState } from "react";
import { CONFERENCE_DATE, getConferenceClock } from "@/lib/conference-time";
import { AuthRibbon } from "./AuthRibbon";
import { HelpCard } from "./HelpCard";
import { LunchCard } from "./LunchCard";
import { RightNowWidget } from "./RightNowWidget";
import { SignedInCallouts } from "./SignedInCallouts";
import { WifiCard } from "./WifiCard";

export function Landing({ initialSignedIn: _signedIn }: { initialSignedIn: boolean }) {
  // Re-render every 30s so the clock + day countdown stay current.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  return (
    <div className="space-y-5 pt-1">
      {/* Hero status */}
      <section className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // APPLIED AI CONF · BERLIN
        </p>
        {clock.isConferenceDay ? (
          <>
            <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tighter tabular-nums leading-none">
              {clock.nowHHMM}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
              Conference day · {CONFERENCE_DATE} · The Delta Campus
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
              to {CONFERENCE_DATE} · The Delta Campus, Berlin
            </p>
          </>
        ) : (
          <p className="font-mono text-3xl font-bold tracking-tighter">
            Conference complete · see you next year
          </p>
        )}
      </section>

      {/* Same slot, two states:
          - signed-out → sign-in pitch
          - signed-in → time-bounded callout (speaker, voucher) if applicable */}
      <AuthRibbon />
      <SignedInCallouts />

      {/* What's live right now (only on conference day, only if anything live) */}
      <RightNowWidget />

      {/* Venue cards */}
      <WifiCard />

      <div className="grid sm:grid-cols-2 gap-5">
        <LunchCard />
        <HelpCard />
      </div>

      {/* Footer links */}
      <footer className="pt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
        <a href="/code-of-conduct" className="hover:text-white">
          Code of conduct
        </a>
        <a href="/privacy" className="hover:text-white">
          Privacy
        </a>
        <a href="/imprint" className="hover:text-white">
          Imprint
        </a>
        <a href="/" className="hover:text-white ml-auto">
          ‹ techeurope.io
        </a>
      </footer>
    </div>
  );
}
