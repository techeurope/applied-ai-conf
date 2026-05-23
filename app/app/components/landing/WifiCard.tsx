"use client";

import { useState } from "react";
import { Copy, Check, Wifi } from "lucide-react";

const SSID = "AppliedAIConf";
const PASSWORD = "shipit2026";

export function WifiCard() {
  const [copied, setCopied] = useState<"ssid" | "password" | null>(null);

  const copy = async (value: string, which: "ssid" | "password") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="glass-card rounded-2xl p-5 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
        <Wifi className="size-3" strokeWidth={2} />
        // WI-FI
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => copy(SSID, "ssid")}
          className="group text-left rounded-xl ring-1 ring-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:ring-white/20 transition-colors px-3.5 py-2.5"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-0.5">
            Network
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-white truncate">{SSID}</span>
            {copied === "ssid" ? (
              <Check className="size-3.5 text-emerald-300 shrink-0" strokeWidth={2} />
            ) : (
              <Copy className="size-3.5 text-white/30 group-hover:text-white/70 shrink-0" strokeWidth={1.75} />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => copy(PASSWORD, "password")}
          className="group text-left rounded-xl ring-1 ring-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:ring-white/20 transition-colors px-3.5 py-2.5"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-0.5">
            Password
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm text-white truncate">{PASSWORD}</span>
            {copied === "password" ? (
              <Check className="size-3.5 text-emerald-300 shrink-0" strokeWidth={2} />
            ) : (
              <Copy className="size-3.5 text-white/30 group-hover:text-white/70 shrink-0" strokeWidth={1.75} />
            )}
          </div>
        </button>
      </div>
      <p className="text-xs text-white/40">Tap a field to copy. Guest network, open throughout the venue.</p>
    </section>
  );
}
