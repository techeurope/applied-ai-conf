"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function DirectoryPage() {
  const directory = useQuery(api.users.directoryList, {});
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!directory) return [];
    const q = search.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter((u) =>
      [u.name, u.role, u.company].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [directory, search]);

  return (
    <div className="space-y-4 pt-2">
      <header className="space-y-1">
        <h1 className="font-mono text-xl tracking-tight">Directory</h1>
        <p className="text-sm text-zinc-400">Everyone who&apos;s here and opted into the directory.</p>
      </header>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, role, company"
        className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30"
      />

      {directory === undefined && (
        <p className="font-mono text-xs text-zinc-500">Loading…</p>
      )}

      {directory && filtered.length === 0 && (
        <p className="font-mono text-xs text-zinc-500">No matches.</p>
      )}

      <ul className="space-y-2">
        {filtered.map((u) => (
          <li key={u._id}>
            <Link
              href={`/connect/u/${u._id}`}
              className="block glass-card rounded-xl p-4 hover:border-white/20 transition-colors"
            >
              <div className="font-mono text-sm text-foreground">{u.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {[u.role, u.company].filter(Boolean).join(" · ")}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
