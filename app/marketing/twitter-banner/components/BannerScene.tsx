"use client";

import { LidarBannerBackground } from "./LidarBannerBackground";
import { BannerTextOverlay } from "./BannerTextOverlay";
import { useBannerStore } from "../store";

export function BannerScene() {
  const { config } = useBannerStore();
  const { background } = config;

  return (
    <>
      {/* Lidar Grid Background */}
      <LidarBannerBackground
        fogDensity={background.fogDensity}
        gridOpacity={background.gridOpacity}
        animationPaused={background.animationPaused}
        animationTime={background.animationTime}
      />

      {/* Text Overlay */}
      <BannerTextOverlay />
    </>
  );
}

