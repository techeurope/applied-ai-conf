"use client";

import { Suspense, useMemo } from "react";
import { Text, useTexture } from "@react-three/drei";
import type { AssetConfig } from "../store";

const FONT_KODE_MONO_BOLD = "/fonts/KodeMono-Bold.ttf";
const FONT_KODE_MONO_REGULAR = "/fonts/KodeMono-Regular.ttf";

// Company logo mapping with dark versions (white logos for dark background)
const COMPANY_LOGOS: Record<string, { path: string; aspectRatio: number }> = {
  langdock: { path: "/logos/langdock_dark.png", aspectRatio: 5.09 },
  choco: { path: "/logos/choco_dark.png", aspectRatio: 2.73 },
  tacto: { path: "/logos/tacto_dark.png", aspectRatio: 2.98 },
  legora: { path: "/logos/legora_dark.png", aspectRatio: 4.5 },
  knowunity: { path: "/logos/knowunity_dark.png", aspectRatio: 4.78 },
};

// Logo component that renders as a texture
function CompanyLogoMesh({ company }: { company: string }) {
  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  
  if (!logoConfig) {
    return null;
  }

  const texture = useTexture(logoConfig.path);
  
  // Calculate dimensions based on aspect ratio
  const { width, height } = useMemo(() => {
    const h = 0.12; // Fixed height
    const w = h * logoConfig.aspectRatio;
    return { width: w, height: h };
  }, [logoConfig.aspectRatio]);

  return (
    <mesh position={[0, -0.18, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.8}
        depthWrite={false}
      />
    </mesh>
  );
}

function CompanyLogo({ company }: { company: string }) {
  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  
  if (!logoConfig) {
    // Fallback to text if no logo
    return (
      <Text
        position={[0, -0.18, 0]}
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
          position={[0, -0.18, 0]}
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
      <CompanyLogoMesh company={company} />
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
  return (
    <group position={[0, -1.2, 0]}>
      {/* Speaker name */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={config.name.fontSize}
        color={config.name.color}
        anchorX="center"
        anchorY="middle"
        font={FONT_KODE_MONO_BOLD}
        letterSpacing={config.name.letterSpacing}
      >
        {name}
      </Text>

      {/* Title */}
      <Text
        position={[0, 0.02, 0]}
        fontSize={config.subtitle.fontSize}
        color={config.subtitle.color}
        anchorX="center"
        anchorY="middle"
        font={FONT_KODE_MONO_REGULAR}
        letterSpacing={config.subtitle.letterSpacing}
      >
        {title}
      </Text>

      {/* Company Logo */}
      <CompanyLogo company={company} />

      {/* Conference branding */}
      <Text
        position={[0, -0.42, 0]}
        fontSize={config.branding.fontSize}
        color={config.branding.color}
        anchorX="center"
        anchorY="middle"
        font={FONT_KODE_MONO_BOLD}
        letterSpacing={config.branding.letterSpacing}
      >
        {config.branding.text}
      </Text>

      {/* Date & Location */}
      <Text
        position={[0, -0.58, 0]}
        fontSize={config.dateLocation.fontSize}
        color={config.dateLocation.color}
        anchorX="center"
        anchorY="middle"
        font={FONT_KODE_MONO_REGULAR}
        letterSpacing={config.dateLocation.letterSpacing}
      >
        {config.dateLocation.text}
      </Text>
    </group>
  );
}

