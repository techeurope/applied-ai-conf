"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type Kind = "speaker" | "walkin" | "guest" | "staff";

export default function AdminCodesPage() {
  const codes = useQuery(api.admin.listClaimCodes, { includeRevoked: true, limit: 500 });
  const createCode = useMutation(api.admin.createClaimCode);
  const createBulk = useMutation(api.admin.createClaimCodesBulk);
  const revokeCode = useMutation(api.admin.revokeClaimCode);
  const emailCode = useAction(api.admin_email.emailClaimCode);
  const [emailing, setEmailing] = useState<Id<"claimCodes"> | null>(null);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkKind, setBulkKind] = useState<Kind>("speaker");
  const [bulkResults, setBulkResults] = useState<Array<{ email: string; code: string }>>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErr, setBulkErr] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [kind, setKind] = useState<Kind>("walkin");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await createCode({
        email: email.trim(),
        name: name.trim() || undefined,
        company: company.trim() || undefined,
        jobRole: jobRole.trim() || undefined,
        kind,
        note: note.trim() || undefined,
      });
      setJustCreated(res.code);
      setEmail("");
      setName("");
      setCompany("");
      setJobRole("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(codeId: Id<"claimCodes">) {
    setEmailing(codeId);
    setEmailMsg(null);
    try {
      const r = await emailCode({ codeId });
      setEmailMsg(`Code emailed to ${r.sentTo}`);
    } catch (e) {
      setEmailMsg(e instanceof Error ? e.message : "Failed to email");
    } finally {
      setEmailing(null);
    }
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault();
    setBulkBusy(true);
    setBulkErr(null);
    setBulkResults([]);
    try {
      // Parse CSV: each row = email[, name[, company[, jobRole[, note]]]]
      const entries = bulkCsv
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter((row) => row && !row.startsWith("#"))
        .map((row) => {
          const cols = row.split(",").map((c) => c.trim());
          return {
            email: cols[0],
            name: cols[1] || undefined,
            company: cols[2] || undefined,
            jobRole: cols[3] || undefined,
            note: cols[4] || undefined,
            kind: bulkKind,
          };
        })
        .filter((e) => e.email);
      if (entries.length === 0) throw new Error("No valid rows in CSV");
      const created = await createBulk({ entries });
      setBulkResults(created.map(({ email, code }) => ({ email, code })));
      setBulkCsv("");
    } catch (e) {
      setBulkErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleRevoke(codeId: Id<"claimCodes">) {
    if (!confirm("Revoke this code? Once revoked it can't be used.")) return;
    try {
      await revokeCode({ codeId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const codeTotals = codes
    ? {
        all: codes.length,
        unclaimed: codes.filter((c) => !c.claimedAt && !c.revokedAt).length,
        claimed: codes.filter((c) => c.claimedAt).length,
      }
    : null;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Codes total" value={codeTotals?.all ?? "—"} hint="Including revoked" />
        <Stat label="Unclaimed" value={codeTotals?.unclaimed ?? "—"} hint="Still usable" />
        <Stat label="Claimed" value={codeTotals?.claimed ?? "—"} hint="Redeemed by a user" />
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">Generate claim code</h2>
        <p className="text-xs text-white/60">
          Use this at the badge desk for speakers, walk-ins, and anyone without a Luma ticket.
          The attendee signs in with email, enters this code in Settings, and the desk record
          links to their account.
        </p>
        <form onSubmit={handleCreate} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Email" value={email} onChange={setEmail} required type="email" />
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Company" value={company} onChange={setCompany} />
            <Field label="Job role" value={jobRole} onChange={setJobRole} />
          </div>
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              Kind
            </span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm"
            >
              <option value="walkin">walk-in</option>
              <option value="speaker">speaker</option>
              <option value="guest">guest</option>
              <option value="staff">staff</option>
            </select>
          </label>
          <Field label="Note (optional)" value={note} onChange={setNote} />
          <div className="pt-2">
            <button
              type="submit"
              disabled={busy || !email}
              className="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-medium disabled:opacity-50"
            >
              {busy ? "Generating…" : "Generate code"}
            </button>
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </form>

        {justCreated && (
          <div className="rounded-xl bg-white/5 ring-1 ring-white/20 px-4 py-3 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              New code
            </div>
            <div className="font-mono text-3xl font-bold tracking-widest">{justCreated}</div>
            <p className="text-xs text-white/50">
              Share via email or read aloud at the desk. The attendee enters it under{" "}
              <span className="font-mono">/app/settings</span>.
            </p>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">Bulk import</h2>
        <p className="text-xs text-white/60">
          One row per attendee:{" "}
          <code className="font-mono text-white/70">email, name, company, role, note</code> (only
          email is required). Lines starting with <code>#</code> are ignored.
        </p>
        <form onSubmit={handleBulk} className="space-y-2">
          <textarea
            value={bulkCsv}
            onChange={(e) => setBulkCsv(e.target.value)}
            rows={5}
            placeholder={"# kind: speaker / walkin / guest / staff\nspeaker@x.com, Ana Speaker, Acme, CTO\nguest@y.com, Bob Guest"}
            className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-white/30"
          />
          <div className="flex items-center gap-2">
            <select
              value={bulkKind}
              onChange={(e) => setBulkKind(e.target.value as Kind)}
              className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm"
            >
              <option value="walkin">walk-in</option>
              <option value="speaker">speaker</option>
              <option value="guest">guest</option>
              <option value="staff">staff</option>
            </select>
            <button
              type="submit"
              disabled={bulkBusy || !bulkCsv.trim()}
              className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
            >
              {bulkBusy ? "Generating…" : "Generate all"}
            </button>
          </div>
          {bulkErr && <p className="text-xs text-red-300">{bulkErr}</p>}
        </form>
        {bulkResults.length > 0 && (
          <div className="rounded-xl bg-white/5 ring-1 ring-white/20 px-4 py-3 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
              Generated {bulkResults.length} codes
            </div>
            <ul className="space-y-0.5 font-mono text-xs">
              {bulkResults.map((r) => (
                <li key={r.email}>
                  <span className="text-white/50">{r.email}</span>{" "}
                  <span className="text-white font-bold">{r.code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm font-bold">All codes</h2>
        {emailMsg && (
          <p className="text-xs text-emerald-300">{emailMsg}</p>
        )}
        <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
          {codes?.map((c) => (
            <li key={c._id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-lg font-bold tracking-widest">{c.code}</div>
                <div className="text-xs text-white/50 truncate">
                  {c.pending?.email} · {c.pending?.kind} {c.pending?.name ? `· ${c.pending.name}` : ""}
                </div>
                <div className="font-mono text-[10px] text-white/30">
                  created {new Date(c.createdAt).toLocaleString()}
                  {c.claimedAt && ` · claimed ${new Date(c.claimedAt).toLocaleString()}`}
                  {c.revokedAt && ` · revoked ${new Date(c.revokedAt).toLocaleString()}`}
                  {c.expiresAt && !c.claimedAt && !c.revokedAt &&
                    ` · expires ${new Date(c.expiresAt).toLocaleString()}`}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {c.claimedAt && <Pill label="claimed" />}
                {c.revokedAt && <Pill label="revoked" tone="danger" />}
                {!c.claimedAt && !c.revokedAt && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEmail(c._id)}
                      disabled={emailing === c._id}
                      className="font-mono text-xs underline text-white/60 hover:text-white disabled:opacity-50"
                    >
                      {emailing === c._id ? "…" : "email"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(c._id)}
                      className="font-mono text-xs underline text-white/40 hover:text-red-300"
                    >
                      revoke
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
          {codes && codes.length === 0 && (
            <li className="px-4 py-6 text-sm text-white/50">No codes yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className="font-mono text-2xl font-bold text-white">{value}</div>
      {hint && <div className="text-[11px] text-white/40 mt-0.5">{hint}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
      />
    </label>
  );
}

function Pill({ label, tone }: { label: string; tone?: "danger" }) {
  const cls =
    tone === "danger" ? "bg-red-500/20 text-red-200" : "bg-white/10 text-white/70";
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ${cls}`}
    >
      {label}
    </span>
  );
}
