"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const STATUS_LIST = ["hot", "warm", "cold", "junk"] as const;
type LeadStatus = (typeof STATUS_LIST)[number];

const STATUS_STYLES: Record<LeadStatus, string> = {
  hot: "bg-rose-500/20 text-rose-200 ring-rose-500/30",
  warm: "bg-amber-500/20 text-amber-200 ring-amber-500/30",
  cold: "bg-sky-500/20 text-sky-200 ring-sky-500/30",
  junk: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
};

export default function TeamLeadsPage() {
  const team = useQuery(api.partners.myTeam);
  const leads = useQuery(api.partners.myTeamLeads);
  const updateNotes = useMutation(api.contacts.updateNotes);
  const updateLead = useMutation(api.contacts.updateLeadQualification);

  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [editingDesc, setEditingDesc] = useState<string | null>(null);
  const [draftDesc, setDraftDesc] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  if (team === undefined || leads === undefined) {
    return <p className="text-xs font-mono text-white/40">Loading…</p>;
  }
  if (team === null) {
    return <p className="text-sm text-white/60">No partner team.</p>;
  }

  const term = search.toLowerCase().trim();
  const visible = leads.filter(({ contact, lead }) => {
    if (!lead) return false;
    if (statusFilter !== "all" && contact.leadStatus !== statusFilter) return false;
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
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          {team.team.name} · {leads.length} leads
        </p>
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

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <FilterPill
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        >
          All
        </FilterPill>
        {STATUS_LIST.map((s) => (
          <FilterPill
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </FilterPill>
        ))}
      </div>

      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {visible.map(({ contact, lead, firstScan, scanners, commenters }) => {
          if (!lead) return null;
          const notesEditing = editingNotes === contact._id;
          const descEditing = editingDesc === contact._id;
          return (
            <li key={contact._id} className="px-4 py-3 space-y-2.5">
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

              {(firstScan || commenters.length > 0) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-white/40">
                  {firstScan && (
                    <span>
                      <span className="text-white/30">scanned by</span>{" "}
                      <span className="text-white/70">{firstScan.name}</span>
                      <span className="text-white/30">
                        {" "}
                        · {new Date(firstScan.ts).toLocaleDateString()}
                      </span>
                      {scanners.length > 1 && (
                        <span
                          className="text-white/30"
                          title={scanners.map((s) => s.name).join(", ")}
                        >
                          {" "}
                          +{scanners.length - 1} more
                        </span>
                      )}
                    </span>
                  )}
                  {commenters.length > 0 && (
                    <span>
                      <span className="text-white/30">notes by</span>{" "}
                      <span className="text-white/70">
                        {commenters.join(", ")}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {STATUS_LIST.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      updateLead({
                        contactId: contact._id,
                        leadStatus: contact.leadStatus === s ? "clear" : s,
                      })
                    }
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ring-1 transition-colors ${
                      contact.leadStatus === s
                        ? STATUS_STYLES[s]
                        : "ring-white/15 text-white/40 hover:text-white/80 hover:ring-white/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <FieldEditor
                label="Qualification"
                value={contact.leadDescription ?? ""}
                editing={descEditing}
                draft={draftDesc}
                onEdit={() => {
                  setEditingDesc(contact._id);
                  setDraftDesc(contact.leadDescription ?? "");
                }}
                onChange={setDraftDesc}
                onCancel={() => setEditingDesc(null)}
                onSave={async () => {
                  await updateLead({
                    contactId: contact._id,
                    leadDescription: draftDesc,
                  });
                  setEditingDesc(null);
                }}
                placeholder="Budget, decision-maker, follow-up timing…"
              />

              <FieldEditor
                label="Quick notes"
                value={contact.notes ?? ""}
                editing={notesEditing}
                draft={draftNotes}
                onEdit={() => {
                  setEditingNotes(contact._id);
                  setDraftNotes(contact.notes ?? "");
                }}
                onChange={setDraftNotes}
                onCancel={() => setEditingNotes(null)}
                onSave={async () => {
                  await updateNotes({ contactId: contact._id, notes: draftNotes });
                  setEditingNotes(null);
                }}
                placeholder="Where you met, what they care about…"
              />
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

      <Link href="/app/team" className="inline-block font-mono text-xs underline text-white/60">
        ← team dashboard
      </Link>
    </div>
  );
}

function FilterPill({
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
      onClick={onClick}
      className={`shrink-0 px-3 py-1 rounded-full ring-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "bg-white text-black ring-white"
          : "ring-white/15 text-white/60 hover:text-white hover:ring-white/30"
      }`}
    >
      {children}
    </button>
  );
}

function FieldEditor({
  label,
  value,
  editing,
  draft,
  onEdit,
  onChange,
  onCancel,
  onSave,
  placeholder,
}: {
  label: string;
  value: string;
  editing: boolean;
  draft: string;
  onEdit: () => void;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
        {label}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="w-full rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-2 text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              className="px-3 py-1 rounded-full bg-white text-black font-mono text-[11px]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 rounded-full ring-1 ring-white/20 font-mono text-[11px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={onEdit}
          className="text-xs text-white/70 cursor-pointer rounded-md bg-white/[0.02] ring-1 ring-white/5 px-2 py-1.5"
        >
          {value || <span className="text-white/30">{placeholder}</span>}
        </div>
      )}
    </div>
  );
}
