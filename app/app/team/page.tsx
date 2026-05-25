"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { BarChart3, Send, Ban } from "lucide-react";

export default function TeamDashboardPage() {
  const team = useQuery(api.partners.myTeam);
  const members = useQuery(api.partners.myTeamMembers);
  const leads = useQuery(api.partners.myTeamLeads);
  const pendingInvites = useQuery(api.partners.myTeamPendingInvites);
  const ownerInvite = useMutation(api.partners.ownerInviteMember);
  const setRole = useMutation(api.partners.setMemberRole);
  const resendInvite = useMutation(api.partners.resendTeamInvite);
  const [resendBusyId, setResendBusyId] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  if (team === undefined) return <p className="text-xs font-mono text-white/40">Loading…</p>;
  if (team === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/60">You're not part of a partner team.</p>
        <Link href="/app" className="font-mono text-xs underline">
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
        <Link
          href="/app/team/help"
          className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white pt-2"
        >
          How does this work? ›
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Leads" value={leadCount} />
        <Stat label="Members" value={memberCount} />
        <Stat label="Booth" value={team.team.partnerBoothLocation ?? "—"} small />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link
          href="/app/team/leads"
          className="glass-card rounded-2xl px-4 py-4 hover:bg-white/10 flex flex-col gap-1"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Shared leads →
          </span>
          <span className="text-sm">View and edit notes on every scan from your team.</span>
        </Link>
        <Link
          href="/app/team/analytics"
          className="glass-card rounded-2xl px-4 py-4 hover:bg-white/10 flex flex-col gap-1"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 inline-flex items-center gap-1.5">
            <BarChart3 className="size-3.5" strokeWidth={1.75} />
            Analytics →
          </span>
          <span className="text-sm">Scan timeline, lead status, and per-member leaderboard.</span>
        </Link>
        <Link
          href={`/app/partner/${team.team.slug}`}
          className="glass-card rounded-2xl px-4 py-4 hover:bg-white/10 flex flex-col gap-1"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Public profile →
          </span>
          <span className="text-sm">See how attendees see your booth page.</span>
        </Link>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">Team members ({memberCount})</h2>
        <ul className="divide-y divide-white/5">
          {members?.map(({ membership, user }) => {
            const canChangeRole = team.role === "owner";
            const nextRole = membership.role === "owner" ? "member" : "owner";
            return (
              <li key={membership._id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm">{user?.name ?? "Unknown"}</div>
                  <div className="text-xs text-white/50 truncate">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    {membership.role}
                  </span>
                  {canChangeRole && (
                    <button
                      type="button"
                      onClick={async () => {
                        setRoleErr(null);
                        try {
                          await setRole({
                            teamId: team.team._id,
                            userId: membership.userId,
                            role: nextRole,
                          });
                        } catch (e) {
                          setRoleErr(e instanceof Error ? e.message : "Failed");
                        }
                      }}
                      className="font-mono text-xs text-white/50 hover:text-white underline"
                    >
                      make {nextRole}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {roleErr && <li className="text-xs text-red-300">{roleErr}</li>}
        </ul>

        {team.role === "owner" ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setInviteBusy(true);
              setInviteMsg(null);
              try {
                await ownerInvite({
                  teamId: team.team._id,
                  email: inviteEmail,
                  role: "member",
                });
                setInviteMsg(`Invite emailed to ${inviteEmail}.`);
                setInviteEmail("");
              } catch (e) {
                setInviteMsg(e instanceof Error ? e.message : "Failed");
              } finally {
                setInviteBusy(false);
              }
            }}
            className="space-y-2 pt-3 border-t border-white/5"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              Invite a teammate
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@yourcompany.com"
                className="flex-1 rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
              />
              <button
                type="submit"
                disabled={inviteBusy || !inviteEmail.trim()}
                className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
              >
                {inviteBusy ? "…" : "Invite"}
              </button>
            </div>
            {inviteMsg && (
              <p className="text-xs text-white/60 font-mono">{inviteMsg}</p>
            )}
            <p className="text-[11px] text-white/40">
              They&apos;ll get an email with a link to accept the invite.
            </p>
          </form>
        ) : (
          <p className="text-xs text-white/40">
            Only the team owner can invite new members. Ask them, or contact the conference admin.
          </p>
        )}

        {pendingInvites && pendingInvites.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-white/5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              // PENDING INVITES · {pendingInvites.length}
            </h3>
            <ul className="space-y-1.5">
              {pendingInvites.map((inv) => {
                const declined = !!inv.declinedAt;
                const ts = inv.lastEmailedAt ?? inv.invitedAt;
                return (
                  <li
                    key={inv._id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-white/5 bg-white/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{inv.email}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        {declined ? (
                          <span className="text-rose-200/80 inline-flex items-center gap-1">
                            <Ban className="size-3" strokeWidth={2} />
                            declined
                          </span>
                        ) : (
                          <span className="text-white/40">
                            invited · {relativeTime(ts)}
                          </span>
                        )}
                      </div>
                    </div>
                    {team.role === "owner" && (
                      <button
                        type="button"
                        disabled={resendBusyId === inv._id}
                        onClick={async () => {
                          setResendBusyId(inv._id);
                          try {
                            await resendInvite({ inviteId: inv._id });
                          } finally {
                            setResendBusyId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white px-2.5 py-1 rounded-full ring-1 ring-white/10 hover:ring-white/30 disabled:opacity-50"
                      >
                        <Send className="size-3" strokeWidth={1.75} />
                        {resendBusyId === inv._id
                          ? "…"
                          : declined
                            ? "Send again"
                            : "Resend"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
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
