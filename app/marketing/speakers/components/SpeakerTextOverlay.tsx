"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, useTexture } from "@react-three/drei";
import type { Vector3 } from "three";
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
  "veed.io": { path: "/logos/veed.svg", aspectRatio: 4.79 }, // TODO: Create veed_dark.png
  codewords: { path: "/logos/codewords.svg", aspectRatio: 6.58 }, // TODO: Create codewords_dark.png
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
  // Fallback to a placeholder if logo not found (instead of defaulting to legora)
  const texture = useTexture(logoConfig?.path || "/logos/langdock_dark.png");

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
  const { updatePosition, selectedElements, setElementCenterOffset } = useSpeakerAssetStore();
  const speakerNameRef = useRef<any>(null);
  const speakerTitleRef = useRef<any>(null);
  const techEuropeRef = useRef<any>(null);
  const dateLocationRef = useRef<any>(null);
  const logoLine1Ref = useRef<any>(null);
  const logoLine2Ref = useRef<any>(null);
  // Estimate initial bounds based on font size and typical text lengths
  // These will be updated by onSync when text actually renders
  const [speakerNameBounds, setSpeakerNameBounds] = useState({
    width: config.speakerName.fontSize * 12, // Estimate ~12 chars wide
    height: config.speakerName.fontSize,
    centerX: config.speakerName.fontSize * 6, // Center offset = width/2
    centerY: 0,
  });
  const [techEuropeBounds, setTechEuropeBounds] = useState({
    width: config.techEurope.fontSize * 10,
    height: config.techEurope.fontSize,
    centerX: config.techEurope.fontSize * 5,
    centerY: 0,
  });
  const [speakerTitleBounds, setSpeakerTitleBounds] = useState({
    width: config.speakerTitle.fontSize * 8,
    height: config.speakerTitle.fontSize,
    centerX: config.speakerTitle.fontSize * 4,
    centerY: 0,
  });
  const [dateLocationBounds, setDateLocationBounds] = useState({
    width: config.dateLocation.fontSize * 14,
    height: config.dateLocation.fontSize,
    centerX: config.dateLocation.fontSize * 7,
    centerY: 0,
  });
  const [logoBounds, setLogoBounds] = useState<{
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  }>({
    width: config.logo.fontSize * 6,
    height: config.logo.fontSize * 2.5,
    centerX: config.logo.fontSize * 3,
    centerY: 0, // The two lines are symmetrical around y=0
  });

  // Global text color override
  const globalColor = config.globalTextColor;

  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  const cardLogoWidth =
    config.speakerMetaCard.logoScale * (logoConfig?.aspectRatio ?? 1);
  const metaPaddingLeft = 0.12;
  const metaPaddingRight = 0.12;

  // Compute the visual center of the meta card content
  const metaCardContentX = -config.speakerMetaCard.width / 2 + metaPaddingLeft;
  const metaCardLogoCenterX = metaCardContentX + cardLogoWidth / 2;

  // Sync offsets to store whenever bounds change
  useEffect(() => {
    setElementCenterOffset("speakerMetaCard", { x: metaCardLogoCenterX, y: 0 });
  }, [setElementCenterOffset, metaCardLogoCenterX]);

  useEffect(() => {
    setElementCenterOffset("speakerName", { x: speakerNameBounds.centerX, y: speakerNameBounds.centerY });
  }, [setElementCenterOffset, speakerNameBounds.centerX, speakerNameBounds.centerY]);

  useEffect(() => {
    setElementCenterOffset("techEurope", { x: techEuropeBounds.centerX, y: techEuropeBounds.centerY });
  }, [setElementCenterOffset, techEuropeBounds.centerX, techEuropeBounds.centerY]);

  useEffect(() => {
    setElementCenterOffset("speakerTitle", { x: speakerTitleBounds.centerX, y: speakerTitleBounds.centerY });
  }, [setElementCenterOffset, speakerTitleBounds.centerX, speakerTitleBounds.centerY]);

  useEffect(() => {
    setElementCenterOffset("dateLocation", { x: dateLocationBounds.centerX, y: dateLocationBounds.centerY });
  }, [setElementCenterOffset, dateLocationBounds.centerX, dateLocationBounds.centerY]);

  useEffect(() => {
    setElementCenterOffset("logo", { x: logoBounds.centerX, y: logoBounds.centerY });
  }, [setElementCenterOffset, logoBounds.centerX, logoBounds.centerY]);

  const computeSingleLineBounds = useCallback(
    (
      ref: React.MutableRefObject<any>,
      setBounds: React.Dispatch<
        React.SetStateAction<{
          width: number;
          height: number;
          centerX: number;
          centerY: number;
        }>
      >
    ) => {
      const line = ref.current;
      if (!line) return;
      const info = line.textRenderInfo;
      if (!info?.blockBounds) return;
      const [minX, minY, maxX, maxY] = info.blockBounds as [
        number,
        number,
        number,
        number,
      ];
      const width = Math.max(0.01, maxX - minX);
      const height = Math.max(0.01, maxY - minY);
      // Center offset relative to anchor point (not including local position)
      // For anchorX="left", anchorY="middle": center is at (width/2, 0) from anchor
      const offsetX = (minX + maxX) / 2;
      const offsetY = (minY + maxY) / 2;
      setBounds({
        width,
        height,
        centerX: offsetX,
        centerY: offsetY,
      });
      // Offset syncing is handled by useEffects that watch bounds changes
    },
    []
  );

  const computeLogoBounds = useCallback(() => {
    const line1 = logoLine1Ref.current;
    const line2 = logoLine2Ref.current;
    if (!line1 || !line2) return;

    const info1 = line1.textRenderInfo;
    const info2 = line2.textRenderInfo;
    if (!info1?.blockBounds || !info2?.blockBounds) return;

    const [minX1, minY1, maxX1, maxY1] = info1.blockBounds as [
      number,
      number,
      number,
      number,
    ];
    const [minX2, minY2, maxX2, maxY2] = info2.blockBounds as [
      number,
      number,
      number,
      number,
    ];

    // Include local positions since logo text lines have explicit Y offsets
    const pos1 = line1.position as Vector3;
    const pos2 = line2.position as Vector3;

    // Calculate combined bounds in local space (relative to the SelectableElement position)
    const minX = Math.min(pos1.x + minX1, pos2.x + minX2);
    const maxX = Math.max(pos1.x + maxX1, pos2.x + maxX2);
    const minY = Math.min(pos1.y + minY1, pos2.y + minY2);
    const maxY = Math.max(pos1.y + maxY1, pos2.y + maxY2);

    // Center offset relative to the SelectableElement's position (anchor)
    const offsetX = (minX + maxX) / 2;
    const offsetY = (minY + maxY) / 2;
    setLogoBounds({
      width: Math.max(0.01, maxX - minX),
      height: Math.max(0.01, maxY - minY),
      centerX: offsetX,
      centerY: offsetY,
    });
    // Offset syncing is handled by useEffect that watches logoBounds changes
  }, []);

  return (
    <>
      {/* Speaker name (large, prominent) */}
      <SelectableElement
        elementType="speakerName"
        position={config.speakerName.position}
        onPositionChange={(pos) => updatePosition("speakerName", pos)}
      >
        <group>
          {selectedElements.includes("speakerName") && (
            <mesh position={[speakerNameBounds.centerX, speakerNameBounds.centerY, -0.01]}>
              <planeGeometry args={[speakerNameBounds.width + 0.04, speakerNameBounds.height + 0.04]} />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <Text
            ref={speakerNameRef}
            fontSize={config.speakerName.fontSize}
            color={globalColor || config.speakerName.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_BOLD}
            letterSpacing={config.speakerName.letterSpacing}
            onSync={() =>
              computeSingleLineBounds(speakerNameRef, setSpeakerNameBounds)
            }
          >
            {name}
          </Text>
        </group>
      </SelectableElement>

      {/* Speaker meta card (role + company) */}
      {config.speakerMetaCard.enabled ? (
        <SelectableElement
          elementType="speakerMetaCard"
          position={config.speakerMetaCard.position}
          onPositionChange={(pos) => updatePosition("speakerMetaCard", pos)}
        >
          <group>
            {(() => {
              // Content starts at x, logo extends from x to x+cardLogoWidth
              const contentX = -config.speakerMetaCard.width / 2 + metaPaddingLeft;
              // Box should wrap the logo with equal padding on both sides
              const boxWidth = cardLogoWidth + metaPaddingLeft + metaPaddingRight;
              // Box center = logo center
              const logoCenterX = contentX + cardLogoWidth / 2;

              return (
                <>
                  {/* Background for card (if configured) */}
                  {config.speakerMetaCard.backgroundOpacity > 0 && (
                    <mesh position={[logoCenterX, 0, -0.02]}>
                      <planeGeometry args={[boxWidth, config.speakerMetaCard.height]} />
                      <meshBasicMaterial
                        color={config.speakerMetaCard.backgroundColor}
                        transparent
                        opacity={config.speakerMetaCard.backgroundOpacity}
                      />
                    </mesh>
                  )}

                  {/* Selection highlight box */}
                  {selectedElements.includes("speakerMetaCard") && (
                    <mesh position={[logoCenterX, 0, -0.01]}>
                      <planeGeometry
                        args={[
                          boxWidth + 0.06,
                          config.speakerMetaCard.height + 0.06,
                        ]}
                      />
                      <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
                    </mesh>
                  )}
                </>
              );
            })()}

            {/* Labels and values - two-line layout with horizontal separator */}
            {(() => {
              const paddingY = 0.1;
              const labelValueGap = 0.07;
              const lineGap = 0.12; // Space between the two lines
              const x = -config.speakerMetaCard.width / 2 + metaPaddingLeft;
              const boxWidth = cardLogoWidth + metaPaddingLeft + metaPaddingRight;
              const logoCenterX = x + cardLogoWidth / 2;
              
              // Calculate section heights
              const roleLabelHeight = config.speakerMetaCard.labelSize;
              const roleValueHeight = config.speakerMetaCard.valueSize;
              const companyLabelHeight = config.speakerMetaCard.labelSize;
              const companyValueHeight = Math.max(config.speakerMetaCard.valueSize, config.speakerMetaCard.logoScale);
              
              // Card bounds: extends from -height/2 to +height/2
              const cardTop = config.speakerMetaCard.height / 2 - paddingY;
              const cardBottom = -config.speakerMetaCard.height / 2 + paddingY;
              
              // Position separator at center (y=0)
              const separatorY = 0;
              
              // Top line (Role) - positioned above separator, within card bounds
              const topValueY = separatorY + lineGap / 2 + roleValueHeight * 0.5;
              const topLabelY = topValueY + roleValueHeight * 0.5 + labelValueGap + roleLabelHeight * 0.5;
              
              // Bottom line (Company) - positioned below separator, within card bounds
              const bottomLabelY = separatorY - lineGap / 2 - companyLabelHeight * 0.5;
              const bottomValueY = bottomLabelY - companyLabelHeight * 0.5 - labelValueGap - companyValueHeight * 0.5;

              return (
                <>
                  {/* Horizontal separator */}
                  <mesh position={[logoCenterX, separatorY, 0.01]}>
                    <planeGeometry args={[boxWidth, 0.008]} />
                    <meshBasicMaterial
                      color={config.speakerMetaCard.borderColor}
                      transparent
                      opacity={config.speakerMetaCard.borderOpacity * 0.6}
                    />
                  </mesh>

                  {/* Role label */}
                  <Text
                    fontSize={config.speakerMetaCard.labelSize}
                    color={globalColor || config.speakerMetaCard.labelColor}
                    anchorX="left"
                    anchorY="middle"
                    font={FONT_KODE_MONO_REGULAR}
                    letterSpacing={config.speakerMetaCard.labelTracking}
                    position={[x, topLabelY, 0.01]}
                  >
                    ROLE
                  </Text>
                  {/* Role value */}
                  <Text
                    ref={speakerTitleRef}
                    fontSize={config.speakerMetaCard.valueSize}
                    color={globalColor || config.speakerMetaCard.valueColor}
                    anchorX="left"
                    anchorY="middle"
                    font={FONT_KODE_MONO_REGULAR}
                    letterSpacing={config.speakerMetaCard.valueTracking}
                    position={[x, topValueY, 0.01]}
                    onSync={() =>
                      computeSingleLineBounds(speakerTitleRef, setSpeakerTitleBounds)
                    }
                  >
                    {title}
                  </Text>

                  {/* Company label */}
                  <Text
                    fontSize={config.speakerMetaCard.labelSize}
                    color={globalColor || config.speakerMetaCard.labelColor}
                    anchorX="left"
                    anchorY="middle"
                    font={FONT_KODE_MONO_REGULAR}
                    letterSpacing={config.speakerMetaCard.labelTracking}
                    position={[x, bottomLabelY, 0.01]}
                  >
                    COMPANY
                  </Text>

                  {/* Company logo */}
                  <group position={[x + cardLogoWidth / 2, bottomValueY - 0.01, 0.01]}>
                    <Suspense fallback={null}>
                      <CompanyLogoMesh
                        company={company}
                        scale={config.speakerMetaCard.logoScale}
                        opacity={config.speakerMetaCard.logoOpacity}
                      />
                    </Suspense>
                  </group>
                </>
              );
            })()}
          </group>
        </SelectableElement>
      ) : null}

      {(!config.speakerMetaCard.enabled || selectedElements.includes("speakerTitle")) && (
        <SelectableElement
          elementType="speakerTitle"
          position={config.speakerTitle.position}
          onPositionChange={(pos) => updatePosition("speakerTitle", pos)}
        >
          <group>
            {selectedElements.includes("speakerTitle") && (
              <mesh position={[speakerTitleBounds.centerX, speakerTitleBounds.centerY, -0.01]}>
                <planeGeometry
                  args={[speakerTitleBounds.width + 0.04, speakerTitleBounds.height + 0.04]}
                />
                <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
              </mesh>
            )}
            <Text
              ref={speakerTitleRef}
              fontSize={config.speakerTitle.fontSize}
              color={globalColor || config.speakerTitle.color}
              anchorX="left"
              anchorY="middle"
              font={FONT_KODE_MONO_REGULAR}
              letterSpacing={config.speakerTitle.letterSpacing}
              onSync={() =>
                computeSingleLineBounds(speakerTitleRef, setSpeakerTitleBounds)
              }
            >
              {`${title} @`}
            </Text>
          </group>
        </SelectableElement>
      )}

      {/* {Tech: Europe} text above logo */}
      <SelectableElement
        elementType="techEurope"
        position={config.techEurope.position}
        onPositionChange={(pos) => updatePosition("techEurope", pos)}
      >
        <group>
          {selectedElements.includes("techEurope") && (
            <mesh position={[techEuropeBounds.centerX, techEuropeBounds.centerY, -0.01]}>
              <planeGeometry args={[techEuropeBounds.width + 0.04, techEuropeBounds.height + 0.04]} />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <Text
            ref={techEuropeRef}
            fontSize={config.techEurope.fontSize}
            color={globalColor || config.techEurope.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_REGULAR}
            letterSpacing={config.techEurope.letterSpacing}
            onSync={() =>
              computeSingleLineBounds(techEuropeRef, setTechEuropeBounds)
            }
          >
            {config.techEurope.text}
          </Text>
        </group>
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
            <mesh position={[logoBounds.centerX, logoBounds.centerY, -0.01]}>
              <planeGeometry args={[logoBounds.width + 0.04, logoBounds.height + 0.04]} />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <Text
            ref={logoLine1Ref}
            fontSize={config.logo.fontSize}
            color={globalColor || config.logo.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_BOLD}
            letterSpacing={config.logo.letterSpacing}
            position={[0, config.logo.fontSize * 0.6, 0]}
            onSync={computeLogoBounds}
          >
            {config.logo.textLine1}
          </Text>
          <Text
            ref={logoLine2Ref}
            fontSize={config.logo.fontSize}
            color={globalColor || config.logo.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_BOLD}
            letterSpacing={config.logo.letterSpacing}
            position={[0, -config.logo.fontSize * 0.6, 0]}
            onSync={computeLogoBounds}
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
        <group>
          {selectedElements.includes("dateLocation") && (
            <mesh position={[dateLocationBounds.centerX, dateLocationBounds.centerY, -0.01]}>
              <planeGeometry
                args={[dateLocationBounds.width + 0.04, dateLocationBounds.height + 0.04]}
              />
              <meshBasicMaterial color="#ab7030" transparent opacity={0.3} />
            </mesh>
          )}
          <Text
            ref={dateLocationRef}
            fontSize={config.dateLocation.fontSize}
            color={globalColor || config.dateLocation.color}
            anchorX="left"
            anchorY="middle"
            font={FONT_KODE_MONO_REGULAR}
            letterSpacing={config.dateLocation.letterSpacing}
            onSync={() =>
              computeSingleLineBounds(dateLocationRef, setDateLocationBounds)
            }
          >
            {config.dateLocation.text}
          </Text>
        </group>
      </SelectableElement>
    </>
  );
}
