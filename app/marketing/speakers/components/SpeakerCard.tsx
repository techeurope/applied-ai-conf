"use client";

import type React from "react";
import type { Speaker } from "@/types";
import { applyKerning } from "@/lib/utils";
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
import { OpenAiLogo } from "@/components/ui/openai-logo";
import { DlthubLogo } from "@/components/ui/dlthub-logo";
import { DistilLabsLogo } from "@/components/ui/distil-labs-logo";
import { MiroLogo } from "@/components/ui/miro-logo";
import { ArizeLogo } from "@/components/ui/arize-logo";

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
  OpenAI: OpenAiLogo,
  dltHub: DlthubLogo,
  "distil labs": DistilLabsLogo,
  Miro: MiroLogo,
  Arize: ArizeLogo,
};

interface ImageConfig {
  x: number;
  y: number;
  scale: number;
  gradientHeight: number;
}

const defaultImageConfig: ImageConfig = {
  x: 213,
  y: 29,
  scale: 1.2,
  gradientHeight: 40,
};

interface Props {
  speaker: Speaker;
  conferenceDate?: string;
  imageConfig?: ImageConfig;
  hidePhoto?: boolean;
}

export function SpeakerCard({
  speaker,
  conferenceDate = "MAY 28, 2026",
  imageConfig = defaultImageConfig,
  hidePhoto = false,
}: Props) {
  const LogoComponent = COMPANY_LOGOS[speaker.company];
  return (
    <div className="relative w-[1080px] h-[1080px] bg-[#0a0a0a] overflow-hidden border border-neutral-800">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Speaker image */}
      {!hidePhoto && (
        <div
          className="absolute flex items-end justify-end"
          style={{
            bottom: 0,
            right: 0,
            width: `${85 * imageConfig.scale}%`,
            height: `${95 * imageConfig.scale}%`,
            transform: `translate(${imageConfig.x}px, ${imageConfig.y}px)`,
          }}
        >
          <img
            src={speaker.imageTransparent || speaker.image}
            alt={speaker.name}
            className="h-full w-auto object-contain object-bottom"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Bottom fog gradient */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: `${imageConfig.gradientHeight}%`,
          background:
            "linear-gradient(0deg, rgba(10,10,10,1) 0%, rgba(10,10,10,0.9) 30%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0) 100%)",
        }}
      />

      {/* Top left - Conference branding */}
      <div className="absolute top-10 left-10 z-20 flex flex-col items-center gap-2">
        <span
          className="text-neutral-500 text-xl tracking-wide"
          style={{ fontFamily: "'Kode Mono', monospace" }}
        >
          {"{Tech: Europe}"}
        </span>
        <div
          className="text-white text-5xl font-bold tracking-tight leading-[0.95] text-center"
          style={{ fontFamily: "'Kode Mono', monospace" }}
        >
          <div>APPLIED</div>
          <div>AI CONF</div>
        </div>
      </div>

      {/* Top right - Date and location */}
      <div className="absolute top-10 right-10 z-20 text-right">
        <div
          className="text-neutral-500 text-2xl tracking-[0.1em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {conferenceDate}
        </div>
        <div
          className="text-neutral-500 text-2xl tracking-[0.1em] uppercase mt-2"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          The Delta Campus, Berlin
        </div>
      </div>

      {/* Bottom left - Speaker name stacked with role below */}
      <div className="absolute bottom-10 left-10 z-20 flex flex-col">
        <h1
          className="font-bold text-white tracking-tight leading-[0.85]"
          style={{
            fontFamily: "'Kode Mono', monospace",
            fontSize: `${speaker.nameFontSize ?? 140}px`,
          }}
        >
          {speaker.name.split(" ").map((word, i) => (
            <span key={i} className="block">
              {applyKerning(word)}
            </span>
          ))}
        </h1>
        <div
          className="flex items-center gap-5 mt-10"
          style={{ fontSize: `${speaker.titleFontSize ?? 48}px` }}
        >
          <span
            className="text-neutral-300"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {speaker.title}
          </span>
          <span className="text-neutral-500">at</span>
          {LogoComponent && (
            <LogoComponent className="h-14 w-auto text-white" />
          )}
        </div>
      </div>
    </div>
  );
}
