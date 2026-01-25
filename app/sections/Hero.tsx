import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS, LUMA_EVENT_ID } from "@/data/navigation";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { InlineNewsletterForm } from "@/components/ui/newsletter-form";
import { CompanyLogoMarquee } from "@/components/ui/company-logo-marquee";
import { Ticket } from "lucide-react";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-24 text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-7">
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

        {/* 3. Date + Location */}
        <div className="-mt-1 text-xs sm:text-sm font-medium text-white/60">
          {CONFERENCE_INFO.dateDisplay} ·{" "}
          <a
            href="https://www.thedeltacampus.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white/50"
          >
            The Delta Campus
          </a>
        </div>

        {/* 4. Tagline - Large, breathing typography */}
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-medium text-white/90 tracking-tight max-w-4xl leading-tight">
          For teams building and running AI systems in production
        </p>

        {/* 5. Actions */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
          <div className="w-full sm:flex-1">
            <InlineNewsletterForm />
          </div>
          <a
            href={ticketAction.href}
            target="_blank"
            rel="noopener noreferrer"
            data-luma-action="checkout"
            data-luma-event-id={LUMA_EVENT_ID}
            className="group flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-gray-100 transition-all shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-[1.03] w-full sm:w-auto ring-1 ring-white/30"
          >
            <Ticket className="h-4 w-4 text-black" />
            <span className="text-base font-bold text-black">Get Tickets</span>
          </a>
        </div>

        {/* 6. Speaker Company Logos */}
        <CompanyLogoMarquee />
      </div>
    </section>
  );
}
