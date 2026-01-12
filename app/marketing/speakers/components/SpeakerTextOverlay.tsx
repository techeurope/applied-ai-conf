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
  langdock: { path: "/logos/langdock_dark.png", aspectRatio: 5.09 },  // 112x22
  choco: { path: "/logos/choco_dark.png", aspectRatio: 2.73 },        // ~320x117
  tacto: { path: "/logos/tacto_dark.png", aspectRatio: 2.98 },        // 125x42
  legora: { path: "/logos/legora_dark.png", aspectRatio: 1.0 },       // 1200x1200 (square)
  knowunity: { path: "/logos/knowunity_dark.png", aspectRatio: 4.78 }, // 859x180
};

// Logo component that renders as a texture
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

  if (!logoConfig) {
    return null;
  }

  const texture = useTexture(logoConfig.path);

  // Calculate dimensions based on aspect ratio
  const { width, height } = useMemo(() => {
    const h = scale;
    const w = h * logoConfig.aspectRatio;
    return { width: w, height: h };
  }, [logoConfig.aspectRatio, scale]);

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

function CompanyLogo({
  company,
  scale,
  opacity,
}: {
  company: string;
  scale: number;
  opacity: number;
}) {
  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];

  if (!logoConfig) {
    // Fallback to text if no logo
    return (
      <Text
        fontSize={0.1}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        font={FONT_KODE_MONO_REGULAR}
      >
        {company}
      </Text>
    );
  }

  return (
    <Suspense
      fallback={
        <Text
          fontSize={0.1}
          color="#666666"
          anchorX="center"
          anchorY="middle"
          font={FONT_KODE_MONO_REGULAR}
        >
          {company}
        </Text>
      }
    >
      <CompanyLogoMesh company={company} scale={scale} opacity={opacity} />
    </Suspense>
  );
}

interface SpeakerTextOverlayProps {
  name: string;
  title: string;
  company: string;
  config: AssetConfig;
}

export function SpeakerTextOverlay({
  name,
  title,
  company,
  config,
}: SpeakerTextOverlayProps) {
  const { updatePosition, selectedElements } = useSpeakerAssetStore();

  // Global text color override
  const globalColor = config.globalTextColor;

  const logoAspect =
    COMPANY_LOGOS[company.toLowerCase()]?.aspectRatio ?? 4;
  const logoWidth = config.logo.scale * logoAspect;
  const logoOffsetX =
    config.logo.align === "left"
      ? logoWidth / 2
      : config.logo.align === "right"
        ? -logoWidth / 2
        : 0;

  return (
    <>
      {/* Speaker name */}
      <SelectableElement
        elementType="name"
        position={config.name.position}
        onPositionChange={(pos) => updatePosition("name", pos)}
      >
        <Text
          fontSize={config.name.fontSize}
          color={globalColor || config.name.color}
          anchorX="center"
          anchorY="middle"
          font={FONT_KODE_MONO_BOLD}
          letterSpacing={config.name.letterSpacing}
          outlineWidth={selectedElements.includes("name") ? 0.005 : 0}
          outlineColor="#ab7030"
        >
          {name}
        </Text>
      </SelectableElement>

      {/* Title (subtitle) */}
      <SelectableElement
        elementType="subtitle"
        position={config.subtitle.position}
        onPositionChange={(pos) => updatePosition("subtitle", pos)}
      >
        <Text
          fontSize={config.subtitle.fontSize}
          color={globalColor || config.subtitle.color}
          anchorX="center"
          anchorY="middle"
          font={FONT_KODE_MONO_REGULAR}
          letterSpacing={config.subtitle.letterSpacing}
          outlineWidth={selectedElements.includes("subtitle") ? 0.003 : 0}
          outlineColor="#ab7030"
        >
          {title}
        </Text>
      </SelectableElement>

      {/* Company Logo */}
      <SelectableElement
        elementType="logo"
        position={config.logo.position}
        onPositionChange={(pos) => updatePosition("logo", pos)}
      >
        {/* Offset the logo inside its draggable anchor so alignment works:
            - left: left edge stays fixed (logo grows to the right)
            - center: grows in both directions
            - right: right edge stays fixed (logo grows to the left) */}
        <group position={[logoOffsetX, 0, 0]}>
          {/* Selection outline for logo */}
          {selectedElements.includes("logo") && (
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry
                args={[logoWidth + 0.05, config.logo.scale + 0.03]}
              />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <CompanyLogo company={company} scale={config.logo.scale} opacity={config.logo.opacity} />
        </group>
      </SelectableElement>

      {/* Conference branding */}
      <SelectableElement
        elementType="branding"
        position={config.branding.position}
        onPositionChange={(pos) => updatePosition("branding", pos)}
      >
        <Text
          fontSize={config.branding.fontSize}
          color={globalColor || config.branding.color}
          anchorX="center"
          anchorY="middle"
          font={FONT_KODE_MONO_BOLD}
          letterSpacing={config.branding.letterSpacing}
          outlineWidth={selectedElements.includes("branding") ? 0.003 : 0}
          outlineColor="#ab7030"
        >
          {config.branding.text}
        </Text>
      </SelectableElement>

      {/* Date & Location */}
      <SelectableElement
        elementType="dateLocation"
        position={config.dateLocation.position}
        onPositionChange={(pos) => updatePosition("dateLocation", pos)}
      >
        <Text
          fontSize={config.dateLocation.fontSize}
          color={globalColor || config.dateLocation.color}
          anchorX="center"
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
