import { preloadQuery } from "convex/nextjs";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { api } from "@convex/_generated/api";
import { AgendaList } from "../components/AgendaList";

// Server component: pre-fetch the agenda + the signed-in user's favorites
// + their `me` row so the HTML ships with everything baked in. No loading
// flash, no layout shift when hearts populate after the data arrives.
//
// Per-user data means we can't share an SSR cache across visitors — but
// each render is one Convex round-trip in parallel, fast enough that we
// don't need the cache.
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { accessToken } = await withAuth();
  const tokenOption = accessToken ? { token: accessToken } : undefined;

  const [preloadedSlots, preloadedFavorites] = await Promise.all([
    preloadQuery(api.agenda.list, {}),
    preloadQuery(api.favorites.list, {}, tokenOption),
  ]);

  return (
    <div className="space-y-3 pt-1">
      <p className="text-xs text-zinc-400">
        May 28, 2026 · The Delta Campus, Berlin · all times CEST (UTC+2)
      </p>
      <AgendaList
        preloadedSlots={preloadedSlots}
        preloadedFavorites={preloadedFavorites}
      />
    </div>
  );
}
