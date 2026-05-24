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
            One airport, one S-Bahn ride, six minutes on foot. Here's everything
            you need to know to land, sleep, and get to the venue without
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
          <Step n="01" title="Land at BER (Brandenburg)" body="It's the only Berlin airport. Trains leave the airport station every 10–15 min." />
          <Step n="02" title="Take the FEX or RE to Hauptbahnhof" body="≈ 30 min. From Hauptbahnhof, switch to the S-Bahn (S3, S5, S7, S9) toward Charlottenburg." />
          <Step n="03" title="Get off at S Westkreuz" body="≈ 15 min from Hauptbahnhof." />
          <Step n="04" title="Walk 6 minutes to The Delta Campus" body="Follow the signs from the south exit; you'll see the building from the street." />
        </ol>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <Card
          icon={Plane}
          label="AIRPORT"
          title="BER · Berlin Brandenburg"
          body="The only airport. ~25–40 min by train to central Berlin. Taxis run €60–70, but transit is faster at rush hour."
        />
        <Card
          icon={Train}
          label="LONG DISTANCE"
          title="Deutsche Bahn"
          body="Direct ICE / IC trains from Hamburg, Munich, Frankfurt, Amsterdam, Prague, Warsaw. Berlin Hauptbahnhof is the main stop."
        />
        <Card
          icon={Bike}
          label="LOCALLY"
          title="BVG · S-Bahn · U-Bahn"
          body="A single ticket (€3.80 AB) covers the trip from BER to the venue. Bikes can be hired with Nextbike / Tier."
        />
        <Card
          icon={Hotel}
          label="STAY"
          title="Where to sleep"
          body="The Charlottenburg / Wilmersdorf neighborhoods are closest. Mitte and Friedrichshain are 20–25 min away by S-Bahn."
        />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // suggested hotels
        </p>
        <ul className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {[
            {
              name: "25hours Hotel Bikini Berlin",
              area: "Charlottenburg · 12 min by transit",
              note: "Iconic, fun lobby, walking distance to S Zoologischer Garten.",
              url: "https://www.25hours-hotels.com/hotels/berlin/bikini-berlin",
            },
            {
              name: "Hotel Zoo Berlin",
              area: "Kurfürstendamm · 14 min by transit",
              note: "Quiet, design-y, close to U-Bahn and tram lines.",
              url: "https://www.hotelzoo.de/",
            },
            {
              name: "The Hoxton, Charlottenburg",
              area: "Wilmersdorf · 15 min by transit",
              note: "Communal feel; great for groups travelling together.",
              url: "https://thehoxton.com/berlin/",
            },
            {
              name: "Sir Savigny",
              area: "Savignyplatz · 10 min by transit",
              note: "Boutique. One of the closest to the venue.",
              url: "https://www.sirhotels.com/savigny-berlin",
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
