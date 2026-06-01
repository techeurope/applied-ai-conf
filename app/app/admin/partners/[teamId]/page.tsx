"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const team = useQuery(api.partners.getTeam, { teamId: teamId as Id<"teams"> });
  const verify = useMutation(api.partners.verifyTeam);
  const unverify = useMutation(api.partners.unverifyTeam);
  const update = useMutation(api.partners.updateTeam);
  const invite = useMutation(api.partners.inviteMember);
  const remove = useMutation(api.partners.removeMember);
  const revoke = useMutation(api.partners.revokeInvite);
  const setRole = useMutation(api.partners.setMemberRole);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    partnerTier: string;
    partnerBoothLocation: string;
    partnerBio: string;
    partnerWebsite: string;
  } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (team === undefined) return <p className="text-xs font-mono text-white/40">Loading…</p>;
  if (team === null) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/60">Team not found.</p>
        <Link href="/app/admin/partners" className="font-mono text-xs underline">
          ← partners
        </Link>
      </div>
    );
  }

  function startEdit() {
    if (!team) return;
    setForm({
      name: team.team.name,
      partnerTier: team.team.partnerTier ?? "",
      partnerBoothLocation: team.team.partnerBoothLocation ?? "",
      partnerBio: team.team.partnerBio ?? "",
      partnerWebsite: team.team.partnerWebsite ?? "",
    });
    setEditing(true);
  }

  async function save() {
    if (!form) return;
    setBusy("save");
    setError(null);
    try {
      await update({
        teamId: teamId as Id<"teams">,
        patch: {
          name: form.name,
          partnerTier: form.partnerTier || undefined,
          partnerBoothLocation: form.partnerBoothLocation || undefined,
          partnerBio: form.partnerBio || undefined,
          partnerWebsite: form.partnerWebsite || undefined,
        },
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function doInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy("invite");
    setError(null);
    try {
      await invite({
        teamId: teamId as Id<"teams">,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function doVerify() {
    setBusy("verify");
    setError(null);
    try {
      if (team!.team.partnerVerifiedAt) {
        if (!confirm("Unverify this partner? Their team-level features stop unlocking.")) {
          setBusy(null);
          return;
        }
        await unverify({ teamId: teamId as Id<"teams"> });
      } else {
        await verify({ teamId: teamId as Id<"teams"> });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link href="/app/admin/partners" className="font-mono text-xs text-white/40 underline">
          ← partners
        </Link>
        <Link
          href={`/app/partner/${team.team.slug}`}
          target="_blank"
          className="font-mono text-xs text-white/40 underline"
        >
          public page ↗
        </Link>
      </div>

      <header className="space-y-1">
        <h2 className="font-mono font-bold text-2xl tracking-tighter">{team.team.name}</h2>
        <p className="text-xs text-white/60">/partner/{team.team.slug}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {team.team.partnerVerifiedAt ? (
            <Pill label="verified" tone="ok" />
          ) : (
            <Pill label="unverified" tone="warn" />
          )}
          {team.team.partnerTier && <Pill label={team.team.partnerTier} />}
        </div>
      </header>

      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {!editing ? (
        <section className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold">Profile</h3>
            <button
              type="button"
              onClick={startEdit}
              className="font-mono text-xs underline text-white/70"
            >
              edit
            </button>
          </div>
          <Detail label="Tier" value={team.team.partnerTier} />
          <Detail label="Booth" value={team.team.partnerBoothLocation} />
          <Detail label="Website" value={team.team.partnerWebsite} />
          <Detail label="Bio" value={team.team.partnerBio} multiline />
        </section>
      ) : form ? (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="font-mono text-sm font-bold">Edit profile</h3>
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field
            label="Tier"
            value={form.partnerTier}
            onChange={(v) => setForm({ ...form, partnerTier: v })}
          />
          <Field
            label="Booth"
            value={form.partnerBoothLocation}
            onChange={(v) => setForm({ ...form, partnerBoothLocation: v })}
          />
          <Field
            label="Website"
            value={form.partnerWebsite}
            onChange={(v) => setForm({ ...form, partnerWebsite: v })}
          />
          <Field
            label="Bio"
            value={form.partnerBio}
            onChange={(v) => setForm({ ...form, partnerBio: v })}
            multiline
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
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
        <h3 className="font-mono text-sm font-bold">Verification</h3>
        <p className="text-xs text-white/60">
          {team.team.partnerVerifiedAt
            ? `Verified on ${new Date(team.team.partnerVerifiedAt).toLocaleDateString()}. Members of this team bypass the Luma ticket gate.`
            : "Unverified. Team can be configured but members can't use platform-side partner features until you verify."}
        </p>
        <button
          type="button"
          onClick={doVerify}
          disabled={busy === "verify"}
          className={`px-4 py-2 rounded-full font-mono text-xs ring-1 disabled:opacity-50 ${
            team.team.partnerVerifiedAt
              ? "ring-amber-500/40 text-amber-100 bg-amber-500/10"
              : "ring-emerald-500/40 text-emerald-100 bg-emerald-500/10"
          }`}
        >
          {busy === "verify"
            ? "…"
            : team.team.partnerVerifiedAt
              ? "Unverify"
              : "Mark as verified"}
        </button>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-mono text-sm font-bold">Members ({team.members.length})</h3>
        <ul className="divide-y divide-white/5">
          {team.members.map(({ membership, user }) => {
            const nextRole = membership.role === "owner" ? "member" : "owner";
            return (
              <li key={membership._id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm">{user?.name ?? "Unknown"}</div>
                  <div className="text-xs text-white/50 truncate">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    {membership.role}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await setRole({
                          teamId: teamId as Id<"teams">,
                          userId: membership.userId,
                          role: nextRole,
                        });
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                    className="font-mono text-xs text-white/50 hover:text-white underline"
                  >
                    make {nextRole}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Remove ${user?.email}?`)) return;
                      setBusy("remove");
                      try {
                        await remove({
                          teamId: teamId as Id<"teams">,
                          userId: membership.userId,
                        });
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Failed");
                      } finally {
                        setBusy(null);
                      }
                    }}
                    className="font-mono text-xs text-white/40 hover:text-red-300 underline"
                  >
                    remove
                  </button>
                </div>
              </li>
            );
          })}
          {team.members.length === 0 && (
            <li className="py-2 text-xs text-white/50">No members yet.</li>
          )}
        </ul>

        <form onSubmit={doInvite} className="flex gap-2 pt-2 border-t border-white/5">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@partner.com"
            required
            className="flex-1 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-white/30"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "owner" | "member")}
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm"
          >
            <option value="member">member</option>
            <option value="owner">owner</option>
          </select>
          <button
            type="submit"
            disabled={busy === "invite" || !inviteEmail.trim()}
            className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
          >
            Invite
          </button>
        </form>
      </section>

      {team.invites.filter((i) => !i.consumedAt).length > 0 && (
        <section className="glass-card rounded-2xl p-5 space-y-2">
          <h3 className="font-mono text-sm font-bold">Pending invites</h3>
          <ul className="divide-y divide-white/5">
            {team.invites
              .filter((i) => !i.consumedAt)
              .map((i) => (
                <li key={i._id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm">{i.email}</div>
                    <div className="text-[10px] text-white/40">
                      {i.role} · invited {new Date(i.invitedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await revoke({ inviteId: i._id });
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                    className="font-mono text-xs text-white/40 hover:text-red-300 underline"
                  >
                    revoke
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <TeamLeadsSection teamId={teamId as Id<"teams">} teamSlug={team.team.slug} />
    </div>
  );
}

function TeamLeadsSection({
  teamId,
  teamSlug,
}: {
  teamId: Id<"teams">;
  teamSlug: string;
}) {
  const leads = useQuery(api.admin.teamLeads, { teamId });
  return (
    <section className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-sm font-bold">
          Leads {leads ? `(${leads.length})` : ""}
        </h3>
        <a
          href={`/api/team/leads/export?teamId=${teamId}&slug=${encodeURIComponent(teamSlug)}`}
          className="inline-flex items-center px-3 py-1.5 rounded-full ring-1 ring-white/20 font-mono text-[11px]"
        >
          Export CSV ↓
        </a>
      </div>
      <p className="text-xs text-white/60">
        All scans by members of <span className="font-mono">{teamSlug}</span>. Team
        members manage these from <span className="font-mono">/app/team/leads</span>.
      </p>
      {!leads ? (
        <p className="text-xs text-white/40">loading…</p>
      ) : leads.length === 0 ? (
        <p className="text-xs text-white/50">No scans yet.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {leads.map(({ contact, lead, scanners, notes }) => (
            <li key={contact._id} className="py-2 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm">{lead?.name ?? "—"}</span>
                <span className="font-mono text-[10px] text-white/30">
                  {new Date(contact.lastScanAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-white/60 truncate">
                {[lead?.role, lead?.company].filter(Boolean).join(" · ")}
              </div>
              <div className="font-mono text-[10px] text-white/40 truncate">
                {lead?.email}
              </div>
              {contact.leadStatus && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                  {contact.leadStatus}
                </span>
              )}
              {scanners.length > 0 && (
                <div className="font-mono text-[10px] text-white/40">
                  scanned by {scanners.map((s) => s.name).join(", ")}
                </div>
              )}
              {contact.leadDescription && (
                <p className="text-xs text-white/70 mt-1 whitespace-pre-wrap">
                  {contact.leadDescription}
                </p>
              )}
              {notes.length > 0 && (
                <ul className="mt-1 space-y-1 border-l border-white/10 pl-2">
                  {notes.map((n, i) => (
                    <li key={i} className="text-xs text-white/60">
                      <span className="font-mono text-[10px] text-white/40">
                        {n.author} ·{" "}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      <p className="whitespace-pre-wrap text-white/70">{n.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {contact.notes && (
                <p className="text-xs text-white/50 mt-1 italic">{contact.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Pill({ label, tone }: { label: string; tone?: "ok" | "warn" | "danger" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/20 text-emerald-200"
      : tone === "warn"
        ? "bg-amber-500/20 text-amber-200"
        : tone === "danger"
          ? "bg-red-500/20 text-red-200"
          : "bg-white/10 text-white/70";
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ${cls}`}>
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
