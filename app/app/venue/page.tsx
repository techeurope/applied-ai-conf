import Link from "next/link";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { Coffee, ExternalLink, Lock, MapPin, Toilet, UtensilsCrossed, Wifi } from "lucide-react";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "Venue · Applied AI Conf",
};

export default async function VenuePage() {
  const { user } = await withAuth();
  const signedIn = !!user;
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 03 · venue"
        title={<>The Delta Campus.</>}
        lede={
          <>
            Donaustraße 44, 12043 Berlin (Neukölln). A converted industrial
            space designed for builders, with two stages, a bar, and
            room to think. Four to seven minutes on foot from U Rathaus
            Neukölln (U7), U Boddinstraße (U8), or U Karl-Marx-Straße (U7).
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

      {/* Floor plan — inside The Delta Campus */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // floor plan · delta campus
        </p>
        <div className="rounded-2xl ring-1 ring-white/10 bg-[#0C0C0E] overflow-hidden p-3 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/venue/floorplan-delta.svg"
            alt="Floor plan of The Delta Campus: Main Stage (left), Side Stage (bottom right), Registration (center right), Bar with coffee (top), Booths (top right)"
            className="w-full h-auto block"
          />
        </div>
        <p className="text-xs text-white/55 leading-relaxed">
          Coffee is served at the bar throughout the day. Lunch is in a
          separate building, Kalle Halle — see the walking route below.
        </p>
      </section>

      {/* Walking route to lunch */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/80 flex items-center gap-1.5">
          <UtensilsCrossed className="size-3" strokeWidth={2} />
          // walk to lunch · kalle halle
        </p>
        <div className="rounded-2xl ring-1 ring-white/10 bg-[#0C0C0E] overflow-hidden p-3 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/venue/floorplan-kalle-halle.svg"
            alt="Walking route from The Delta Campus to Kalle Halle for lunch. Red arrows mark the path outside."
            className="w-full h-auto block"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="https://maps.google.com/?q=Kalle+Halle+Berlin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full ring-1 ring-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:bg-white/[0.06]"
          >
            Open Kalle Halle in Maps
            <ExternalLink className="size-3" strokeWidth={1.75} />
          </a>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        {signedIn ? (
          <Info
            icon={Wifi}
            label="WI-FI"
            rows={[
              ["Network", "TBA"],
              ["Password", "TBA"],
            ]}
            note="Credentials are also posted at registration on the day."
          />
        ) : (
          <WifiGate />
        )}
        <Info
          icon={UtensilsCrossed}
          label="LUNCH"
          rows={[
            ["When", "12:30 – 13:30"],
            ["Where", "Kalle Halle (right next door)"],
          ]}
          note="Meat, vegetarian, vegan, gluten-free. Allergens labelled at the counter."
        />
        <Info
          icon={Coffee}
          label="COFFEE"
          rows={[
            ["Morning break", "10:30 – 10:50"],
            ["Afternoon break", "15:10 – 15:30"],
            ["Where", "At the bar"],
          ]}
          note="Coffee is available at the bar throughout the day."
        />
        <Info
          icon={Toilet}
          label="RESTROOMS"
          rows={[
            ["Main", "South corridor"],
            ["Accessible", "Ask Help Desk"],
          ]}
        />
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
  note?: string;
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
      {note && <p className="text-xs text-white/50 leading-relaxed">{note}</p>}
    </div>
  );
}

function WifiGate() {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-1.5">
        <Wifi className="size-3" strokeWidth={2} />
        // wi-fi
      </p>
      <div className="flex items-start gap-2 text-sm text-white/65">
        <Lock className="size-4 text-white/40 mt-0.5 shrink-0" strokeWidth={1.75} />
        <p className="leading-relaxed">
          Wi-Fi credentials are visible after sign-in.{" "}
          <Link
            href="/api/auth/sign-in?return_to=/app/venue"
            className="text-white underline underline-offset-4 hover:no-underline"
          >
            Sign in to see them
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

