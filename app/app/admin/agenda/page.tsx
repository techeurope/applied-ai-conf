"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type Stage = "main" | "side";
type Format = "keynote" | "talk" | "workshop" | "break" | "logistics";

const STAGE_COLORS: Record<Stage, string> = {
  main: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  side: "bg-violet-400/15 text-violet-200 ring-violet-300/30",
};

const FORMATS: Format[] = ["keynote", "talk", "workshop", "break", "logistics"];

export default function AdminAgendaPage() {
  const sessions = useQuery(api.agenda.list);
  const create = useMutation(api.agenda.create);
  const update = useMutation(api.agenda.update);
  const remove = useMutation(api.agenda.remove);
  const setCancelled = useMutation(api.agenda.setCancelled);

  const [stageFilter, setStageFilter] = useState<"all" | Stage>("all");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (!sessions) return [];
    return stageFilter === "all"
      ? sessions
      : sessions.filter((s) => s.stage === stageFilter);
  }, [sessions, stageFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <FilterPill active={stageFilter === "all"} onClick={() => setStageFilter("all")}>
            All
          </FilterPill>
          <FilterPill active={stageFilter === "main"} onClick={() => setStageFilter("main")}>
            Main
          </FilterPill>
          <FilterPill active={stageFilter === "side"} onClick={() => setStageFilter("side")}>
            Side
          </FilterPill>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs"
        >
          {creating ? "Close form" : "+ New session"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {creating && (
        <CreateForm
          onCreate={async (entry) => {
            setError(null);
            try {
              await create(entry);
              setCreating(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed");
            }
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {!sessions ? (
        <p className="text-xs font-mono text-white/40">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((s) => (
            <SessionRow
              key={s._id}
              session={s}
              onUpdate={async (patch) => {
                setError(null);
                try {
                  await update({ sessionId: s._id, patch });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                  throw e;
                }
              }}
              onRemove={async () => {
                if (!confirm(`Delete "${s.title}"?`)) return;
                setError(null);
                try {
                  await remove({ sessionId: s._id });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                }
              }}
              onToggleCancel={async () => {
                setError(null);
                try {
                  await setCancelled({
                    sessionId: s._id,
                    cancelled: !s.cancelledAt,
                  });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                }
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type SessionData = NonNullable<ReturnType<typeof useQuery<typeof api.agenda.list>>>[number];

function SessionRow({
  session: s,
  onUpdate,
  onRemove,
  onToggleCancel,
}: {
  session: SessionData;
  onUpdate: (patch: {
    title?: string;
    speakerName?: string;
    startTime?: string;
    endTime?: string;
    stage?: Stage;
    format?: Format;
    description?: string;
  }) => Promise<void>;
  onRemove: () => Promise<void>;
  onToggleCancel: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: s.title,
    speakerName: s.speakerName ?? "",
    startTime: s.startTime,
    endTime: s.endTime,
    stage: s.stage as Stage,
    format: s.format as Format,
    description: s.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  const stageClass = STAGE_COLORS[s.stage as Stage] ?? "bg-white/10 text-white/60";

  if (!editing) {
    return (
      <li
        className={`glass-card rounded-xl p-3 ${s.cancelledAt ? "opacity-50" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[11px] tracking-widest text-white/60">
                {s.startTime}–{s.endTime}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ring-1 ${stageClass}`}
              >
                {s.stage}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                {s.format}
              </span>
              {s.cancelledAt && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-200">
                  cancelled
                </span>
              )}
            </div>
            <div className={`font-mono text-sm ${s.cancelledAt ? "line-through" : ""}`}>
              {s.title}
            </div>
            {s.speakerName && (
              <div className="text-xs text-white/60">{s.speakerName}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-mono text-xs underline text-white/60 hover:text-white"
            >
              edit
            </button>
            <button
              type="button"
              onClick={onToggleCancel}
              className="font-mono text-xs underline text-white/40 hover:text-amber-200"
            >
              {s.cancelledAt ? "uncancel" : "cancel"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="font-mono text-xs underline text-white/40 hover:text-red-300"
            >
              delete
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="glass-card rounded-xl p-3 space-y-2 ring-2 ring-white/20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Field label="Start" type="time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
        <Field label="End" type="time" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
        <Select
          label="Stage"
          value={form.stage}
          onChange={(v) => setForm({ ...form, stage: v as Stage })}
          options={["main", "side"]}
        />
        <Select
          label="Format"
          value={form.format}
          onChange={(v) => setForm({ ...form, format: v as Format })}
          options={FORMATS}
        />
      </div>
      <Field
        label="Title"
        value={form.title}
        onChange={(v) => setForm({ ...form, title: v })}
      />
      <Field
        label="Speaker"
        value={form.speakerName}
        onChange={(v) => setForm({ ...form, speakerName: v })}
        placeholder="(empty for break/logistics)"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            try {
              await onUpdate({
                title: form.title,
                speakerName: form.speakerName,
                startTime: form.startTime,
                endTime: form.endTime,
                stage: form.stage,
                format: form.format,
              });
              setEditing(false);
            } catch {
              /* error surfaced in parent */
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="px-3 py-1.5 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 rounded-full ring-1 ring-white/20 font-mono text-xs"
        >
          Cancel
        </button>
      </div>
    </li>
  );
}

function CreateForm({
  onCreate,
  onCancel,
}: {
  onCreate: (entry: {
    slug: string;
    title: string;
    startTime: string;
    endTime: string;
    stage: Stage;
    format: Format;
    speakerName?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    speakerName: "",
    startTime: "09:00",
    endTime: "09:20",
    stage: "main" as Stage,
    format: "talk" as Format,
  });
  const [saving, setSaving] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <h3 className="font-mono text-sm font-bold">New session</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Field label="Start" type="time" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
        <Field label="End" type="time" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
        <Select
          label="Stage"
          value={form.stage}
          onChange={(v) => setForm({ ...form, stage: v as Stage })}
          options={["main", "side"]}
        />
        <Select
          label="Format"
          value={form.format}
          onChange={(v) => setForm({ ...form, format: v as Format })}
          options={FORMATS}
        />
      </div>
      <Field
        label="Slug"
        value={form.slug}
        onChange={(v) => setForm({ ...form, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
        placeholder="main-12"
      />
      <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field
        label="Speaker"
        value={form.speakerName}
        onChange={(v) => setForm({ ...form, speakerName: v })}
        placeholder="(empty for break/logistics)"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            try {
              await onCreate({
                slug: form.slug,
                title: form.title,
                speakerName: form.speakerName || undefined,
                startTime: form.startTime,
                endTime: form.endTime,
                stage: form.stage,
                format: form.format,
              });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving || !form.slug || !form.title}
          className="px-4 py-2 rounded-full bg-white text-black font-mono text-xs disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-full ring-1 ring-white/20 font-mono text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-white/30"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-white/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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
