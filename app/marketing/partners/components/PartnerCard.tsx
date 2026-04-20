"use client";

import type { Partner, PartnerTier } from "@/types";

interface TierStyle {
  label: string;
  glow: string;
  glowWidth: number;
  glowHeight: number;
}

// Explicit ellipse sizing inside an oversized container avoids the rectangular
// clipping that appears when the gradient still has visible color at a
// container edge.
const TIER_STYLES: Record<PartnerTier, TierStyle> = {
  premium: {
    label: "PREMIUM PARTNER",
    glow:
      "radial-gradient(ellipse 440px 260px at center, rgba(90, 170, 210, 0.3) 0%, rgba(50, 110, 160, 0.15) 35%, rgba(30, 70, 110, 0.05) 65%, rgba(0, 0, 0, 0) 100%)",
    glowWidth: 1080,
    glowHeight: 640,
  },
  gold: {
    label: "GOLD PARTNER",
    glow:
      "radial-gradient(ellipse 380px 230px at center, rgba(255, 200, 110, 0.16) 0%, rgba(220, 160, 60, 0.07) 40%, rgba(140, 100, 30, 0.02) 70%, rgba(0, 0, 0, 0) 100%)",
    glowWidth: 1080,
    glowHeight: 580,
  },
  community: {
    label: "COMMUNITY PARTNER",
    glow:
      "radial-gradient(ellipse 260px 160px at center, rgba(200, 200, 200, 0.08) 0%, rgba(160, 160, 160, 0.03) 50%, rgba(0, 0, 0, 0) 100%)",
    glowWidth: 1080,
    glowHeight: 440,
  },
};

interface Props {
  partner: Partner;
  tier: PartnerTier;
  conferenceDate?: string;
  hideLogo?: boolean;
}

export function PartnerCard({
  partner,
  tier,
  conferenceDate = "MAY 28, 2026",
  hideLogo = false,
}: Props) {
  const style = TIER_STYLES[tier];
  const logoScale = partner.logoScale ?? 1;
  // Baseline logo bounding box, scaled per-partner for visual consistency.
  // Capped to the 918px separator width (Figma safe zone) so wide logos at
  // high logoScale don't bleed past the card margins.
  const logoHeight = Math.min(420 * logoScale, 460);
  const logoWidth = Math.min(900 * logoScale, 918);

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

      {/* Radial glow centered above the divider line */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "45%",
          width: `${style.glowWidth}px`,
          height: `${style.glowHeight}px`,
          transform: "translate(-50%, -50%)",
          background: style.glow,
        }}
      />

      {/* Partner logo centered over the glow */}
      {!hideLogo && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "45%",
            transform: "translate(-50%, -50%)",
            width: `${logoWidth}px`,
            height: `${logoHeight}px`,
          }}
        >
          <img
            src={partner.logo}
            alt={partner.logoAlt}
            crossOrigin="anonymous"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}

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

      {/* Horizontal divider line (from Figma spec) */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          left: "81px",
          top: "711px",
          width: "918px",
          height: "5px",
          background:
            "linear-gradient(90deg, rgba(217, 217, 217, 0) 0%, #D9D9D9 50%, rgba(115, 115, 115, 0) 100%)",
        }}
      />

      {/* Tier label */}
      <div
        className="absolute left-0 right-0 z-20 text-center"
        style={{
          top: "82%",
          fontFamily: "'Kode Mono', monospace",
          fontSize: "68px",
          fontWeight: 500,
          letterSpacing: "0.15em",
          color: "#d4d4d4",
        }}
      >
        {style.label}
      </div>
    </div>
  );
}
