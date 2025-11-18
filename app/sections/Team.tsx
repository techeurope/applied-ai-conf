"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";
import { TEAM } from "@/data/team";

export default function Team() {
  return (
    <section id="team" className="relative w-full bg-black py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-mono mb-3">
            The Team
          </p>
          <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl text-glow">
            People behind Applied AI Conf
          </h2>
        </div>

        {/* Team Grid - Matched to Speakers (Large cards, 3 cols) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 w-full px-5 pb-5 transition-transform duration-300 group-hover:translate-y-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-white leading-tight whitespace-nowrap">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {member.xUrl && (
                        <a
                          href={member.xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
                          aria-label={`${member.name} on X`}
                        >
                          <div className="relative h-4 w-4">
                            <Image src="/x.svg" alt="X" fill />
                          </div>
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
