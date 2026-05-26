"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";

const LEAD_STATUSES = ["hot", "warm", "cold", "junk"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];
const LEAD_STYLES: Record<LeadStatus, string> = {
  hot: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
  warm: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
  cold: "bg-sky-500/20 text-sky-200 ring-sky-500/40",
  junk: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/40",
};

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contacts = useQuery(api.contacts.list);
  const updateNotes = useMutation(api.contacts.updateNotes);
  const addNote = useMutation(api.contacts.addNote);
  const updateLead = useMutation(api.contacts.updateLeadQualification);
  const noteThread = useQuery(api.contacts.notesForContact, {
    contactId: id as Id<"contacts">,
  });
  const scanners = useQuery(api.contacts.scannersForContact, {
    contactId: id as Id<"contacts">,
  });
  const entry = contacts?.find((c) => c.contact._id === id);

  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [postingNote, setPostingNote] = useState(false);
  const [leadBusy, setLeadBusy] = useState(false);

  useEffect(() => {
    if (entry?.contact) {
      setTags(entry.contact.tags ?? []);
    }
  }, [entry?.contact]);

  if (contacts === undefined) {
    return <p className="font-mono text-xs text-zinc-500">Loading…</p>;
  }

  if (!entry) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">Lead not found.</p>
        <Link href="/app/contacts" className="font-mono text-xs underline">
          ← Back to leads
        </Link>
      </div>
    );
  }

  const { user, contact } = entry;

  async function handleSaveTags() {
    setSaving(true);
    try {
      await updateNotes({ contactId: id as Id<"contacts">, tags });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pt-2">
      <Link href="/app/contacts" className="font-mono text-xs text-zinc-500 hover:text-zinc-300">
        ← Leads
      </Link>

      <header className="space-y-1">
        <h1 className="font-mono text-2xl tracking-tight">{user?.name}</h1>
        <p className="text-sm text-zinc-400">
          {[user?.role, user?.company].filter(Boolean).join(" · ")}
        </p>
        {user?.linkedinUrl && (
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-mono text-xs underline text-zinc-300 mt-1"
          >
            LinkedIn ↗
          </a>
        )}
      </header>

      {user?.bio && (
        <p className="text-sm text-zinc-300 leading-relaxed">{user.bio}</p>
      )}

      {scanners && scanners.length > 0 && (
        <section className="space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Scanned by
          </div>
          <ul className="space-y-0.5">
            {scanners.map((s, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2 text-sm text-white/80"
              >
                <span className="text-white">{s.isMe ? "You" : s.name}</span>
                <span className="font-mono text-[10px] text-white/40">
                  {new Date(s.ts).toLocaleString()}
                  {i === 0 && scanners.length > 1 ? " · first" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contact.ownerType === "team" && (
        <section className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Lead status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_STATUSES.map((s) => {
              const active = contact.leadStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={leadBusy}
                  onClick={async () => {
                    setLeadBusy(true);
                    try {
                      await updateLead({
                        contactId: id as Id<"contacts">,
                        leadStatus: active ? "clear" : s,
                      });
                    } finally {
                      setLeadBusy(false);
                    }
                  }}
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ring-1 transition-colors disabled:opacity-50 ${
                    active
                      ? LEAD_STYLES[s]
                      : "ring-white/15 text-white/50 hover:text-white hover:ring-white/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {contact.ownerType === "team" ? "Team notes" : "Notes thread"}
        </label>
        {noteThread === undefined ? (
          <p className="text-xs text-zinc-500 font-mono">Loading…</p>
        ) : noteThread.length === 0 ? (
          <p className="text-xs text-zinc-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {noteThread.map((n) => (
              <li
                key={n._id}
                className="rounded-md bg-white/[0.03] ring-1 ring-white/10 px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                    {n.authorIsMe ? "You" : n.authorName}
                  </span>
                  <span className="font-mono text-[10px] text-white/30">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-white/85 whitespace-pre-wrap">
                  {n.text}
                </p>
              </li>
            ))}
          </ul>
        )}
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const trimmed = newNote.trim();
            if (!trimmed) return;
            setPostingNote(true);
            try {
              await addNote({
                contactId: id as Id<"contacts">,
                text: trimmed,
              });
              setNewNote("");
            } finally {
              setPostingNote(false);
            }
          }}
        >
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            placeholder="Add a note…"
            className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30 resize-none"
          />
          <button
            type="submit"
            disabled={postingNote || !newNote.trim()}
            className="px-4 py-2 rounded-md bg-foreground text-background font-mono text-xs disabled:opacity-50"
          >
            {postingNote ? "Posting…" : "Add note"}
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Tags
        </label>
        <input
          type="text"
          value={tags.join(", ")}
          onChange={(e) => setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          placeholder="follow-up, infra, hiring"
          className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30"
        />
        <button
          type="button"
          onClick={handleSaveTags}
          disabled={saving}
          className="px-4 py-2 bg-foreground text-background font-mono text-xs rounded-md disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save tags"}
        </button>
      </section>

      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        First met {new Date(contact.firstScanAt).toLocaleString()}
      </p>
    </div>
  );
}
