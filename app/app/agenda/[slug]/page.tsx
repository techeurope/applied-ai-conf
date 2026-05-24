import { preloadQuery } from "convex/nextjs";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { api } from "@convex/_generated/api";
import { AgendaDetailClient } from "./AgendaDetailClient";

// Per-user dynamic — we preload both the agenda + the signed-in viewer's
// favorites so the "On your agenda" / "Add to my agenda" button is in the
// right state on first paint (no pop-in or layout shift).
export const dynamic = "force-dynamic";

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { accessToken } = await withAuth();
  const tokenOption = accessToken ? { token: accessToken } : undefined;

  const [preloadedSlots, preloadedFavorites] = await Promise.all([
    preloadQuery(api.agenda.list, {}),
    preloadQuery(api.favorites.list, {}, tokenOption),
  ]);

  return (
    <AgendaDetailClient
      slug={slug}
      preloadedSlots={preloadedSlots}
      preloadedFavorites={preloadedFavorites}
    />
  );
}
