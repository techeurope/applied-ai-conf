import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS } from "@/data/navigation";
import { FluidWaveBackground } from "@/components/ui/fluid-wave-background";
import { Linkedin, X } from "lucide-react";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-[110vh] w-full flex-col items-center justify-center overflow-hidden py-32 text-center">
      {/* Background Fluid Wave - Slightly darkened for text contrast */}
      <FluidWaveBackground />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        {/* Organized By - New Branding */}
        <div className="mb-6 font-mono text-sm tracking-widest text-gray-400 uppercase">
          Organized by{" "}
          <span className="text-white font-semibold">
            {"{"}Tech: Europe{"}"}
          </span>
        </div>

        {/* Date/Location Pill - Mono font for tech feel */}
        <div className="glass mb-10 inline-flex items-center rounded-full px-5 py-2 text-sm font-medium text-white/90 transition-transform hover:scale-105 cursor-default border-white/10 font-mono tracking-wide">
          <span className="mr-3 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {CONFERENCE_INFO.location}
        </div>

        {/* Main Title - Full width, massive scale, Mono font */}
        <h1 className="mb-12 w-full text-6xl font-bold tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] leading-[0.85] text-glow font-mono select-none">
          Applied AI
          <br />
          <span className="text-white/40">in Europe</span>
        </h1>

        {/* Description - Sans font, high readability, large size */}
        <div className="mb-16 max-w-4xl mx-auto backdrop-blur-sm rounded-2xl p-4 sm:p-0">
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed font-normal max-w-3xl mx-auto drop-shadow-md">
            The definitive conference for{" "}
            <span className="text-white font-medium">Applied AI</span> in
            Europe.
            <br className="hidden sm:block" />
            One full day of talks & workshops in the heart of Berlin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full max-w-lg flex-col gap-5 sm:flex-row sm:justify-center items-center">
          {/* Ticket Button */}
          <a
            href={ticketAction.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            {ticketAction.label}
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/techeurope_"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 border border-white/10"
              aria-label="Follow on X (Twitter)"
            >
              <X className="h-6 w-6" />
            </a>
            <a
              href="https://linkedin.com/company/techeurope"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 border border-white/10"
              aria-label="Follow on LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
