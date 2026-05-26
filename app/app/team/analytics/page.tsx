"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const STATUS_COLOR: Record<string, string> = {
  hot: "bg-rose-400/80 text-rose-100 ring-rose-300/40",
  warm: "bg-amber-400/80 text-amber-100 ring-amber-300/40",
  cold: "bg-sky-400/70 text-sky-100 ring-sky-300/40",
  unset: "bg-white/10 text-white/60 ring-white/15",
};

export default function TeamAnalyticsPage() {
  const team = useQuery(api.partners.myTeam);
  const analytics = useQuery(api.partners.myTeamAnalytics);

  if (team === undefined || analytics === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }
  if (team === null || analytics === null) {
    return (
      <div className="space-y-2 pt-4">
        <p className="text-sm text-white/60">
          You&apos;re not part of a partner team.
        </p>
        <Link href="/app" className="font-mono text-xs underline">
          ‹ back to app
        </Link>
      </div>
    );
  }

  const peakHour = analytics.hourSeries.reduce(
    (best, h) => (h.count > best.count ? h : best),
    { hour: 0, count: 0 },
  );
  const maxCount = peakHour.count;
  const conversionRate = analytics.totalLeads
    ? Math.round((analytics.leadStatus.hot / analytics.totalLeads) * 100)
    : 0;
  const totalStatus =
    analytics.leadStatus.hot +
    analytics.leadStatus.warm +
    analytics.leadStatus.cold +
    analytics.leadStatus.unset;

  return (
    <div className="space-y-6 pt-1">
      <header className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // ANALYTICS · {team.team.name.toUpperCase()}
        </p>
        <h1 className="font-mono font-bold text-2xl tracking-tighter">
          Team performance
        </h1>
        <Link
          href="/app/team"
          className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          ‹ team dashboard
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Unique leads" value={analytics.totalLeads} />
        <Stat label="Total scans" value={analytics.totalScans} />
        <Stat
          label="Active scanners"
          value={`${analytics.activeScanners}/${analytics.memberCount}`}
          small
        />
        <Stat label="Hot rate" value={`${conversionRate}%`} small />
      </section>

      <section className="space-y-3">
        <Heading>// LEAD STATUS</Heading>
        {totalStatus === 0 ? (
          <p className="text-xs text-white/50 px-1">
            No leads yet. They&apos;ll show up here once team members start
            scanning attendees.
          </p>
        ) : (
          <>
            <div className="flex w-full h-3 rounded-full overflow-hidden ring-1 ring-white/10">
              {(["hot", "warm", "cold", "unset"] as const).map(
                (key) => {
                  const n = analytics.leadStatus[key];
                  if (n === 0) return null;
                  const w = (n / totalStatus) * 100;
                  const fill =
                    key === "hot"
                      ? "bg-rose-400"
                      : key === "warm"
                        ? "bg-amber-400"
                        : key === "cold"
                          ? "bg-sky-400"
                          : "bg-white/15";
                  return (
                    <div
                      key={key}
                      className={fill}
                      style={{ width: `${w}%` }}
                      title={`${key}: ${n}`}
                    />
                  );
                },
              )}
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["hot", "warm", "cold", "unset"] as const).map(
                (key) => (
                  <li
                    key={key}
                    className={`rounded-xl px-3 py-2 ring-1 ${STATUS_COLOR[key]}`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-80">
                      {key}
                    </p>
                    <p className="font-mono text-lg tabular-nums font-bold">
                      {analytics.leadStatus[key]}
                    </p>
                  </li>
                ),
              )}
            </ul>
          </>
        )}
      </section>

      <section className="space-y-3">
        <Heading>// SCANS BY HOUR · CEST</Heading>
        {analytics.totalScans === 0 ? (
          <p className="text-xs text-white/50 px-1">
            No scans recorded yet.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {analytics.hourSeries.map((h) => {
              const pct = maxCount ? (h.count / maxCount) * 100 : 0;
              const isPeak = h.count > 0 && h.count === peakHour.count;
              return (
                <div
                  key={h.hour}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                  title={`${String(h.hour).padStart(2, "0")}:00 — ${h.count} scan${h.count === 1 ? "" : "s"}`}
                >
                  <div
                    className={`w-full rounded-sm transition-all ${
                      isPeak ? "bg-emerald-400/90" : "bg-emerald-400/40"
                    }`}
                    style={{
                      height: `${Math.max(pct, h.count > 0 ? 4 : 0)}%`,
                    }}
                  />
                  <span
                    className={`font-mono text-[9px] tabular-nums ${
                      h.hour % 3 === 0 ? "text-white/40" : "text-transparent"
                    }`}
                  >
                    {String(h.hour).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {peakHour.count > 0 && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Peak · {String(peakHour.hour).padStart(2, "0")}:00 ·{" "}
            {peakHour.count} scans
          </p>
        )}
      </section>

      <section className="space-y-3">
        <Heading>// LEADERBOARD</Heading>
        {analytics.leaderboard.length === 0 ? (
          <p className="text-xs text-white/50 px-1">No team members yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {analytics.leaderboard.map((m, idx) => (
              <li
                key={m.userId}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] ring-1 ring-white/5"
              >
                <span className="font-mono text-[10px] tabular-nums text-white/40 w-5 text-right">
                  {idx + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{m.name}</p>
                  {m.role === "owner" && (
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-200/80">
                      owner
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold tabular-nums">
                    {m.uniqueLeads}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                    {m.totalScans} scan{m.totalScans === 1 ? "" : "s"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: number | string;
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
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
      {children}
    </p>
  );
}
