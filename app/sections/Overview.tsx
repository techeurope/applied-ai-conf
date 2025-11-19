'use client';

import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import { Check } from 'lucide-react';

export default function Overview() {
  return (
    <section id="overview" className="relative overflow-hidden py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black"></div>
      
      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
            Applied AI
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400 leading-relaxed">
            The first edition of <span className="font-mono text-white">Applied AI Conf</span> by <a href="https://techeurope.io" target="_blank" rel="noopener noreferrer" className="font-mono text-white hover:text-gray-300 transition-colors">{'{'}Tech: Europe{'}'}</a>.
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
            <h3 className="mb-8 text-2xl font-semibold text-white">Who&rsquo;s Coming</h3>
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
