"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AdminPartnersPage() {
  const teams = useQuery(api.partners.listTeams, { includeUnverified: true });
  const createTeam = useMutation(api.partners.createTeam);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tier, setTier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createTeam({
        name: name.trim(),
        slug: slug.trim() || name.trim(),
        partnerTier: tier.trim() || undefined,
      });
      setName("");
      setSlug("");
      setTier("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">Create partner team</h2>
        <p className="text-xs text-white/60">
          Partners are admin-only. Once created, verify them after their sponsorship is
          paid, then invite team members by email.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sponsor name (Stripe)"
            required
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (stripe)"
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30 font-mono"
          />
          <input
            type="text"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            placeholder="tier (gold / silver / community)"
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="sm:col-span-3 px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50 justify-self-start"
          >
            {busy ? "Creating…" : "Create partner"}
          </button>
          {error && <p className="text-xs text-red-300 sm:col-span-3">{error}</p>}
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm font-bold">Partner teams</h2>
        <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
          {teams?.map((t) => (
            <li
              key={t._id}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5"
            >
              <Link
                href={`/app/admin/partners/${t._id}`}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm flex items-center gap-2">
                    <span>{t.name}</span>
                    {t.partnerVerifiedAt ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                        verified
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                        unverified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50">
                    /partner/{t.slug}
                    {t.partnerTier ? ` · ${t.partnerTier}` : ""}
                  </div>
                </div>
              </Link>
              <a
                href={`/api/team/leads/export?teamId=${t._id}&slug=${encodeURIComponent(t.slug)}`}
                className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full ring-1 ring-white/20 hover:ring-white/40 font-mono text-[11px]"
              >
                Export CSV ↓
              </a>
              <span className="font-mono text-[10px] text-white/30">→</span>
            </li>
          ))}
          {teams && teams.length === 0 && (
            <li className="px-4 py-6 text-sm text-white/50">No partner teams yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
