"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Linkedin } from "lucide-react";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";
import {
  getConferenceClock,
  isLive,
  nextSlotsByStage,
} from "@/lib/conference-time";

// This view is NOT shown on the actual stage — it's the host's terminal:
// the conference host watches it while introducing speakers, so it needs
// both the live status (countdown, progress) AND every detail about the
// person on deck (talk title, company, what they're building, headshot,
// LinkedIn). Click the speaker card to fullscreen the photo if needed.

type StageKey = "main" | "side";

type AgendaSlot = {
  startTime: string;
  endTime: string;
  title: string;
  speakerName?: string;
  speakerNames?: string[];
  description?: string;
  stage: string;
  cancelledAt?: number;
};

export default function StageDmcPage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage: rawStage } = use(params);
  const stage = (rawStage === "main" || rawStage === "side" ? rawStage : "main") as StageKey;
  const agenda = useQuery(api.agenda.list) ?? [];

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const stageAgenda = agenda.filter((s) => s.stage === stage && !s.cancelledAt);
  const liveSlot = clock.isConferenceDay
    ? stageAgenda.find((s) => isLive(s, clock.nowMinutes))
    : null;
  const nextSlot = clock.isConferenceDay
    ? nextSlotsByStage(stageAgenda, clock.nowMinutes)[stage]
    : null;

  const liveProgress = liveSlot
    ? Math.max(
        0,
        Math.min(
          1,
          (clock.nowMinutes -
            parseInt(liveSlot.startTime.split(":")[0], 10) * 60 -
            parseInt(liveSlot.startTime.split(":")[1], 10)) /
            (parseInt(liveSlot.endTime.split(":")[0], 10) * 60 +
              parseInt(liveSlot.endTime.split(":")[1], 10) -
              (parseInt(liveSlot.startTime.split(":")[0], 10) * 60 +
                parseInt(liveSlot.startTime.split(":")[1], 10))),
        ),
      )
    : 0;

  const stageColor =
    stage === "main" ? "text-emerald-300" : "text-violet-300";
  const stageRing =
    stage === "main" ? "ring-emerald-300/30" : "ring-violet-300/30";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-6 sm:p-10 flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Applied AI Conf · {stage} stage · host view
          </p>
          <h1 className={`font-mono text-2xl sm:text-4xl font-bold mt-1 ${stageColor}`}>
            {stage === "main" ? "Main Stage" : "Side Stage"}
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">Now</p>
          <p className="font-mono text-3xl sm:text-5xl font-bold tracking-tighter tabular-nums">
            {clock.nowHHMM}
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {!clock.isConferenceDay && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Conference day
            </p>
            <p className="font-mono text-6xl sm:text-8xl font-bold tracking-tighter">
              {clock.daysUntil > 0
                ? `${clock.daysUntil} ${clock.daysUntil === 1 ? "day" : "days"} to go`
                : "Conference has ended"}
            </p>
          </div>
        )}

        {clock.isConferenceDay && (
          <>
            {liveSlot ? (
              <SlotPanel
                label={
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-rose-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-rose-300">
                      Live now · {liveSlot.startTime}–{liveSlot.endTime}
                    </span>
                  </span>
                }
                slot={liveSlot}
                progress={liveProgress}
                accentRing={stageRing}
              />
            ) : (
              <section className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-200">
                  Between sessions
                </p>
                <h2 className="font-mono text-3xl sm:text-5xl font-bold tracking-tighter text-white/60">
                  Stand by — the next session starts soon.
                </h2>
              </section>
            )}

            {nextSlot && nextSlot !== liveSlot && (
              <SlotPanel
                label={
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
                    Up next · {nextSlot.startTime} ({startsIn(nextSlot.startTime, clock.nowMinutes)})
                  </span>
                }
                slot={nextSlot}
                accentRing={stageRing}
                muted
              />
            )}
          </>
        )}
      </div>

      <footer className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
        auto-refresh every 10s · conference.techeurope.io
      </footer>
    </div>
  );
}

function SlotPanel({
  label,
  slot,
  progress,
  accentRing,
  muted = false,
}: {
  label: React.ReactNode;
  slot: AgendaSlot;
  progress?: number;
  accentRing: string;
  muted?: boolean;
}) {
  const speakers = resolveSpeakers(slot);
  return (
    <section
      className={`rounded-2xl ring-1 ${accentRing} ${
        muted ? "bg-white/[0.015]" : "bg-white/[0.03]"
      } p-5 sm:p-7 space-y-5`}
    >
      <div>{label}</div>
      <h2
        className={`font-mono font-bold tracking-tighter leading-[1.05] ${
          muted ? "text-2xl sm:text-4xl text-white/90" : "text-3xl sm:text-5xl text-white text-glow"
        }`}
      >
        {slot.title}
      </h2>

      {slot.description && !muted && (
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-3xl">
          {slot.description}
        </p>
      )}

      {progress !== undefined && (
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-rose-400 transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {speakers.length > 0 ? (
        <div
          className={`grid gap-3 ${
            speakers.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"
          }`}
        >
          {speakers.map((sp, i) => (
            <SpeakerDetail key={sp.resolved?.name ?? sp.fallbackName ?? i} entry={sp} />
          ))}
        </div>
      ) : (
        // No speaker name on the slot — break, logistics, panel without
        // matched speakers in SPEAKERS. Show nothing extra.
        null
      )}
    </section>
  );
}

type SpeakerEntry = {
  fallbackName: string;
  resolved: Speaker | null;
};

function SpeakerDetail({ entry }: { entry: SpeakerEntry }) {
  const sp = entry.resolved;
  // Unmatched: speaker is on the agenda but not in our static SPEAKERS file.
  // Still useful to render the name so the host has something on screen.
  if (!sp) {
    return (
      <div className="rounded-xl ring-1 ring-white/10 bg-white/[0.02] p-4">
        <p className="font-mono text-base text-white/80">{entry.fallbackName}</p>
        <p className="text-xs text-white/40 mt-1">
          No additional bio data on file.
        </p>
      </div>
    );
  }
  const photo = sp.imageTransparent ?? sp.image;
  return (
    <div className="rounded-xl ring-1 ring-white/10 bg-white/[0.02] p-4 flex gap-4">
      {photo && (
        <div className="relative size-24 sm:size-28 shrink-0 rounded-lg overflow-hidden bg-white/5">
          <Image
            src={photo}
            alt={sp.imageAlt}
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="font-mono text-lg font-bold leading-tight">{sp.name}</p>
        <p className="text-sm text-white/80">
          {sp.title}
          <span className="text-white/40"> · </span>
          <span className="text-white">{sp.company}</span>
        </p>
        {sp.vertical && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {sp.vertical}
          </p>
        )}
        {sp.building && (
          <p className="text-xs text-white/60 leading-snug">{sp.building}</p>
        )}
        {sp.bio && (
          <p className="text-xs text-white/55 leading-snug">{sp.bio}</p>
        )}
        {sp.linkedinUrl && (
          <a
            href={sp.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white pt-1"
          >
            <Linkedin className="size-3" strokeWidth={1.75} />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

function resolveSpeakers(slot: AgendaSlot): SpeakerEntry[] {
  const names: string[] = [];
  if (slot.speakerNames && slot.speakerNames.length > 0) {
    names.push(...slot.speakerNames);
  } else if (slot.speakerName) {
    names.push(slot.speakerName);
  }
  return names.map((n) => ({
    fallbackName: n,
    resolved: findSpeakerByName(n),
  }));
}

function findSpeakerByName(name: string): Speaker | null {
  const norm = name.trim().toLowerCase();
  return (
    (SPEAKERS as Speaker[]).find(
      (sp) => sp.name.trim().toLowerCase() === norm,
    ) ?? null
  );
}

function startsIn(startTime: string, nowMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const delta = h * 60 + m - nowMinutes;
  if (delta <= 0) return "now";
  if (delta < 60) return `in ${delta} min`;
  const hh = Math.floor(delta / 60);
  const mm = delta % 60;
  return `in ${hh}h${mm ? ` ${mm}m` : ""}`;
}
