"use client";

import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";

export default function FeaturedSpeakers() {
  return (
    <section
      id="speakers"
      className="relative w-full min-h-screen bg-black py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
            Speakers
          </h2>
        </div>

        {/* Speakers Grid - Full Width */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {SPEAKERS.map((speaker) => (
            <div
              key={speaker.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-solid border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-950/80 to-black/80 transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              {/* Speaker Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                {speaker.image ? (
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                    <span className="text-4xl font-mono text-gray-600">
                      {speaker.initial}
                    </span>
                  </div>
                )}
              </div>

              {/* Speaker Info */}
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-2xl font-light text-white transition-colors group-hover:text-white lg:text-3xl">
                  {speaker.name}
                </h3>
                <p className="text-sm uppercase tracking-wider text-gray-400 transition-colors group-hover:text-gray-300">
                  {speaker.title} @ {speaker.company}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center lg:mt-24">
          <h3 className="mb-8 text-3xl font-light text-white sm:text-4xl lg:text-5xl">
            More speakers coming soon
          </h3>
          <Link
            href="#"
            className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium uppercase tracking-wider text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Call for proposals
            <span
              aria-hidden
              className="text-xl transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          <p className="mt-6 text-sm text-gray-400 lg:text-base">
            We accept talks until Dec 31, 2025
          </p>
        </div>
      </div>
    </section>
  );
}
