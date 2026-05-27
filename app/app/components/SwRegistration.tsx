"use client";

import { useEffect } from "react";

// Registers /sw.js (compiled from app/sw.ts by @serwist/next) on /app.
// Scope is /app so the marketing site at "/" is untouched.
//
// Dev behaviour:
//   - Default: SW is NOT registered, and any previously-registered SW for
//     this origin is force-unregistered so hot reload isn't intercepted by
//     a stale cached bundle.
//   - Opt-in: set NEXT_PUBLIC_SW_DEV=1 in .env.local to register the SW
//     in dev too. Useful when manually QA'ing the offline-reload flow.
//
// Prod behaviour: always register.
export function SwRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isDev = process.env.NODE_ENV === "development";
    const swDevEnabled = process.env.NEXT_PUBLIC_SW_DEV === "1";

    if (isDev && !swDevEnabled) {
      // Unregister anything left from a previous opt-in dev session so the
      // user gets a fresh page on every reload.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => undefined);
      return;
    }

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
