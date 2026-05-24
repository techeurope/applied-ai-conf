"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Expand, IdCard, ImageUp, Mic, ScanLine, Shield } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { UserQR } from "../components/UserQR";
import { QrScanner } from "../components/QrScanner";
import { FullScreenQr } from "../components/FullScreenQr";

type Mode = "badge" | "scanner";

function parseConnectUrl(text: string): string | null {
  try {
    const url = new URL(text);
    const match = url.pathname.match(/^\/(?:app|connect)\/u\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
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

  return (
    <div className="space-y-5 pt-1">
      <header className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // CONNECT
        </p>
        <ModeToggle mode={mode} onChange={changeMode} />
      </header>

      {mode === "badge" ? (
        <BadgeMode me={me} myTeam={myTeam ?? null} />
      ) : (
        <ScannerMode recordScan={recordScan} router={router} />
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

function ScannerMode({
  recordScan,
  router,
}: {
  recordScan: RecordScan;
  router: ReturnType<typeof useRouter>;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(
    async (text: string) => {
      if (status === "saving") return;
      const token = parseConnectUrl(text);
      if (!token) {
        setStatus("error");
        setErrorMessage("That QR isn't an attendee code.");
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
          router.push(`/app/contacts`);
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
    <section className="space-y-3">
      <QrScanner onScan={handleScan} paused={status === "saving"} />

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
    </section>
  );
}
