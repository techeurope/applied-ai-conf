"use client";

import { Suspense, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, SRGBColorSpace } from "three";
import { useSpeakerAssetStore } from "../store";
import type { AssetConfig, SpeakerAssetStore } from "../store";
import { SelectableElement } from "./SelectableElement";

interface SpeakerImageMeshProps {
  imageUrl: string;
  size: number;
}

function SpeakerImageMesh({ imageUrl, size }: SpeakerImageMeshProps) {
  const texture = useLoader(TextureLoader, imageUrl);
  const selectedElements = useSpeakerAssetStore((s: SpeakerAssetStore) => s.selectedElements);

  // Ensure proper color rendering (web images are sRGB)
  texture.colorSpace = SRGBColorSpace;

  return (
    <group>
      {/* Selection outline */}
      {selectedElements.includes("image") && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[size + 0.08, size + 0.08]} />
          <meshBasicMaterial color="#ab7030" transparent opacity={0.4} />
        </mesh>
      )}
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

interface SpeakerImageProps {
  imageUrl: string;
  config: AssetConfig;
}

export function SpeakerImage({ imageUrl, config }: SpeakerImageProps) {
  const updatePosition = useSpeakerAssetStore((s: SpeakerAssetStore) => s.updatePosition);
  const setElementCenterOffset = useSpeakerAssetStore((s: SpeakerAssetStore) => s.setElementCenterOffset);

  // Image is centered at its position (plane geometry is centered by default)
  useEffect(() => {
    setElementCenterOffset("image", { x: 0, y: 0 });
  }, [setElementCenterOffset]);

  return (
    <SelectableElement
      elementType="image"
      position={config.image.position}
      onPositionChange={(pos) => updatePosition("image", pos)}
    >
      <Suspense fallback={null}>
        <SpeakerImageMesh
          key={imageUrl}
          imageUrl={imageUrl}
          size={config.image.size}
        />
      </Suspense>
    </SelectableElement>
  );
}
