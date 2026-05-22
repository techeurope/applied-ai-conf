"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

// Stage views are public read-only — no AuthKit, plain Convex client.
// (Reusing the /app ConvexClientProvider would require WorkOS auth context.)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function StageLayout({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-white/60">
        Convex not configured.
      </div>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
