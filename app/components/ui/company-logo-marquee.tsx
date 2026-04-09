"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
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
import { LlamaIndexLogo } from "@/components/ui/llamaindex-logo";
import { ConfluentLogo } from "@/components/ui/confluent-logo";
import { StripeLogo } from "@/components/ui/stripe-logo";
import { SwordHealthLogo } from "@/components/ui/sword-health-logo";
import { ConductLogo } from "@/components/ui/conduct-logo";
import { PeecAiLogo } from "@/components/ui/peec-ai-logo";
import { AiCousticsLogo } from "@/components/ui/ai-coustics-logo";
import { ParloaLogo } from "@/components/ui/parloa-logo";
import { MicrosoftLogo } from "@/components/ui/microsoft-logo";
import { SapLogo } from "@/components/ui/sap-logo";
import { BloombergLogo } from "@/components/ui/bloomberg-logo";
import { SiemensLogo } from "@/components/ui/siemens-logo";
import { AllianzLogo } from "@/components/ui/allianz-logo";
import { SoundCloudLogo } from "@/components/ui/soundcloud-logo";
import { MiroLogo } from "@/components/ui/miro-logo";
import { FlinkLogo } from "@/components/ui/flink-logo";
import { BlinkistLogo } from "@/components/ui/blinkist-logo";
import { StellantisLogo } from "@/components/ui/stellantis-logo";
import { OpenAiLogo } from "@/components/ui/openai-logo";

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
  LlamaIndex: LlamaIndexLogo,
  Confluent: ConfluentLogo,
  Stripe: StripeLogo,
  "Sword Health": SwordHealthLogo,
  Conduct: ConductLogo,
  "Peec AI": PeecAiLogo,
  "ai-coustics": AiCousticsLogo,
  Parloa: ParloaLogo,
  Microsoft: MicrosoftLogo,
  SAP: SapLogo,
  Bloomberg: BloombergLogo,
  Siemens: SiemensLogo,
  Allianz: AllianzLogo,
  SoundCloud: SoundCloudLogo,
  Miro: MiroLogo,
  Flink: FlinkLogo,
  Blinkist: BlinkistLogo,
  Stellantis: StellantisLogo,
  OpenAI: OpenAiLogo,
};

// Square/compact logos need a larger height to match the visual weight of wide wordmarks
// Square/compact logos need a larger height to match the visual weight of wide wordmarks
const LOGO_SIZE_OVERRIDES: Record<string, string> = {
  SoundCloud: "h-8 sm:h-10 lg:h-12 w-auto",
};

// Manually ordered: alternating prominent (big-name) and less prominent companies
const COMPANY_ITEMS = [
  { name: "Microsoft", url: "https://www.microsoft.com" },
  { name: "Dust", url: "https://dust.tt" },
  { name: "Siemens", url: "https://www.siemens.com" },
  { name: "Langdock", url: "https://langdock.com" },
  { name: "Bloomberg", url: "https://www.bloomberg.com" },
  { name: "Choco", url: "https://choco.com" },
  { name: "SAP", url: "https://www.sap.com" },
  { name: "Tacto", url: "https://tacto.ai" },
  { name: "Allianz", url: "https://www.allianz.com" },
  { name: "Knowunity", url: "https://knowunity.de" },
  { name: "SoundCloud", url: "https://soundcloud.com" },
  { name: "Conduct", url: "https://conduct.com" },
  { name: "Stripe", url: "https://stripe.com" },
  { name: "Legora", url: "https://legora.ai" },
  { name: "Miro", url: "https://miro.com" },
  { name: "VEED.IO", url: "https://veed.io" },
  { name: "Stellantis", url: "https://www.stellantis.com" },
  { name: "Codewords", url: "https://codewords.com" },
  { name: "Flink", url: "https://www.flink.com" },
  { name: "Gradium", url: "https://gradium.co" },
  { name: "Intercom", url: "https://intercom.com" },
  { name: "Peec AI", url: "https://peec.ai" },
  { name: "Blinkist", url: "https://www.blinkist.com" },
  { name: "ai-coustics", url: "https://ai-coustics.com" },
  { name: "Confluent", url: "https://confluent.io" },
  { name: "Parloa", url: "https://parloa.com" },
  { name: "LlamaIndex", url: "https://llamaindex.ai" },
  { name: "Sword Health", url: "https://swordhealth.com" },
];

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
                const sizeClass = LOGO_SIZE_OVERRIDES[company.name] ?? "h-4 sm:h-5 lg:h-6 w-auto";
                const logoContent = (
                  <>
                    <LogoComponent className={sizeClass} />
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
