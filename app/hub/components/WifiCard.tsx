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
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-mono text-lg font-semibold text-white">Wi-Fi</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => copy(SSID, "ssid")}
          className="group text-left rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 hover:border-white/20 transition-all px-4 py-3 cursor-pointer"
        >
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
            Network
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-white text-base truncate">{SSID}</span>
            {copied === "ssid" ? (
              <Check className="w-4 h-4 text-green-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0" />
            )}
          </div>
        </button>

        <button
          onClick={() => copy(PASSWORD, "password")}
          className="group text-left rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 hover:border-white/20 transition-all px-4 py-3 cursor-pointer"
        >
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
            Password
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-white text-base truncate">{PASSWORD}</span>
            {copied === "password" ? (
              <Check className="w-4 h-4 text-green-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0" />
            )}
          </div>
        </button>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Tap a field to copy. Guest network, open throughout the venue.
      </p>
    </div>
  );
}
