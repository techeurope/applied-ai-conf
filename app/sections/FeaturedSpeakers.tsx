"use client";

import type React from "react";
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

const COMPANY_LOGOS: Record<string, React.ComponentType<{ className?: string }>> = {
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
      company: "",
      bio: "",
      vertical: "",
      building: "More production AI builders coming soon",
      image: undefined,
      initial: "TBA",
      accent: "from-white/10 via-white/10 to-white/10",
      imageAlt: "Speaker to be announced",
    });
  }

  return (
    <section id="speakers" className="relative w-full bg-black py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-mono font-bold tracking-tighter sm:text-6xl md:text-7xl text-white">
            Speakers
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Building the future of AI in Europe
          </p>
        </div>

        {/* Speakers Grid - Conference badge layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => {
            const className = "group relative flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1";

            const cardContent = (
              <>
                {/* Header: Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                  {(speaker.imageTransparent || speaker.image) ? (
                    <Image
                      src={speaker.imageTransparent || speaker.image!}
                      alt={speaker.imageAlt}
                      fill
                      className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                      <span className="text-6xl font-mono text-gray-600">
                        {speaker.initial}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text Section */}
                <div className="flex flex-col p-6">
                  {/* Name */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white font-mono leading-tight">
                      {speaker.name}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Row 1: Role and Company side by side */}
                  <div className="grid grid-cols-2 gap-4 py-3">
                    {/* Role */}
                    <div>
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-1.5">
                        Role
                      </div>
                      <div className="text-sm text-white font-medium leading-relaxed">
                        {speaker.title}
                      </div>
                    </div>

                    {/* Company */}
                    {speaker.company && (
                      <div>
                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-1.5">
                          Company
                        </div>
                        <div className="flex items-center">
                          {(() => {
                            const LogoComponent = COMPANY_LOGOS[speaker.company];
                            return LogoComponent ? (
                              <LogoComponent className="h-5 w-auto text-white" />
                            ) : speaker.companyLogo ? (
                              <Image
                                src={speaker.companyLogo}
                                alt={speaker.logoAlt || `${speaker.company} logo`}
                                width={80}
                                height={20}
                                className="h-5 w-auto"
                              />
                            ) : (
                              <span className="text-sm text-white font-medium">
                                {speaker.company}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Row 2: Building */}
                  <div className="py-3">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-1.5">
                      Building
                    </div>
                    <div className="text-sm text-gray-200 leading-relaxed">
                      {speaker.building}
                    </div>
                  </div>

                  {/* Divider */}
                  {speaker.vertical && <div className="border-t border-white/10" />}

                  {/* Row 3: Vertical */}
                  {speaker.vertical && (
                    <div className="py-3">
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-1.5">
                        Vertical
                      </div>
                      <div className="text-sm text-white font-medium leading-relaxed">
                        {speaker.vertical}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );

            return speaker.linkedinUrl ? (
              <Link
                key={speaker.name}
                href={speaker.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {cardContent}
              </Link>
            ) : (
              <div key={speaker.name} className={className}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <p className="mx-auto mb-6 text-sm text-gray-400 sm:text-base max-w-2xl">
            Shipping AI-powered products to real users? Apply to speak and share
            what you&apos;ve learned.
          </p>
          <Link
            href="https://tally.so/r/gDbPed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:bg-gray-200"
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
