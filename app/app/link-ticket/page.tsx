"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function LinkTicketPage() {
  const router = useRouter();
  const me = useQuery(api.users.me);
  const status = useQuery(api.ticket.status);
  const requestEmailCode = useAction(api.ticket.requestEmailCode);
  const verifyEmailCode = useMutation(api.ticket.verifyEmailCode);
  const redeemClaim = useMutation(api.claim.redeem);

  const [step, setStep] = useState<"start" | "code" | "claim">("start");
  const [lumaEmail, setLumaEmail] = useState("");
  const [code, setCode] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (me === undefined || status === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (status?.linked) {
    return (
      <div className="space-y-4 pt-6">
        <h1 className="font-mono font-bold text-2xl">You're verified ✓</h1>
        <p className="text-sm text-white/70">
          Linked via <span className="font-mono">{status.method}</span>
          {status.lumaEmail && (
            <>
              {" "}as <span className="font-mono">{status.lumaEmail}</span>
            </>
          )}
          .
        </p>
        <Link
          href="/app"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-black font-mono text-sm"
        >
          Go to /app →
        </Link>
      </div>
    );
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await requestEmailCode({ lumaEmail });
      if (res.status === "auto_linked") {
        router.push("/app");
        return;
      }
      if (res.status === "not_found") {
        setError(
          "We can't find that email on the Luma guest list. Try the email you used on Luma, or visit the help desk to verify in person.",
        );
        return;
      }
      setStep("code");
      setInfo(`Code sent to ${res.sentTo}. It expires in 15 minutes.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode({ lumaEmail, code });
      router.push("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await redeemClaim({ code: claimCode });
      router.push("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 pt-6 sm:pt-12">
      <header className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Verify your ticket
        </p>
        <h1 className="font-mono font-bold text-3xl sm:text-5xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Connect your ticket
        </h1>
        <p className="text-sm text-white/70 leading-relaxed max-w-prose">
          Confirm you're on the guest list so you can use the platform during
          the conference. We'll send a 6-digit code to your Luma email if it
          differs from your sign-in email.
        </p>
        {me?.email && (
          <p className="text-xs text-white/40 font-mono">
            Signed in as {me.email}
          </p>
        )}
      </header>

      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-xl bg-white/5 ring-1 ring-white/20 px-4 py-3 text-sm text-white/80">
          {info}
        </div>
      )}

      {step === "start" && (
        <form onSubmit={handleRequest} className="space-y-3">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
              The email you used on Luma
            </span>
            <input
              type="email"
              required
              value={lumaEmail}
              onChange={(e) => setLumaEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !lumaEmail.trim()}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium ring-1 ring-white/30 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
              6-digit code
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-2xl tracking-[0.4em] text-center font-mono placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium ring-1 ring-white/30 disabled:opacity-50"
            >
              {busy ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("start");
                setCode("");
                setInfo(null);
              }}
              className="px-4 py-2 rounded-full ring-1 ring-white/20 font-mono text-xs"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <section className="space-y-2 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => setStep(step === "claim" ? "start" : "claim")}
          className="font-mono text-xs underline text-white/60 hover:text-white"
        >
          {step === "claim" ? "Back to ticket verification" : "Got a desk claim code instead?"}
        </button>
        {step === "claim" && (
          <form onSubmit={handleClaim} className="space-y-3 pt-2">
            <p className="text-xs text-white/50">
              Speakers, walk-ins, and partners: enter the XXXX-XXXX code from
              the conference team.
            </p>
            <input
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-mono uppercase tracking-widest placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={busy || !claimCode.trim()}
              className="inline-flex items-center px-5 py-2.5 rounded-full ring-1 ring-white/30 font-mono text-xs disabled:opacity-50"
            >
              {busy ? "…" : "Redeem code"}
            </button>
          </form>
        )}
      </section>

      <p className="text-xs text-white/40">
        Can&apos;t verify? Visit the help desk at the conference and we&apos;ll sort it
        out.
      </p>
    </div>
  );
}
