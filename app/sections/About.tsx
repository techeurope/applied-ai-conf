"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Venue() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="venue"
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex items-end"
    >
      {/* Background: Berlin cityscape, full bleed */}
      <Image
        src="/venue/berlin-cityscape.png"
        alt="Berlin cityscape at dusk"
        fill
        className="object-cover"
        priority={false}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

      {/* Content */}
      <div
        className={`relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pb-16 pt-32 lg:pb-24 transition-all duration-1000 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        {/* Headline */}
        <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-bold tracking-tighter text-glow mb-4">
          Berlin.
        </h2>
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-mono tracking-tight mb-4">
          Europe&apos;s startup capital.
        </p>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Home to 500+ AI companies, a thriving open-source community, and
          the highest density of tech talent in continental Europe. The city
          where builders come to ship.
        </p>

        {/* Delta Campus card */}
        <div className="bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md max-w-3xl">
          <div className="flex flex-col sm:flex-row">
            {/* Venue image */}
            <div className="relative w-full sm:w-64 md:w-80 h-48 sm:h-auto flex-shrink-0">
              <Image
                src="/delta-campus-berlin.jpg"
                alt="The Delta Campus Berlin"
                fill
                className="object-cover"
              />
            </div>
            {/* Venue info */}
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <p className="text-xs font-mono text-blue-400 mb-2 tracking-wider">
                THE VENUE
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono mb-3">
                The Delta Campus
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                A modern event space in the heart of Berlin, purpose-built for
                tech conferences with dual-stage setup, expo area, and
                networking zones.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  May 28, 2026
                </span>
                <span className="flex items-center gap-2 text-gray-300">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Berlin, Germany
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
