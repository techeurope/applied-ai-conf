import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import Link from 'next/link';

export default function PartnershipTiers() {
  return (
    <section id="tiers" className="relative min-h-screen bg-black py-20 lg:py-32">
      <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
            Partnership opportunities
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300 sm:text-xl lg:text-2xl">
            Position your brand in front of 700+ Europe's leading AI founders, engineers, and decision-makers.
          </p>
        </div>

        {/* Tier Grid - Simplified */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERSHIP_OVERVIEW.tiers.map((tier, index) => (
            <div
              key={tier.name}
              className="group relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-zinc-900 to-black p-8 transition-all duration-300 hover:border-white/30 hover:from-zinc-800 hover:to-zinc-900"
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
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mb-16 grid gap-8 rounded-2xl border border-dashed border-white/10 bg-zinc-900/50 p-6 sm:grid-cols-3 lg:p-8">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">
              700+
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
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-12 text-center lg:p-16">
          <h3 className="mb-4 text-3xl font-light text-white lg:text-4xl">
            Interested in partnering with us?
          </h3>
          <p className="mb-8 text-lg text-gray-300">
            Get in touch to discuss custom packages, speaking opportunities, and exclusive activations tailored to your goals.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:partnerships@appliedai.eu"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-medium uppercase tracking-wider text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Get Partnership Info
              <span aria-hidden className="text-xl">→</span>
            </Link>
            <Link
              href="#"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-medium uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Download Prospectus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
