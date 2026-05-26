"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Expand, IdCard, ImageUp, Mic, ScanLine, Shield } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { UserQR } from "../components/UserQR";
import { QrScanner } from "../components/QrScanner";
import { FullScreenQr } from "../components/FullScreenQr";

type Mode = "badge" | "scanner";

const LEAD_STATUSES = ["hot", "warm", "cold"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];
const LEAD_STYLES: Record<LeadStatus, string> = {
  hot: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
  warm: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
  cold: "bg-sky-500/20 text-sky-200 ring-sky-500/40",
};

function parseConnectUrl(text: string): string | null {
  try {
    const url = new URL(text);
    const match = url.pathname.match(/^\/(?:app|connect)\/u\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

// Convex wraps `throw new Error(...)` into a generic "Server Error"
// string before it reaches the client — only `ConvexError` carries
// its payload across. Pull the readable string out of either, falling
// back to the supplied default for anything we can't classify.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError) {
    const data = (err as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
    }
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function ConnectPage() {
  const me = useQuery(api.users.me);
  const myTeam = useQuery(api.partners.myTeam);
  const router = useRouter();
  const params = useSearchParams();
  const recordScan = useMutation(api.scans.record);

  const queryMode = params.get("mode");
  const initialFromQuery: Mode | null =
    queryMode === "scanner" || queryMode === "badge" ? queryMode : null;

  const [mode, setMode] = useState<Mode>(initialFromQuery ?? "badge");

  const changeMode = useCallback(
    (next: Mode) => {
      setMode(next);
      const search = new URLSearchParams(Array.from(params.entries()));
      search.set("mode", next);
      router.replace(`/app/connect?${search.toString()}`, { scroll: false });
    },
    [params, router],
  );

  if (me === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (me === null) {
    return <p className="font-mono text-xs text-white/40">Not signed in.</p>;
  }

  // Scanner is partner-team-only. Regular attendees see Badge mode only,
  // with no mode toggle. Admins always get the toggle.
  const isAdmin = me.accessLevel === "admin";
  const canScan = isAdmin || !!me.teamId;
  const effectiveMode: Mode = canScan ? mode : "badge";

  return (
    <div className="space-y-5 pt-1">
      <header className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // CONNECT
        </p>
        {canScan && <ModeToggle mode={effectiveMode} onChange={changeMode} />}
      </header>

      {effectiveMode === "badge" ? (
        <BadgeMode me={me} myTeam={myTeam ?? null} />
      ) : (
        <ScannerMode recordScan={recordScan} />
      )}
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Connect mode"
      className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.02]"
    >
      <ToggleButton active={mode === "badge"} onClick={() => onChange("badge")} icon={IdCard}>
        Badge
      </ToggleButton>
      <ToggleButton active={mode === "scanner"} onClick={() => onChange("scanner")} icon={ScanLine}>
        Scanner
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ScanLine;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5 transition-colors ${
        active ? "bg-white text-black" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}

// ───── Badge mode ─────

type Me = NonNullable<ReturnType<typeof useQuery<typeof api.users.me>>>;
type MyTeam = NonNullable<ReturnType<typeof useQuery<typeof api.partners.myTeam>>> | null;

function BadgeMode({ me, myTeam }: { me: Me; myTeam: MyTeam }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  const token = me.publicToken ?? me._id;
  const badgeUrl = origin ? `${origin}/app/u/${token}` : null;

  return (
    <section className="space-y-3">
      <div className="glass-card rounded-2xl p-5 space-y-4">
        {/* Smaller, click-to-enlarge QR. Tap anywhere on the QR tile and a
            full-screen overlay opens for scanning by the other person. */}
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="group block w-full mx-auto max-w-[240px] sm:max-w-[280px] relative"
          aria-label="Enlarge your badge QR"
        >
          <UserQR
            token={token}
            size={320}
            showUrl={false}
            maxWidthClass="max-w-none"
          />
          <span className="absolute top-2 right-2 size-7 rounded-full bg-stone-900/80 backdrop-blur ring-1 ring-white/15 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <Expand className="size-3.5 text-white" strokeWidth={2} />
          </span>
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
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 pt-1">
            Tap the QR to enlarge
          </p>
        </div>
      </div>

      {badgeUrl && (
        <FullScreenQr
          open={fullscreen}
          value={badgeUrl}
          title={me.name || undefined}
          caption="Let the other person scan this to save your contact."
          onClose={() => setFullscreen(false)}
        />
      )}
    </section>
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

// ───── Scanner mode ─────

type RecordScan = ReturnType<typeof useMutation<typeof api.scans.record>>;

type ScanHistory = {
  priorScanCount: number;
  recentPriorScans: Array<{ scannerName: string; ts: number; isMe: boolean }>;
  leadStatus: LeadStatus | null;
};

type RecentScan = {
  contactId: string;
  scannedUserId: string;
  name: string;
  role?: string;
  company?: string;
  publicToken?: string;
  at: number;
  history: ScanHistory;
};

function ScannerMode({
  recordScan,
}: {
  recordScan: RecordScan;
}) {
  const addNote = useMutation(api.contacts.addNote);
  const updateLead = useMutation(api.contacts.updateLeadQualification);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentScan[]>([]);
  // The just-scanned attendee, popped over the camera until the user
  // dismisses or adds a note. While this is set the camera stays
  // paused so we don't queue more scans behind the modal.
  const [activeScan, setActiveScan] = useState<RecentScan | null>(null);
  // Confirmation toast shown briefly after the modal closes so the
  // partner has visual feedback that the contact was saved.
  const [toast, setToast] = useState<{ name: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);
  const dismissModal = useCallback(() => {
    if (activeScan) setToast({ name: activeScan.name });
    setActiveScan(null);
  }, [activeScan]);
  // Cooldown so the camera doesn't re-decode the same QR a dozen times
  // while it's still in frame. Holds the publicToken just scanned.
  const lastScanRef = useRef<{ token: string; ts: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(
    async (text: string) => {
      if (status === "saving" || activeScan) return;
      const token = parseConnectUrl(text);
      if (!token) {
        setStatus("error");
        setErrorMessage("That QR isn't an attendee code.");
        return;
      }
      // Cooldown: if the same token was scanned in the last 4s, skip —
      // continuous decode loops would otherwise fire the mutation many
      // times for the same QR sitting in front of the camera.
      const last = lastScanRef.current;
      if (last && last.token === token && Date.now() - last.ts < 4_000) {
        return;
      }
      lastScanRef.current = { token, ts: Date.now() };
      setStatus("saving");
      try {
        const clientId = `${crypto.randomUUID()}-${token}`;
        const result = await recordScan({
          token,
          clientId,
        });
        if ("scanned" in result && result.scanned) {
          const history: ScanHistory = "history" in result && result.history
            ? {
                priorScanCount: result.history.priorScanCount,
                recentPriorScans: result.history.recentPriorScans,
                leadStatus:
                  (result.history.leadStatus as LeadStatus | null) ?? null,
              }
            : { priorScanCount: 0, recentPriorScans: [], leadStatus: null };
          const entry: RecentScan = {
            contactId: result.contactId,
            scannedUserId: result.scanned._id,
            name: result.scanned.name,
            role: result.scanned.role,
            company: result.scanned.company,
            publicToken: result.scanned.publicToken,
            at: Date.now(),
            history,
          };
          setRecent((prev) => {
            const filtered = prev.filter(
              (r) => r.scannedUserId !== entry.scannedUserId,
            );
            return [entry, ...filtered].slice(0, 20);
          });
          setActiveScan(entry);
        }
        setStatus("idle");
      } catch (err) {
        setStatus("error");
        setErrorMessage(extractErrorMessage(err, "Could not save scan"));
      }
    },
    [recordScan, status, activeScan],
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
    <section className="space-y-3 relative">
      <QrScanner
        onScan={handleScan}
        paused={status === "saving" || !!activeScan}
      />

      {activeScan && (
        <ScanModal
          scan={activeScan}
          onClose={dismissModal}
          onSaveNote={async (text) => {
            await addNote({
              contactId: activeScan.contactId as Id<"contacts">,
              text,
            });
            dismissModal();
          }}
          onSetLeadStatus={async (next) => {
            await updateLead({
              contactId: activeScan.contactId as Id<"contacts">,
              leadStatus: next,
            });
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-3 z-30 rounded-full bg-emerald-500/95 text-white text-sm font-medium px-4 py-2 shadow-lg animate-fade-in"
        >
          ✓ Saved {toast.name} to leads
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={status === "saving"}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-colors font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white disabled:opacity-50"
      >
        <ImageUp className="size-3.5" strokeWidth={1.75} />
        or upload a photo
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

      {recent.length > 0 && (
        <section className="space-y-2 pt-2">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            This session
          </h3>
          <ul className="space-y-1.5">
            {recent.map((r, i) => {
              const isLatest = i === 0;
              return (
                <li key={r.scannedUserId}>
                  <Link
                    href={`/app/contacts/${r.contactId}`}
                    className={
                      isLatest
                        ? "flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/15 transition-colors"
                        : "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-colors"
                    }
                  >
                    <div className="min-w-0">
                      {isLatest && (
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 mb-1">
                          Just scanned
                        </div>
                      )}
                      <div
                        className={`text-sm ${isLatest ? "font-medium" : ""} text-white truncate`}
                      >
                        {r.name}
                      </div>
                      {(r.role || r.company) && (
                        <div
                          className={`text-[11px] ${
                            isLatest ? "text-white/60" : "text-white/40"
                          } truncate`}
                        >
                          {[r.role, r.company].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-mono text-[10px] shrink-0 ${
                        isLatest
                          ? "uppercase tracking-[0.2em] text-emerald-200"
                          : "text-white/30"
                      }`}
                    >
                      {isLatest ? "Open →" : "→"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}

function ScanModal({
  scan,
  onClose,
  onSaveNote,
  onSetLeadStatus,
}: {
  scan: RecentScan;
  onClose: () => void;
  onSaveNote: (text: string) => Promise<void>;
  onSetLeadStatus: (next: LeadStatus | "clear") => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "note">("view");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pickedStatus, setPickedStatus] = useState<LeadStatus | null>(
    scan.history.leadStatus,
  );
  const [leadBusy, setLeadBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === "note") textareaRef.current?.focus();
  }, [mode]);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    try {
      await onSaveNote(trimmed);
    } catch (e) {
      setErr(extractErrorMessage(e, "Could not save note"));
    } finally {
      setBusy(false);
    }
  }

  async function handlePickStatus(s: LeadStatus) {
    setLeadBusy(true);
    setErr(null);
    try {
      const next = pickedStatus === s ? "clear" : s;
      await onSetLeadStatus(next);
      setPickedStatus(next === "clear" ? null : s);
    } catch (e) {
      setErr(extractErrorMessage(e, "Could not update lead"));
    } finally {
      setLeadBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl"
    >
      <div className="w-full max-w-sm m-3 rounded-2xl bg-zinc-900 ring-1 ring-emerald-400/30 p-5 space-y-4 shadow-2xl">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">
            Just scanned
          </div>
          <div className="text-lg font-medium text-white">{scan.name}</div>
          {(scan.role || scan.company) && (
            <div className="text-sm text-white/60">
              {[scan.role, scan.company].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>

        <ScanHistoryBanner history={scan.history} />

        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            How was this lead?
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={leadBusy}
                onClick={() => handlePickStatus(s)}
                className={`font-mono text-[10px] uppercase tracking-[0.18em] py-2 rounded-md ring-1 transition-colors disabled:opacity-50 ${
                  pickedStatus === s
                    ? LEAD_STYLES[s]
                    : "ring-white/15 text-white/60 hover:text-white hover:ring-white/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {mode === "view" ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setMode("note")}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-white text-black font-mono text-sm font-medium"
            >
              Add note
            </button>
            <Link
              href={`/app/contacts/${scan.contactId}`}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full ring-1 ring-white/20 font-mono text-xs text-white/80 hover:text-white hover:ring-white/30"
            >
              Open lead
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white/50 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quick note for your team — what did you talk about?"
              rows={4}
              className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-white/30 resize-none"
            />
            {err && <p className="text-xs text-rose-200 font-mono">{err}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={busy || !text.trim()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white text-black font-mono text-sm font-medium disabled:opacity-50"
              >
                {busy ? "Saving…" : "OK"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setText("");
                  setErr(null);
                }}
                disabled={busy}
                className="px-4 py-2.5 rounded-full ring-1 ring-white/20 font-mono text-xs text-white/70 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScanHistoryBanner({ history }: { history: ScanHistory }) {
  if (history.priorScanCount === 0) {
    return (
      <div className="rounded-md bg-emerald-500/10 ring-1 ring-emerald-400/20 px-3 py-2 text-xs text-emerald-100">
        First time meeting them.
      </div>
    );
  }
  const last = history.recentPriorScans[0];
  const lastLabel = last ? `${last.isMe ? "you" : last.scannerName} · ${relativeTime(last.ts)}` : null;
  return (
    <div className="rounded-md bg-amber-500/10 ring-1 ring-amber-400/20 px-3 py-2 text-xs text-amber-100 space-y-1">
      <div className="font-medium">
        Already scanned {history.priorScanCount === 1 ? "once" : `${history.priorScanCount} times`}
        {lastLabel ? ` — last by ${lastLabel}` : ""}.
      </div>
      {history.recentPriorScans.length > 1 && (
        <ul className="text-[11px] text-amber-200/70 space-y-0.5">
          {history.recentPriorScans.slice(1).map((s, i) => (
            <li key={i}>
              {s.isMe ? "you" : s.scannerName} · {relativeTime(s.ts)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
