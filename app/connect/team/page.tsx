"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function TeamDashboardPage() {
  const team = useQuery(api.partners.myTeam);
  const members = useQuery(api.partners.myTeamMembers);
  const leads = useQuery(api.partners.myTeamLeads);

  if (team === undefined) return <p className="text-xs font-mono text-white/40">Loading…</p>;
  if (team === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/60">You're not part of a partner team.</p>
        <Link href="/connect" className="font-mono text-xs underline">
          ← back to connect
        </Link>
      </div>
    );
  }

  const verified = !!team.team.partnerVerifiedAt;
  const leadCount = leads?.length ?? 0;
  const memberCount = members?.length ?? 0;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Partner team
        </p>
        <h1 className="font-mono font-bold text-2xl tracking-tighter">
          {team.team.name}
        </h1>
        <p className="text-xs text-white/60">
          {team.team.partnerTier ? `${team.team.partnerTier} sponsor · ` : ""}
          {team.team.partnerBoothLocation ?? "no booth set"}
        </p>
        {!verified && (
          <p className="text-xs text-amber-200 mt-2">
            Awaiting verification. Lead capture works, but team features unlock once admin verifies.
          </p>
        )}
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Leads" value={leadCount} />
        <Stat label="Members" value={memberCount} />
        <Stat label="Booth" value={team.team.partnerBoothLocation ?? "—"} small />
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Link
          href="/connect/team/leads"
          className="glass-card rounded-2xl px-4 py-4 hover:bg-white/10 flex flex-col gap-1"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Shared leads →
          </span>
          <span className="text-sm">View and edit notes on every scan from your team.</span>
        </Link>
        <Link
          href={`/connect/partner/${team.team.slug}`}
          className="glass-card rounded-2xl px-4 py-4 hover:bg-white/10 flex flex-col gap-1"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Public profile →
          </span>
          <span className="text-sm">See how attendees see your booth page.</span>
        </Link>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">Team members</h2>
        <ul className="divide-y divide-white/5">
          {members?.map(({ membership, user }) => (
            <li key={membership._id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm">{user?.name ?? "Unknown"}</div>
                <div className="text-xs text-white/50 truncate">{user?.email}</div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                {membership.role}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/40">
          Invites are managed by the conference admin. Ask them to add a teammate by email.
        </p>
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
      <div className={`font-mono font-bold text-white ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </div>
    </div>
  );
}
