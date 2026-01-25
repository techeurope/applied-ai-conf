import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS, LUMA_EVENT_ID } from "@/data/navigation";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { CompanyLogoMarquee } from "@/components/ui/company-logo-marquee";
import { Ticket, Handshake, MapPin, Mail } from "lucide-react";
import { HeroNewsletterPill } from "@/components/ui/hero-newsletter-pill";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-24 text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
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

        {/* 3. Tagline - Large, breathing typography */}
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-medium text-white/90 tracking-tight max-w-4xl leading-tight">
          Learn how to use AI
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          in production
        </p>

        {/* 4. Floating Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          {/* Location Pill */}
          <a
            href="https://www.thedeltacampus.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all"
          >
            <MapPin className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              {CONFERENCE_INFO.dateDisplay} · Berlin
            </span>
          </a>

          {/* Newsletter Pill */}
          <HeroNewsletterPill />

          {/* Partner Pill */}
          <a
            href="#tiers"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all"
          >
            <Handshake className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              Partner
            </span>
          </a>

          {/* Tickets - Primary CTA */}
          <a
            href={ticketAction.href}
            target="_blank"
            rel="noopener noreferrer"
            data-luma-action="checkout"
            data-luma-event-id={LUMA_EVENT_ID}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-100 transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105"
          >
            <Ticket className="h-4 w-4 text-black" />
            <span className="text-sm font-bold text-black">Get Tickets</span>
          </a>
        </div>

        {/* 5. Speaker Company Logos */}
        <CompanyLogoMarquee />
      </div>
    </section>
  );
}
