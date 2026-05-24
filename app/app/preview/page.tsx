import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { VARIATIONS } from "./_lib/variations";
import { DemoClock } from "./_components/DemoClock";

const ACCENTS: Record<
  string,
  { ring: string; text: string; bg: string; glow: string }
> = {
  emerald: {
    ring: "ring-emerald-300/30",
    text: "text-emerald-200",
    bg: "bg-emerald-400/[0.04]",
    glow: "[box-shadow:0_0_80px_-24px_rgba(52,211,153,0.55)]",
  },
  amber: {
    ring: "ring-amber-300/30",
    text: "text-amber-200",
    bg: "bg-amber-400/[0.04]",
    glow: "[box-shadow:0_0_80px_-24px_rgba(251,191,36,0.5)]",
  },
  violet: {
    ring: "ring-violet-300/30",
    text: "text-violet-200",
    bg: "bg-violet-400/[0.04]",
    glow: "[box-shadow:0_0_80px_-24px_rgba(196,181,253,0.5)]",
  },
  sky: {
    ring: "ring-sky-300/30",
    text: "text-sky-200",
    bg: "bg-sky-400/[0.04]",
    glow: "[box-shadow:0_0_80px_-24px_rgba(125,211,252,0.5)]",
  },
};

export default function PreviewChooser() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // /app · attendee home · four directions
        </p>
        <h1 className="font-mono text-4xl sm:text-6xl font-bold tracking-tighter leading-[0.92]">
          <span className="text-glow">Pick the room.</span>
        </h1>
        <p className="text-base sm:text-lg text-white/55 max-w-2xl leading-relaxed">
          Four full-width takes on the attendee home. Floating switcher
          (bottom-right) flips between them once you're inside.
        </p>
      </header>

      <DemoClock variationSlugs={VARIATIONS.map((v) => v.slug)} />

      <ul className="grid sm:grid-cols-2 gap-4">
        {VARIATIONS.map((v) => {
          const a = ACCENTS[v.accent];
          return (
            <li key={v.slug}>
              <Link
                href={`/app/preview/${v.slug}?__now=10:15`}
                data-variation-link={v.slug}
                className={`group block h-full rounded-3xl ring-1 ${a.ring} ${a.bg} ${a.glow} p-6 sm:p-7 hover:scale-[1.005] transition-transform`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`font-mono text-5xl sm:text-6xl font-bold tabular-nums tracking-tighter ${a.text} leading-none`}
                  >
                    {v.number}
                  </div>
                  <ArrowUpRight
                    className="size-5 text-white/30 group-hover:text-white transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.3em] ${a.text}`}
                  >
                    {v.codename}
                  </p>
                  <p className="text-xl sm:text-2xl text-white font-medium leading-snug">
                    {v.tagline}
                  </p>
                  <p className="text-sm text-white/55 leading-relaxed">
                    {v.hook}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 pt-2">
                    {v.vibe}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl ring-1 ring-white/10 p-5 sm:p-6 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // new static pages (none of these are tabs)
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {[
            { href: "/app/about", label: "About" },
            { href: "/app/programme", label: "Programme" },
            { href: "/app/venue", label: "Venue" },
            { href: "/app/faq", label: "FAQ" },
            { href: "/app/travel", label: "Travel" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg ring-1 ring-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:ring-white/20 px-3 py-2.5 font-mono uppercase tracking-[0.18em] text-[10px] text-white/70 hover:text-white text-center transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </ul>
      </section>
    </div>
  );
}
