"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type Kind = "speaker" | "walkin" | "guest" | "staff";

export default function AdminCodesPage() {
  const codes = useQuery(api.admin.listClaimCodes, { includeRevoked: true, limit: 500 });
  const createCode = useMutation(api.admin.createClaimCode);
  const revokeCode = useMutation(api.admin.revokeClaimCode);

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

  async function handleRevoke(codeId: Id<"claimCodes">) {
    if (!confirm("Revoke this code? Once revoked it can't be used.")) return;
    try {
      await revokeCode({ codeId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
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
              <span className="font-mono">/connect/settings</span>.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm font-bold">All codes</h2>
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
                  <button
                    type="button"
                    onClick={() => handleRevoke(c._id)}
                    className="font-mono text-xs underline text-white/60 hover:text-white"
                  >
                    revoke
                  </button>
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
