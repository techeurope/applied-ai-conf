"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches uncaught errors from Convex queries / mutations during render so the
// user never sees a raw "Server Error / Request ID: …" dump on the page. The
// most common cause in the wild is the browser losing network mid-render
// (offline / flaky wifi). The page's `useQuery` will retry on its own once
// connectivity comes back, but the thrown error needs to be contained
// somewhere — without this boundary it bubbles to the Next.js error overlay
// or, in prod, a generic crash screen.
export class ConvexErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep it out of Sentry / console noise once we identify it as a known
    // offline / network error. Anything else we still want logged.
    if (!isLikelyNetworkError(error)) {
      // eslint-disable-next-line no-console
      console.error("[ConvexErrorBoundary]", error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const network = isLikelyNetworkError(this.state.error);
    return (
      <div className="max-w-md mx-auto py-12 px-6 text-center space-y-4">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-400/40">
          {network ? (
            <WifiOff className="size-5 text-amber-200" strokeWidth={1.75} />
          ) : (
            <RefreshCw className="size-5 text-amber-200" strokeWidth={1.75} />
          )}
        </div>
        <h2 className="font-mono text-lg font-bold">
          {network ? "You're offline" : "Something went wrong"}
        </h2>
        <p className="text-sm text-white/60 leading-relaxed">
          {network
            ? "We couldn't reach the server. Check your connection and try again."
            : "We hit an unexpected error. Try again — if it keeps happening, refresh the page."}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={this.reset}
            className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-medium"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full ring-1 ring-white/20 font-mono text-xs"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

function isLikelyNetworkError(error: Error): boolean {
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("server error") ||
    msg.includes("offline") ||
    msg.includes("convex") ||
    typeof navigator !== "undefined" && !navigator.onLine
  );
}
