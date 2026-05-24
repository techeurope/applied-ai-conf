"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { VARIATIONS } from "../_lib/variations";

// Tiny floating dock on every preview page so you can A/B click between
// variations without going back to the chooser.
export function VariationSwitcher() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const active = VARIATIONS.find((v) => pathname.endsWith(`/${v.slug}`));

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {open ? (
        <div className="rounded-2xl ring-1 ring-white/20 bg-black/80 backdrop-blur-xl p-2 w-[260px] shadow-2xl">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              // variations
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white"
              aria-label="Close switcher"
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <ul className="space-y-0.5 mt-1">
            {VARIATIONS.map((v) => {
              const isActive = active?.slug === v.slug;
              return (
                <li key={v.slug}>
                  <Link
                    href={`/app/preview/${v.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                      isActive
                        ? "bg-white text-black"
                        : "text-white/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] tabular-nums ${
                        isActive ? "text-black/60" : "text-white/30"
                      }`}
                    >
                      {v.number}
                    </span>
                    <span className="font-mono uppercase tracking-[0.15em] text-[10px]">
                      {v.codename}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className="pt-1 mt-1 border-t border-white/10">
              <Link
                href="/app/preview"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-white/50 hover:text-white"
              >
                <ArrowLeftRight className="size-3" strokeWidth={1.75} />
                Compare all
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full ring-1 ring-white/20 bg-black/70 backdrop-blur-xl px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/80 hover:text-white hover:ring-white/40 flex items-center gap-2"
        >
          <ArrowLeftRight className="size-3.5" strokeWidth={1.75} />
          {active ? `${active.number} · ${active.codename}` : "Variations"}
        </button>
      )}
    </div>
  );
}
