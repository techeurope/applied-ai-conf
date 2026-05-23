"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function TeamInviteAcceptPage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  const { inviteId } = use(params);
  const router = useRouter();
  const data = useQuery(api.partners.teamInviteForAccept, {
    inviteId: inviteId as Id<"partnerInvites">,
  });
  const accept = useMutation(api.partners.acceptTeamInvite);
  const decline = useMutation(api.partners.declineTeamInvite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }
  if (data === null) {
    return (
      <div className="space-y-3 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <p className="text-sm text-rose-200">Invite not found or expired.</p>
        <Link
          href="/app"
          className="inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          ‹ back to app
        </Link>
      </div>
    );
  }

  const { invite, team, emailMatches, myEmail, signedIn } = data;

  // Not signed in yet → invite them to sign up using the invited email.
  // Most invitees don't have an account; this is the common path.
  if (!signedIn) {
    const returnTo = encodeURIComponent(`/app/team/accept/${inviteId}`);
    return (
      <div className="space-y-5 pt-6 max-w-md">
        <header className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            // TEAM INVITE
          </p>
          <p className="text-sm text-white/60">You&apos;ve been invited to join</p>
          <h1 className="font-mono text-3xl font-bold tracking-tighter">
            {team.name}
          </h1>
          {team.tier && (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-200">
              {team.tier} partner team
            </p>
          )}
        </header>

        <div className="rounded-2xl ring-1 ring-emerald-300/40 bg-emerald-400/[0.06] p-5 space-y-3">
          <p className="text-sm text-white/85 leading-relaxed">
            Create your account (or sign in) to accept the invite. Use the
            email it was sent to:
          </p>
          <p className="font-mono text-base text-white">{invite.email}</p>
          <a
            href={`/api/auth/sign-in?return_to=${returnTo}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-mono text-sm hover:scale-[1.02] transition-transform"
          >
            <LogIn className="size-3.5" strokeWidth={2} />
            Sign in or sign up
          </a>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">
          If you sign up with a different email, the invite won&apos;t match —
          ask the team owner to send you a new one.
        </p>
      </div>
    );
  }

  // Already decided?
  if (invite.consumedAt) {
    return (
      <div className="space-y-4 pt-6 max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <h1 className="font-mono text-2xl font-bold">You&apos;re already on {team.name}.</h1>
        <Link
          href="/app/team"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-mono text-sm"
        >
          Go to team dashboard ›
        </Link>
      </div>
    );
  }
  if (invite.declinedAt) {
    return (
      <div className="space-y-4 pt-6 max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <h1 className="font-mono text-2xl font-bold">Invite was declined.</h1>
        <p className="text-sm text-white/60">
          If that wasn&apos;t you, ask the team owner to send you a fresh invite.
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
  if (!emailMatches) {
    return (
      <div className="space-y-3 pt-6 max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // TEAM INVITE
        </p>
        <h1 className="font-mono text-2xl font-bold tracking-tighter">
          Wrong email
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          This invite was sent to <span className="font-mono">{invite.email}</span>.
          You&apos;re signed in as <span className="font-mono">{myEmail ?? "—"}</span>.
        </p>
        <p className="text-xs text-white/50">
          Sign out and sign back in with the invited email, or ask the team
          owner to re-send the invite to your current email.
        </p>
      </div>
    );
  }

  async function handleAccept() {
    setBusy(true);
    setError(null);
    try {
      await accept({ inviteId: inviteId as Id<"partnerInvites"> });
      router.push("/app/team");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function handleDecline() {
    if (!confirm("Decline the invite? The owner can send a new one any time.")) return;
    setBusy(true);
    setError(null);
    try {
      await decline({ inviteId: inviteId as Id<"partnerInvites"> });
      router.push("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
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
        <h1 className="font-mono text-3xl font-bold tracking-tighter">{team.name}</h1>
        {team.tier && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-200">
            {team.tier} partner team
          </p>
        )}
      </header>

      <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-4 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Role
        </p>
        <p className="font-mono text-sm text-white">{invite.role}</p>
      </div>

      <p className="text-xs text-white/60 leading-relaxed">
        Accepting puts you on this partner team. Your scans during the
        conference will be shared with the team. You can leave the team later
        by asking an owner to remove you.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={busy}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-mono text-sm disabled:opacity-50"
        >
          {busy ? "…" : `Accept · join ${team.name}`}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={busy}
          className="inline-flex items-center justify-center px-5 py-3 rounded-full ring-1 ring-white/20 hover:ring-white/40 font-mono text-sm text-white/70 hover:text-white disabled:opacity-50"
        >
          Decline
        </button>
      </div>

      {error && <p className="text-xs text-rose-200 font-mono">{error}</p>}
    </div>
  );
}
