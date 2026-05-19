"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AdminAttendeesPage() {
  const [search, setSearch] = useState("");
  const [onlyDeactivated, setOnlyDeactivated] = useState(false);
  const users = useQuery(api.admin.listUsers, {
    search: search.trim() || undefined,
    onlyDeactivated,
    limit: 500,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, company, role"
          className="flex-1 rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:ring-white/30"
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full ring-1 ring-white/10 text-xs font-mono text-white/70">
          <input
            type="checkbox"
            checked={onlyDeactivated}
            onChange={(e) => setOnlyDeactivated(e.target.checked)}
          />
          Only deactivated
        </label>
      </div>

      <div className="text-xs font-mono text-white/40">
        {users ? `${users.length} attendees` : "loading…"}
      </div>

      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {users?.map((u) => (
          <li key={u._id}>
            <Link
              href={`/connect/admin/attendees/${u._id}`}
              className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-white/5"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm text-white flex items-center gap-2">
                  <span className="truncate">{u.name || "Unnamed"}</span>
                  {u.accessLevel === "admin" && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                      admin
                    </span>
                  )}
                  {u.isSpeaker && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                      speaker
                    </span>
                  )}
                  {u.deactivatedAt && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-200">
                      deactivated
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 truncate">
                  {[u.role, u.company].filter(Boolean).join(" · ")}
                </div>
                <div className="font-mono text-[10px] text-white/30 truncate">{u.email}</div>
              </div>
              <span className="font-mono text-[10px] text-white/30">→</span>
            </Link>
          </li>
        ))}
        {users && users.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/50">No attendees match.</li>
        )}
      </ul>
    </div>
  );
}
