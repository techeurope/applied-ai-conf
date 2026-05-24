import Link from "next/link";
import { ArrowUpRight, MapPin, Train, Users2 } from "lucide-react";

// The questions a first-timer actually has, answered as flat facts (no
// marketing copy, no duplication of the top nav).
export function ConferenceFacts({
  accent = "white",
}: {
  accent?: "white" | "violet" | "amber" | "sky" | "emerald";
}) {
  const linkHover: Record<typeof accent, string> = {
    white: "hover:text-white",
    violet: "hover:text-violet-200",
    amber: "hover:text-amber-200",
    sky: "hover:text-sky-200",
    emerald: "hover:text-emerald-200",
  };
  return (
    <section className="w-full border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-7 sm:py-9 grid lg:grid-cols-3 gap-x-10 gap-y-7">
        <Fact
          label="WHAT"
          icon={Users2}
          headline="1 day · 2 stages · 25 talks"
          body="In-person conference for engineers shipping AI to production. No product pitches, just real systems."
        />
        <Fact
          label="WHERE"
          icon={MapPin}
          headline="The Delta Campus, Berlin"
          body="Street address on the venue page. Step-free access, accessible restrooms, reserved seating on request."
          link={{ href: "/app/venue", label: "Floor plan & access", hover: linkHover[accent] }}
        />
        <Fact
          label="GETTING IN"
          icon={Train}
          headline="S Westkreuz · 6 min walk"
          body="Direct from BER on FEX/RE → Hauptbahnhof → S3/5/7/9 to Westkreuz. Sleep in Berlin the night before."
          link={{ href: "/app/travel", label: "Berlin → venue", hover: linkHover[accent] }}
        />
      </div>
    </section>
  );
}

function Fact({
  label,
  icon: Icon,
  headline,
  body,
  link,
}: {
  label: string;
  icon: typeof MapPin;
  headline: string;
  body: string;
  link?: { href: string; label: string; hover: string };
}) {
  return (
    <div className="flex items-start gap-3.5">
      <Icon className="size-4 text-white/40 mt-1 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0 space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // {label}
        </p>
        <p className="font-mono text-base sm:text-lg text-white leading-tight">
          {headline}
        </p>
        <p className="text-sm text-white/55 leading-relaxed">{body}</p>
        {link && (
          <Link
            href={link.href}
            className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 ${link.hover} transition-colors pt-1`}
          >
            {link.label}
            <ArrowUpRight className="size-3" strokeWidth={1.75} />
          </Link>
        )}
      </div>
    </div>
  );
}
