import { FloorPlan } from "./components/FloorPlan";
import { LiveSchedule } from "./components/LiveSchedule";
import { WifiCard } from "./components/WifiCard";
import { LunchCard } from "./components/LunchCard";
import { HelpCard } from "./components/HelpCard";

export default function HubPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-2">
            Event Hub · May 28, 2026
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-kode-mono), monospace" }}
          >
            Welcome to Applied AI Conf.
          </h1>
          <p className="text-neutral-400 mt-3 text-base sm:text-lg max-w-2xl">
            Everything you need on-site. Wi-Fi, what&apos;s on now, where to eat, and how
            to find your way around The Delta Campus.
          </p>
        </div>

        {/* Top row: Wi-Fi + Schedule */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5 mb-5">
          <WifiCard />
          <LiveSchedule />
        </div>

        {/* Floor plan (full width) */}
        <div className="mb-5">
          <FloorPlan />
        </div>

        {/* Bottom row: Lunch + Help */}
        <div className="grid md:grid-cols-2 gap-5">
          <LunchCard />
          <HelpCard />
        </div>
      </div>
    </div>
  );
}
