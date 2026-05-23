import { withAuth } from "@workos-inc/authkit-nextjs";
import { Landing } from "./components/landing/Landing";

export default async function AppHome() {
  const { user } = await withAuth();
  // Render the same landing for everyone. The auth ribbon at the top swaps
  // between "sign in to unlock X" and a personal strip based on session.
  return <Landing initialSignedIn={!!user} />;
}
