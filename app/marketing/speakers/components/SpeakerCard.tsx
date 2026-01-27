"use client";

import type { Speaker } from "@/types";

// Map company names to actual logo files (dark versions = white logos for dark bg)
const LOGO_MAP: Record<string, string> = {
  legora: "/logos/legora_dark.png",
  langdock: "/logos/langdock_dark.png",
  choco: "/logos/choco_dark.png",
  tacto: "/logos/tacto_dark.png",
  knowunity: "/logos/knowunity_dark.png",
  "veed.io": "/logos/veed.svg",
  codewords: "/logos/codewords.svg",
};

function getLogoPath(speaker: Speaker): string {
  const key = speaker.company.toLowerCase();
  return LOGO_MAP[key] || speaker.companyLogo || "/logos/langdock_dark.png";
}

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
}

export function SpeakerCard({
  speaker,
  conferenceDate = "MAY 28, 2026",
  imageConfig = defaultImageConfig,
}: Props) {
  const logoPath = getLogoPath(speaker);
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
          className="text-[140px] font-bold text-white tracking-tight leading-[0.85]"
          style={{ fontFamily: "'Kode Mono', monospace" }}
        >
          {speaker.name.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word}
            </span>
          ))}
        </h1>
        <div className="flex items-center gap-5 mt-10">
          <span
            className="text-neutral-300 text-5xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {speaker.title}
          </span>
          <span className="text-neutral-500 text-5xl">at</span>
          <img
            src={logoPath}
            alt={speaker.logoAlt}
            className="h-14 w-auto object-contain"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  );
}
