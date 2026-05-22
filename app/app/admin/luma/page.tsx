"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AdminLumaPage() {
  const [search, setSearch] = useState("");
  const [includeUnapproved, setIncludeUnapproved] = useState(false);
  const stats = useQuery(api.luma.stats, {});
  const attendees = useQuery(api.luma.list, {
    search: search.trim() || undefined,
    limit: 500,
    includeUnapproved,
  });

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Approved" value={stats?.approved ?? "—"} />
        <Stat label="Invited" value={stats?.invited ?? "—"} />
        <Stat label="Pending" value={stats?.pending ?? "—"} />
        <Stat label="Waitlist" value={stats?.waitlist ?? "—"} />
        <Stat label="Declined" value={stats?.declined ?? "—"} />
        <Stat label="Checked-in" value={stats?.checkedIn ?? "—"} />
        <Stat label="Total cached" value={stats?.total ?? "—"} />
        <Stat
          label="Last sync"
          value={
            stats?.lastSynced
              ? new Date(stats.lastSynced).toLocaleString()
              : "—"
          }
        />
      </section>

      <p className="text-xs text-white/50">
        Cache of Luma attendees for the conference event. Re-sync from CLI:{" "}
        <code className="font-mono text-white/70">
          node scripts/sync-luma-attendees.mjs
        </code>{" "}
        (add <code>--prod</code> for production).
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, ticket type"
          className="flex-1 rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:ring-white/30"
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full ring-1 ring-white/10 text-xs font-mono text-white/70">
          <input
            type="checkbox"
            checked={includeUnapproved}
            onChange={(e) => setIncludeUnapproved(e.target.checked)}
          />
          Show non-approved
        </label>
      </div>

      <div className="text-xs font-mono text-white/40">
        {attendees ? `${attendees.length} shown` : "loading…"}
      </div>

      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {attendees?.map((a) => (
          <li key={a._id} className="px-4 py-3 space-y-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-sm">{a.name || "—"}</span>
              <span className="font-mono text-[10px] text-white/40">
                {a.approvalStatus}
                {a.checkedInAt ? " · checked in" : ""}
              </span>
            </div>
            <div className="text-xs text-white/60 truncate">{a.email}</div>
            <div className="font-mono text-[10px] text-white/30">
              {a.ticketType ?? "—"} · {new Date(a.registeredAt).toLocaleDateString()}{" "}
              · {a.lumaGuestId}
            </div>
          </li>
        ))}
        {attendees && attendees.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/50">No matches.</li>
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className="font-mono text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
