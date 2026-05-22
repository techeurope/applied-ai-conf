"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { AgendaSlot } from "@/types";
import { getConferenceClock, isLive } from "@/lib/conference-time";

type StageFilter = "all" | "main" | "side";

interface AgendaListProps {
  slots: AgendaSlot[];
}

const STAGE_STYLES: Record<string, string> = {
  main: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  side: "bg-violet-400/15 text-violet-200 ring-violet-300/30",
};

export function AgendaList({ slots }: AgendaListProps) {
  const favorites = useQuery(api.favorites.list);
  const addFavorite = useMutation(api.favorites.add);
  const removeFavorite = useMutation(api.favorites.remove);

  const [stage, setStage] = useState<StageFilter>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 30s so the LIVE indicator stays accurate.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const clock = getConferenceClock();

  const favSet = useMemo(() => new Set(favorites ?? []), [favorites]);

  const canFavorite = (slot: AgendaSlot) =>
    slot.format !== "break" && slot.format !== "logistics";

  const visible = useMemo(() => {
    return slots.filter((s) => {
      if (stage !== "all" && s.stage !== stage) return false;
      if (onlyFavorites && !favSet.has(s.id)) return false;
      return true;
    });
  }, [slots, stage, onlyFavorites, favSet]);

  const favoritesCount = useMemo(
    () => slots.filter((s) => canFavorite(s) && favSet.has(s.id)).length,
    [slots, favSet],
  );

  async function toggle(slot: AgendaSlot) {
    if (favSet.has(slot.id)) {
      await removeFavorite({ sessionSlug: slot.id });
    } else {
      await addFavorite({ sessionSlug: slot.id });
    }
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-[88px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/85 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <FilterPill active={stage === "all"} onClick={() => setStage("all")}>
            All stages
          </FilterPill>
          <FilterPill active={stage === "main"} onClick={() => setStage("main")}>
            Main
          </FilterPill>
          <FilterPill active={stage === "side"} onClick={() => setStage("side")}>
            Side
          </FilterPill>
          <span className="mx-1 h-5 w-px bg-white/10 shrink-0" aria-hidden />
          <FilterPill
            active={onlyFavorites}
            onClick={() => setOnlyFavorites((v) => !v)}
            icon
          >
            <Heart
              className="size-3.5"
              strokeWidth={1.75}
              fill={onlyFavorites ? "currentColor" : "none"}
            />
            Favorites{favoritesCount ? ` (${favoritesCount})` : ""}
          </FilterPill>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-white/60 px-1 pt-4">
          {onlyFavorites && favoritesCount === 0
            ? "No favorites yet. Tap the heart on a session to add it."
            : "No sessions match the current filter."}
        </p>
      ) : (
        <ol className="space-y-3">
          {visible.map((slot) => {
            const fav = favSet.has(slot.id);
            const favoritable = canFavorite(slot);
            const stageClass = STAGE_STYLES[slot.stage] ?? "bg-white/10 text-white/60 ring-white/15";
            const live = clock.isConferenceDay && isLive(slot, clock.nowMinutes) && favoritable;
            return (
              <li
                key={slot.id}
                className={`glass-card rounded-xl p-4 ${live ? "ring-2 ring-rose-400/60" : ""}`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                      {slot.startTime}–{slot.endTime}
                    </span>
                    {live && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/30">
                        <span className="size-1.5 rounded-full bg-rose-300 animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 ${stageClass}`}
                    >
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
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] ring-1 transition-colors ${
        active
          ? "bg-white text-black ring-white"
          : "text-white/60 ring-white/15 hover:text-white hover:ring-white/30"
      } ${icon ? "" : ""}`}
    >
      {children}
    </button>
  );
}
