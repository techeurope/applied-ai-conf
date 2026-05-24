import { LifeBuoy, UtensilsCrossed, Wifi, DoorOpen } from "lucide-react";

// Compact strip of info attendees ACTUALLY ask during the day. None of this
// duplicates the top nav — these are facts, not destinations.
export function PracticalStrip({ tone = "white" }: { tone?: "white" | "violet" | "amber" | "sky" | "emerald" }) {
  const hover: Record<typeof tone, string> = {
    white: "hover:text-white",
    violet: "hover:text-violet-200",
    amber: "hover:text-amber-200",
    sky: "hover:text-sky-200",
    emerald: "hover:text-emerald-200",
  };
  void hover;
  return (
    <section className="w-full border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-7 sm:py-9 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        <Item
          icon={Wifi}
          label="WI-FI"
          primary="AppliedAIConf"
          secondary="shipit2026"
        />
        <Item
          icon={DoorOpen}
          label="DOORS"
          primary="08:00"
          secondary="First session 09:10"
        />
        <Item
          icon={UtensilsCrossed}
          label="LUNCH"
          primary="12:30 – 13:30"
          secondary="Expo Hall · veg/vegan/GF"
        />
        <Item
          icon={LifeBuoy}
          label="HELP"
          primary={<a href="mailto:hello@techeurope.io" className="hover:text-white">hello@techeurope.io</a>}
          secondary="Crew · black tee · ask anyone"
        />
      </div>
    </section>
  );
}

function Item({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: typeof Wifi;
  label: string;
  primary: React.ReactNode;
  secondary: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-white/40 mt-1 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
          // {label}
        </p>
        <p className="font-mono text-base sm:text-lg text-white tabular-nums leading-none">
          {primary}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mt-1.5">
          {secondary}
        </p>
      </div>
    </div>
  );
}
