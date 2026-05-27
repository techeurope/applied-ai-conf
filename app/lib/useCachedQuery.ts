"use client";

import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useEffect, useMemo, useRef, useState } from "react";

// Drop-in replacement for `useQuery` that mirrors every successful response
// to `localStorage`, so the next render — even after an offline reload —
// has *something* to show while Convex re-establishes its websocket.
//
// Usage:
//   const me = useCachedQuery(api.users.me, {}, "users.me");
//
// The third arg is the cache key. Keep it stable per query+args. Stale
// snapshots are fine here — they're explicitly tolerated for offline UX
// (badge QR, voucher QR, agenda, nav tabs all stay rendered with last-
// known values) and overwritten as soon as the live query returns.
//
// Do NOT use for queries that contain secrets or sensitive data — local
// storage is plaintext.
const CACHE_PREFIX = "cq:v1:";

function readCache<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { v: T };
    return parsed.v;
  } catch {
    return undefined;
  }
}

function writeCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ v: value, t: Date.now() }),
    );
  } catch {
    // Quota / disabled storage — ignore. Cache is best-effort.
  }
}

// Mirrors convex/react `useQuery`'s inference: caller passes a query
// reference, gets back the inferred return type (or undefined while
// loading or offline-with-no-cache).
export function useCachedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  // Pass `{}` for no-arg queries — matches convex/react's own contract.
  args: Query["_args"],
  cacheKey: string,
): Query["_returnType"] | undefined {
  type R = Query["_returnType"];
  // Read cached value once on first render. After that, the live response
  // (when it arrives) wins.
  const initial = useRef<R | undefined>(undefined);
  if (initial.current === undefined) {
    initial.current = readCache<R>(cacheKey);
  }

  const live = useQuery(query, args) as R | undefined;

  useEffect(() => {
    if (live !== undefined && live !== null) {
      writeCache(cacheKey, live);
    }
  }, [live, cacheKey]);

  return live !== undefined ? live : initial.current;
}

// Convenience: a hook that returns whether localStorage is currently
// being relied on (i.e., live query hasn't responded yet). Useful for
// rendering a "showing last-known data" hint.
export function useIsServingFromCache<R>(
  liveValue: R | undefined,
  cacheKey: string,
): boolean {
  const [hasCached, setHasCached] = useState(false);
  useMemo(() => {
    if (typeof window === "undefined") return;
    setHasCached(window.localStorage.getItem(CACHE_PREFIX + cacheKey) !== null);
  }, [cacheKey]);
  return liveValue === undefined && hasCached;
}
