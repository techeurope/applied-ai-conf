"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Monitor,
  Mic,
  Sparkles,
  Maximize2,
} from "lucide-react";

const STAGES = [
  {
    id: "main" as const,
    label: "Main Stage",
    path: "/stage/main",
    sub: "Keynotes + main-stage talks. The bigger room.",
    accent: "emerald",
  },
  {
    id: "side" as const,
    label: "Side Stage",
    path: "/stage/side",
    sub: "Demos + side-stage talks. The second room.",
    accent: "violet",
  },
];

const ACCENT_STYLES: Record<string, { ring: string; bg: string; pill: string }> = {
  emerald: {
    ring: "ring-emerald-300/40",
    bg: "bg-emerald-400/[0.06]",
    pill: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/40",
  },
  violet: {
    ring: "ring-violet-300/40",
    bg: "bg-violet-400/[0.06]",
    pill: "bg-violet-400/15 text-violet-200 ring-violet-300/40",
  },
};

export default function AdminStagePage() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // STAGE MONITORS
        </p>
        <p className="text-sm text-white/70 leading-relaxed max-w-prose">
          Auto-refreshing live views for the venue TVs at each stage. Public,
          no sign-in required — anyone on the network can open them. Both
          poll Convex every 10s and show the currently-live talk + Up Next.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        {STAGES.map((stage) => (
          <StageCard key={stage.id} stage={stage} origin={origin} />
        ))}
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
          <Sparkles className="size-3" strokeWidth={2} />
          // VENUE SETUP TIPS
        </p>
        <ul className="space-y-2 text-sm text-white/80">
          <Tip icon={Maximize2}>
            <strong>Fullscreen the browser</strong> on the TV — press{" "}
            <Kbd>F11</Kbd> on Windows/Linux or <Kbd>⌃⌘F</Kbd> on Mac. Chrome
            also has a kiosk mode:{" "}
            <Code>chrome --kiosk https://conference.techeurope.io/stage/main</Code>
          </Tip>
          <Tip icon={Monitor}>
            <strong>Disable screensaver</strong> on the host device so it
            doesn&apos;t blank out during long sessions.
          </Tip>
          <Tip icon={Mic}>
            <strong>Page auto-refreshes every 10s</strong> — no need to
            babysit. If WiFi drops the last-rendered slot stays on screen
            until reconnection.
          </Tip>
        </ul>
      </section>
    </div>
  );
}

function StageCard({
  stage,
  origin,
}: {
  stage: (typeof STAGES)[number];
  origin: string;
}) {
  const [copied, setCopied] = useState(false);
  const accent = ACCENT_STYLES[stage.accent];
  const fullUrl = origin ? `${origin}${stage.path}` : stage.path;
  const copyUrl = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <article
      className={`rounded-2xl ring-1 ${accent.ring} ${accent.bg} p-5 space-y-3`}
    >
      <header className="space-y-1">
        <span
          className={`inline-block font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 ${accent.pill}`}
        >
          {stage.id}
        </span>
        <h3 className="font-mono text-xl font-bold tracking-tight">
          {stage.label}
        </h3>
        <p className="text-xs text-white/60">{stage.sub}</p>
      </header>

      <div className="font-mono text-xs text-white/50 break-all leading-relaxed">
        {fullUrl}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={stage.path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-mono text-xs"
        >
          <ExternalLink className="size-3.5" strokeWidth={2} />
          Open in new tab
        </a>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full ring-1 ring-white/15 hover:ring-white/30 font-mono text-xs text-white/70 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3.5" strokeWidth={2} />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" strokeWidth={2} />
              Copy URL
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function Tip({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="size-4 text-white/50 mt-0.5 shrink-0" strokeWidth={1.75} />
      <span className="flex-1 leading-relaxed [&_strong]:text-white">
        {children}
      </span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[11px] text-white/90 bg-white/5 px-1.5 py-0.5 rounded break-all">
      {children}
    </code>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[11px] text-white bg-white/10 ring-1 ring-white/20 px-1.5 py-0.5 rounded">
      {children}
    </kbd>
  );
}
