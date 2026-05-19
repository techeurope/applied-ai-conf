"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@convex/_generated/api";

type ConsentKey =
  | "visible_when_scanned"
  | "directory_listing"
  | "email_summaries";

const CONSENT_ITEMS: { key: ConsentKey; label: string }[] = [
  { key: "visible_when_scanned", label: "Show my profile when scanned" },
  { key: "directory_listing", label: "List me in the directory" },
  { key: "email_summaries", label: "Email me an end-of-day summary" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const ensure = useMutation(api.users.ensureFromWorkos);
  const setConsent = useMutation(api.consents.set);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const me = useQuery(api.users.me);

  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    visible_when_scanned: true,
    directory_listing: true,
    email_summaries: true,
  });
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    linkedinUrl: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensure({}).catch(() => undefined);
  }, [ensure]);

  useEffect(() => {
    if (me) {
      setForm((prev) => ({
        name: me.name || prev.name,
        role: me.role || prev.role,
        company: me.company || prev.company,
        linkedinUrl: me.linkedinUrl || prev.linkedinUrl,
        bio: me.bio || prev.bio,
      }));
    }
  }, [me]);

  async function handleSubmit() {
    setSaving(true);
    try {
      await ensure({});
      await Promise.all(
        (Object.keys(consents) as ConsentKey[]).map((key) =>
          setConsent({ key, granted: consents[key] }),
        ),
      );
      await completeOnboarding(form);
      router.push("/connect/scan");
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
            details
          </Link>
        </legend>
        <ul className="space-y-1.5">
          {CONSENT_ITEMS.map((item) => (
            <li key={item.key}>
              <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents[item.key]}
                  onChange={(e) =>
                    setConsents((c) => ({ ...c, [item.key]: e.target.checked }))
                  }
                  className="size-4 accent-white"
                />
                <span>{item.label}</span>
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
