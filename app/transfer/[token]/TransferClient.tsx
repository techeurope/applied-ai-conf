"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function TransferClient({
  token,
  initialAction,
}: {
  token: string;
  initialAction: "approve" | "decline" | null;
}) {
  const details = useQuery(api.ticket.transferDetails, { token });
  const approve = useMutation(api.ticket.approveTransfer);
  const decline = useMutation(api.ticket.declineTransfer);
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"approved" | "declined" | null>(null);

  async function handleApprove() {
    setBusy("approve");
    setError(null);
    try {
      await approve({ token });
      setResult("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleDecline() {
    setBusy("decline");
    setError(null);
    try {
      await decline({ token });
      setResult("declined");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  if (details === undefined) {
    return (
      <Shell>
        <p className="text-sm text-zinc-400 animate-pulse">Loading…</p>
      </Shell>
    );
  }

  if (details === null) {
    return (
      <Shell>
        <h1 className="font-mono text-xl font-bold mb-2">Request not found</h1>
        <p className="text-sm text-zinc-400">
          This link is invalid or has been deleted. If you didn&apos;t expect
          this email, you can safely ignore it.
        </p>
      </Shell>
    );
  }

  const status = result ?? details.status;

  if (status === "approved") {
    return (
      <Shell>
        <h1 className="font-mono text-xl font-bold mb-2">Transfer approved</h1>
        <p className="text-sm text-zinc-400">
          The ticket has moved from <Mono>{details.fromEmail}</Mono> to{" "}
          <Mono>{details.toEmail}</Mono>. Any unredeemed vouchers moved with it.
        </p>
      </Shell>
    );
  }

  if (status === "declined") {
    return (
      <Shell>
        <h1 className="font-mono text-xl font-bold mb-2">Transfer declined</h1>
        <p className="text-sm text-zinc-400">
          The ticket stays on <Mono>{details.fromEmail}</Mono>. The requester
          will see that the request was denied.
        </p>
      </Shell>
    );
  }

  if (status === "expired") {
    return (
      <Shell>
        <h1 className="font-mono text-xl font-bold mb-2">Request expired</h1>
        <p className="text-sm text-zinc-400">
          This transfer request has expired. If the move is still wanted, the
          requester can start a new one from the verify-ticket flow.
        </p>
      </Shell>
    );
  }

  if (status === "superseded") {
    return (
      <Shell>
        <h1 className="font-mono text-xl font-bold mb-2">Replaced by a newer request</h1>
        <p className="text-sm text-zinc-400">
          A more recent transfer request for the same ticket has taken its
          place. Check your inbox for the latest email.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-mono text-xl font-bold mb-3">Approve ticket transfer?</h1>
      <p className="text-sm text-zinc-300 leading-relaxed mb-2">
        Someone signed in as <Mono>{details.toEmail}</Mono> is trying to move
        your Applied AI Conf ticket
        {details.ticketType ? ` (${details.ticketType})` : ""} away from{" "}
        <Mono>{details.fromEmail}</Mono> to their account.
      </p>
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        If that&apos;s you (e.g. switching to a different email), approve. If
        you don&apos;t recognise this request, decline — your ticket stays put.
        Any unredeemed vouchers move with the ticket.
      </p>
      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-sm text-red-100 mb-4">
          {error}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleApprove}
          disabled={busy !== null}
          autoFocus={initialAction === "approve"}
          className="px-5 py-3 rounded-full bg-white text-black font-mono text-sm font-medium disabled:opacity-50"
        >
          {busy === "approve" ? "Approving…" : "Approve transfer"}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={busy !== null}
          autoFocus={initialAction === "decline"}
          className="px-5 py-3 rounded-full bg-white/10 ring-1 ring-white/20 text-white font-mono text-sm font-medium disabled:opacity-50"
        >
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
      <p className="text-xs text-zinc-500 font-mono mt-6">
        Expires {new Date(details.expiresAt).toLocaleString()}
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#05070f] text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-8">
        {children}
      </div>
    </main>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-white">{children}</span>;
}
