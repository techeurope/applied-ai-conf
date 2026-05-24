import Link from "next/link";

// Links to the genuinely new pages — none of these exist as top-nav tabs.
const LINKS = [
  { href: "/app/about", label: "About the day", note: "Format, audience, the point of it." },
  { href: "/app/programme", label: "Programme", note: "Six clusters, two panels, the anti-repetition rule." },
  { href: "/app/venue", label: "Venue & floor plan", note: "Address, wifi, accessibility, walking directions." },
  { href: "/app/travel", label: "Travel", note: "Berlin airports, transit, hotels close by." },
  { href: "/app/faq", label: "FAQ", note: "Recordings, photos, dietary, lost & found." },
];

export function MoreLinks({ accent = "white" }: { accent?: "white" | "violet" | "amber" | "sky" | "emerald" }) {
  const hover: Record<typeof accent, string> = {
    white: "hover:text-white",
    violet: "hover:text-violet-200",
    amber: "hover:text-amber-200",
    sky: "hover:text-sky-200",
    emerald: "hover:text-emerald-200",
  };
  return (
    <section className="w-full border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-8 sm:py-10 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // background reading
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`group inline-flex flex-col text-left`}
              >
                <span
                  className={`font-mono text-base text-white/85 ${hover[accent]} transition-colors border-b border-dotted border-white/15 pb-0.5 inline-flex items-center gap-1.5 w-fit`}
                >
                  {l.label}
                  <span className="text-xs">→</span>
                </span>
                <span className="text-xs text-white/45 mt-1.5 leading-relaxed">
                  {l.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
