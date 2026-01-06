"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function About() {
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
      id="about"
      ref={sectionRef}
      className="relative w-full bg-black py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl text-glow mb-4">
            Why Applied AI Conf?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Europe&apos;s premier gathering for builders shipping production AI
            systems
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* About the Conference Card */}
          <div
            className={`md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-sm transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono mb-3">
                  About the Conference
                </h3>
                <p className="text-gray-300 text-base lg:text-lg leading-relaxed mb-4">
                  Applied AI Conf is a one-day, highly curated conference for
                  people who are actually putting AI into production:
                  Europe&apos;s leading technical founders, engineering leaders,
                  and the global infra and devtools teams powering them.
                </p>
                <p className="text-gray-400 text-base leading-relaxed">
                  Over one day, we&apos;ll go deep on how to design, build, and
                  scale production-grade AI systems. You&apos;ll learn directly
                  from teams shipping AI into real products every day.
                </p>
              </div>
            </div>
          </div>

          {/* Venue Image Card */}
          <div
            className={`lg:col-span-1 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative h-full min-h-[250px]">
              <Image
                src="/modern-tech-conference-venue-in-berlin-with-indust.jpg"
                alt="The Delta Campus Berlin"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-mono text-blue-400 mb-1">
                  THE VENUE
                </p>
                <p className="text-white font-bold text-lg">The Delta Campus</p>
                <p className="text-gray-400 text-sm">Berlin</p>
              </div>
            </div>
          </div>

          {/* What you'll gain Card */}
          <div
            className={`md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-sm transition-all duration-700 delay-150 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono">
                What you&apos;ll gain
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-16">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-mono text-lg">→</span>
                <span className="text-gray-300">
                  Practical patterns for production AI
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-mono text-lg">→</span>
                <span className="text-gray-300">
                  Honest lessons from real deployments
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-mono text-lg">→</span>
                <span className="text-gray-300">
                  New tools from infra teams
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-mono text-lg">→</span>
                <span className="text-gray-300">
                  Network of builders across Europe
                </span>
              </div>
            </div>
          </div>

          {/* Who it's for Card */}
          <div
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white font-mono">
                Who attends
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">→</span>
                <span>Technical founders & CTOs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">→</span>
                <span>Engineers shipping AI features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">→</span>
                <span>ML / applied AI practitioners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">→</span>
                <span>Engineering leaders scaling AI teams</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">→</span>
                <span>Infra teams enabling production AI</span>
              </li>
            </ul>
          </div>

          {/* Conference Format Card */}
          <div
            className={`md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-sm transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-orange-400"
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
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono">
                Conference Format
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-16">
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono text-lg flex-shrink-0">
                  01
                </span>
                <div>
                  <p className="text-white font-semibold mb-1">
                    One Day in Berlin
                  </p>
                  <p className="text-gray-400 text-sm">
                    The Delta Campus — May 2026
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono text-lg flex-shrink-0">
                  02
                </span>
                <div>
                  <p className="text-white font-semibold mb-1">
                    Dual Track System
                  </p>
                  <p className="text-gray-400 text-sm">
                    Main track + Side track (hands-on technical sessions)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono text-lg flex-shrink-0">
                  03
                </span>
                <div>
                  <p className="text-white font-semibold mb-1">
                    Workshops & Panels
                  </p>
                  <p className="text-gray-400 text-sm">
                    Live demos focused on production AI patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono text-lg flex-shrink-0">
                  04
                </span>
                <div>
                  <p className="text-white font-semibold mb-1">Expo Area</p>
                  <p className="text-gray-400 text-sm">
                    Sponsors and community partners showcase
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic mt-6 border-t border-white/5 pt-4">
              Full agenda coming soon. Speaker lineup updates will be posted
              regularly.
            </p>
          </div>

          {/* Networking Image Card */}
          <div
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-700 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative h-full min-h-[250px]">
              <Image
                src="/diverse-tech-professionals-networking-at-modern-co.jpg"
                alt="Conference networking"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-mono text-purple-400 mb-1">
                  NETWORK
                </p>
                <p className="text-white font-bold text-lg">
                  Connect with Europe&apos;s AI builders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
