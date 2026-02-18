"use client";

import Image from "next/image";
import Link from "next/link";
import { PARTNERS } from "@/data/partners";

export default function PartnershipTiers() {
  const borderColor = "rgba(255,255,255,0.10)";

  return (
    <section id="partner" className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <h2 className="text-4xl font-mono font-bold tracking-tight text-center sm:text-5xl md:text-6xl mb-16">
          Partners
        </h2>

        {/* Partner Grid */}
        <div className="w-full mb-16">
          {/* Gold */}
          <div className="relative" style={{ borderTop: `1px solid ${borderColor}` }}>
            <span
              className="absolute top-0 left-0 -translate-y-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-400/60 bg-[#05070f] px-2"
            >
              Gold
            </span>
            <div
              className="flex w-full"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {PARTNERS.gold.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  style={{
                    width: `${100 / PARTNERS.gold.length}%`,
                    padding: "56px 32px",
                    borderRight: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="relative h-16 w-full">
                    <Image
                      src={partner.logo}
                      alt={partner.logoAlt}
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="relative">
            <span
              className="absolute top-0 left-0 -translate-y-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 bg-[#05070f] px-2"
            >
              Community
            </span>
            <div
              className="flex w-full"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {PARTNERS.community.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                  style={{
                    width: `${100 / PARTNERS.community.length}%`,
                    padding: "32px 20px",
                    borderRight: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="relative h-8 w-full"
                    style={partner.logoScale ? { transform: `scale(${partner.logoScale})` } : undefined}
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.logoAlt}
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            Want to partner with us?
          </p>
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
    </section>
  );
}
