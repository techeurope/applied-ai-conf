"use client";

import { Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

interface SpeakerImageMeshProps {
  imageUrl: string;
  size: number;
  positionY: number;
}

function SpeakerImageMesh({ imageUrl, size, positionY }: SpeakerImageMeshProps) {
  const texture = useLoader(TextureLoader, imageUrl);

  return (
    <mesh position={[0, positionY, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

interface SpeakerImageProps {
  imageUrl: string;
  size: number;
  positionY: number;
}

export function SpeakerImage({ imageUrl, size, positionY }: SpeakerImageProps) {
  return (
    <Suspense fallback={null}>
      <SpeakerImageMesh
        key={imageUrl}
        imageUrl={imageUrl}
        size={size}
        positionY={positionY}
      />
    </Suspense>
  );
}



