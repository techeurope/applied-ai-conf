"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function PublicConvexProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [],
  );
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-sm text-zinc-400">
        Service is not configured.
      </div>
    );
  }
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
