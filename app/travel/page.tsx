import SubpageLayout from "@/components/SubpageLayout";

export const metadata = {
  title: "Travel - Applied AI Conf by {Tech: Europe}",
  description: "Venue details, hotel recommendations, and transport options for Applied AI Conf 2026 in Berlin.",
};

const VENUE = [
  { label: "Location", value: "The Delta Campus, Berlin (Neukölln)" },
  {
    label: "Address",
    value: "Donaustraße 44, 12043 Berlin",
    href: "https://maps.google.com/?q=The+Delta+Campus+Berlin",
  },
  { label: "Date", value: "Thursday, May 28, 2026" },
  { label: "Doors open", value: "08:00" },
];

type Tier = "Premium" | "Mid-range" | "Budget";

const TIER_STYLES: Record<Tier, string> = {
  Premium: "bg-purple-500/15 text-purple-300 border-purple-400/20",
  "Mid-range": "bg-blue-500/15 text-blue-300 border-blue-400/20",
  Budget: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
};

const HOTELS: Array<{
  tier: Tier;
  name: string;
  location: string;
  description: string;
  href: string;
  linkLabel: string;
}> = [
  {
    tier: "Premium",
    name: "Orania.Berlin",
    location: "Oranienplatz, Kreuzberg · ~12 min via U8",
    description:
      "Boutique 5-star on Oranienplatz with a live music room, strong design, and very quiet rooms. Easy U8 ride to the venue.",
    href: "https://www.orania.berlin/",
    linkLabel: "orania.berlin",
  },
  {
    tier: "Mid-range",
    name: "Michelberger Hotel",
    location: "Warschauer Str., Friedrichshain · ~15 min by U / S-Bahn",
    description:
      "An iconic Berlin design hotel with a great breakfast and bar — five minutes from Warschauer Str. with frequent connections south.",
    href: "https://michelbergerhotel.com/",
    linkLabel: "michelbergerhotel.com",
  },
  {
    tier: "Mid-range",
    name: "Hüttenpalast",
    location: "Hobrechtstraße, Neukölln · ~10 min walk",
    description:
      "Quirky neighbourhood hotel with vintage caravans and cabins inside an old factory. Walking distance to the venue, well-loved by guests.",
    href: "https://www.huettenpalast.de/",
    linkLabel: "huettenpalast.de",
  },
  {
    tier: "Budget",
    name: "Estrel Berlin",
    location: "Sonnenallee 225, Neukölln · ~12 min walk",
    description:
      "Europe's largest hotel, basically next door to the venue. Reliable, well-priced, minimal travel time on the day.",
    href: "https://www.estrel.com/",
    linkLabel: "estrel.com",
  },
];

const TRANSPORT = [
  {
    title: "From BER airport",
    description:
      "Fastest: bus X71 from BER to U Rudow, then U7 to U Karl-Marx-Straße (~40 min). Alternative: S85 (or S9 / S45) to Treptower Park, then bus M43 to U Rathaus Neukölln or bus 166 to U Boddinstraße (~55 min). Then 4–7 min on foot to Delta Campus. Ticket: BVG ABC single, €5,00.",
  },
  {
    title: "Long-distance trains",
    description:
      "If you're arriving by ICE / IC, get off at Ostkreuz or Südkreuz — both are faster onward to Neukölln than Hauptbahnhof.",
  },
  {
    title: "Nearest stations",
    description:
      "U Rathaus Neukölln (U7) and U Boddinstraße (U8) are both ~4 min walk. U Karl-Marx-Straße (U7) is ~7 min walk.",
  },
  {
    title: "By taxi / ride-share",
    description:
      "Drop off at Donaustraße 44, 12043 Berlin. Street parking nearby is limited — public transit recommended.",
  },
];

export default function TravelPage() {
  return (
    <SubpageLayout>
      <div className="border-b border-white/10 pb-8 mb-10">
        <span className="inline-block text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-gray-500 mb-3">
          Applied AI Conf 2026
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tighter mb-3">
          Getting to Berlin
        </h1>
        <p className="text-base text-gray-400">
          Venue details, hotel recommendations, and transport options.
        </p>
      </div>

      <p className="text-base text-gray-300 leading-relaxed mb-8">
        The conference takes place at Delta Campus in Neukölln on{" "}
        <span className="text-white font-medium">Thursday, May 28, 2026</span>.
        Doors open at 08:00.
      </p>

      <div className="glass-card rounded-2xl bg-white/5 border border-white/10 px-5 py-4 mb-4 text-sm text-gray-300 leading-relaxed">
        <span className="text-white font-medium">
          Pick up your badge on May 27.
        </span>{" "}
        Badges can be collected at the venue the day before the conference.
        More detailed information will follow soon.
      </div>

      <div className="glass-card rounded-2xl bg-white/5 border border-white/10 px-5 py-4 mb-12 text-sm text-gray-300 leading-relaxed">
        <span className="text-white font-medium">
          We recommend arriving on May 27.
        </span>{" "}
        Multiple side events are taking place the evening before the conference
        — a great way to meet speakers, partners, and fellow attendees before
        the main day.
      </div>

      <p className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-gray-500 mb-3">
        Venue
      </p>
      <div className="glass-card rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 px-6 py-5 mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {VENUE.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">{item.label}</span>
            <span className="text-sm font-medium text-white">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {item.value} <span aria-hidden>↗</span>
                </a>
              ) : (
                item.value
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-gray-500 mb-3">
        Recommended hotels
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
        {HOTELS.map((hotel) => (
          <div
            key={hotel.name}
            className="glass-card rounded-2xl bg-white/[0.02] border border-white/10 px-5 py-4 flex flex-col"
          >
            <span
              className={`inline-block self-start text-[10px] font-mono font-medium tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border mb-3 ${
                TIER_STYLES[hotel.tier]
              }`}
            >
              {hotel.tier}
            </span>
            <p className="text-base font-medium text-white mb-1">
              {hotel.name}
            </p>
            <p className="text-xs text-gray-500 mb-2">{hotel.location}</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-3 flex-1">
              {hotel.description}
            </p>
            <a
              href={hotel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
            >
              {hotel.linkLabel} <span aria-hidden>↗</span>
            </a>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-8">
        <p className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-gray-500 mb-3">
          Getting there
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {TRANSPORT.map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-xl bg-white/[0.02] border border-white/10 px-4 py-4"
            >
              <p className="text-sm font-medium text-white mb-1">
                {item.title}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="border-l-2 border-white/15 pl-4 py-3">
          <p className="text-sm text-gray-400 leading-relaxed">
            Questions about travel or logistics? Reach us at{" "}
            <a
              href="mailto:info@techeurope.io"
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              info@techeurope.io
            </a>
            .
          </p>
        </div>
      </div>
    </SubpageLayout>
  );
}
