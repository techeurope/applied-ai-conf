"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { ArrowRight, PlaneTakeoff, Ticket as TicketIcon } from "lucide-react";
import { CONFERENCE_DATE, getConferenceClock } from "@/lib/conference-time";
import { rightNowPeek } from "../_lib/right-now";
import { PracticalStrip } from "../_components/PracticalStrip";
import { MoreLinks } from "../_components/MoreLinks";
import { Footer } from "../_components/Footer";
import { ConferenceFacts } from "../_components/ConferenceFacts";

export default function V2BoardingPass() {
  const auth = useAuth();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();
  const peek = rightNowPeek(clock.nowMinutes, clock.isConferenceDay);

  const passengerName = auth.user
    ? (auth.user.firstName?.toUpperCase() ||
        auth.user.email?.split("@")[0].toUpperCase() ||
        "ATTENDEE")
    : "GUEST";

  return (
    <div className="min-h-[100dvh] w-full">
      {/* ── COMPACT STATUS BAR (no marketing wordmark) ────────── */}
      <section className="w-full border-b border-white/10 bg-[radial-gradient(circle_at_85%_-50%,rgba(251,191,36,0.18),transparent_55%)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-5 grid sm:grid-cols-[1fr_auto] gap-3 items-baseline">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/85 flex items-center gap-2">
            <PlaneTakeoff className="size-3" strokeWidth={2.25} />
            ITINERARY · APPLIED AI CONF
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.25em] tabular-nums text-white/55">
            {CONFERENCE_DATE} · DELTA · BLN ·{" "}
            <span className={clock.isConferenceDay ? "text-amber-200" : "text-white/55"}>
              {clock.isConferenceDay
                ? `LIVE ${clock.nowHHMM}`
                : clock.daysUntil > 0
                  ? `T−${clock.daysUntil}`
                  : "ENDED"}
            </span>
          </p>
        </div>
      </section>

      {/* ── BOARDING PASS (the lead element) ─────────────────── */}
      <section className="w-full border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-7 sm:py-10">
          <BoardingPass
            passenger={passengerName}
            signedIn={!!auth.user}
            date={CONFERENCE_DATE}
            now={clock.isConferenceDay ? clock.nowHHMM : null}
            daysUntil={clock.isConferenceDay ? 0 : clock.daysUntil}
            peek={peek}
          />

          {!auth.user && !auth.loading && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/api/auth/sign-in?return_to=%2Fapp%2Fpreview%2Fv2"
                className="inline-flex items-center gap-2 rounded-full bg-amber-200 text-stone-900 px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] hover:scale-[1.02] transition-transform shadow-[0_0_50px_-14px_rgba(251,191,36,0.7)]"
              >
                <TicketIcon className="size-4" strokeWidth={2} />
                Check in with your Luma email
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </a>
              <p className="text-xs text-white/45 font-mono uppercase tracking-[0.18em]">
                Unlocks name, badge & lunch voucher
              </p>
            </div>
          )}
        </div>
      </section>

      <ConferenceFacts accent="amber" />
      <PracticalStrip />
      <MoreLinks accent="amber" />
      <Footer accent="amber" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function BoardingPass({
  passenger,
  signedIn,
  date,
  now,
  daysUntil,
  peek,
}: {
  passenger: string;
  signedIn: boolean;
  date: string;
  now: string | null;
  daysUntil: number;
  peek: ReturnType<typeof rightNowPeek>;
}) {
  const headline =
    peek?.liveMain ?? peek?.liveSide ?? peek?.nextMain ?? peek?.nextSide;

  return (
    <article className="relative flex flex-col sm:flex-row bg-amber-50 text-stone-900 rounded-3xl overflow-hidden ring-1 ring-amber-200/30 shadow-[0_30px_80px_-30px_rgba(251,191,36,0.45)]">
      <div className="relative bg-stone-900 text-amber-50 px-6 sm:px-8 py-6 sm:py-7 sm:w-[280px] flex sm:flex-col justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
            PASS
          </p>
          <p className="font-mono text-3xl sm:text-4xl font-bold mt-0.5 tracking-tight">
            APP-26
          </p>
        </div>
        <div className="sm:mt-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
            DATE
          </p>
          <p className="font-mono text-lg sm:text-xl font-bold tabular-nums">
            28&nbsp;MAY&nbsp;26
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60 mt-3">
            GATE
          </p>
          <p className="font-mono text-base sm:text-lg font-bold tabular-nums">
            DELTA · BLN
          </p>
        </div>
        <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-[#05070f]" />
      </div>

      <div className="flex-1 p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6">
          <Field label="PASSENGER" value={passenger} dim={!signedIn} />
          <Field
            label={now ? "BOARDED" : "BOARDS IN"}
            value={now ?? (daysUntil > 0 ? `${daysUntil} DAYS` : "ENDED")}
            accent
          />
          <Field
            label="MAIN STAGE"
            value={peek?.liveMain ? "LIVE" : peek?.nextMain?.startTime ?? "—"}
            small
          />
          <Field
            label="SIDE STAGE"
            value={peek?.liveSide ? "LIVE" : peek?.nextSide?.startTime ?? "—"}
            small
          />
        </div>

        <div className="border-t border-stone-300 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-1.5">
            {peek?.liveMain || peek?.liveSide ? "NOW BOARDING" : headline ? "UP NEXT" : "DESTINATION"}
          </p>
          {headline ? (
            <Link
              href={`/app/agenda/${headline.id}`}
              className="group block"
            >
              <p className="text-xl sm:text-2xl font-medium leading-snug text-stone-900 group-hover:underline underline-offset-4 decoration-stone-900 decoration-1">
                {headline.title}
              </p>
              {(headline.speakerName || headline.speakerNames) && (
                <p className="text-sm text-stone-600 mt-1 italic">
                  by {headline.speakerName ?? headline.speakerNames?.join(" & ")}
                </p>
              )}
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 mt-2 tabular-nums">
                {headline.stage === "main" ? "GATE A · MAIN" : headline.stage === "side" ? "GATE B · SIDE" : "EXPO"} · {headline.startTime}–{headline.endTime}
              </p>
            </Link>
          ) : (
            <p className="text-base sm:text-lg leading-snug text-stone-700">
              Twenty-five engineering talks across two stages. Doors 08:00 ·
              First session 09:10 · Closes 17:30.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div
            className="flex-1 h-8 [background-image:repeating-linear-gradient(90deg,#0c0a06_0,#0c0a06_2px,transparent_2px,transparent_4px,#0c0a06_4px,#0c0a06_5px,transparent_5px,transparent_9px,#0c0a06_9px,#0c0a06_11px,transparent_11px,transparent_14px)]"
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500 tabular-nums">
            APPLIED·AI·{date.replace(/-/g, "")}
          </span>
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  accent,
  small,
  dim,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
  dim?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-stone-500 mb-0.5">
        {label}
      </p>
      <p
        className={`font-mono ${
          small ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
        } font-bold tabular-nums leading-none ${
          accent ? "text-amber-700" : dim ? "text-stone-500" : "text-stone-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
