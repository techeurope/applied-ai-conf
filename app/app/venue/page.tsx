import Link from "next/link";
import { Accessibility, Coffee, ExternalLink, MapPin, Toilet, UtensilsCrossed, Wifi } from "lucide-react";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "Venue · Applied AI Conf",
};

export default function VenuePage() {
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 03 · venue"
        title={<>The Delta Campus.</>}
        lede={
          <>
            Berlin. A converted industrial space designed for builders, with
            two stages, an expo hall, and room to think. Six minutes by foot
            from S Westkreuz.
          </>
        }
      />

      {/* Address card */}
      <section className="rounded-2xl ring-1 ring-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(125,211,252,0.12),transparent_50%)] p-5 sm:p-6 space-y-3 overflow-hidden">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sky-200/80 flex items-center gap-1.5">
          <MapPin className="size-3" strokeWidth={2} />
          // address
        </p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
          The Delta Campus
          <br />
          <span className="text-white/55 text-lg sm:text-xl font-normal">Berlin</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="https://thedelta.io/berlin/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full ring-1 ring-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:bg-white/[0.06]"
          >
            thedelta.io
            <ExternalLink className="size-3" strokeWidth={1.75} />
          </a>
          <a
            href="https://maps.google.com/?q=The+Delta+Campus+Berlin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full ring-1 ring-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:bg-white/[0.06]"
          >
            Open in Maps
            <ExternalLink className="size-3" strokeWidth={1.75} />
          </a>
        </div>
      </section>

      {/* Floor plan thumbnail link */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // walk the floor
        </p>
        <Link
          href="/app/preview/v4"
          className="group block rounded-2xl ring-1 ring-white/10 bg-[#07090f] overflow-hidden hover:ring-sky-300/30 transition-all relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/venue/floorplan-bg.png"
            alt="Floor plan of The Delta Campus"
            className="w-full h-auto block opacity-60 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-200/80">
                interactive map
              </p>
              <p className="text-base text-white font-medium leading-snug">
                Tap a zone to see what's there and walking directions.
              </p>
            </div>
            <ArrowGlyph />
          </div>
        </Link>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <Info
          icon={Wifi}
          label="WI-FI"
          rows={[
            ["Network", "AppliedAIConf"],
            ["Password", "shipit2026"],
          ]}
          note="Guest network, open throughout the venue."
        />
        <Info
          icon={UtensilsCrossed}
          label="LUNCH"
          rows={[
            ["When", "12:30 – 13:30"],
            ["Where", "Expo Hall"],
          ]}
          note="Meat, vegetarian, vegan, gluten-free. Allergens labelled at the counter."
        />
        <Info
          icon={Coffee}
          label="COFFEE"
          rows={[
            ["Morning break", "10:30 – 10:50"],
            ["Afternoon break", "15:10 – 15:30"],
          ]}
          note="Plus coffee available all day in the expo hall."
        />
        <Info
          icon={Toilet}
          label="RESTROOMS"
          rows={[
            ["Main", "South corridor"],
            ["Accessible", "Ask Help Desk"],
          ]}
          note="Gender-neutral restrooms available."
        />
      </section>

      <section className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-1.5">
          <Accessibility className="size-3" strokeWidth={2} />
          // accessibility
        </p>
        <ul className="space-y-2 text-sm text-white/70 leading-relaxed">
          <li>Step-free access from the main entrance.</li>
          <li>Accessible restroom available — ask Help Desk if you can't find it.</li>
          <li>Reserved seating in both stages — ask Crew (black T-shirts) on arrival.</li>
          <li>Subtitles and quiet rooms available; flag your needs in the onboarding form.</li>
          <li>
            Anything we missed? Email{" "}
            <a className="text-white underline underline-offset-4 hover:no-underline" href="mailto:hello@techeurope.io">
              hello@techeurope.io
            </a>{" "}
            and we'll make it work.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // getting in
        </p>
        <p className="text-sm text-white/65 leading-relaxed">
          Doors open 08:00. Pick up your badge at registration straight ahead of
          the entrance. Bring the Luma email QR or your full name — either works.
          The first session is at 09:10; aim to be inside by 09:00.
        </p>
      </section>

      <PageFooter />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  rows,
  note,
}: {
  icon: typeof Wifi;
  label: string;
  rows: [string, string][];
  note: string;
}) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-1.5">
        <Icon className="size-3" strokeWidth={2} />
        // {label}
      </p>
      <dl className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              {k}
            </dt>
            <dd className="font-mono text-sm text-white tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-white/50 leading-relaxed">{note}</p>
    </div>
  );
}

function ArrowGlyph() {
  return (
    <span className="font-mono text-sky-200 text-base">→</span>
  );
}
