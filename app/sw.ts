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
  NetworkFirst,
  NetworkOnly,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Precache is intentionally skipped. The precache manifest is keyed on the
// webpack build's chunk hashes; if the same SW is served by a different
// bundler (e.g. the dev server using turbopack), those URLs 404 and the
// install hangs forever. Runtime caching (stale-while-revalidate for /app
// pages, cache-first for assets) populates the same cache after the
// first visit, with negligible difference in offline-reload behavior.
// Force-touch the manifest so the linter doesn't complain.
void self.__SW_MANIFEST;
const serwist = new Serwist({
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
    // 1) Admin area: never cache. Admins need fresh data, and the page
    //    bundles contain user-bound destructive controls we don't want
    //    served stale to a delegate or to the same admin after a deploy.
    //    Must come before the /app/* rule (first match wins).
    {
      matcher: ({ url }) => url.pathname.startsWith("/app/admin"),
      handler: new NetworkOnly(),
    },
    // 2) Convex websocket / HTTPS: never cache. Force the network path.
    {
      matcher: ({ url }) =>
        url.hostname.endsWith(".convex.cloud") ||
        url.hostname.endsWith(".convex.site"),
      handler: new NetworkOnly(),
    },
    // 3) WorkOS auth endpoints: never cache (security-sensitive, includes
    //    OAuth callbacks and token refresh).
    {
      matcher: ({ url }) =>
        url.hostname.endsWith(".workos.com") ||
        url.pathname.startsWith("/api/auth/"),
      handler: new NetworkOnly(),
    },
    // 4) App pages under /app: NetworkFirst with a short timeout. Online
    //    users always see the freshest deploy; offline users fall back to
    //    the cached HTML. Matches both navigation requests (destination
    //    "document") and programmatic fetches (destination "") so the
    //    client-side CacheWarmer can populate this cache on first load.
    {
      matcher: ({ request, url }) =>
        url.pathname.startsWith("/app") &&
        (request.destination === "document" || request.destination === ""),
      handler: new NetworkFirst({
        cacheName: "app-pages",
        networkTimeoutSeconds: 4,
      }),
    },
    // 5) Images, fonts, and other static assets: cache-first.
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
    // 6) Everything else: serwist's defaults (StaleWhileRevalidate for
    //    same-origin, NetworkFirst for cross-origin).
    ...defaultCache,
  ],
});

serwist.addEventListeners();
