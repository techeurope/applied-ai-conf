import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Service worker for /app (the conference companion). Lets the app shell
// reload while offline — the browser doesn't fall back to its built-in
// "no network" page. Scope is /app/*, so the marketing site is untouched.
// `app/sw.ts` defines the precache + runtime caching strategies.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // Disable the SW in dev to avoid the usual "stale bundle" trap during
  // hot-reload. Prod (next start, Vercel) registers it normally.
  disable: process.env.NODE_ENV === "development",
});

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

export default withSerwist(nextConfig);
