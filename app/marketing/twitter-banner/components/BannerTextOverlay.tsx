"use client";

import { Text } from "@react-three/drei";
import { useBannerStore } from "../store";

export function BannerTextOverlay() {
  const { config } = useBannerStore();
  const { subtitle, title, dateLocation } = config;

  return (
    <group>
      {/* Subtitle: {Tech: Europe} */}
      <Text
        position={[subtitle.position.x, subtitle.position.y, 0]}
        fontSize={subtitle.fontSize}
        color={subtitle.color}
        letterSpacing={subtitle.letterSpacing}
        anchorX="center"
        anchorY="middle"
        font="/fonts/KodeMono-Regular.ttf"
      >
        {subtitle.text}
      </Text>

      {/* Title: Applied AI Conf */}
      <Text
        position={[title.position.x, title.position.y, 0]}
        fontSize={title.fontSize}
        color={title.color}
        letterSpacing={title.letterSpacing}
        anchorX="center"
        anchorY="middle"
        font="/fonts/KodeMono-Bold.ttf"
      >
        {title.text}
      </Text>

      {/* Date & Location */}
      <Text
        position={[dateLocation.position.x, dateLocation.position.y, 0]}
        fontSize={dateLocation.fontSize}
        color={dateLocation.color}
        letterSpacing={dateLocation.letterSpacing}
        anchorX="center"
        anchorY="middle"
        font="/fonts/KodeMono-Regular.ttf"
      >
        {dateLocation.text}
      </Text>
    </group>
  );
}




