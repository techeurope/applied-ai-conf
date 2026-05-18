"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function ProfileViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const user = useQuery(api.users.getById, { userId: token as Id<"users"> });
  const contacts = useQuery(api.contacts.list);
  const addContact = useMutation(api.contacts.add);
  const [saving, setSaving] = useState(false);

  if (user === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (user === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-white/60">User not found.</p>
        <Link href="/connect/directory" className="font-mono text-xs underline">
          ← Directory
        </Link>
      </div>
    );
  }

  const existing = contacts?.find((c) => c.user?._id === user._id)?.contact;

  async function handleAdd() {
    if (!user) return;
    setSaving(true);
    try {
      const contactId = await addContact({ userId: user._id });
      router.push(`/connect/contacts/${contactId}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <Link href="/connect/directory" className="font-mono text-xs text-white/40 hover:text-white">
        ← Directory
      </Link>

      <header className="space-y-2">
        {user.isSpeaker && (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Speaker
          </p>
        )}
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-[1.1] pb-1 text-glow">
          {user.name}
        </h1>
        <p className="text-sm text-white/60">
          {[user.role, user.company].filter(Boolean).join(" · ")}
        </p>
        {user.linkedinUrl && (
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-mono text-xs underline underline-offset-2 text-white/70 hover:text-white"
          >
            LinkedIn ↗
          </a>
        )}
      </header>

      {(user.bio || user.headline) && (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          {user.headline && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1.5">
                Talk
              </div>
              <p className="text-sm text-white">{user.headline}</p>
            </div>
          )}
          {user.bio && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1.5">
                Building
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </section>
      )}

      {existing ? (
        <Link
          href={`/connect/contacts/${existing._id}`}
          className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium ring-1 ring-white/30"
        >
          Open in your contacts
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium ring-1 ring-white/30 disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add to my contacts"}
        </button>
      )}
    </div>
  );
}
