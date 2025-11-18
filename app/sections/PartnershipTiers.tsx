'use client';

import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import Link from 'next/link';

export default function PartnershipTiers() {
  return (
    <section id="tiers" className="relative min-h-screen overflow-hidden py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
            Partners
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            Position your brand in front of Europe&apos;s leading AI founders, engineers, and decision-makers.
          </p>
        </div>

        {/* Tier Grid - Coming Soon */}
        <div className="mb-20 rounded-2xl border border-dashed border-white/10 glass-card p-10 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.4em] text-gray-500 mb-4">
            Partnership tiers drop soon
          </p>
          <h3 className="text-3xl font-semibold text-white mb-3">
            Custom packages for teams who want to be part of the conference
          </h3>
          <p className="text-gray-400">
            We&apos;re finalizing Platinum/Gold/Silver options with stage time, workshop slots,
            and curated intros. Reach out now to get early access to the deck.
          </p>
        </div>

        {false && (
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
        )}

        {/* Stats Bar */}
        <div className="mb-20 grid gap-8 rounded-2xl glass-card p-8 sm:grid-cols-3 text-center">
          <div>
            <div className="mb-1 text-4xl font-bold text-white">700</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Attendees</div>
          </div>
          <div>
            <div className="mb-1 text-4xl font-bold text-white">65%</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Senior ICs & Founders</div>
          </div>
          <div>
            <div className="mb-1 text-4xl font-bold text-white">45%</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Decision Makers</div>
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
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              Become a Partner
            </Link>
            <Link
              href="mailto:info@techeurope.io"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 text-lg font-semibold text-white transition-all hover:bg-white/15"
            >
              Get Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
