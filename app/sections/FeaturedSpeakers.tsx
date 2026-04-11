"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SPEAKERS } from "@/data/speakers";
import type { Speaker } from "@/types";

// 2 rows × columns per breakpoint
const VISIBLE_ROWS = 3;
const COLS_LG = 3;
const COLS_MD = 2;

export default function FeaturedSpeakers() {
  const speakers: Speaker[] = SPEAKERS.filter((s) => !s.hidden);
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const initialCount = VISIBLE_ROWS * COLS_LG; // 6 on desktop
  const hasMore = speakers.length > initialCount;

  return (
    <section
      ref={sectionRef}
      id="speakers"
      className="relative w-full bg-black py-16 lg:py-20"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div
          className={`mb-8 max-w-7xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05] text-center">
            Speakers
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-4 text-center">
            Building the future of AI
          </p>
        </div>

        {/* Speaker Grid with collapse */}
        <div className="relative">
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {speakers.map((speaker, i) => {
              const photoSrc = speaker.imageTransparent || speaker.image;

              // Determine if this card should be hidden when collapsed
              // Use the largest breakpoint count (3 cols) for the cutoff
              const isHidden = !expanded && i >= initialCount;

              const inner = (
                <div
                  className={`group relative flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/15 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                  style={{ transitionDelay: `${100 + i * 40}ms` }}
                >
                  {/* Photo */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
                    {photoSrc ? (
                      <Image
                        src={photoSrc}
                        alt={speaker.imageAlt}
                        fill
                        className="object-cover object-top"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-lg font-mono text-gray-600">
                          {speaker.initial}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-base font-mono font-semibold text-white leading-tight">
                        {speaker.name}
                      </h3>
                      {speaker.linkedinUrl && (
                        <svg
                          className="h-3 w-3 shrink-0 text-gray-600 transition-colors duration-200 group-hover:text-gray-400"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 8.5l5-5M4 3.5h4.5V8" />
                        </svg>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500 mt-0.5">
                      {speaker.title}
                      {speaker.company && (
                        <span className="text-gray-600">
                          {" "}
                          · {speaker.company}
                        </span>
                      )}
                    </p>
                    <div className="min-h-[3.75rem] mt-1.5">
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                        {speaker.talkTitle || speaker.building}
                      </p>
                    </div>
                  </div>
                </div>
              );

              const card = speaker.linkedinUrl ? (
                <Link
                  key={speaker.name}
                  href={speaker.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block ${isHidden ? "hidden" : ""}`}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={speaker.name}
                  className={isHidden ? "hidden" : ""}
                >
                  {inner}
                </div>
              );

              return card;
            })}
          </div>

          {/* Fade overlay when collapsed */}
          {hasMore && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Toggle button */}
        {hasMore && (
          <div className={`flex justify-center ${expanded ? "mt-8" : "-mt-4 relative z-10"}`}>
            <button
              onClick={() => {
                setExpanded(!expanded);
                if (expanded && sectionRef.current) {
                  sectionRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group/btn flex items-center gap-2.5 rounded-full border border-white/10 bg-black px-7 py-3 text-sm font-mono text-gray-300 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
            >
              {expanded ? (
                <>
                  Show fewer
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10l4-4 4 4" />
                  </svg>
                </>
              ) : (
                <>
                  Show all {speakers.length} speakers
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-y-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
