'use client';

import { useState, useEffect, useRef } from 'react';
import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import Link from 'next/link';

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

export default function PartnershipTiers() {
  return (
    <section id="tiers" className="relative min-h-screen overflow-hidden py-20 pb-10 lg:py-32 lg:pb-16">
      {/* Background gradient overlays matching FAQ and Overview style */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-black/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700/40 via-transparent to-transparent"></div>

      <div className="relative mx-auto w-full max-w-screen-2xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl min-h-[1.2em]">
            <TypingHeading text="Partnership opportunities" />
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300 sm:text-xl lg:text-2xl">
            Position your brand in front of 500+ Europe&apos;s leading AI founders, engineers, and decision-makers.
          </p>
        </div>

        {/* Tier Grid - Simplified */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERSHIP_OVERVIEW.tiers.map((tier, index) => (
            <div
              key={tier.name}
              className="group relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-950/80 to-black/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:from-zinc-800/80 hover:to-zinc-900/80"
            >
              {/* Tier Number */}
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-sm uppercase tracking-widest text-gray-500">
                  Tier {index + 1}
                </span>
                {tier.limit && (
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-400">
                    Limited
                  </span>
                )}
              </div>

              {/* Tier Name */}
              <h3 className="mb-6 text-3xl font-light text-white lg:text-4xl">
                {tier.name.replace(' Partner', '')}
              </h3>

              {/* Key Highlight */}
              <p className="text-sm leading-relaxed text-gray-400">
                {tier.description}
              </p>

              {/* Subtle hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/0 via-zinc-500/0 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mb-16 grid gap-8 rounded-2xl border border-dashed border-white/10 bg-zinc-900/50 p-6 sm:grid-cols-3 lg:p-8">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">
              500+
            </div>
            <div className="text-sm uppercase tracking-wider text-gray-400">
              Expected Attendees
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">
              60%
            </div>
            <div className="text-sm uppercase tracking-wider text-gray-400">
              AI Founders & Engineers
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">
              1 Day
            </div>
            <div className="text-sm uppercase tracking-wider text-gray-400">
              High-Impact Event
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-4xl p-12 text-center lg:p-16">
          <h3 className="mb-4 text-3xl font-light text-white lg:text-4xl">
            Interested in partnering with us?
          </h3>
          <p className="mb-8 text-lg text-gray-300">
            Get in touch to discuss custom packages, speaking opportunities, and exclusive activations tailored to your goals.
          </p>
          <div className="flex items-center justify-center">
            <Link
              href="mailto:info@techeurope.io"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-zinc-800 via-zinc-900 to-black px-10 py-5 text-base font-medium uppercase tracking-wider text-white shadow-lg shadow-black/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-zinc-800/80 border border-white/20 hover:border-white/40"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-black via-zinc-900 to-zinc-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-3">
                Get Partnership Info
                <span aria-hidden className="text-xl transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
