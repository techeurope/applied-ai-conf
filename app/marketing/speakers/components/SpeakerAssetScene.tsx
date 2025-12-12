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

  return (
    <>
      {/* Background click area for deselection */}
      <BackgroundClickArea />

      {/* Dark background plane */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#05070f" />
      </mesh>

      {/* Lidar background - selectable for background controls */}
      <group
        onPointerDown={(e) => {
          e.stopPropagation();
          setSelectedElement("background");
        }}
      >
        <LidarGridBackground gridColor={config.background.gridColor} />
      </group>

      {/* Semi-transparent overlay for readability */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={config.background.overlayOpacity}
        />
      </mesh>

      {/* Speaker image */}
      {speaker.image && (
        <SpeakerImage imageUrl={speaker.image} config={config} />
      )}

      {/* Text content */}
      <SpeakerTextOverlay
        name={speaker.name}
        title={speaker.title}
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
