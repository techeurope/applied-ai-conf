import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["conf.localhost", "*.conf.localhost"],
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod.spline.design",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
