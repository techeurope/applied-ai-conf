import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS } from "@/data/navigation";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { NewsletterModal } from "@/components/ui/newsletter-form";
import { MapPin, Calendar, ArrowRight, Ticket, Mail } from "lucide-react";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-24 text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. Tech Europe Presents... */}
        <div className="font-mono text-sm sm:text-base tracking-widest text-gray-500">
          <a
            href="https://techeurope.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-bold hover:text-gray-300 transition-colors"
          >
            {"{"}Tech: Europe{"}"}
          </a>{" "}
          <span className="uppercase">presents</span>
        </div>

        {/* 2. Main Title */}
        <h1 className="w-full text-6xl font-bold tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] leading-[0.9] text-glow font-mono select-none">
          Applied
          <br />
          <span className="text-white block mt-2 sm:mt-4">AI Conf</span>
        </h1>

        {/* 3. HUD / Bento Grid - Integrated Actions */}
        <div className="w-full max-w-5xl mx-auto">
          {/* Grid Container with borders */}
          <div className="grid grid-cols-1 md:grid-cols-12 border border-white/10 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Top Row: Intro Text (Full Width) */}
            <div className="col-span-1 md:col-span-12 p-6 sm:p-10 border-b border-white/10 flex items-center justify-center bg-black/20">
              <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed font-normal drop-shadow-md">
                Europe&apos;s top builders are shipping AI into production
              </p>
            </div>

            {/* Middle Row Left: Venue (Single Line) */}
            <div className="col-span-1 md:col-span-3 p-5 flex items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 hover:bg-black/50 transition-colors group relative">
              <a
                href="https://www.thedelta.io/berlin/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">View Venue</span>
              </a>
              <MapPin className="h-5 w-5 text-white/80 shrink-0" />
              <span className="text-base font-medium text-white hover:text-gray-300 transition-colors text-left">
                Berlin
              </span>
            </div>

            {/* Middle Row Middle: Date (Single Line) */}
            <div className="col-span-1 md:col-span-3 p-5 flex items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 hover:bg-black/50 transition-colors">
              <Calendar className="h-5 w-5 text-white/80 shrink-0" />
              <div className="text-base font-medium text-white">
                {CONFERENCE_INFO.dateDisplay}
              </div>
            </div>

            {/* Middle Row Right 1: Newsletter */}
            <div className="col-span-1 md:col-span-3 p-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 hover:bg-black/50 transition-colors group">
              <NewsletterModal>
                <button className="w-full h-full flex items-center justify-center gap-3 focus:outline-none cursor-pointer p-5">
                  <Mail className="h-5 w-5 text-white/80 group-hover:text-white transition-colors shrink-0" />
                  <span className="text-base font-medium text-white group-hover:text-white transition-colors">
                    Receive Updates
                  </span>
                </button>
              </NewsletterModal>
            </div>

            {/* Middle Row Right 2: Ticket Action (Simple White) */}
            <div className="col-span-1 md:col-span-3 p-0 relative overflow-hidden group bg-white hover:bg-gray-50 transition-colors rounded-br-2xl">
              <a
                href={ticketAction.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-30"
              >
                <span className="sr-only">{ticketAction.label}</span>
              </a>

              <div className="relative z-20 w-full h-full p-5 flex items-center justify-center gap-3">
                <Ticket className="h-5 w-5 text-black shrink-0" />
                <div className="flex items-center gap-2 text-lg font-bold text-black">
                  Get Tickets
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
