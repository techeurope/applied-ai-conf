"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

type SortKey = "recent" | "name";

const LEAD_STATUSES = ["hot", "warm", "cold", "junk"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];
const LEAD_STYLES: Record<LeadStatus, string> = {
  hot: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
  warm: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
  cold: "bg-sky-500/20 text-sky-200 ring-sky-500/40",
  junk: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/40",
};

export default function ContactsPage() {
  const contacts = useQuery(api.contacts.list);
  const me = useQuery(api.users.me);
  const canScan = !!me && (me.accessLevel === "admin" || !!me.teamId);
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const sorted = useMemo(() => {
    if (!contacts) return contacts;
    const copy = contacts.slice();
    if (sortKey === "name") {
      copy.sort((a, b) =>
        (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
      );
    } else {
      copy.sort((a, b) => b.contact.lastScanAt - a.contact.lastScanAt);
    }
    return copy;
  }, [contacts, sortKey]);

  return (
    <div className="space-y-5 pt-1">
      <div className="flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Sort contacts"
          className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.02]"
        >
          <SortButton active={sortKey === "recent"} onClick={() => setSortKey("recent")}>
            Recent
          </SortButton>
          <SortButton active={sortKey === "name"} onClick={() => setSortKey("name")}>
            Name
          </SortButton>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          {contacts?.length ?? 0} {contacts?.length === 1 ? "person" : "people"}
        </span>
      </div>

      {contacts === undefined && (
        <p className="font-mono text-xs text-white/40">Loading…</p>
      )}

      {contacts && contacts.length === 0 && (
        <div className="rounded-2xl glass-card p-8 text-center">
          <p className="text-base text-white/80 mb-1">No contacts yet.</p>
          <p className="text-sm text-white/50 mb-6">
            {canScan
              ? "Scan someone's QR to add them."
              : "Open someone's QR with your phone camera and tap \"Add to my contacts\" on their profile."}
          </p>
          {canScan && (
            <Link
              href="/app/connect?mode=scanner"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-medium hover:scale-[1.02] transition-all ring-1 ring-white/30"
            >
              Open scanner
            </Link>
          )}
        </div>
      )}

      {sorted && sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map(({ contact, user }) => (
            <li key={contact._id}>
              <Link
                href={`/app/contacts/${contact._id}`}
                className="block glass-card rounded-2xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-white truncate">
                      {user?.name}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5 truncate">
                      {[user?.role, user?.company].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {contact.leadStatus && (
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 shrink-0 ${
                        LEAD_STYLES[contact.leadStatus as LeadStatus]
                      }`}
                    >
                      {contact.leadStatus}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
        active ? "bg-white text-black" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
