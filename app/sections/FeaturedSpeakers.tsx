"use client";

import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";
import { applyKerning } from "@/lib/utils";

export default function FeaturedSpeakers() {
  const speakers: Speaker[] = [...SPEAKERS.filter(s => !s.hidden)];

  // Calculate how many placeholders needed to fill the 3-column grid
  const placeholdersNeeded = (3 - (speakers.length % 3)) % 3;
  
  // Add placeholder cards to fill the grid
  for (let i = 0; i < placeholdersNeeded; i++) {
    speakers.push({
      name: "Speaker TBA",
      title: "To be announced",
      company: "",
      bio: "",
      vertical: "",
      building: "More speakers to be announced soon",
      image: undefined,
      initial: "TBA",
      accent: "from-white/10 via-white/10 to-white/10",
      imageAlt: "Speaker to be announced",
      _isPlaceholder: true,
      _placeholderIndex: i,
    } as Speaker & { _isPlaceholder: boolean; _placeholderIndex: number });
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
            const speakerWithMeta = speaker as Speaker & { _isPlaceholder?: boolean; _placeholderIndex?: number };
            const isSecondPlaceholder = speakerWithMeta._isPlaceholder && speakerWithMeta._placeholderIndex === 1;
            
            // Hide second placeholder on small screens (only show on lg where we have 3 columns)
            const responsiveClass = isSecondPlaceholder ? "hidden lg:flex" : "flex";
            const className = `group relative ${responsiveClass} flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1`;

            const isPlaceholder = speakerWithMeta._isPlaceholder;
            
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
                  <div className={isPlaceholder ? "" : "mb-4"}>
                    <h3 className="text-2xl font-bold text-white font-mono leading-tight">
                      {speaker.name.split(" ").map((word, i, words) => (
                        <span key={i}>
                          {applyKerning(word)}
                          {i < words.length - 1 && " "}
                        </span>
                      ))}
                    </h3>
                  </div>

                  {/* Only show details for real speakers */}
                  {!isPlaceholder && (
                    <>
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
                            <div className="text-sm text-white font-medium">
                              {speaker.company}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10" />

                      {/* Row 2: Impact */}
                      <div className="py-3">
                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wide mb-1.5">
                          Impact
                        </div>
                        <div className="text-sm text-gray-200 leading-relaxed">
                          {speaker.building}
                        </div>
                      </div>

                      {/* Vertical removed (covered by Impact) */}
                    </>
                  )}
                </div>
              </>
            );

            const key = speakerWithMeta._isPlaceholder 
              ? `placeholder-${speakerWithMeta._placeholderIndex}` 
              : speaker.name;

            return speaker.linkedinUrl ? (
              <Link
                key={key}
                href={speaker.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {cardContent}
              </Link>
            ) : (
              <div key={key} className={className}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* More speakers note */}
        <div className="mt-20 text-center">
          <p className="mx-auto text-sm text-gray-400 sm:text-base max-w-2xl">
            We&apos;re still adding speakers to the lineup — stay tuned for more announcements.
          </p>
        </div>
      </div>
    </section>
  );
}
