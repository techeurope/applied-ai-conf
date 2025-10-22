'use client';

import { useState, useEffect, useRef } from 'react';
import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';

function TypingHeading({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      if (headingRef.current) {
        observer.unobserve(headingRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      if (!isDeleting) {
        // Typing forward
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(animate, 100);
        } else {
          // Pause at end before deleting
          timeoutId = setTimeout(() => {
            isDeleting = true;
            animate();
          }, 2000);
        }
      } else {
        // Deleting backward
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayText(text.slice(0, currentIndex));
          timeoutId = setTimeout(animate, 50);
        } else {
          // Pause at start before typing again
          timeoutId = setTimeout(() => {
            isDeleting = false;
            animate();
          }, 500);
        }
      }
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, [text, isVisible]);

  return (
    <span ref={headingRef}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Overview() {
  return (
    <section id="overview" className="relative overflow-hidden py-20">
      {/* Background gradient overlays matching FAQ style */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-black/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700/40 via-transparent to-transparent"></div>

      <div className="relative mx-auto w-full max-w-screen-2xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl min-h-[1.2em]">
            <TypingHeading text="Applied AI in Europe" />
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300 sm:text-xl lg:text-2xl">
            A one-day technical gathering for a curated mix of builders, product owners, and partners shaping applied AI across Europe
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Topics Box - Left Side */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-800/40 to-black/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:from-zinc-800/80 hover:via-zinc-700/50 hover:to-zinc-900/80 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <h3 className="mb-6 text-3xl font-light text-white lg:text-4xl">Focus Areas</h3>
            <ul className="space-y-4">
              {PARTNERSHIP_OVERVIEW.focusAreas.map((area) => (
                <li key={area} className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <span className="text-sm leading-relaxed text-gray-400">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Attendees Box - Right Side */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-800/40 to-black/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:from-zinc-800/80 hover:via-zinc-700/50 hover:to-zinc-900/80 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <h3 className="mb-6 text-3xl font-light text-white lg:text-4xl">Attendees</h3>
            <ul className="space-y-4">
              {PARTNERSHIP_OVERVIEW.audience.map((segment) => (
                <li key={segment.label} className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <span className="text-sm leading-relaxed text-gray-400">{segment.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
