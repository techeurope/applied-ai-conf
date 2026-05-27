/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// Service worker source — compiled to /public/sw.js by @serwist/next at
// build time. Scope is /app (set in app/app/manifest.ts and by the script
// tag registration), so the marketing site at "/" never sees it.
//
// Caching strategy summary:
//   * Precache: build manifest (CSS/JS chunks + favicon).
//   * Static assets, fonts, images: cache-first.
//   * Navigations under /app: stale-while-revalidate so the app shell
//     loads instantly and updates in the background.
//   * Convex (wss/https traffic): NEVER cached. Convex queries are
//     reactive over a websocket; intercepting would corrupt the live data.
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Render the app shell when the browser asks for an /app/* page offline.
  // Falls back to "/app" (which is precached), so the user sees our UI
  // with the "Offline" chip rather than the Chrome dino.
  fallbacks: {
    entries: [
      {
        url: "/app",
        matcher: ({ request }) =>
          request.destination === "document" &&
          new URL(request.url).pathname.startsWith("/app"),
      },
    ],
  },
  runtimeCaching: [
    // 1) Convex websocket / HTTPS: never cache. Force the network path.
    {
      matcher: ({ url }) =>
        url.hostname.endsWith(".convex.cloud") ||
        url.hostname.endsWith(".convex.site"),
      handler: new NetworkOnly(),
    },
    // 2) WorkOS auth endpoints: never cache (security-sensitive, includes
    //    OAuth callbacks and token refresh).
    {
      matcher: ({ url }) =>
        url.hostname.endsWith(".workos.com") ||
        url.pathname.startsWith("/api/auth/"),
      handler: new NetworkOnly(),
    },
    // 3) App pages under /app: stale-while-revalidate. The first visit
    //    populates the cache; subsequent reloads use the cached HTML
    //    immediately and revalidate in the background.
    {
      matcher: ({ request, url }) =>
        request.destination === "document" &&
        url.pathname.startsWith("/app"),
      handler: new StaleWhileRevalidate({
        cacheName: "app-pages",
      }),
    },
    // 4) Images, fonts, and other static assets: cache-first.
    {
      matcher: ({ request }) =>
        request.destination === "image" ||
        request.destination === "font" ||
        request.destination === "style" ||
        request.destination === "script",
      handler: new CacheFirst({
        cacheName: "static-assets",
      }),
    },
    // 5) Everything else: serwist's defaults (StaleWhileRevalidate for
    //    same-origin, NetworkFirst for cross-origin).
    ...defaultCache,
  ],
});

serwist.addEventListeners();
