"use client";

import { useEffect } from "react";

// Registers /sw.js (compiled from app/sw.ts by @serwist/next) the first
// time the user lands on any /app route. Scope is /app so the marketing
// site is unaffected. Re-running register() on every mount is fine —
// the browser deduplicates against the existing registration.
export function SwRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/app" })
      .catch((err) => {
        // Non-fatal: the app still works without offline support.
        // eslint-disable-next-line no-console
        console.warn("[sw] register failed", err);
      });
  }, []);
  return null;
}
