"use client";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SPEAKERS } from "@/data/speakers";
import type { AssetConfig } from "../store";
import { useSpeakerAssetStore } from "../store";
import { LidarGridBackground } from "./LidarGridBackground";
import { SpeakerImage } from "./SpeakerImage";
import { SpeakerTextOverlay } from "./SpeakerTextOverlay";
import { BackgroundClickArea, SelectableElement } from "./SelectableElement";

export interface RendererRef {
  gl: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
}

interface SpeakerAssetSceneProps {
  speaker: (typeof SPEAKERS)[number];
  rendererRef: React.MutableRefObject<RendererRef | null>;
  config: AssetConfig;
}

export function SpeakerAssetScene({
  speaker,
  rendererRef,
  config,
}: SpeakerAssetSceneProps) {
  const { gl, scene, camera } = useThree();
  const { selectedElements, setSelectedElement } = useSpeakerAssetStore();

  if (!rendererRef.current || rendererRef.current.gl !== gl) {
    rendererRef.current = { gl, scene, camera };
  }

  // Use transparent image if available, fallback to original
  const imageUrl = speaker.imageTransparent || speaker.image;

  return (
    <>
      {/* Background click area for deselection */}
      <BackgroundClickArea />

      {/* Background plane - solid color */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color={config.background.solidColor} />
      </mesh>

      {/* Lidar background - only render when enabled, selectable for background controls */}
      {config.background.enabled && (
        <group
          onPointerDown={(e) => {
            e.stopPropagation();
            setSelectedElement("background");
          }}
        >
          <LidarGridBackground
            gridColor={config.background.gridColor}
            animationPaused={config.background.animationPaused}
            animationTime={config.background.animationTime}
          />
        </group>
      )}

      {/* Click area for background controls when grid is disabled */}
      {!config.background.enabled && (
        <mesh
          position={[0, 0, -9]}
          onPointerDown={(e) => {
            e.stopPropagation();
            setSelectedElement("background");
          }}
        >
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Semi-transparent overlay for readability (only when grid enabled) */}
      {config.background.enabled && (
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={config.background.overlayOpacity}
          />
        </mesh>
      )}

      {/* Speaker image */}
      {imageUrl && (
        <SpeakerImage imageUrl={imageUrl} config={config} />
      )}

      {/* Text content */}
      <SpeakerTextOverlay
        name={speaker.name}
        company={speaker.company}
        config={config}
      />

      {/* Selection indicator overlay */}
      {selectedElements.includes("background") && (
        <mesh position={[0, 0, -0.49]}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial color="#ab7030" transparent opacity={0.1} />
        </mesh>
      )}
    </>
  );
}
