"use client";

import { Suspense, useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";
import type { AssetConfig } from "../store";
import { useSpeakerAssetStore } from "../store";
import { SelectableElement } from "./SelectableElement";

const FONT_KODE_MONO_BOLD = "/fonts/KodeMono-Bold.ttf";
const FONT_KODE_MONO_REGULAR = "/fonts/KodeMono-Regular.ttf";

// Company logo mapping with dark versions (white logos for dark background)
const COMPANY_LOGOS: Record<string, { path: string; aspectRatio: number }> = {
  langdock: { path: "/logos/langdock_dark.png", aspectRatio: 5.09 },
  choco: { path: "/logos/choco_dark.png", aspectRatio: 2.73 },
  tacto: { path: "/logos/tacto_dark.png", aspectRatio: 2.98 },
  legora: { path: "/logos/legora_dark.png", aspectRatio: 1.0 },
  knowunity: { path: "/logos/knowunity_dark.png", aspectRatio: 4.78 },
};

// Company logo mesh component
function CompanyLogoMesh({
  company,
  scale,
  opacity,
}: {
  company: string;
  scale: number;
  opacity: number;
}) {
  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  const texture = useTexture(logoConfig?.path || "/logos/legora_dark.png");

  const { width, height } = useMemo(() => {
    const aspectRatio = logoConfig?.aspectRatio ?? 1;
    const h = scale;
    const w = h * aspectRatio;
    return { width: w, height: h };
  }, [logoConfig?.aspectRatio, scale]);

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

interface SpeakerTextOverlayProps {
  name: string;
  company: string;
  config: AssetConfig;
}

export function SpeakerTextOverlay({
  name,
  company,
  config,
}: SpeakerTextOverlayProps) {
  const { updatePosition, selectedElements } = useSpeakerAssetStore();

  // Global text color override
  const globalColor = config.globalTextColor;

  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  const logoWidth = config.companyLogo.scale * (logoConfig?.aspectRatio ?? 1);

  return (
    <>
      {/* Speaker name (large, prominent) */}
      <SelectableElement
        elementType="speakerName"
        position={config.speakerName.position}
        onPositionChange={(pos) => updatePosition("speakerName", pos)}
      >
        <Text
          fontSize={config.speakerName.fontSize}
          color={globalColor || config.speakerName.color}
          anchorX="left"
          anchorY="middle"
          font={FONT_KODE_MONO_BOLD}
          letterSpacing={config.speakerName.letterSpacing}
          outlineWidth={selectedElements.includes("speakerName") ? 0.005 : 0}
          outlineColor="#ab7030"
        >
          {name}
        </Text>
      </SelectableElement>

      {/* Company Logo (image) */}
      <SelectableElement
        elementType="companyLogo"
        position={config.companyLogo.position}
        onPositionChange={(pos) => updatePosition("companyLogo", pos)}
      >
        <group>
          {/* Selection outline */}
          {selectedElements.includes("companyLogo") && (
            <mesh position={[logoWidth / 2, 0, -0.01]}>
              <planeGeometry args={[logoWidth + 0.05, config.companyLogo.scale + 0.03]} />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          {/* Offset to align left edge */}
          <group position={[logoWidth / 2, 0, 0]}>
            <Suspense fallback={null}>
              <CompanyLogoMesh
                company={company}
                scale={config.companyLogo.scale}
                opacity={config.companyLogo.opacity}
              />
            </Suspense>
          </group>
        </group>
      </SelectableElement>

      {/* {Tech: Europe} text above logo */}
      <SelectableElement
        elementType="techEurope"
        position={config.techEurope.position}
        onPositionChange={(pos) => updatePosition("techEurope", pos)}
      >
        <Text
          fontSize={config.techEurope.fontSize}
          color={globalColor || config.techEurope.color}
          anchorX="left"
          anchorY="middle"
          font={FONT_KODE_MONO_REGULAR}
          letterSpacing={config.techEurope.letterSpacing}
          outlineWidth={selectedElements.includes("techEurope") ? 0.002 : 0}
          outlineColor="#ab7030"
        >
          {config.techEurope.text}
        </Text>
      </SelectableElement>

      {/* Conference Logo - text-based "APPLIED" / "AI CONF" */}
      <SelectableElement
        elementType="logo"
        position={config.logo.position}
        onPositionChange={(pos) => updatePosition("logo", pos)}
      >
        <group>
          {/* Selection outline for logo */}
          {selectedElements.includes("logo") && (
            <mesh position={[0.3, -config.logo.fontSize * 0.5, -0.01]}>
              <planeGeometry args={[0.8, config.logo.fontSize * 2.5]} />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <Text
            fontSize={config.logo.fontSize}
            color={globalColor || config.logo.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_BOLD}
            letterSpacing={config.logo.letterSpacing}
            position={[0, config.logo.fontSize * 0.6, 0]}
          >
            {config.logo.textLine1}
          </Text>
          <Text
            fontSize={config.logo.fontSize}
            color={globalColor || config.logo.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_BOLD}
            letterSpacing={config.logo.letterSpacing}
            position={[0, -config.logo.fontSize * 0.6, 0]}
          >
            {config.logo.textLine2}
          </Text>
        </group>
      </SelectableElement>

      {/* Date & Location (e.g. "MAY 28TH | BERLIN") */}
      <SelectableElement
        elementType="dateLocation"
        position={config.dateLocation.position}
        onPositionChange={(pos) => updatePosition("dateLocation", pos)}
      >
        <Text
          fontSize={config.dateLocation.fontSize}
          color={globalColor || config.dateLocation.color}
          anchorX="left"
          anchorY="middle"
          font={FONT_KODE_MONO_REGULAR}
          letterSpacing={config.dateLocation.letterSpacing}
          outlineWidth={selectedElements.includes("dateLocation") ? 0.002 : 0}
          outlineColor="#ab7030"
        >
          {config.dateLocation.text}
        </Text>
      </SelectableElement>
    </>
  );
}
