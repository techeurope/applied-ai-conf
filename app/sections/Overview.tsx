'use client';

import { useState, useEffect, useRef } from 'react';
import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import { Check } from 'lucide-react';

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

    const currentRef = headingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
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
    <span ref={headingRef} className="text-glow">
      {displayText}
      <span className="animate-pulse text-white/50">|</span>
    </span>
  );
}

export default function Overview() {
  return (
    <section id="overview" className="relative overflow-hidden py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black"></div>
      
      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl min-h-[1.2em]">
            <TypingHeading text="Applied AI" />
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400 leading-relaxed">
            The first edition of Applied AI Conf by {'{'}Tech: Europe{'}'}.
            <br />
            A one-day technical gathering for builders, product owners, and partners.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Focus Areas */}
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <h3 className="mb-8 text-2xl font-semibold text-white">Focus Areas</h3>
            <ul className="space-y-4">
              {PARTNERSHIP_OVERVIEW.focusAreas.map((area) => (
                <li key={area} className="flex items-start">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 mr-4">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-base text-gray-300">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Attendees */}
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <h3 className="mb-8 text-2xl font-semibold text-white">Who's Coming</h3>
            <ul className="space-y-4">
              {PARTNERSHIP_OVERVIEW.audience.map((segment) => (
                <li key={segment.label} className="flex items-start">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 mr-4">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-base text-gray-300">{segment.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
