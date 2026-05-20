"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { AgendaSlot } from "@/types";

interface AgendaListProps {
  slots: AgendaSlot[];
  onlyFavorites?: boolean;
}

export function AgendaList({ slots, onlyFavorites }: AgendaListProps) {
  const favorites = useQuery(api.favorites.list);
  const addFavorite = useMutation(api.favorites.add);
  const removeFavorite = useMutation(api.favorites.remove);

  const favSet = new Set(favorites ?? []);
  const visible = onlyFavorites ? slots.filter((s) => favSet.has(s.id)) : slots;

  // Only sessions with a speaker are favoritable (breaks/logistics excluded).
  function canFavorite(slot: AgendaSlot) {
    return slot.format !== "break" && slot.format !== "logistics";
  }

  async function toggle(slot: AgendaSlot) {
    if (favSet.has(slot.id)) {
      await removeFavorite({ sessionSlug: slot.id });
    } else {
      await addFavorite({ sessionSlug: slot.id });
    }
  }

  if (onlyFavorites && favorites && favorites.length === 0) {
    return (
      <div className="space-y-3 pt-6">
        <p className="text-sm text-white/60">No favorites yet.</p>
        <Link href="/connect/agenda" className="font-mono text-xs underline text-white/70">
          Browse the full agenda →
        </Link>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {visible.map((slot) => {
        const fav = favSet.has(slot.id);
        const favoritable = canFavorite(slot);
        return (
          <li key={slot.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {slot.startTime}–{slot.endTime}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  {slot.stage}
                </span>
                {favoritable && (
                  <button
                    type="button"
                    onClick={() => toggle(slot)}
                    aria-label={fav ? "Remove from my agenda" : "Add to my agenda"}
                    className={`p-1 rounded-full transition-colors ${
                      fav
                        ? "text-rose-400 hover:text-rose-300"
                        : "text-white/30 hover:text-white/70"
                    }`}
                  >
                    <Heart
                      className="size-4"
                      strokeWidth={1.75}
                      fill={fav ? "currentColor" : "none"}
                    />
                  </button>
                )}
              </div>
            </div>
            <div className="font-mono text-sm text-foreground">{slot.title}</div>
            {slot.speakerName && (
              <div className="text-xs text-zinc-400 mt-1">{slot.speakerName}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
