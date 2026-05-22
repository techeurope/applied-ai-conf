"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function PartnerPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const profile = useQuery(api.partners.publicProfile, { slug });

  if (profile === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (profile === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/60">No verified partner with that slug.</p>
        <Link href="/app" className="font-mono text-xs underline">
          ← back to connect
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-3">
        {profile.logoUrl && (
          <div className="h-14 max-w-[200px] flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.logoUrl}
              alt={`${profile.name} logo`}
              className="h-full w-auto object-contain"
            />
          </div>
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          {profile.tier ? `${profile.tier} sponsor` : "Sponsor"}
        </p>
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-[1.1] pb-1 text-glow">
          {profile.name}
        </h1>
        {profile.booth && (
          <p className="text-sm text-white/60">Booth: {profile.booth}</p>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-mono text-xs underline underline-offset-2 text-white/70 hover:text-white"
          >
            {profile.website.replace(/^https?:\/\//, "")} ↗
          </a>
        )}
      </header>

      {profile.bio && (
        <section className="glass-card rounded-2xl p-5">
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </section>
      )}

      {profile.members.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-mono text-sm font-bold">Team at the booth</h2>
          <ul className="space-y-2">
            {profile.members.map((m) => (
              <li
                key={m.name + (m.publicToken ?? "")}
                className="glass-card rounded-xl px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm">{m.name}</div>
                    {m.role && <div className="text-xs text-white/60">{m.role}</div>}
                  </div>
                  {m.publicToken && (
                    <Link
                      href={`/app/u/${m.publicToken}`}
                      className="font-mono text-xs underline text-white/60"
                    >
                      profile →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
