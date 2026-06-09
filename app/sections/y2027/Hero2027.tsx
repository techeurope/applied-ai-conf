import Link from "next/link";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { InlineNewsletterForm } from "@/components/ui/newsletter-form";
import { PARTNER_2027_FORM_URL } from "./config";

export default function Hero2027() {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pt-32 sm:pb-16 text-center">
      {/* Background - reused Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-[90rem] flex-col items-center">
        {/* Tech Europe */}
        <div className="font-mono text-base sm:text-xl tracking-widest">
          <a
            href="https://techeurope.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 font-bold hover:text-white transition-colors"
          >
            {"{"}Tech: Europe{"}"}
          </a>
        </div>

        {/* Logo wordmark */}
        <div className="mt-6 font-mono text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl leading-[0.9] select-none">
          <span className="text-glow">Applied</span>
          <br />
          <span className="text-glow block mt-1 sm:mt-2">AI Conf</span>
        </div>

        {/* Edition stamp */}
        <p className="mt-5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-white/40">
          May 28, 2026 · The Delta Campus, Berlin
        </p>

        {/* The one major thing — different typeface than the logo */}
        <h1 className="mt-7 w-full max-w-5xl font-mono text-3xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12]">
          Thank you for an{" "}
          <span className="whitespace-nowrap">unforgettable 2026.</span>
        </h1>

        {/* Actions — mirrors the 2026 hero: newsletter on the left (flex-1), CTAs on the right */}
        <div className="mt-9 flex w-full max-w-4xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/2026"
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-mono font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:text-white sm:w-auto"
          >
            Relive 2026
          </Link>
          <Link
            href={PARTNER_2027_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-mono font-medium text-black shadow-xl shadow-white/20 ring-1 ring-white/30 transition-all hover:scale-[1.03] hover:bg-gray-100 hover:shadow-white/30 sm:w-auto"
          >
            Partner with us for 2027
          </Link>
          <div className="w-full sm:flex-1">
            <InlineNewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
