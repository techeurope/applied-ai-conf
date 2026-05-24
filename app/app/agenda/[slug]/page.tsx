import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { AgendaDetailClient } from "./AgendaDetailClient";

// Same SSR-preload pattern as /app/agenda — server hydrates with the
// agenda data so the detail card paints immediately. revalidate=60 keeps
// the SSR cache fresh; signed-in clients see live updates via the
// reactive subscription regardless.
export const revalidate = 60;

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preloadedSlots = await preloadQuery(api.agenda.list, {});
  return <AgendaDetailClient slug={slug} preloadedSlots={preloadedSlots} />;
}
