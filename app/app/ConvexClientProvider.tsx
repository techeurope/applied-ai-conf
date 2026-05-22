"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuth, useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useCallback, useMemo, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function useAuthFromWorkOS() {
  const { user, loading: authLoading } = useAuth();
  const { getAccessToken, loading: tokenLoading } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken: _forceRefreshToken }: { forceRefreshToken: boolean }) => {
      void _forceRefreshToken;
      try {
        const token = await getAccessToken();
        return token ?? null;
      } catch {
        return null;
      }
    },
    [getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading: authLoading || tokenLoading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [authLoading, tokenLoading, user, fetchAccessToken],
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md text-sm text-zinc-400">
          <p className="text-zinc-200 font-mono mb-2">Connect is not configured yet.</p>
          <p>
            Set <code className="font-mono text-zinc-300">NEXT_PUBLIC_CONVEX_URL</code> in <code className="font-mono text-zinc-300">.env.local</code> and run
            <code className="font-mono text-zinc-300"> npx convex dev</code> to initialize the project.
          </p>
        </div>
      </div>
    );
  }
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
      {children}
    </ConvexProviderWithAuth>
  );
}
