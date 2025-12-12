"use client";

import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";
import {
  LangdockLogo,
  ChocoLogo,
  TactoLogo,
  LegoraLogo,
  KnowunityLogo,
} from "@/components";

const COMPANY_LOGOS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Langdock: LangdockLogo,
  Choco: ChocoLogo,
  Tacto: TactoLogo,
  Legora: LegoraLogo,
  Knowunity: KnowunityLogo,
};

export default function FeaturedSpeakers() {
  const speakers: Speaker[] = [...SPEAKERS];

  if (speakers.length < 6) {
    speakers.push({
      name: "Speaker TBA",
      title: "To be announced",
      company: "Applied AI Conf",
      bio: "",
      image: undefined,
      initial: "TBA",
      accent: "from-white/10 via-white/10 to-white/10",
    });
  }

  return (
    <section
      id="speakers"
      className="relative w-full bg-black py-24 lg:py-32 min-h-screen flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-5xl font-mono font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-glow">
            Speakers
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Building the future of AI in Europe.
          </p>
        </div>

        {/* Speakers Grid - Three per row on desktop */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
          {speakers.map((speaker) => (
            <div
              key={speaker.name}
              className="group relative flex flex-col transition-all hover:-translate-y-2"
            >
              {/* Speaker Image - Clean, no effects */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-colors duration-300 group-hover:border-green-900/60 group-hover:shadow-[0_0_20px_rgba(0,255,0,0.05)]">
                {speaker.image ? (
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                    <span className="text-6xl font-mono text-gray-600">
                      {speaker.initial}
                    </span>
                  </div>
                )}

                {/* Simple gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 z-10" />
              </div>

              {/* HUD-style name box - extends outside image */}
              <div className="relative -mt-16 -mx-2 border border-white/20 bg-black/90 backdrop-blur-md px-4 py-4 z-30 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-300 group-hover:border-green-500/30 group-hover:shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                {/* Radial Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_40%,transparent_100%)] z-0" />

                {/* Scanlines - White/Alpha (Only on hover) */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px] z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30 rounded-tl-lg z-10 transition-colors duration-300 group-hover:border-green-500/60" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30 rounded-tr-lg z-10 transition-colors duration-300 group-hover:border-green-500/60" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30 rounded-bl-lg z-10 transition-colors duration-300 group-hover:border-green-500/60" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30 rounded-br-lg z-10 transition-colors duration-300 group-hover:border-green-500/60" />

                <div className="relative z-10">
                  <h3 className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-[0.95] tracking-tight drop-shadow-sm transition-colors duration-300 group-hover:text-green-400 group-hover:drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
                    {speaker.name.split(" ").slice(0, -1).join(" ")}
                    <br />
                    {speaker.name.split(" ").slice(-1)[0]}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium text-gray-400 font-mono uppercase tracking-widest transition-colors duration-300 group-hover:text-green-700">
                      {speaker.title}
                    </span>
                    <span className="text-white/30 transition-colors duration-300 group-hover:text-green-900">
                      /
                    </span>
                    {COMPANY_LOGOS[speaker.company] ? (
                      (() => {
                        const LogoComponent = COMPANY_LOGOS[speaker.company];
                        return (
                          <LogoComponent className="h-4 w-auto text-white/70 transition-all duration-300 group-hover:text-green-500" />
                        );
                      })()
                    ) : speaker.companyLogo ? (
                      <Image
                        src={speaker.companyLogo}
                        alt={speaker.company}
                        width={80}
                        height={20}
                        className="h-4 w-auto opacity-70 transition-all duration-300 group-hover:opacity-100 [filter:brightness(0)_invert(1)] group-hover:[filter:brightness(0)_saturate(100%)_invert(48%)_sepia(79%)_saturate(2476%)_hue-rotate(86deg)_brightness(118%)_contrast(119%)]"
                      />
                    ) : (
                      <span className="text-xs font-medium text-white/70 font-mono uppercase tracking-widest transition-colors duration-300 group-hover:text-green-600">
                        {speaker.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <p className="mx-auto mb-6 text-sm text-gray-400 sm:text-base">
            Shipping AI-powered products to real users? Apply to speak and share
            what you&apos;ve learned.
          </p>
          <Link
            href="https://tally.so/r/gDbPed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Call for proposals
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Applications open until January 30, 2026
          </p>
        </div>
      </div>
    </section>
  );
}
