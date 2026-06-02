"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { PARTNERS } from "../_data/partners";
import type { Partner } from "@/types";

export default function PartnershipTiers() {
  const borderColor = "rgba(255,255,255,0.10)";

  const handleCopyAnchor = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#partners`;
    navigator.clipboard.writeText(url).catch(() => {});
    window.history.replaceState(null, "", "#partners");
  };

  return (
    <section id="partners" className="relative overflow-hidden py-16 lg:py-20 min-h-screen flex items-center">
      <div className="w-full px-6 lg:px-12">
        <h2 className="text-4xl font-mono font-bold tracking-tight text-center sm:text-5xl md:text-6xl mb-16">
          <button
            type="button"
            onClick={handleCopyAnchor}
            aria-label="Copy link to Partners section"
            className="group inline-flex items-baseline gap-3 cursor-pointer"
          >
            <span>Partners</span>
            <span
              aria-hidden="true"
              className="font-mono text-xl sm:text-2xl md:text-3xl text-gray-400 opacity-0 group-hover:opacity-40 transition-opacity"
            >
              #
            </span>
          </button>
        </h2>

        {/* Partner Grid */}
        <div className="w-full mb-16">
          {/* Premium */}
          <div className="relative" style={{ borderTop: `1px solid ${borderColor}` }}>
            <span
              className="absolute top-0 left-0 -translate-y-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/70 bg-[#05070f] px-2"
            >
              Premium
            </span>
            <div
              className="flex w-full"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {PARTNERS.premium.map((partner: Partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity py-12 px-6 lg:py-20 lg:px-12"
                  style={{
                    width: `${100 / PARTNERS.premium.length}%`,
                    borderRight: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="relative h-24 lg:h-32 w-full"
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

          {/* Gold */}
          <div className="relative">
            <span
              className="absolute top-0 left-0 -translate-y-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-400/60 bg-[#05070f] px-2"
            >
              Gold
            </span>
            <div
              className="flex flex-wrap w-full justify-center"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
              }}
            >
              {(() => {
                const COLS = 4;
                const total = PARTNERS.gold.length;
                return PARTNERS.gold.map((partner, i) => {
                  const rowIndex = Math.floor(i / COLS);
                  const rowStart = rowIndex * COLS;
                  const rowItems = Math.min(COLS, total - rowStart);
                  const indexInRow = i - rowStart;
                  const isLastInRow = indexInRow === rowItems - 1;
                  const isFirstRow = rowIndex === 0;

                  const cellStyle: CSSProperties = {};
                  if (isFirstRow) {
                    cellStyle.borderTop = `1px solid ${borderColor}`;
                    cellStyle.borderBottom = `1px solid ${borderColor}`;
                  }
                  if (!isLastInRow) {
                    cellStyle.borderRight = `1px solid ${borderColor}`;
                  }

                  return (
                    <Link
                      key={partner.name}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity w-1/2 sm:w-1/3 lg:w-1/4 py-8 px-4 lg:py-12 lg:px-8"
                      style={cellStyle}
                    >
                      <div
                        className="relative h-12 lg:h-16 w-full"
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
                  );
                });
              })()}
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
              className="flex flex-wrap w-full"
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
                  className="relative flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity w-1/2 sm:w-1/4 lg:w-[12.5%] py-6 px-3 lg:py-9 lg:px-6"
                  style={{
                    borderRight: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="relative h-5 lg:h-6 w-full lg:w-[152px]"
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
      </div>
    </section>
  );
}
