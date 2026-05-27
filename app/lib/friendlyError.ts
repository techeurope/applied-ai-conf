// Turn Convex / network errors into something a user can read. Convex
// surfaces "Server Error / Request ID: ..." text by default, which is fine
// for debugging but hostile on a voucher screen at lunchtime when wifi
// drops. Keep the user-visible string short and action-oriented.
export function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong";
  const msg = (err.message ?? "").toLowerCase();
  if (
    typeof navigator !== "undefined" && !navigator.onLine ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("server error") ||
    msg.includes("offline") ||
    msg.includes("called by client")
  ) {
    return "You're offline — reconnect and try again.";
  }
  // Convex throws errors like "Uncaught Error: Something" — strip the prefix.
  return err.message.replace(/^Uncaught Error:\s*/i, "");
}

export function isOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  const msg = (err.message ?? "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("server error") ||
    msg.includes("offline")
  );
}
