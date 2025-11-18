"use client";

import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";

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
      className="relative w-full bg-black py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
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
              className="group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5"
            >
              {/* Speaker Image - Taller aspect ratio */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
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
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 w-full p-10 transition-transform duration-300 group-hover:translate-y-0">
                   <h3 className="text-4xl font-bold text-white leading-tight mb-3">
                    {speaker.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-300">
                    <span className="uppercase tracking-wide text-white/90">{speaker.title}</span>
                    <span className="mx-2 text-gray-500">@</span>
                    <span className="text-white font-semibold">{speaker.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Link
            href="#"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Call for proposals
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Applications open until Dec 31, 2025
          </p>
        </div>
      </div>
    </section>
  );
}
