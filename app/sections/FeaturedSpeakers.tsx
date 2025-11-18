"use client";

import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";

export default function FeaturedSpeakers() {
  return (
    <section
      id="speakers"
      className="relative w-full bg-black py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
            Speakers
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Building the future of AI in Europe.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SPEAKERS.map((speaker) => (
            <div
              key={speaker.name}
              className="group relative flex flex-col overflow-hidden rounded-xl glass-card transition-all hover:-translate-y-1"
            >
              {/* Speaker Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
                {speaker.image ? (
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                    <span className="text-4xl font-mono text-gray-600">
                      {speaker.initial}
                    </span>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                
                {/* Text Content (Over Image) */}
                <div className="absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 group-hover:translate-y-0">
                   <h3 className="text-lg font-bold text-white leading-tight">
                    {speaker.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-300">
                    {speaker.company}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {speaker.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Link
            href="#"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/30"
          >
            Call for proposals
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Applications open until Dec 31, 2025
          </p>
        </div>
      </div>
    </section>
  );
}
