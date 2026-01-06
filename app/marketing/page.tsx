import { CONFERENCE_INFO } from "@/data/conference";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { MapPin, Calendar } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. Tech Europe Presents... */}
        <div className="font-mono text-sm sm:text-base tracking-widest text-gray-500">
          <span className="text-white font-bold">
            {"{"}Tech: Europe{"}"}
          </span>{" "}
          <span className="uppercase">presents</span>
        </div>

        {/* 2. Main Title */}
        <h1 className="w-full text-6xl font-bold tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] leading-[0.9] text-glow font-mono select-none">
          Applied
          <br />
          <span className="text-white block mt-2 sm:mt-4">AI Conf</span>
        </h1>

        {/* 3. HUD / Bento Grid */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Grid Container with borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Top Row: Intro Text (Full Width) */}
            <div className="col-span-1 md:col-span-2 p-6 sm:p-10 border-b border-white/10 flex items-center justify-center bg-black/20">
              <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed font-normal drop-shadow-md">
                Shipping AI into production from Europe&apos;s best founders &
                engineers
              </p>
            </div>

            {/* Bottom Row Left: Venue */}
            <div className="col-span-1 p-5 flex items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
              <MapPin className="h-5 w-5 text-white/80 shrink-0" />
              <span className="text-base font-medium text-white">Berlin</span>
            </div>

            {/* Bottom Row Right: Date */}
            <div className="col-span-1 p-5 flex items-center justify-center gap-3 bg-black/40">
              <Calendar className="h-5 w-5 text-white/80 shrink-0" />
              <div className="text-base font-medium text-white">
                {CONFERENCE_INFO.dateDisplay}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
