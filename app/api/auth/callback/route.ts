import { handleAuth } from "@workos-inc/authkit-nextjs";

// baseURL is required because requests come through portless on
// https://conf.localhost (dev) or the Vercel edge on
// https://conference.techeurope.io (prod), but Next.js receives them
// with the internal `localhost:3000` host. Without an explicit
// baseURL, AuthKit constructs the post-callback redirect against that
// internal host and the browser ends up at http://localhost:3000/...
// with an SSL error.
const baseURL = (() => {
  // Derive from the public redirect URI we register with WorkOS:
  // strip the /api/auth/callback suffix.
  const redirectUri =
    process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ??
    process.env.WORKOS_REDIRECT_URI;
  if (!redirectUri) return undefined;
  try {
    const url = new URL(redirectUri);
    return `${url.protocol}//${url.host}`;
  } catch {
    return undefined;
  }
})();

// Always land on /app after sign-in. AppShell handles the next hop:
// → /app/link-ticket if not verified, → /app/onboarding if profile is
// still empty, → badge home otherwise. Hardcoding /app/onboarding here
// trapped already-onboarded users on the setup form after every sign-in.
export const GET = handleAuth({
  returnPathname: "/app",
  ...(baseURL ? { baseURL } : {}),
});
