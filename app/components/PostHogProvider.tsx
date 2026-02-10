"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import CookieConsent from "./CookieConsent";

const CONSENT_KEY = "cookie-consent";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

function initPostHog(anonymous: boolean) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;

  if (posthog.__loaded) {
    // Already loaded — upgrade or downgrade persistence
    if (!anonymous) {
      posthog.set_config({ persistence: "localStorage+cookie" });
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: anonymous ? "memory" : "localStorage+cookie",
  });
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    // Always init PostHog — anonymous mode if declined or no choice yet
    initPostHog(consent !== "accepted");
    setReady(true);
  }, []);

  const onAccept = useCallback(() => {
    // Upgrade to full persistence with cookies
    initPostHog(false);
  }, []);

  const onDecline = useCallback(() => {
    // Already running in anonymous/memory mode, nothing to change
  }, []);

  if (!ready) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
      <CookieConsent onAccept={onAccept} onDecline={onDecline} />
    </PHProvider>
  );
}
