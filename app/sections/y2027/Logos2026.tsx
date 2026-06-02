"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  COMPANY_LOGOS,
  COMPANY_ITEMS,
} from "@/components/ui/company-logo-marquee";
import { PARTNERS } from "@/data/partners";
import type { Partner } from "@/types";

const borderColor = "rgba(255,255,255,0.10)";
const BADGE_BG = "#000";

function Heading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-center font-mono font-bold tracking-tight ${className}`}>
      <span className="text-glow">{children}</span>
    </h2>
  );
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default function Logos2026() {
  // Companies that are also partners shouldn't be listed twice — drop them from
  // the attending-companies wall.
  const partnerHosts = new Set(
    [...PARTNERS.premium, ...PARTNERS.gold, ...PARTNERS.community].map((p) =>
      host(p.url)
    )
  );
  const companies = COMPANY_ITEMS.filter((c) => !partnerHosts.has(host(c.url)));

  return (
    <section className="relative border-t border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Partners — original aligned tier grid */}
        <Heading className="text-3xl sm:text-4xl lg:text-5xl">
          Thanks to our awesome partners
        </Heading>

        <div className="mt-14 w-full">
          {/* Premium */}
          <div className="relative" style={{ borderTop: `1px solid ${borderColor}` }}>
            <span className="absolute top-0 left-0 -translate-y-1/2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70" style={{ backgroundColor: BADGE_BG }}>
              Premium
            </span>
            <div className="flex w-full" style={{ borderBottom: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}` }}>
              {PARTNERS.premium.map((partner: Partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center py-12 px-6 opacity-80 transition-opacity hover:opacity-100 lg:py-20 lg:px-12"
                  style={{ width: `${100 / PARTNERS.premium.length}%`, borderRight: `1px solid ${borderColor}` }}
                >
                  <div className="relative h-24 w-full lg:h-32" style={partner.logoScale ? { transform: `scale(${partner.logoScale})` } : undefined}>
                    <Image src={partner.logo} alt={partner.logoAlt} fill className="object-contain" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Gold */}
          <div className="relative">
            <span className="absolute top-0 left-0 -translate-y-1/2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400/60" style={{ backgroundColor: BADGE_BG }}>
              Gold
            </span>
            <div className="flex w-full flex-wrap justify-center" style={{ borderBottom: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}` }}>
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
                      className="relative flex w-1/2 items-center justify-center py-8 px-4 opacity-70 transition-opacity hover:opacity-100 sm:w-1/3 lg:w-1/4 lg:py-12 lg:px-8"
                      style={cellStyle}
                    >
                      <div className="relative h-12 w-full lg:h-16" style={partner.logoScale ? { transform: `scale(${partner.logoScale})` } : undefined}>
                        <Image src={partner.logo} alt={partner.logoAlt} fill className="object-contain" />
                      </div>
                    </Link>
                  );
                });
              })()}
            </div>
          </div>

          {/* Community */}
          <div className="relative">
            <span className="absolute top-0 left-0 -translate-y-1/2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30" style={{ backgroundColor: BADGE_BG }}>
              Community
            </span>
            <div className="flex w-full flex-wrap" style={{ borderBottom: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}` }}>
              {PARTNERS.community.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex w-1/2 items-center justify-center py-6 px-3 opacity-50 transition-opacity hover:opacity-100 sm:w-1/4 lg:w-[12.5%] lg:py-9 lg:px-6"
                  style={{ borderRight: `1px solid ${borderColor}` }}
                >
                  <div className="relative h-5 w-full lg:h-6 lg:w-[152px]" style={partner.logoScale ? { transform: `scale(${partner.logoScale})` } : undefined}>
                    <Image src={partner.logo} alt={partner.logoAlt} fill className="object-contain" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Attending companies — all logos at once, sponsors excluded, small */}
        <div className="mt-20">
          <Heading className="text-2xl sm:text-3xl lg:text-4xl">
            Thanks to all the attending companies
          </Heading>
          <div className="mx-auto mt-12 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-12">
            {companies.map((company) => {
              const Logo = COMPANY_LOGOS[company.name];
              if (!Logo) return null;
              return (
                <Link
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/45 transition-colors hover:text-white"
                  aria-label={company.name}
                >
                  <Logo className="h-4 w-auto sm:h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
