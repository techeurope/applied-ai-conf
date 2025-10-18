'use client'

/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SPEAKERS } from '@/data/speakers';

export default function FeaturedSpeakers() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSpeaker = SPEAKERS[activeIndex] ?? SPEAKERS[0];

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % SPEAKERS.length);
    }, 1000); // Wechselt alle 2.0 Sekunden

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleSpeakerClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Timer wird nach 10 Sekunden wieder aktiviert
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    // Timer wird nach 2 Sekunden wieder aktiviert
    setTimeout(() => setIsPaused(false), 2000);
  };

  if (!activeSpeaker) {
    return null;
  }

  return (
    <section id="speakers" className="relative min-h-screen bg-black py-20 lg:py-32">
      <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-12">
        {/* Header with Title and CTA */}
        <div className="mb-16 flex items-start justify-between lg:mb-24">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
            Featured speakers
          </h2>
          <Link
            href="#"
            className="hidden rounded-md bg-blue-600 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition hover:bg-blue-700 lg:inline-flex lg:items-center lg:gap-2"
          >
            View all speakers
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* Left: Speaker List */}
          <div className="relative" onMouseLeave={handleMouseLeave}>
            <ul className="divide-y divide-dashed divide-white/10">
              {SPEAKERS.map((speaker, index) => {
                const isActive = index === activeIndex;

                return (
                  <li key={speaker.name}>
                    <button
                      type="button"
                      className={`group w-full py-8 text-left transition-all duration-300 lg:py-10 ${
                        isActive ? '' : 'opacity-40 hover:opacity-70'
                      }`}
                      onClick={() => handleSpeakerClick(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      aria-pressed={isActive}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p
                            className={`font-mono text-3xl font-light uppercase tracking-tight text-white transition-all sm:text-4xl lg:text-5xl ${
                              isActive ? 'opacity-100' : 'opacity-100'
                            }`}
                          >
                            {speaker.name}
                          </p>
                          {isActive && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="text-sm uppercase tracking-widest text-gray-400 sm:text-base">
                                {speaker.title}, {speaker.company}
                              </p>
                              {activeSpeaker.socials && activeSpeaker.socials.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-3">
                                  {activeSpeaker.socials.map((social) => (
                                    <Link
                                      key={`${activeSpeaker.name}-${social.label}`}
                                      href={social.url}
                                      className="inline-flex items-center text-sm text-gray-400 transition hover:text-white"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {social.label === 'X' && (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                      )}
                                      {social.label === 'LinkedIn' && (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                      )}
                                      {social.label === 'GitHub' && (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: Speaker Image/Details */}
          <div className="relative">
            <div className="h-full overflow-hidden rounded-2xl border border-dashed border-white/10 bg-black">
              <div className="relative flex h-full min-h-[600px] flex-col">
                {/* Speaker Image - Elegant B&W */}
                <div className="relative flex-1">
                  {/* Base Image */}
                  <div className="absolute inset-0">
                    <Image
                      src="/Speakers/Screenshot 2025-10-18 at 23.34.24.png"
                      alt={activeSpeaker.name}
                      fill
                      className="object-cover grayscale"
                      priority
                    />
                  </div>
                  
                  {/* Subtle dark gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Bio Overlay at Bottom */}
                <div className="relative bg-gradient-to-t from-black via-black/95 to-transparent p-8 lg:p-12">
                  <p className="text-base leading-relaxed text-gray-300 lg:text-lg">
                    {activeSpeaker.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-12 lg:hidden">
          <Link
            href="#"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-4 text-sm font-medium uppercase tracking-wider text-white transition hover:bg-blue-700"
          >
            View all speakers
            <span aria-hidden className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
