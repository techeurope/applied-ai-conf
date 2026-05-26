"use client";

import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const updateProfile = useMutation(api.users.updateProfile);

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
          onClick={async () => {
            if (!confirm("Delete your account and all your data? This can't be undone.")) return;
            await deleteAccount({});
            window.location.href = "/app";
          }}
          className="font-mono text-xs text-red-300 hover:text-red-200 underline"
        >
          Delete my account
        </button>
      </section>
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
    headline: "",
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
      headline: me.headline ?? "",
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
        headline: form.headline || undefined,
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
            { key: "headline", label: "Talk headline (speakers)", placeholder: "Title of your talk" },
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
