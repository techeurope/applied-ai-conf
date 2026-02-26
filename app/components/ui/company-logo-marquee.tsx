"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { SPEAKERS } from "@/data/speakers";
import { LegoraLogo } from "@/components/ui/legora-logo";
import { LangdockLogo } from "@/components/ui/langdock-logo";
import { ChocoLogo } from "@/components/ui/choco-logo";
import { TactoLogo } from "@/components/ui/tacto-logo";
import { KnowunityLogo } from "@/components/ui/knowunity-logo";
import { VeedLogo } from "@/components/ui/veed-logo";
import { CodewordsLogo } from "@/components/ui/codewords-logo";
import { DustLogo } from "@/components/ui/dust-logo";
import { IntercomLogo } from "@/components/ui/intercom-logo";
import { GradiumLogo } from "@/components/ui/gradium-logo";

type LogoComponent = React.ComponentType<{ className?: string }>;

const COMPANY_LOGOS: Record<string, LogoComponent> = {
  Langdock: LangdockLogo,
  Choco: ChocoLogo,
  Tacto: TactoLogo,
  Legora: LegoraLogo,
  Knowunity: KnowunityLogo,
  "VEED.IO": VeedLogo,
  Codewords: CodewordsLogo,
  Dust: DustLogo,
  Intercom: IntercomLogo,
  Gradium: GradiumLogo,
};

const COMPANY_ITEMS = Array.from(
  new Map(
    SPEAKERS.filter((speaker) => speaker.company).map((speaker) => [
      speaker.company,
      {
        name: speaker.company,
        url: speaker.companyUrl,
      },
    ])
  ).values()
).filter((company) => COMPANY_LOGOS[company.name]);

export function CompanyLogoMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const primaryGroup = track.querySelector<HTMLElement>(
      "[data-logo-marquee-group='primary']"
    );
    if (!primaryGroup) return;

    const updateOffset = () => {
      setOffset(primaryGroup.scrollWidth);
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(primaryGroup);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <p className="text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-[0.25em] text-white/60">
        attending companies
      </p>
      <div className="relative mt-3 overflow-hidden group">
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-0 top-0 h-full w-12 sm:w-16 bg-linear-to-r from-black via-black/60 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-12 sm:w-16 bg-linear-to-l from-black via-black/60 to-transparent" />
        </div>
        <div
          ref={trackRef}
          className="logo-marquee flex items-center py-2"
          style={
            offset
              ? ({ "--logo-marquee-offset": `${offset}px` } as React.CSSProperties)
              : undefined
          }
        >
          {[0, 1].map((repeatIndex) => (
            <div
              key={repeatIndex}
              className="flex items-center gap-10 sm:gap-14 lg:gap-16 pr-10 sm:pr-14 lg:pr-16 shrink-0"
              aria-hidden={repeatIndex === 1}
              data-logo-marquee-group={repeatIndex === 0 ? "primary" : "clone"}
            >
              {COMPANY_ITEMS.map((company) => {
                const LogoComponent = COMPANY_LOGOS[company.name];
                const logoContent = (
                  <>
                    <LogoComponent className="h-4 sm:h-5 lg:h-6 w-auto" />
                    <span className="sr-only">{company.name}</span>
                  </>
                );

                return company.url ? (
                  <a
                    key={`${company.name}-${repeatIndex}`}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-white/80 hover:text-white transition-colors"
                  >
                    {logoContent}
                  </a>
                ) : (
                  <div
                    key={`${company.name}-${repeatIndex}`}
                    className="flex items-center text-white/80"
                  >
                    {logoContent}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
