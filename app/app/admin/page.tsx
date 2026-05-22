"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AdminOverviewPage() {
  const users = useQuery(api.admin.listUsers, { limit: 500 });
  const codes = useQuery(api.admin.listClaimCodes, { includeRevoked: false, limit: 500 });

  const totals = users
    ? {
        all: users.length,
        speakers: users.filter((u) => u.isSpeaker).length,
        admins: users.filter((u) => u.accessLevel === "admin").length,
        deactivated: users.filter((u) => u.deactivatedAt).length,
      }
    : null;
  const codeTotals = codes
    ? {
        all: codes.length,
        unclaimed: codes.filter((c) => !c.claimedAt).length,
        claimed: codes.filter((c) => c.claimedAt).length,
      }
    : null;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Attendees" value={totals?.all ?? "—"} />
        <Stat label="Speakers" value={totals?.speakers ?? "—"} />
        <Stat label="Admins" value={totals?.admins ?? "—"} />
        <Stat label="Deactivated" value={totals?.deactivated ?? "—"} />
      </section>
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Codes total" value={codeTotals?.all ?? "—"} />
        <Stat label="Unclaimed" value={codeTotals?.unclaimed ?? "—"} />
        <Stat label="Claimed" value={codeTotals?.claimed ?? "—"} />
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-mono text-sm font-bold">What you can do here</h2>
        <ul className="text-sm text-white/70 space-y-1.5 list-disc pl-5">
          <li>Search attendees, edit their profile, reset onboarding.</li>
          <li>Generate a claim code for a walk-in or speaker at the badge desk.</li>
          <li>Kick someone out: soft-deactivates them and revokes every active WorkOS session.</li>
          <li>Audit feed of every admin action.</li>
        </ul>
        <div className="pt-2 flex flex-wrap gap-2">
          <Link
            href="/app/admin/attendees"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black font-mono text-xs font-medium"
          >
            Attendees →
          </Link>
          <Link
            href="/app/admin/codes"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full ring-1 ring-white/20 font-mono text-xs"
          >
            New claim code
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className="font-mono text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
