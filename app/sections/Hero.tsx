import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS, LUMA_EVENT_ID } from "@/data/navigation";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { InlineNewsletterForm } from "@/components/ui/newsletter-form";
import { Ticket, Handshake } from "lucide-react";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-24 text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. Tech Europe */}
        <div className="font-mono text-xl sm:text-2xl md:text-3xl tracking-widest">
          <a
            href="https://techeurope.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-bold hover:text-gray-300 transition-colors"
          >
            {"{"}Tech: Europe{"}"}
          </a>
        </div>

        {/* 2. Main Title (H1) */}
        <h1 className="w-full text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] leading-[0.9] font-mono select-none">
          <span className="text-glow">Applied</span>
          <br />
          <span className="text-glow block mt-2 sm:mt-4">AI Conf</span>
        </h1>

        {/* 3. HUD / Bento Grid - Integrated Actions */}
        <div className="w-full max-w-5xl mx-auto">
          {/* Grid Container with borders */}
          <div className="grid grid-cols-1 md:grid-cols-12 border border-white/10 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Top Row: Single Tagline (Full Width) */}
            <div className="col-span-1 md:col-span-12 p-6 sm:p-8 border-b border-white/10 flex flex-col items-center justify-center bg-black/20">
              <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium drop-shadow-md max-w-4xl">
                Learn how to use AI in production
              </p>
            </div>

            {/* Middle Row Left: Date & Location Combined */}
            <div className="col-span-1 md:col-span-4 p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
              <div className="text-sm font-medium text-white">
                {CONFERENCE_INFO.dateDisplay} ·{" "}
                <a
                  href="https://www.thedeltacampus.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors underline decoration-white/30 hover:decoration-white/60"
                >
                  Delta Campus Berlin
                </a>
              </div>
            </div>

            {/* Middle Row: Newsletter Email Field - More Prominent */}
            <div className="col-span-1 md:col-span-4 p-2 border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
              <InlineNewsletterForm />
            </div>

            {/* Middle Row: Become a Partner (Secondary CTA) */}
            <div className="col-span-1 md:col-span-2 p-0 relative overflow-hidden group bg-transparent border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors">
              <a href="#tiers" className="absolute inset-0 z-30">
                <span className="sr-only">Become a partner</span>
              </a>
              <div className="relative z-20 w-full h-full p-4 flex items-center justify-center gap-2">
                <Handshake className="h-4 w-4 text-white/80 shrink-0" />
                <span className="text-sm font-medium text-white">Partner</span>
              </div>
            </div>

            {/* Middle Row Right: Ticket Action (Primary CTA - Simple White) */}
            <div className="col-span-1 md:col-span-2 p-0 relative overflow-hidden group bg-white hover:bg-gray-50 transition-colors md:rounded-br-2xl">
              <a
                href={ticketAction.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-30"
                data-luma-action="checkout"
                data-luma-event-id={LUMA_EVENT_ID}
              >
                <span className="sr-only">{ticketAction.label}</span>
              </a>

              <div className="relative z-20 w-full h-full p-4 flex items-center justify-center gap-2">
                <Ticket className="h-4 w-4 text-black shrink-0" />
                <span className="text-sm font-bold text-black">Tickets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
