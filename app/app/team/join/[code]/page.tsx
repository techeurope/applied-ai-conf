"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";

export default function TeamJoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const normalized = code.toUpperCase();
  const router = useRouter();
  const lookup = useQuery(api.partners.lookupTeamInviteCode, { code: normalized });
  const me = useQuery(api.users.me);
  const myTeam = useQuery(api.partners.myTeam);
  const redeem = useMutation(api.partners.redeemTeamInviteCode);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lookup === undefined || me === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }

  if (!me) {
    return (
      <div className="space-y-4 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <p className="text-sm text-white/70">
          Sign in to join a partner team.
        </p>
        <a
          href={`/api/auth/sign-in?return_to=${encodeURIComponent(`/app/team/join/${normalized}`)}`}
          className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-white text-black font-mono text-sm"
        >
          Sign in to continue
        </a>
      </div>
    );
  }

  if (!lookup.valid) {
    return (
      <div className="space-y-3 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <p className="text-sm text-rose-200">
          {lookup.reason === "revoked"
            ? "This join code has been revoked."
            : "This join code isn't valid."}
        </p>
        <p className="text-xs text-white/50">
          Ask your team owner for a fresh code.
        </p>
        <Link
          href="/app"
          className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          ‹ back to app
        </Link>
      </div>
    );
  }

  const alreadyOnThisTeam = myTeam?.team?._id === lookup.teamId;
  const alreadyOnOtherTeam =
    myTeam?.team && myTeam.team._id !== lookup.teamId;

  async function handleJoin() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await redeem({ code: normalized });
      router.push("/app/team");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 pt-6 max-w-md">
      <header className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <p className="text-sm text-white/60">You&apos;ve been invited to join</p>
        <h1 className="font-mono text-3xl font-bold tracking-tighter">
          {lookup.teamName}
        </h1>
        {lookup.tier && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-200">
            {lookup.tier} sponsor
          </p>
        )}
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Code
        </p>
        <p className="font-mono text-2xl tracking-[0.18em] text-white">
          {normalized}
        </p>
      </div>

      {alreadyOnThisTeam ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/5 p-4 space-y-2">
          <p className="text-sm text-emerald-100">
            You&apos;re already on this team.
          </p>
          <Link
            href="/app/team"
            className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-200 hover:text-emerald-100"
          >
            Go to team dashboard ›
          </Link>
        </div>
      ) : alreadyOnOtherTeam ? (
        <div className="rounded-xl border border-amber-300/40 bg-amber-400/5 p-4 space-y-2">
          <p className="text-sm text-amber-100">
            You&apos;re currently on{" "}
            <span className="font-mono">{myTeam?.team.name}</span>. To switch
            teams, ask that team&apos;s owner to remove you first.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleJoin}
          disabled={busy}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-black font-mono text-sm disabled:opacity-50"
        >
          {busy ? "Joining…" : `Join ${lookup.teamName}`}
        </button>
      )}

      {error && (
        <p className="text-xs text-rose-200 font-mono">{error}</p>
      )}
    </div>
  );
}
