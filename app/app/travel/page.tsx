import Link from "next/link";
import { ExternalLink, Plane, Train, Hotel, Bike, ArrowRight } from "lucide-react";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "Travel · Applied AI Conf",
};

export default function TravelPage() {
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 04 · travel"
        title={<>Getting to Berlin.</>}
        lede={
          <>
            One airport, a 40-minute door-to-door ride, a four-minute walk.
            Everything you need to land, sleep, and reach the venue without
            stress.
          </>
        }
      />

      {/* Door-to-door */}
      <section className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // door to door
        </p>
        <ol className="space-y-3">
          <Step n="01" title="Land at BER" body="The only airport in Berlin." />
          <Step
            n="02"
            title="Fastest: Bus X71 to U Rudow, then U7 to U Karl-Marx-Straße"
            body="≈ 40 min total. Alternative: S85 (or S9 / S45) to Treptower Park, then bus M43 to U Rathaus Neukölln or bus 166 to U Boddinstraße. ≈ 55 min."
          />
          <Step
            n="03"
            title="Walk 4–7 min to The Delta Campus"
            body="Donaustraße 44, 12043 Berlin (Neukölln). From Rathaus Neukölln (U7) or Boddinstraße (U8) ≈ 4 min; from Karl-Marx-Straße (U7) ≈ 7 min."
          />
        </ol>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <Card
          icon={Plane}
          label="AIRPORT"
          title="BER · Berlin Brandenburg"
          body="The only airport. Combine bus + U-Bahn for the fastest route to Neukölln (≈ 40 min). Taxis run €50–70."
        />
        <Card
          icon={Train}
          label="LONG DISTANCE"
          title="Deutsche Bahn"
          body="If you're coming by train, get off at Ostkreuz or Südkreuz instead of Hauptbahnhof — both are much faster onward to Neukölln."
        />
        <Card
          icon={Bike}
          label="LOCALLY"
          title="BVG · S-Bahn · U-Bahn"
          body="From BER you need a single BVG ABC ticket (€5.00) — BER is in zone C. Inside the city an AB ticket is enough. Bikes via Nextbike / Tier."
        />
        <Card
          icon={Hotel}
          label="STAY"
          title="Where to sleep"
          body="Neukölln, Kreuzberg, and Friedrichshain are all within 5–15 min of the venue. See the recommended hotels below."
        />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // suggested hotels
        </p>
        <ul className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {[
            {
              name: "Estrel Berlin",
              area: "Neukölln · 12 min walk / 1 stop on the M41 bus",
              note: "Europe's largest hotel. Reliable, well-priced, basically next door.",
              url: "https://www.estrel.com/",
            },
            {
              name: "Orania.Berlin",
              area: "Kreuzberg, Oranienplatz · 12 min via U8",
              note: "Boutique 5-star with a live music room; quiet rooms, strong design.",
              url: "https://www.orania.berlin/",
            },
            {
              name: "Hüttenpalast",
              area: "Neukölln, Hobrechtstraße · 10 min walk",
              note: "Indoor vintage caravans + regular rooms. Quirky, well-loved.",
              url: "https://www.huettenpalast.de/",
            },
            {
              name: "Michelberger Hotel",
              area: "Friedrichshain, Warschauer Str · 15 min by U / S-Bahn",
              note: "Iconic Berlin design hotel with a great breakfast and bar.",
              url: "https://michelbergerhotel.com/",
            },
          ].map((h) => (
            <li key={h.name}>
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[1fr_auto] gap-3 items-baseline px-4 sm:px-5 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <div>
                  <p className="text-sm text-white font-medium">{h.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{h.area}</p>
                  <p className="text-xs text-white/45 mt-0.5">{h.note}</p>
                </div>
                <ExternalLink className="size-3.5 text-white/30" strokeWidth={1.75} />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/45 leading-relaxed">
          Not affiliated, just walkable and well-reviewed near the venue. We'll
          share a small partner discount code closer to the date.
        </p>
      </section>

      <section className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // arrive the night before
        </p>
        <p className="text-sm text-white/65 leading-relaxed">
          Doors are 08:00 sharp and the room fills up fast. If you're flying in
          from outside the EU, sleeping in Berlin the night before saves a lot
          of nerves.
        </p>
      </section>

      <Link
        href="/app/venue"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white"
      >
        Continue to venue details
        <ArrowRight className="size-3" strokeWidth={1.75} />
      </Link>

      <PageFooter />
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-3 items-baseline">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200/70 tabular-nums">
        {n}
      </span>
      <div>
        <p className="text-sm text-white font-medium">{title}</p>
        <p className="text-sm text-white/55 mt-0.5">{body}</p>
      </div>
    </li>
  );
}

function Card({
  icon: Icon,
  label,
  title,
  body,
}: {
  icon: typeof Plane;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-1.5">
        <Icon className="size-3" strokeWidth={2} />
        // {label}
      </p>
      <p className="text-base text-white font-medium">{title}</p>
      <p className="text-sm text-white/55 leading-relaxed">{body}</p>
    </div>
  );
}
