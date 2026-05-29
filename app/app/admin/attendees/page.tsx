"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvex, useQuery } from "convex/react";
import { Download } from "lucide-react";
import { api } from "@convex/_generated/api";

export default function AdminAttendeesPage() {
  const [search, setSearch] = useState("");
  const [onlyDeactivated, setOnlyDeactivated] = useState(false);
  const users = useQuery(api.admin.listUsers, {
    search: search.trim() || undefined,
    onlyDeactivated,
    limit: 500,
  });
  const convex = useConvex();
  const [exporting, setExporting] = useState(false);

  async function handleExportAttendees() {
    setExporting(true);
    try {
      const rows = await convex.query(api.admin.exportAttendees, {});
      if (rows.length === 0) return;
      // Column order is fixed by the keys of the first row — the Convex
      // query returns a stable shape, so spreadsheet diffs across exports
      // line up cleanly.
      const cols = Object.keys(rows[0]) as (keyof (typeof rows)[number])[];
      const escape = (v: unknown) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
      };
      const csv = [cols.join(",")]
        .concat(rows.map((r) => cols.map((c) => escape(r[c])).join(",")))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
      a.href = url;
      a.download = `applied-ai-conf-attendees-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, company, role"
          className="flex-1 rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:ring-white/30"
        />
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full ring-1 ring-white/10 text-xs font-mono text-white/70">
          <input
            type="checkbox"
            checked={onlyDeactivated}
            onChange={(e) => setOnlyDeactivated(e.target.checked)}
          />
          Only deactivated
        </label>
        <button
          type="button"
          onClick={handleExportAttendees}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full ring-1 ring-white/20 hover:ring-white/30 font-mono text-xs disabled:opacity-50"
          title="Download every attendee with status, ticket, voucher, and activity counts"
        >
          <Download className="size-3" strokeWidth={2} />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <div className="text-xs font-mono text-white/40">
        {users ? `${users.length} attendees` : "loading…"}
      </div>

      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {users?.map((u) => (
          <li key={u._id}>
            <Link
              href={`/app/admin/attendees/${u._id}`}
              className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-white/5"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm text-white flex items-center gap-2">
                  <span className="truncate">{u.name || "Unnamed"}</span>
                  {u.accessLevel === "admin" && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                      admin
                    </span>
                  )}
                  {u.isSpeaker && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                      speaker
                    </span>
                  )}
                  {u.deactivatedAt && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-200">
                      deactivated
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 truncate">
                  {[u.role, u.company].filter(Boolean).join(" · ")}
                </div>
                <div className="font-mono text-[10px] text-white/30 truncate">{u.email}</div>
              </div>
              <span className="font-mono text-[10px] text-white/30">→</span>
            </Link>
          </li>
        ))}
        {users && users.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/50">No attendees match.</li>
        )}
      </ul>
    </div>
  );
}
