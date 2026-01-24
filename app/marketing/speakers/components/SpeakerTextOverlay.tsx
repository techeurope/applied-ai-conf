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
  const [speakerNameBounds, setSpeakerNameBounds] = useState({
    width: 1,
    height: config.speakerName.fontSize,
    centerX: 0.3,
    centerY: 0,
  });
  const [techEuropeBounds, setTechEuropeBounds] = useState({
    width: 0.6,
    height: config.techEurope.fontSize,
    centerX: 0.3,
    centerY: 0,
  });
  const [speakerTitleBounds, setSpeakerTitleBounds] = useState({
    width: 0.6,
    height: config.speakerTitle.fontSize,
    centerX: 0.3,
    centerY: 0,
  });
  const [dateLocationBounds, setDateLocationBounds] = useState({
    width: 0.9,
    height: config.dateLocation.fontSize,
    centerX: 0.3,
    centerY: 0,
  });
  const [logoBounds, setLogoBounds] = useState<{
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  }>({
    width: 0.8,
    height: config.logo.fontSize * 2.5,
    centerX: 0.3,
    centerY: -config.logo.fontSize * 0.5,
  });

  // Global text color override
  const globalColor = config.globalTextColor;

  const logoConfig = COMPANY_LOGOS[company.toLowerCase()];
  const cardLogoWidth =
    config.speakerMetaCard.logoScale * (logoConfig?.aspectRatio ?? 1);

  useEffect(() => {
    setElementCenterOffset("speakerMetaCard", { x: 0, y: 0 });
  }, [setElementCenterOffset]);

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
      >,
      elementType: "speakerName" | "speakerTitle" | "techEurope" | "dateLocation"
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
      const pos = line.position as Vector3;
      const width = Math.max(0.01, maxX - minX);
      const height = Math.max(0.01, maxY - minY);
      const centerX = pos.x + (minX + maxX) / 2;
      const centerY = pos.y + (minY + maxY) / 2;
      setBounds({
        width,
        height,
        centerX,
        centerY,
      });
      setElementCenterOffset(elementType, { x: centerX, y: centerY });
    },
    [setElementCenterOffset]
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

    const pos1 = line1.position as Vector3;
    const pos2 = line2.position as Vector3;

    const minX = Math.min(pos1.x + minX1, pos2.x + minX2);
    const maxX = Math.max(pos1.x + maxX1, pos2.x + maxX2);
    const minY = Math.min(pos1.y + minY1, pos2.y + minY2);
    const maxY = Math.max(pos1.y + maxY1, pos2.y + maxY2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setLogoBounds({
      width: Math.max(0.01, maxX - minX),
      height: Math.max(0.01, maxY - minY),
      centerX,
      centerY,
    });
    setElementCenterOffset("logo", { x: centerX, y: centerY });
  }, [setElementCenterOffset]);

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
              computeSingleLineBounds(speakerNameRef, setSpeakerNameBounds, "speakerName")
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
            {selectedElements.includes("speakerMetaCard") && (
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry
                  args={[
                    config.speakerMetaCard.width + 0.06,
                    config.speakerMetaCard.height + 0.06,
                  ]}
                />
                <meshBasicMaterial color="#ab7030" transparent opacity={0.2} />
              </mesh>
            )}

            {/* Labels and values */}
            {(() => {
              const paddingX = 0.18;
              const paddingY = 0.12;
              const gap = 0.28;
              const labelValueGap = 0.07;
              const columnWidth =
                (config.speakerMetaCard.width - paddingX * 2 - gap) / 2;
              const leftX = -config.speakerMetaCard.width / 2 + paddingX;
              const rightX = leftX + columnWidth + gap;
              const labelY =
                config.speakerMetaCard.height / 2 -
                paddingY -
                config.speakerMetaCard.labelSize * 0.5;
              const valueY =
                labelY -
                labelValueGap -
                config.speakerMetaCard.labelSize * 0.8 -
                config.speakerMetaCard.valueSize * 0.4;

              return (
                <>
                  {/* Column divider */}
                  <mesh position={[0, 0, 0.01]}>
                    <planeGeometry
                      args={[
                        0.008,
                        config.speakerMetaCard.height - paddingY * 2,
                      ]}
                    />
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
                    position={[leftX, labelY, 0.01]}
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
                    position={[leftX, valueY, 0.01]}
                    onSync={() =>
                      computeSingleLineBounds(speakerTitleRef, setSpeakerTitleBounds, "speakerTitle")
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
                    position={[rightX, labelY, 0.01]}
                  >
                    COMPANY
                  </Text>

                  {/* Company logo */}
                  <group position={[rightX + cardLogoWidth / 2, valueY - 0.01, 0.01]}>
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
                computeSingleLineBounds(speakerTitleRef, setSpeakerTitleBounds, "speakerTitle")
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
              computeSingleLineBounds(techEuropeRef, setTechEuropeBounds, "techEurope")
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
              computeSingleLineBounds(dateLocationRef, setDateLocationBounds, "dateLocation")
            }
          >
            {config.dateLocation.text}
          </Text>
        </group>
      </SelectableElement>
    </>
  );
}
