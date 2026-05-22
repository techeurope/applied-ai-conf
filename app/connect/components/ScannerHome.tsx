"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { ImageUp, Camera, QrCode, Pencil, Mic, CalendarDays } from "lucide-react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AGENDA } from "@/data/agenda";
import {
  CONFERENCE_DATE,
  findSpeakerSlots,
  getConferenceClock,
  isLive,
  nextSlotsByStage,
} from "@/lib/conference-time";
import { QrScanner } from "./QrScanner";
import { UserQR } from "./UserQR";

function parseConnectUrl(text: string): string | null {
  try {
    const url = new URL(text);
    const match = url.pathname.match(/^\/connect\/u\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function ScannerHome() {
  const router = useRouter();
  const recordScan = useMutation(api.scans.record);
  const me = useQuery(api.users.me);
  const contacts = useQuery(api.contacts.list);
  const favorites = useQuery(api.favorites.list);
  const myTeam = useQuery(api.partners.myTeam);

  const [mode, setMode] = useState<"show" | "camera" | "upload">("show");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-render every 30s so live agenda chips stay current.
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setClockTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const speakerSlots = me?.isSpeaker ? findSpeakerSlots(AGENDA, me.name ?? "") : [];
  const allLive = clock.isConferenceDay
    ? AGENDA.filter((s) => isLive(s, clock.nowMinutes))
    : [];
  const liveTalks = allLive.filter((s) => s.format !== "break" && s.format !== "logistics");
  // Breaks/logistics are duplicated per stage with identical title+time. Dedupe.
  const liveVenueEventsRaw = allLive.filter(
    (s) => s.format === "break" || s.format === "logistics",
  );
  const liveVenueEvents: typeof liveVenueEventsRaw = [];
  const seenVenue = new Set<string>();
  for (const s of liveVenueEventsRaw) {
    const key = `${s.title}|${s.startTime}|${s.endTime}`;
    if (seenVenue.has(key)) continue;
    seenVenue.add(key);
    liveVenueEvents.push(s);
  }
  const nextByStage = clock.isConferenceDay
    ? nextSlotsByStage(
        AGENDA.filter((s) => s.format !== "logistics" && s.format !== "break"),
        clock.nowMinutes,
        60,
      )
    : {};

  const handleScan = useCallback(
    async (text: string) => {
      if (status === "saving") return;
      const token = parseConnectUrl(text);
      if (!token) {
        setStatus("error");
        setErrorMessage("That QR isn't a Connect code.");
        return;
      }
      setStatus("saving");
      try {
        const clientId = `${crypto.randomUUID()}-${token}`;
        const result = await recordScan({
          scannedUserId: token as Id<"users">,
          clientId,
        });
        if ("scanEventId" in result) {
          router.push(`/connect/contacts`);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Could not save scan");
      }
    },
    [recordScan, router, status],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setStatus("saving");
      setErrorMessage(null);
      try {
        const objectUrl = URL.createObjectURL(file);
        try {
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageUrl(objectUrl);
          await handleScan(result.getText());
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error && err.message.toLowerCase().includes("not found")
            ? "No QR code found in that image."
            : err instanceof Error
              ? err.message
              : "Could not read QR from image",
        );
      }
    },
    [handleScan],
  );

  return (
    <div className="space-y-5 pt-1" data-clock-tick={clockTick}>
      <div className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.02]">
        <ModeButton active={mode === "show"} onClick={() => setMode("show")} icon={QrCode}>
          My QR
        </ModeButton>
        <ModeButton active={mode === "camera"} onClick={() => setMode("camera")} icon={Camera}>
          Camera
        </ModeButton>
        <ModeButton active={mode === "upload"} onClick={() => setMode("upload")} icon={ImageUp}>
          Upload
        </ModeButton>
      </div>

      {mode === "show" && me && (
        <div className="space-y-5">
          {/* Identity strip with role pills */}
          <div className="text-center space-y-2">
            <p className="font-mono text-sm text-white">{me.name || "Unnamed"}</p>
            {(me.role || me.company) && (
              <p className="text-xs text-white/60">
                {[me.role, me.company].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {me.isSpeaker && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                  <Mic className="size-3" strokeWidth={2} />
                  Speaker
                </span>
              )}
              {myTeam?.team && (
                <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/30">
                  {myTeam.team.name} · {myTeam.role}
                </span>
              )}
              {me.accessLevel === "admin" && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-white/10 text-white/80 ring-1 ring-white/20">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Speaker talk callout */}
          {speakerSlots.length > 0 && (
            <div className="rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/30 p-4 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200">
                You&apos;re speaking
              </p>
              {speakerSlots.map((slot) => (
                <div key={slot.id}>
                  <p className="text-sm text-white font-medium leading-snug">{slot.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {slot.startTime}–{slot.endTime} · {slot.stage} stage
                  </p>
                </div>
              ))}
              <Link
                href="/connect/agenda"
                className="inline-block font-mono text-[11px] underline text-emerald-200/80 hover:text-emerald-100"
              >
                See full agenda →
              </Link>
            </div>
          )}

          <UserQR token={me.publicToken ?? me._id} />

          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 text-center">
            Show this to people you meet.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label="Contacts"
              value={contacts?.length ?? 0}
              href="/connect/contacts"
            />
            <Stat
              label="Favorites"
              value={favorites?.length ?? 0}
              href="/connect/agenda"
            />
          </div>

          {/* Live agenda strip */}
          {clock.isConferenceDay &&
            (liveTalks.length > 0 ||
              liveVenueEvents.length > 0 ||
              Object.keys(nextByStage).length > 0) && (
              <div className="rounded-2xl ring-1 ring-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Right now
                  </p>
                  <Link
                    href="/connect/agenda"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white"
                  >
                    full agenda →
                  </Link>
                </div>
                {liveTalks.length === 0 && liveVenueEvents.length === 0 && (
                  <p className="text-xs text-white/50">Between sessions.</p>
                )}
                {liveTalks.map((slot) => (
                  <AgendaCard key={slot.id} slot={slot} kind="live" />
                ))}
                {liveVenueEvents.map((slot) => (
                  <AgendaCard key={slot.id} slot={slot} kind="venue" />
                ))}
                {Object.values(nextByStage)
                  .filter((s) => !liveTalks.includes(s))
                  .map((slot) => (
                    <AgendaCard key={slot.id} slot={slot} kind="next" />
                  ))}
              </div>
            )}
          {!clock.isConferenceDay && clock.daysUntil > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 text-center">
              Conference starts in {clock.daysUntil} {clock.daysUntil === 1 ? "day" : "days"} · {CONFERENCE_DATE}
            </p>
          )}

          <div className="text-center pt-1">
            <Link
              href="/connect/settings"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
            >
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Edit profile
            </Link>
          </div>
        </div>
      )}

      {mode === "camera" && <QrScanner onScan={handleScan} paused={status === "saving"} />}

      {mode === "upload" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "saving"}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            <ImageUp className="size-8 text-white/40" strokeWidth={1.5} />
            <div className="font-mono text-xs text-white/70">Choose photo</div>
            <div className="text-xs text-white/40 max-w-[20ch] text-center leading-relaxed">
              A picture of a badge or a screenshot of a QR works.
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {status === "saving" && (
        <p className="font-mono text-xs text-white/60 text-center animate-pulse">Saving…</p>
      )}
      {status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          <div className="font-mono mb-2">{errorMessage}</div>
          <button
            type="button"
            className="font-mono text-xs underline underline-offset-2 hover:text-red-100"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const inner = (
    <div className="glass-card rounded-2xl px-4 py-3 hover:bg-white/10 transition-colors">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className="font-mono text-xl font-bold text-white">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function AgendaCard({
  slot,
  kind,
}: {
  slot: {
    id: string;
    title: string;
    speakerName?: string;
    stage: string;
    startTime: string;
    endTime: string;
  };
  kind: "live" | "next" | "venue";
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-3 space-y-1">
      <div className="flex items-center gap-2">
        {kind === "live" && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
            <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
            Live
          </span>
        )}
        {kind === "next" && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
            Up next
          </span>
        )}
        {kind === "venue" && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30">
            Now
          </span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          {slot.startTime}–{slot.endTime}
          {kind !== "venue" ? ` · ${slot.stage}` : ""}
        </span>
      </div>
      <p className="text-sm text-white leading-snug">{slot.title}</p>
      {slot.speakerName && <p className="text-xs text-white/60">{slot.speakerName}</p>}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Camera;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-colors flex items-center gap-1.5 ${
        active ? "bg-white text-black" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}
