"use client";

import { useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

// Background-fetches the high-traffic conf routes after the user lands on
// /app while online, so they're cached and survive an offline reload even
// if the user never navigated there manually. Fires once per page load,
// after auth + a short idle delay so it doesn't compete with the actual
// page render.
//
// Failures are swallowed — this is best-effort cache priming, never a
// blocker for the user. The SW's NetworkFirst rule on /app/* puts each
// fetched response into the app-pages cache automatically.
const WARM_ROUTES = [
  "/app/agenda",
  "/app/voucher",
  "/app/venue",
  "/app/connect",
  "/app/travel",
  "/app/programme",
];

export function CacheWarmer() {
  const auth = useAuth();
  const isAuthed = !!auth.user;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthed) return;
    if (!navigator.onLine) return;
    if (!("serviceWorker" in navigator)) return;

    const controller = new AbortController();
    const run = () => {
      for (const path of WARM_ROUTES) {
        fetch(path, {
          method: "GET",
          credentials: "same-origin",
          // Cache header hint — SW NetworkFirst rule decides the actual policy.
          cache: "no-cache",
          signal: controller.signal,
        }).catch(() => undefined);
      }
    };

    // Defer until the page is interactive so we don't compete with the
    // initial render. requestIdleCallback isn't on Safari — fall back to
    // a short setTimeout.
    let cancelIdle: number | undefined;
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      cancelIdle = w.requestIdleCallback(run);
    } else {
      cancelIdle = window.setTimeout(run, 2000) as unknown as number;
    }

    return () => {
      controller.abort();
      if (cancelIdle === undefined) return;
      if (typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(cancelIdle);
      } else {
        window.clearTimeout(cancelIdle);
      }
    };
  }, [isAuthed]);

  return null;
}
