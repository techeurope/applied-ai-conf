"use client";

import Link from "next/link";

export default function PartnershipTiers() {
  return (
    <section id="partner" className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tight sm:text-5xl md:text-6xl">
            Partnership Opportunities
          </h2>
          <p className="mx-auto mt-4 text-lg text-gray-300 leading-relaxed max-w-3xl">
            Connect with Europe&apos;s applied AI builders. Position your brand
            in front of a curated, in-person audience of founders, CTOs, and
            engineers shipping AI to production.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm p-8 lg:p-12">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-mono font-bold text-white mb-4">
                Why partner with us?
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    Direct access to applied AI builders, founders, and CTOs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    Brand visibility across dual tracks and all marketing
                    channels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    Direct engagement with Europe&apos;s AI production community
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>
                    Located in Berlin, Europe&apos;s thriving tech hub
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-mono font-bold text-white mb-4">
                Custom packages available
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We offer tailored partnership packages to meet your specific
                goals, including custom booth setups, speaking opportunities,
                workshop sessions, and exclusive side events.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Want to host a private dinner or networking session? Let&apos;s
                create a partnership that works for you.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto">
              Interested in partnering with us? We&apos;d love to chat about how
              we can work together.
            </p>
            <div className="flex items-center justify-center">
              <Link
                href="https://tally.so/r/Me1ZKM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black transition-all hover:bg-gray-100 hover:scale-105"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
