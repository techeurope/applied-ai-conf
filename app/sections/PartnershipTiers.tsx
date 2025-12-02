"use client";

import Link from "next/link";

export default function PartnershipTiers() {
  return (
    <section
      id="tiers"
      className="relative overflow-hidden py-24 lg:py-32 min-h-screen flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-5xl font-mono font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-glow">
            Partners
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            Be part of the European AI movement. Join founders and engineers who
            are shaping how we build with AI.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-6 text-lg text-gray-400">
            Want to get your brand in front of the European AI scene?
          </p>
          <Link
            href="mailto:info@techeurope.io"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Become a Partner
          </Link>
        </div>
      </div>
    </section>
  );
}
