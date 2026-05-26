"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ChevronDown, Check, Download } from "lucide-react";

type SortKey = "recent" | "name";
type StatusFilter = "all" | "unscored" | "hot" | "warm" | "cold" | "junk";

// Lightweight fuzzy match: substring first (cheap + most common case),
// then a subsequence check so "tipi" matches "Tim Pietrusky". Both
// sides are pre-lowercased by the caller.
function matchesFuzzy(query: string, target: string): boolean {
  if (!query) return true;
  if (!target) return false;
  if (target.includes(query)) return true;
  let qi = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) qi += 1;
  }
  return qi === query.length;
}

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
  // Lead-status filter is only meaningful for partner-team contacts.
  // Solo users (no team) get the same toggle but it's effectively a
  // no-op since their contacts never have a leadStatus set.
  const showStatusFilter = !!me?.teamId;
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filteredAndSorted = useMemo(() => {
    if (!contacts) return contacts;
    let copy = contacts.slice();
    if (statusFilter !== "all") {
      copy = copy.filter(({ contact }) => {
        if (statusFilter === "unscored") return !contact.leadStatus;
        return contact.leadStatus === statusFilter;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      copy = copy.filter(({ user }) => {
        const name = (user?.name ?? "").toLowerCase();
        const company = (user?.company ?? "").toLowerCase();
        return matchesFuzzy(q, name) || matchesFuzzy(q, company);
      });
    }
    if (sortKey === "name") {
      copy.sort((a, b) =>
        (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
      );
    } else {
      copy.sort((a, b) => b.contact.lastScanAt - a.contact.lastScanAt);
    }
    return copy;
  }, [contacts, sortKey, statusFilter, query]);

  function handleExportCsv() {
    if (!filteredAndSorted || filteredAndSorted.length === 0) return;
    const header = [
      "Name",
      "Role",
      "Company",
      "Email",
      "LinkedIn",
      "Lead status",
      "First scan",
      "Last scan",
    ];
    const rows = filteredAndSorted.map(({ contact, user }) => [
      user?.name ?? "",
      user?.role ?? "",
      user?.company ?? "",
      user?.email ?? "",
      user?.linkedinUrl ?? "",
      contact.leadStatus ?? "",
      new Date(contact.firstScanAt).toISOString(),
      new Date(contact.lastScanAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((cols) =>
        cols.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const filenameDate = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applied-ai-conf-contacts-${filenameDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Quick per-status counts so the filter pills can show how many
  // contacts each bucket holds.
  const counts = useMemo(() => {
    const base = { hot: 0, warm: 0, cold: 0, junk: 0, unscored: 0 };
    if (!contacts) return base;
    for (const { contact } of contacts) {
      if (!contact.leadStatus) base.unscored += 1;
      else if (contact.leadStatus in base) {
        base[contact.leadStatus as keyof typeof base] += 1;
      }
    }
    return base;
  }, [contacts]);

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
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
          {showStatusFilter && contacts && contacts.length > 0 && (
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              counts={counts}
              totalCount={contacts.length}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!filteredAndSorted || filteredAndSorted.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ring-1 ring-white/15 hover:ring-white/30 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="size-3" strokeWidth={2} />
          Export CSV
        </button>
      </div>

      {contacts && contacts.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or company…"
            className="flex-1 min-w-0 px-3.5 py-1.5 rounded-full bg-white/[0.03] ring-1 ring-white/10 focus:ring-white/30 focus:outline-none text-sm placeholder:text-white/30"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 whitespace-nowrap">
            {filteredAndSorted?.length ?? 0} of {contacts?.length ?? 0}
          </span>
        </div>
      )}

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

      {filteredAndSorted &&
        contacts &&
        contacts.length > 0 &&
        filteredAndSorted.length === 0 && (
          <p className="text-xs text-white/40 text-center py-6 font-mono">
            No contacts match this filter.
          </p>
        )}

      {filteredAndSorted && filteredAndSorted.length > 0 && (
        <ul className="space-y-2">
          {filteredAndSorted.map(({ contact, user }) => (
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

const STATUS_DOT: Record<LeadStatus, string> = {
  hot: "bg-rose-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
  junk: "bg-zinc-400",
};

function FilterDropdown({
  value,
  onChange,
  counts,
  totalCount,
}: {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: { hot: number; warm: number; cold: number; junk: number; unscored: number };
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: Array<{
    key: StatusFilter;
    label: string;
    count: number;
    dot?: string;
  }> = [
    { key: "all", label: "All", count: totalCount },
    { key: "hot", label: "Hot", count: counts.hot, dot: STATUS_DOT.hot },
    { key: "warm", label: "Warm", count: counts.warm, dot: STATUS_DOT.warm },
    { key: "cold", label: "Cold", count: counts.cold, dot: STATUS_DOT.cold },
    { key: "junk", label: "Junk", count: counts.junk, dot: STATUS_DOT.junk },
    { key: "unscored", label: "Unscored", count: counts.unscored },
  ];
  const current = items.find((i) => i.key === value) ?? items[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ring-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
          value === "all"
            ? "ring-white/15 text-white/60 hover:text-white hover:ring-white/30"
            : "ring-white/30 text-white"
        }`}
      >
        {current.dot && (
          <span className={`size-1.5 rounded-full ${current.dot}`} />
        )}
        {current.label}
        <ChevronDown
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 z-20 min-w-[180px] rounded-xl bg-zinc-900 ring-1 ring-white/10 shadow-xl py-1"
        >
          {items.map((item) => {
            const active = item.key === value;
            return (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(item.key);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.06]"
              >
                <span className="inline-flex items-center gap-2">
                  {item.dot ? (
                    <span className={`size-1.5 rounded-full ${item.dot}`} />
                  ) : (
                    <span className="size-1.5" />
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/85">
                    {item.label}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/40 tabular-nums">
                    {item.count}
                  </span>
                  {active ? (
                    <Check className="size-3 text-emerald-300" strokeWidth={2.5} />
                  ) : (
                    <span className="size-3" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
