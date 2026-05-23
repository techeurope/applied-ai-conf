"use client";

import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { RefreshCw } from "lucide-react";
import { api } from "@convex/_generated/api";

function relativeTime(ts: number | undefined, now: number): string {
  if (!ts) return "never";
  const diff = Math.max(0, now - ts);
  if (diff < 30_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function AdminLumaPage() {
  const [search, setSearch] = useState("");
  const [includeUnapproved, setIncludeUnapproved] = useState(false);
  const stats = useQuery(api.luma.stats, {});
  const attendees = useQuery(api.luma.list, {
    search: search.trim() || undefined,
    limit: 500,
    includeUnapproved,
  });
  const triggerSync = useAction(api.luma.adminTriggerSync);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Tick every 15s so the "Xm ago" label stays current.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  async function handleRefresh() {
    if (syncing) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await triggerSync({});
      setSyncMsg(
        `✓ Synced — ${result.upserted} attendee rows across ${result.pages} page${result.pages === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
      window.setTimeout(() => setSyncMsg(null), 6000);
    }
  }

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
          value={relativeTime(stats?.lastSynced, now)}
          subtitle={
            stats?.lastSynced
              ? new Date(stats.lastSynced).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : undefined
          }
          small
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
        >
          <RefreshCw
            className={`size-3.5 ${syncing ? "animate-spin" : ""}`}
            strokeWidth={2}
          />
          {syncing ? "Syncing…" : "Refresh now"}
        </button>
        <p className="text-xs text-white/50">
          Auto-sync runs every 5 min. This pulls fresh data from Luma
          immediately (one full paginated walk, ~3 requests for ~300 attendees).
        </p>
      </div>
      {syncMsg && (
        <p className="font-mono text-xs text-emerald-200">{syncMsg}</p>
      )}

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

function Stat({
  label,
  value,
  subtitle,
  small,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  small?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div
        className={`font-mono font-bold text-white tabular-nums ${
          small ? "text-base" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {subtitle && (
        <div className="font-mono text-[10px] tabular-nums text-white/40 mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
}
