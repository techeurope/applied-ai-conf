"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contacts = useQuery(api.contacts.list);
  const updateNotes = useMutation(api.contacts.updateNotes);
  const entry = contacts?.find((c) => c.contact._id === id);

  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry?.contact) {
      setNotes(entry.contact.notes ?? "");
      setTags(entry.contact.tags ?? []);
    }
  }, [entry?.contact]);

  if (contacts === undefined) {
    return <p className="font-mono text-xs text-zinc-500">Loading…</p>;
  }

  if (!entry) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">Contact not found.</p>
        <Link href="/app/contacts" className="font-mono text-xs underline">
          ← Back to contacts
        </Link>
      </div>
    );
  }

  const { user, contact } = entry;

  async function handleSave() {
    setSaving(true);
    try {
      await updateNotes({ contactId: id as Id<"contacts">, notes, tags });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pt-2">
      <Link href="/app/contacts" className="font-mono text-xs text-zinc-500 hover:text-zinc-300">
        ← Contacts
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

      <section className="space-y-2">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="What did you talk about?"
          className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30 resize-none"
        />
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
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-foreground text-background font-mono text-sm rounded-md disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        First met {new Date(contact.firstScanAt).toLocaleString()}
      </p>
    </div>
  );
}
