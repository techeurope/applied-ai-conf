"use client";

import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "@convex/_generated/api";
import { useEffect, useRef, useState } from "react";

export default function SettingsPage() {
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const updateProfile = useMutation(api.users.updateProfile);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-8 pt-2">
      <p className="text-xs text-zinc-400">{me?.email}</p>

      <ProfileEditor me={me ?? undefined} updateProfile={updateProfile} />

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Account</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => auth.signOut({ returnTo: "/app" })}
            className="font-mono text-xs text-white/70 hover:text-white underline underline-offset-4"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Your data</h2>
        <p className="text-xs text-zinc-500">
          Download everything we have about you — profile, scans in/out, contacts,
          consents, goals, team membership, and audit entries — as JSON.
        </p>
        <a
          href="/api/me/export"
          className="inline-flex items-center font-mono text-xs underline underline-offset-4 text-white/70 hover:text-white"
        >
          Download my data ↓
        </a>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Danger zone</h2>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="font-mono text-xs text-red-300 hover:text-red-200 underline"
        >
          Delete my account
        </button>
      </section>

      {confirmOpen && (
        <DeleteAccountDialog
          expectedEmail={me?.email ?? null}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            await deleteAccount({});
            window.location.href = "/app";
          }}
        />
      )}
    </div>
  );
}

function DeleteAccountDialog({
  expectedEmail,
  onCancel,
  onConfirm,
}: {
  expectedEmail: string | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  // Compare case-insensitive against a lowercased challenge so users
  // don't have to fight their phone's auto-capitalize.
  const challenge = (expectedEmail?.trim() || "delete").toLowerCase();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, submitting]);

  const matches = input.trim().toLowerCase() === challenge;

  async function handleConfirm() {
    if (!matches || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl ring-1 ring-red-500/20 bg-zinc-950 p-6 space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300/80">
            // danger zone
          </p>
          <h3
            id="delete-account-title"
            className="font-mono text-base text-white"
          >
            Delete your account?
          </h3>
        </div>

        <p className="text-sm text-white/70 leading-relaxed">
          This will permanently delete your profile, scans in/out, contacts,
          consents, goals, team membership, and audit entries. This can&apos;t
          be undone.
        </p>

        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              Type{" "}
              <span className="text-white/80">
                {challenge}
              </span>{" "}
              to confirm
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm font-mono focus:outline-none focus:border-red-400/50 disabled:opacity-60"
            />
          </label>
          {error && (
            <p className="font-mono text-[11px] text-red-300">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="font-mono text-xs text-white/70 hover:text-white px-3 py-2 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!matches || submitting}
            className="font-mono text-xs px-4 py-2 rounded-md bg-red-500/15 text-red-200 ring-1 ring-red-400/30 hover:bg-red-500/25 hover:text-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}

type Me = NonNullable<ReturnType<typeof useQuery<typeof api.users.me>>>;

function ProfileEditor({
  me,
  updateProfile,
}: {
  me: Me | undefined;
  updateProfile: ReturnType<typeof useMutation<typeof api.users.updateProfile>>;
}) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    linkedinUrl: "",
    bio: "",
  });
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Hydrate the form once when the server-side me arrives. Previously
  // this was a useState(fn) initializer (only ever fires once and never
  // sees the updated me) plus a setForm during render (React anti-
  // pattern that fires warnings + can bail mid-render). Both replaced
  // by a single effect.
  useEffect(() => {
    if (!me || hydrated) return;
    setForm({
      name: me.name ?? "",
      role: me.role ?? "",
      company: me.company ?? "",
      linkedinUrl: me.linkedinUrl ?? "",
      bio: me.bio ?? "",
    });
    setHydrated(true);
  }, [me, hydrated]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({
        name: form.name,
        role: form.role || undefined,
        company: form.company || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        bio: form.bio || undefined,
      });
      setMsg("Saved");
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-mono text-sm text-foreground">Profile</h2>
      <p className="text-xs text-zinc-500">
        This is what people see when they scan your QR.
      </p>
      <form onSubmit={handleSave} className="space-y-3">
        {(
          [
            { key: "name", label: "Name", placeholder: "Tim Pietrusky" },
            { key: "role", label: "Role", placeholder: "Founding Engineer" },
            { key: "company", label: "Company", placeholder: "{Tech: Europe}" },
            { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <label key={key} className="block space-y-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              {label}
            </span>
            <input
              type="text"
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30"
            />
          </label>
        ))}
        <label className="block space-y-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Bio
          </span>
          <textarea
            value={form.bio}
            placeholder="What you're working on, what you're looking for..."
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30 resize-none"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 bg-foreground text-background font-mono text-xs rounded-md disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {msg && <span className="font-mono text-[11px] text-white/60">{msg}</span>}
        </div>
      </form>
    </section>
  );
}
