"use client";

import { useEffect, useState } from "react";

const PRESETS: { value: string; label: string; note: string }[] = [
  { value: "off", label: "Live", note: "Real time · T−N before May 28" },
  { value: "10:15", label: "10:15", note: "Mid-morning · both stages live" },
  { value: "12:45", label: "12:45", note: "Lunch break (Expo Hall)" },
  { value: "14:00", label: "14:00", note: "Afternoon · both stages live" },
  { value: "15:15", label: "15:15", note: "Coffee break" },
  { value: "17:30", label: "17:30", note: "Closing remarks" },
];

const KEY = "aac:demo-now";

export function DemoClock({
  variationSlugs,
}: {
  variationSlugs: string[];
}) {
  const [active, setActive] = useState<string>("10:15");

  // Mirror sessionStorage on mount so the chooser reflects what's currently
  // set; if nothing is set yet, default to 10:15 so the right-now peek is
  // populated as soon as the user clicks a variation.
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(KEY);
      if (stored && /^\d{1,2}:\d{2}$/.test(stored)) {
        setActive(stored);
      } else {
        window.sessionStorage.setItem(KEY, "10:15");
      }
    } catch {
      /* sessionStorage disabled */
    }
  }, []);

  const apply = (value: string) => {
    setActive(value);
    try {
      if (value === "off") {
        window.sessionStorage.removeItem(KEY);
      } else {
        window.sessionStorage.setItem(KEY, value);
      }
    } catch {
      /* ignore */
    }
    // Re-stamp the variation cards' hrefs in the DOM so clicks go through with
    // the param too (sessionStorage handles persistence, query param handles
    // first-load).
    variationSlugs.forEach((slug) => {
      const el = document.querySelector<HTMLAnchorElement>(
        `[data-variation-link="${slug}"]`,
      );
      if (!el) return;
      el.href =
        value === "off"
          ? `/app/preview/${slug}`
          : `/app/preview/${slug}?__now=${encodeURIComponent(value)}`;
    });
  };

  const activeNote = PRESETS.find((p) => p.value === active)?.note ?? "";

  return (
    <section className="rounded-2xl ring-1 ring-white/15 bg-white/[0.02] p-5 sm:p-6 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
          // demo clock
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          {activeNote}
        </p>
      </div>
      <p className="text-sm text-white/65 leading-relaxed max-w-2xl">
        Picks a fake "now" so you can see the variations as they'd look mid-conference.
        Persists across clicks. Switch back to <span className="font-mono text-white/85">Live</span> for the real countdown.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const isActive = active === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => apply(p.value)}
              className={`px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "bg-white text-black"
                  : "ring-1 ring-white/15 text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
