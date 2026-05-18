"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { SPEAKERS } from "@/data/speakers";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminSeedPage() {
  const seedSpeakers = useMutation(api.seed.seedSpeakers);
  const listSpeakers = useMutation(api.seed.listSpeakers);
  const me = useQuery(api.users.me);
  const [result, setResult] = useState<string | null>(null);
  const [seeded, setSeeded] = useState<Array<{ _id: string; name: string; company?: string }>>([]);
  const [busy, setBusy] = useState(false);

  async function handleSeed() {
    setBusy(true);
    setResult(null);
    try {
      const payload = SPEAKERS.map((s) => ({
        slug: slugify(s.name),
        name: s.name,
        title: s.title || undefined,
        company: s.company || undefined,
        linkedinUrl: s.linkedinUrl || undefined,
        bio: s.building || undefined,
        headline: s.talkTitle || undefined,
      }));
      const r = await seedSpeakers({ speakers: payload });
      setResult(`Inserted ${r.inserted}, skipped ${r.skipped} (already existed), total ${r.total}`);
      const list = await listSpeakers({});
      setSeeded(list.map((u) => ({ _id: u._id, name: u.name, company: u.company })));
    } catch (e) {
      setResult(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleList() {
    setBusy(true);
    try {
      const list = await listSpeakers({});
      setSeeded(list.map((u) => ({ _id: u._id, name: u.name, company: u.company })));
    } finally {
      setBusy(false);
    }
  }

  if (me === undefined) return <p className="font-mono text-xs text-white/40">Loading…</p>;

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Admin
        </h1>
        <p className="text-sm text-white/60">
          Seed speakers from <code className="font-mono text-white/80">app/data/speakers.ts</code> into Convex. Gated to {me?.email}.
        </p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSeed}
          disabled={busy}
          className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-medium ring-1 ring-white/30 disabled:opacity-50"
        >
          {busy ? "Working…" : `Seed ${SPEAKERS.length} speakers`}
        </button>
        <button
          type="button"
          onClick={handleList}
          disabled={busy}
          className="px-5 py-2.5 rounded-full border border-white/15 font-mono text-xs hover:border-white/30 transition-colors disabled:opacity-50"
        >
          Just list
        </button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-3 font-mono text-xs">{result}</div>
      )}

      {seeded.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-mono text-sm">Speakers in Convex ({seeded.length})</h2>
          <ul className="space-y-2">
            {seeded.map((s) => (
              <li key={s._id} className="glass-card rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm truncate">{s.name}</div>
                  {s.company && <div className="text-xs text-white/50 truncate">{s.company}</div>}
                </div>
                <Link
                  href={`/connect/qr/${s._id}`}
                  className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white shrink-0"
                >
                  QR ↗
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
