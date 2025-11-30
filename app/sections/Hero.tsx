import { CONFERENCE_INFO } from "@/data/conference";
import { NAVIGATION_ACTIONS } from "@/data/navigation";
import Image from "next/image";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { Linkedin } from "lucide-react";

export default function Hero() {
  const ticketAction = NAVIGATION_ACTIONS[0];

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-24 text-center">
      {/* Background - Lidar Scape */}
      <LidarScapeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-center px-4 sm:px-6 lg:px-8 space-y-8">
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
          <span className="text-white block mt-2 sm:mt-4">
            AI Conf
          </span>
        </h1>

        {/* 3. Intro Sentence - Balanced visual weight */}
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed font-normal drop-shadow-md">
            One day of talks & workshops from founders & engineers sharing
            lessons learned from actually shipping AI into production
          </p>
        </div>

        {/* 4. Venue Pill - Solid black background for readability */}
        <div className="inline-flex items-center justify-center rounded-full bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-3 text-sm text-gray-300 font-sans tracking-wide shadow-lg">
          <a
            href="https://www.thedelta.io/berlin/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium hover:underline underline-offset-4 transition-all"
          >
            The Delta Campus
          </a>
          <span className="mx-3 text-gray-600">·</span>
          Berlin
          <span className="mx-3 text-gray-600">·</span>
          {CONFERENCE_INFO.dateDisplay}
        </div>

        {/* Actions & Newsletter - Slight top margin to separate from content */}
        <div className="flex w-full max-w-2xl flex-col items-center gap-4 pt-4">
          <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-4">
            {/* Newsletter Input */}
            <NewsletterForm className="w-full sm:max-w-sm" />

            {/* Ticket Button */}
            <a
              href={ticketAction.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto whitespace-nowrap px-8 h-12 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center"
            >
              {ticketAction.label}
            </a>
          </div>
          <p className="text-xs text-gray-500 font-mono tracking-wide uppercase">
            Get notified about speakers & early bird tickets
          </p>
        </div>
      </div>
    </section>
  );
}
