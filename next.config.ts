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
  // Legacy /connect → /app rename. WorkOS Production still has the old URL
  // baked in as "App Homepage URL" so sign-out lands on /connect. Catch it
  // here too so any external bookmark / printed material from before the
  // rename keeps working.
  async redirects() {
    return [
      {
        source: "/connect",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/connect/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
