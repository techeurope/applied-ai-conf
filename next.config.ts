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
  // Two legacy / external URL spaces both forward to /app:
  //   - /connect: pre-rename code base + lingering WorkOS dashboard config
  //   - /conf-day: printed on attendee badges as the human-typeable URL
  // Permanent (308) so browsers + crawlers cache. Nested redirects cover
  // anything beneath either path.
  async redirects() {
    return [
      { source: "/connect", destination: "/app", permanent: true },
      { source: "/connect/:path*", destination: "/app/:path*", permanent: true },
      { source: "/conf-day", destination: "/app", permanent: true },
      { source: "/conf-day/:path*", destination: "/app/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
