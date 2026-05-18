"use client";

import { useAuth, useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useConvexAuth } from "convex/react";

export default function DebugPage() {
  const auth = useAuth();
  const token = useAccessToken();
  const convexAuth = useConvexAuth();

  return (
    <div className="space-y-4 pt-4">
      <h1 className="font-mono text-xl">Auth Debug</h1>
      <pre className="text-xs whitespace-pre-wrap bg-zinc-900 p-4 rounded">
        {JSON.stringify(
          {
            workosAuth: {
              loading: auth.loading,
              userId: auth.user?.id,
              email: auth.user?.email,
              sessionId: auth.sessionId,
            },
            accessToken: {
              loading: token.loading,
              hasToken: !!token.accessToken,
              tokenPrefix: token.accessToken?.slice(0, 30),
              error: token.error?.message,
            },
            convexAuth: {
              isAuthenticated: convexAuth.isAuthenticated,
              isLoading: convexAuth.isLoading,
            },
            envUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
