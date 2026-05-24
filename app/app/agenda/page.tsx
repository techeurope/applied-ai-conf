import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { AgendaList } from "../components/AgendaList";

// Server component: pre-fetch the agenda on the server so the HTML ships
// with the data baked in. No loading flash on first paint. The client-side
// usePreloadedQuery still subscribes for live updates — admin edits in
// /app/admin/agenda propagate to every open browser within ~100ms without
// any manual cache invalidation.
//
// Tells Next.js to revalidate the SSR cache every 60 seconds so a fresh
// admin edit shows up on cold loads quickly; warm clients update via the
// reactive subscription instantly regardless.
export const revalidate = 60;

export default async function AgendaPage() {
  const preloadedSlots = await preloadQuery(api.agenda.list, {});

  return (
    <div className="space-y-3 pt-1">
      <p className="text-xs text-zinc-400">
        May 28, 2026 · The Delta Campus, Berlin · all times CEST (UTC+2)
      </p>
      <AgendaList preloadedSlots={preloadedSlots} />
    </div>
  );
}
