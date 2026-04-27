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
import { DlthubLogo } from "@/components/ui/dlthub-logo";
import { DistilLabsLogo } from "@/components/ui/distil-labs-logo";
import { ArizeLogo } from "@/components/ui/arize-logo";
import { ModalLogo } from "@/components/ui/modal-logo";
import { NebiusLogo } from "@/components/ui/nebius-logo";
import { GoogleDeepMindLogo } from "@/components/ui/google-deepmind-logo";
import { RestateLogo } from "@/components/ui/restate-logo";

type LogoComponent = React.ComponentType<{ className?: string }>;

const COMPANY_LOGOS: Record<string, LogoComponent> = {
  Langdock: LangdockLogo,
  Choco: ChocoLogo,
  Tacto: TactoLogo,
  Legora: LegoraLogo,
  Knowunity: KnowunityLogo,
  "VEED.IO": VeedLogo,
  CodeWords: CodewordsLogo,
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
  dltHub: DlthubLogo,
  "distil labs": DistilLabsLogo,
  Arize: ArizeLogo,
  Modal: ModalLogo,
  Nebius: NebiusLogo,
  "Google DeepMind": GoogleDeepMindLogo,
  Restate: RestateLogo,
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
  { name: "Nebius", url: "https://nebius.com" },
  { name: "Google DeepMind", url: "https://deepmind.google" },
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
  { name: "CodeWords", url: "https://codewords.ai" },
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
  { name: "dltHub", url: "https://dlthub.com" },
  { name: "distil labs", url: "https://www.distillabs.ai" },
  { name: "Modal", url: "https://modal.com" },
  { name: "Restate", url: "https://restate.dev" },
];

const NORMAL_SPEED = 100; // pixels per second
const HOVER_SPEED = NORMAL_SPEED * 0.2;

export function CompanyLogoMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const groupWidthRef = useRef(0);
  const hoveredRef = useRef(false);
  const currentSpeedRef = useRef(NORMAL_SPEED);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const primaryGroup = track.querySelector<HTMLElement>(
      "[data-logo-marquee-group='primary']"
    );
    if (!primaryGroup) return;

    const updateWidth = () => {
      groupWidthRef.current = primaryGroup.scrollWidth;
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(primaryGroup);

    let prevTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const dt = (now - prevTime) / 1000;
      prevTime = now;

      // Smoothly interpolate speed toward target
      const targetSpeed = hoveredRef.current ? HOVER_SPEED : NORMAL_SPEED;
      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * 0.05;

      positionRef.current -= currentSpeedRef.current * dt;
      const w = groupWidthRef.current;
      if (w > 0 && positionRef.current <= -w) {
        positionRef.current += w;
      }

      track.style.transform = `translateX(${positionRef.current}px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <p className="text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-[0.25em] text-white/60">
        attending companies
      </p>
      <div
        className="relative mt-3 overflow-hidden"
        onMouseEnter={() => (hoveredRef.current = true)}
        onMouseLeave={() => (hoveredRef.current = false)}
      >
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-0 top-0 h-full w-12 sm:w-16 bg-linear-to-r from-black via-black/60 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-12 sm:w-16 bg-linear-to-l from-black via-black/60 to-transparent" />
        </div>
        <div
          ref={trackRef}
          className="logo-marquee flex items-center py-2"
          style={reducedMotion ? { transform: "translateX(0)" } : undefined}
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
