"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function AdminAttendeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;
  const user = useQuery(api.admin.getUser, { userId });
  const activity = useQuery(api.admin.getUserActivity, { userId, limit: 50 });
  const updateProfile = useMutation(api.admin.updateUserProfile);
  const resetOnboarding = useMutation(api.admin.resetOnboarding);
  const reactivate = useMutation(api.admin.reactivateUser);
  const createCode = useMutation(api.admin.createClaimCode);
  const rotateToken = useMutation(api.admin.rotateUserToken);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    role: string;
    company: string;
    linkedinUrl: string;
    bio: string;
    headline: string;
    isSpeaker: boolean;
  } | null>(null);

  if (user === undefined) return <p className="text-xs font-mono text-white/40">Loading…</p>;
  if (user === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/60">User not found.</p>
        <Link href="/connect/admin/attendees" className="font-mono text-xs underline">
          ← attendees
        </Link>
      </div>
    );
  }

  function startEdit() {
    if (!user) return;
    setForm({
      name: user.name,
      role: user.role ?? "",
      company: user.company ?? "",
      linkedinUrl: user.linkedinUrl ?? "",
      bio: user.bio ?? "",
      headline: user.headline ?? "",
      isSpeaker: user.isSpeaker,
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!form) return;
    setBusy("save");
    setError(null);
    try {
      await updateProfile({
        userId,
        patch: {
          name: form.name,
          role: form.role || undefined,
          company: form.company || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          bio: form.bio || undefined,
          headline: form.headline || undefined,
          isSpeaker: form.isSpeaker,
        },
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(null);
    }
  }

  async function handleKick() {
    if (!confirm("Deactivate this account and revoke all WorkOS sessions?")) return;
    setBusy("kick");
    setError(null);
    try {
      const reason = prompt("Reason (logged in audit):") ?? undefined;
      const res = await fetch(`/api/admin/kick/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate");
    } finally {
      setBusy(null);
    }
  }

  async function handleReactivate() {
    setBusy("reactivate");
    setError(null);
    try {
      await reactivate({ userId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleResetOnboarding() {
    setBusy("reset");
    setError(null);
    try {
      await resetOnboarding({ userId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleRotateToken() {
    if (!confirm("Rotate this user's QR token? Their old QR will stop working.")) return;
    setBusy("rotate");
    setError(null);
    try {
      await rotateToken({ userId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleNewCode() {
    if (!user) return;
    setBusy("code");
    setError(null);
    try {
      const res = await createCode({
        email: user.email,
        name: user.name || undefined,
        company: user.company,
        jobRole: user.role,
        kind: user.isSpeaker ? "speaker" : "guest",
        note: "Generated from attendee detail",
      });
      setNewCode(res.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link href="/connect/admin/attendees" className="font-mono text-xs text-white/40 underline">
          ← attendees
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 truncate">
          {user._id}
        </div>
      </div>

      <header className="space-y-1">
        <h2 className="font-mono font-bold text-2xl tracking-tighter">
          {user.name || "Unnamed"}
        </h2>
        <p className="text-xs text-white/60">{user.email}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Pill label={`role: ${user.accessLevel ?? "member"}`} />
          {user.isSpeaker && <Pill label="speaker" />}
          {user.onboardingRequired && <Pill label="onboarding pending" />}
          {user.deactivatedAt && <Pill label="deactivated" tone="danger" />}
          {user.deletedAt && <Pill label="deleted" tone="danger" />}
        </div>
      </header>

      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {newCode && (
        <div className="rounded-xl bg-white/5 ring-1 ring-white/20 px-4 py-3 space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            New claim code
          </div>
          <div className="font-mono text-2xl font-bold tracking-widest">{newCode}</div>
          <div className="text-xs text-white/50">
            Hand it to the attendee. They sign in, enter it in Settings, and the records are linked.
          </div>
        </div>
      )}

      {!editing ? (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold">Profile</h3>
            <button
              type="button"
              onClick={startEdit}
              className="font-mono text-xs underline text-white/70 hover:text-white"
            >
              edit
            </button>
          </div>
          <Detail label="Role" value={user.role} />
          <Detail label="Company" value={user.company} />
          <Detail label="LinkedIn" value={user.linkedinUrl} />
          <Detail label="Headline / talk" value={user.headline} />
          <Detail label="Bio" value={user.bio} multiline />
        </section>
      ) : form ? (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="font-mono text-sm font-bold">Edit profile</h3>
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          <Field
            label="Company"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
          />
          <Field
            label="LinkedIn"
            value={form.linkedinUrl}
            onChange={(v) => setForm({ ...form, linkedinUrl: v })}
          />
          <Field
            label="Headline"
            value={form.headline}
            onChange={(v) => setForm({ ...form, headline: v })}
          />
          <Field
            label="Bio"
            value={form.bio}
            onChange={(v) => setForm({ ...form, bio: v })}
            multiline
          />
          <label className="inline-flex items-center gap-2 text-xs font-mono">
            <input
              type="checkbox"
              checked={form.isSpeaker}
              onChange={(e) => setForm({ ...form, isSpeaker: e.target.checked })}
            />
            Speaker
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy === "save"}
              className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
            >
              {busy === "save" ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-full ring-1 ring-white/20 font-mono text-xs"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-mono text-sm font-bold">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Reset onboarding"
            onClick={handleResetOnboarding}
            busy={busy === "reset"}
          />
          <ActionButton
            label="Rotate QR token"
            onClick={handleRotateToken}
            busy={busy === "rotate"}
          />
          <ActionButton label="Generate claim code" onClick={handleNewCode} busy={busy === "code"} />
          {user.deactivatedAt ? (
            <ActionButton
              label="Reactivate account"
              onClick={handleReactivate}
              busy={busy === "reactivate"}
            />
          ) : (
            <ActionButton
              label="Kick out (revoke sessions)"
              onClick={handleKick}
              busy={busy === "kick"}
              danger
            />
          )}
        </div>
        {user.deactivatedReason && (
          <p className="text-xs text-white/50">
            Deactivated reason: {user.deactivatedReason}
          </p>
        )}
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-mono text-sm font-bold">Activity</h3>
        {activity ? (
          <div className="space-y-3 text-xs">
            <SectionStat
              label="Scans they made"
              count={activity.scansBy.length}
              hint="Times they scanned someone."
            />
            <SectionStat
              label="Scans of them"
              count={activity.scansOf.length}
              hint="Times someone scanned them."
            />
            <SectionStat
              label="Contacts saved"
              count={activity.contactsBy.length}
              hint="Their saved contacts (people they keep)."
            />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
                Recent admin actions on this user
              </div>
              {activity.audit.length === 0 ? (
                <p className="text-white/50">No admin actions yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {activity.audit.slice(0, 10).map((row) => (
                    <li key={row._id} className="text-white/70">
                      <span className="font-mono">{row.action}</span>{" "}
                      <span className="text-white/40">
                        — {new Date(row.createdAt).toLocaleString()}
                      </span>
                      {row.metadata && (
                        <code className="block ml-3 text-[10px] text-white/40 break-all">
                          {row.metadata}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/40">loading…</p>
        )}
      </section>
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone?: "danger" }) {
  const cls =
    tone === "danger"
      ? "bg-red-500/20 text-red-200"
      : "bg-white/10 text-white/70";
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ${cls}`}
    >
      {label}
    </span>
  );
}

function Detail({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-0.5">
        {label}
      </div>
      <p className={`text-sm text-white/80 ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
        />
      )}
    </label>
  );
}

function ActionButton({
  label,
  onClick,
  busy,
  danger,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`px-4 py-2 rounded-full font-mono text-xs ring-1 disabled:opacity-50 ${
        danger
          ? "bg-red-500/20 ring-red-500/40 text-red-100 hover:bg-red-500/30"
          : "ring-white/20 hover:ring-white/40"
      }`}
    >
      {busy ? "…" : label}
    </button>
  );
}

function SectionStat({
  label,
  count,
  hint,
}: {
  label: string;
  count: number;
  hint: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <div className="font-mono text-white/80">{label}</div>
        <div className="text-white/40 text-[10px]">{hint}</div>
      </div>
      <div className="font-mono text-2xl font-bold">{count}</div>
    </div>
  );
}
