import { CONFERENCE_INFO } from "@/data/conference";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";

export default function MarketingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* 1. Tech Europe Presents... */}
        <div className="text-2xl sm:text-3xl md:text-4xl tracking-widest text-white font-mono">
          <span className="font-bold">
            {"{"}Tech: Europe{"}"}
          </span>{" "}
          <span>presents</span>
        </div>

        {/* 2. Main Title */}
        <h1 className="w-full text-6xl font-bold tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] leading-[0.9] text-glow font-mono select-none">
          Applied
          <br />
          <span className="text-white block mt-2 sm:mt-4">AI Conf</span>
        </h1>

        {/* Location & Date */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <span className="text-3xl sm:text-4xl font-medium text-white font-mono">Berlin</span>
          <div className="hidden md:block w-0.5 h-8 bg-white" />
          <div className="block md:hidden w-16 h-0.5 bg-white" />
          <span className="text-3xl sm:text-4xl font-medium text-white font-mono">
            {CONFERENCE_INFO.dateDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}
