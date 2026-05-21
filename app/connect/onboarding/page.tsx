"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@convex/_generated/api";

type ConsentKey = "visible_when_scanned" | "conference_updates";

const CONSENT_ITEMS: { key: ConsentKey; label: string; hint: string }[] = [
  {
    key: "visible_when_scanned",
    label: "Show my profile when scanned",
    hint: "Without this your QR can't do anything.",
  },
  {
    key: "conference_updates",
    label: "Email me conference updates",
    hint: "Schedule changes, post-event recap, transactional only. No marketing.",
  },
];

const DRAFT_STORAGE_KEY = "aac:onboarding-draft:v1";

interface OnboardingDraft {
  name: string;
  role: string;
  company: string;
  linkedinUrl: string;
  bio: string;
  consents: Record<ConsentKey, boolean>;
}

const EMPTY_DRAFT: OnboardingDraft = {
  name: "",
  role: "",
  company: "",
  linkedinUrl: "",
  bio: "",
  consents: {
    visible_when_scanned: true,
    conference_updates: true,
  },
};

function loadDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return { ...EMPTY_DRAFT, ...parsed, consents: { ...EMPTY_DRAFT.consents, ...(parsed.consents ?? {}) } };
  } catch {
    return null;
  }
}

function saveDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / disabled — ignore */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const ensure = useMutation(api.users.ensureFromWorkos);
  const setConsent = useMutation(api.consents.set);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const me = useQuery(api.users.me);

  const [form, setForm] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensure({}).catch(() => undefined);
  }, [ensure]);

  // First mount: load local draft if any (covers refreshes and navigations away).
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setForm(draft);
    setHydrated(true);
  }, []);

  // Once `me` arrives, fill in any fields not already typed by the user.
  useEffect(() => {
    if (!hydrated || !me) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || me.name || "",
      role: prev.role || me.role || "",
      company: prev.company || me.company || "",
      linkedinUrl: prev.linkedinUrl || me.linkedinUrl || "",
      bio: prev.bio || me.bio || "",
    }));
  }, [me, hydrated]);

  // Persist draft on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveDraft(form);
  }, [form, hydrated]);

  async function handleSubmit() {
    setSaving(true);
    try {
      await ensure({});
      await Promise.all(
        (Object.keys(form.consents) as ConsentKey[]).map((key) =>
          setConsent({ key, granted: form.consents[key] }),
        ),
      );
      await completeOnboarding({
        name: form.name,
        role: form.role,
        company: form.company,
        linkedinUrl: form.linkedinUrl,
        bio: form.bio,
      });
      clearDraft();
      router.push("/connect");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 pt-6 sm:pt-12">
      <header className="space-y-3">
        <h1 className="font-mono font-bold text-3xl sm:text-5xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Set up your profile
        </h1>
        <p className="text-base text-white/70 leading-relaxed max-w-prose">
          This is what people see when they scan your QR. You can change everything later in Settings.
        </p>
        {me?.email && (
          <p className="text-xs text-white/40 font-mono">Signed in as {me.email}</p>
        )}
      </header>

      <div className="space-y-4">
        {(
          [
            { key: "name", label: "Name", placeholder: "Tim Pietrusky" },
            { key: "role", label: "Role", placeholder: "Founding Engineer" },
            { key: "company", label: "Company", placeholder: "{Tech: Europe}" },
            { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <label key={key} className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
              {label}
            </span>
            <input
              type="text"
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
            />
          </label>
        ))}
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
            Bio
          </span>
          <textarea
            value={form.bio}
            placeholder="What you're working on, what you're looking for..."
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors resize-none"
          />
        </label>
      </div>

      <fieldset className="space-y-2 pt-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
          Preferences{" "}
          <Link
            href="/connect/consent-details"
            className="ml-2 normal-case tracking-normal underline text-white/40 hover:text-white"
          >
            full explanation
          </Link>
        </legend>
        <ul className="space-y-2">
          {CONSENT_ITEMS.map((item) => (
            <li key={item.key}>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consents[item.key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      consents: { ...f.consents, [item.key]: e.target.checked },
                    }))
                  }
                  className="mt-0.5 size-4 accent-white shrink-0"
                />
                <span className="block leading-snug">
                  <span className="block text-sm text-white/80">{item.label}</span>
                  <span className="block text-[11px] text-white/40">{item.hint}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || !form.name.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all ring-1 ring-white/30 disabled:opacity-50 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
