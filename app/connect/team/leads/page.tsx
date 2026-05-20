"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function TeamLeadsPage() {
  const team = useQuery(api.partners.myTeam);
  const leads = useQuery(api.partners.myTeamLeads);
  const updateNotes = useMutation(api.contacts.updateNotes);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");

  if (team === undefined || leads === undefined) {
    return <p className="text-xs font-mono text-white/40">Loading…</p>;
  }
  if (team === null) {
    return <p className="text-sm text-white/60">No partner team.</p>;
  }

  const term = search.toLowerCase().trim();
  const visible = leads.filter(({ lead }) => {
    if (!lead) return false;
    if (!term) return true;
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.company ?? "").toLowerCase().includes(term) ||
      (lead.role ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            {team.team.name}
          </p>
          <h1 className="font-mono font-bold text-xl">Shared leads ({leads.length})</h1>
        </div>
        <a
          href={`/api/team/leads/export?teamId=${team.team._id}`}
          className="inline-flex items-center px-4 py-2 rounded-full ring-1 ring-white/20 font-mono text-xs"
        >
          Export CSV ↓
        </a>
      </header>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, email, company"
        className="w-full rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:ring-white/30"
      />

      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {visible.map(({ contact, lead }) => {
          if (!lead) return null;
          const isEditing = editing === contact._id;
          return (
            <li key={contact._id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm">{lead.name}</div>
                  <div className="text-xs text-white/60 truncate">
                    {[lead.role, lead.company].filter(Boolean).join(" · ")}
                  </div>
                  <div className="font-mono text-[10px] text-white/40 truncate">
                    {lead.email}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-white/30 shrink-0">
                  {new Date(contact.lastScanAt).toLocaleDateString()}
                </div>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateNotes({ contactId: contact._id, notes: draftNotes });
                        setEditing(null);
                      }}
                      className="px-3 py-1 rounded-full bg-white text-black font-mono text-[11px]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="px-3 py-1 rounded-full ring-1 ring-white/20 font-mono text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditing(contact._id);
                    setDraftNotes(contact.notes ?? "");
                  }}
                  className="text-xs text-white/70 cursor-pointer rounded-md bg-white/[0.02] ring-1 ring-white/5 px-2 py-1.5"
                >
                  {contact.notes || (
                    <span className="text-white/30">Click to add notes</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/50">
            {leads.length === 0
              ? "No scans yet. Team members capture leads by scanning attendee QR codes."
              : "No matches."}
          </li>
        )}
      </ul>

      <Link href="/connect/team" className="inline-block font-mono text-xs underline text-white/60">
        ← team dashboard
      </Link>
    </div>
  );
}
