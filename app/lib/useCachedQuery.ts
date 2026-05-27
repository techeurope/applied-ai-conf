"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
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
// **Cache is scoped by WorkOS user id.** User A's cached nav, vouchers,
// and team membership never leak to user B on the same device. Anonymous
// (signed-out) visitors get no cache reads or writes at all.
//
// Do NOT use for queries that contain secrets or sensitive data — local
// storage is plaintext.
const CACHE_PREFIX = "cq:v1:";

function scopedKey(userId: string, key: string): string {
  return `${CACHE_PREFIX}${userId}:${key}`;
}

function readCache<T>(scoped: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(scoped);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { v: T };
    return parsed.v;
  } catch {
    return undefined;
  }
}

function writeCache<T>(scoped: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      scoped,
      JSON.stringify({ v: value, t: Date.now() }),
    );
  } catch {
    // Quota / disabled storage — ignore. Cache is best-effort.
  }
}

// Wipe every cached query snapshot — used when a user signs out so the
// next visitor on the same device can't read their values.
export function clearAllCachedQueries(): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) toRemove.push(k);
    }
    for (const k of toRemove) window.localStorage.removeItem(k);
  } catch {
    // ignore
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
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  // Read cached value once on first render — but only if we know which
  // user we're rendering for. Signed-out / loading-auth → no cache read.
  const initial = useRef<R | undefined>(undefined);
  const initialReadRef = useRef<boolean>(false);
  if (!initialReadRef.current && userId) {
    initialReadRef.current = true;
    initial.current = readCache<R>(scopedKey(userId, cacheKey));
  }

  const live = useQuery(query, args) as R | undefined;

  useEffect(() => {
    if (!userId) return;
    if (live === undefined || live === null) return;
    writeCache(scopedKey(userId, cacheKey), live);
  }, [live, cacheKey, userId]);

  // No user → never serve cached data (it could belong to a different user
  // on a shared device). Live data still passes through.
  if (!userId) return live;
  return live !== undefined ? live : initial.current;
}

// Convenience: a hook that returns whether localStorage is currently
// being relied on (i.e., live query hasn't responded yet). Useful for
// rendering a "showing last-known data" hint.
export function useIsServingFromCache<R>(
  liveValue: R | undefined,
  cacheKey: string,
): boolean {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const [hasCached, setHasCached] = useState(false);
  useMemo(() => {
    if (typeof window === "undefined") return;
    if (!userId) {
      setHasCached(false);
      return;
    }
    setHasCached(
      window.localStorage.getItem(scopedKey(userId, cacheKey)) !== null,
    );
  }, [cacheKey, userId]);
  return liveValue === undefined && hasCached;
}
