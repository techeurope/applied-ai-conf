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

const CONSENT_ITEMS: { key: ConsentKey; title: string; body: string }[] = [
  {
    key: "visible_when_scanned",
    title: "Show my profile when someone scans my QR",
    body: "Without this, your QR can't do anything. You can toggle this off any time.",
  },
  {
    key: "directory_listing",
    title: "Let others find me in the directory",
    body: "People can browse and connect with you before and during the event.",
  },
  {
    key: "email_summaries",
    title: "Email me a summary at end of day",
    body: "A list of who you connected with and your quick notes.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const ensure = useMutation(api.users.ensureFromWorkos);
  const setConsent = useMutation(api.consents.set);
  const updateProfile = useMutation(api.users.updateProfile);
  const me = useQuery(api.users.me);

  const [step, setStep] = useState<"consent" | "profile">("consent");
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
        ...prev,
        name: me.name || prev.name,
        role: me.role || prev.role,
        company: me.company || prev.company,
        linkedinUrl: me.linkedinUrl || prev.linkedinUrl,
        bio: me.bio || prev.bio,
      }));
    }
  }, [me]);

  async function handleConsentSubmit() {
    setSaving(true);
    try {
      await Promise.all(
        (Object.keys(consents) as ConsentKey[]).map((key) =>
          setConsent({ key, granted: consents[key] }),
        ),
      );
      setStep("profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileSubmit() {
    setSaving(true);
    try {
      await updateProfile(form);
      router.push("/connect/scan");
    } finally {
      setSaving(false);
    }
  }

  if (step === "consent") {
    return (
      <div className="space-y-10 pt-6 sm:pt-12">
        <header className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Step 1 of 2
          </p>
          <h1 className="font-mono font-bold text-3xl sm:text-5xl tracking-tighter leading-[1.1] pb-1 text-glow">
            Let&apos;s set you up
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-prose">
            All optional. Change any of these any time in Settings.{" "}
            <Link href="/connect/consent-details" className="underline underline-offset-2 hover:text-white transition-colors">
              Details
            </Link>
          </p>
        </header>

        <ul className="space-y-3">
          {CONSENT_ITEMS.map((item) => (
            <li key={item.key}>
              <label
                className={`block glass-card rounded-2xl p-5 cursor-pointer transition-all ${
                  consents[item.key] ? "border-white/20" : "opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={consents[item.key]}
                    onChange={(e) =>
                      setConsents((c) => ({ ...c, [item.key]: e.target.checked }))
                    }
                    className="mt-1 size-4 accent-white"
                  />
                  <div className="space-y-1.5">
                    <div className="text-sm font-mono text-white">{item.title}</div>
                    <div className="text-sm text-white/50 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              </label>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleConsentSubmit}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all ring-1 ring-white/30 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-6 sm:pt-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Step 2 of 2
        </p>
        <h1 className="font-mono font-bold text-3xl sm:text-5xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Your profile
        </h1>
        <p className="text-base text-white/70 leading-relaxed max-w-prose">
          This is what people see when they scan you. Edit any time in Settings.
        </p>
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
            rows={4}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors resize-none"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleProfileSubmit}
        disabled={saving || !form.name.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all ring-1 ring-white/30 disabled:opacity-50 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Save and start"}
      </button>
    </div>
  );
}
