'use client';

import { useState, useEffect, useRef } from 'react';
import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

export default function PartnershipTiers() {
  return (
    <section id="tiers" className="relative min-h-screen overflow-hidden py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl min-h-[1.2em]">
            <TypingHeading text="Partners" />
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            Position your brand in front of Europe&apos;s leading AI founders, engineers, and decision-makers.
          </p>
        </div>

        {/* Tier Grid */}
        <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERSHIP_OVERVIEW.tiers.map((tier, index) => (
            <div
              key={tier.name}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl glass-card p-8 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-gray-500">
                    0{index + 1}
                  </span>
                  {tier.limit && (
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-400">
                      Limited
                    </span>
                  )}
                </div>

                <h3 className="mb-4 text-xl font-bold text-white">
                  {tier.name.replace(' Partner', '')}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {tier.description}
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5">
                 <div className="text-xs text-gray-500 font-mono">Starting at</div>
                 <div className="text-lg font-semibold text-white">Contact us</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mb-20 grid gap-8 rounded-2xl glass-card p-8 sm:grid-cols-3 text-center">
          <div>
            <div className="mb-1 text-4xl font-bold text-white">500+</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Attendees</div>
          </div>
          <div>
            <div className="mb-1 text-4xl font-bold text-white">60%</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Founders & Engineers</div>
          </div>
          <div>
            <div className="mb-1 text-4xl font-bold text-white">1 Day</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">High-Impact Event</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="mb-4 text-2xl font-semibold text-white">
            Interested in partnering?
          </h3>
          <p className="mb-8 text-gray-400">
            Get in touch to discuss custom packages and exclusive activations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="mailto:info@techeurope.io"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-all hover:bg-gray-200"
            >
              Become a Partner
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="mailto:info@techeurope.io"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Get Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
