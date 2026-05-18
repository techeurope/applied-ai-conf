"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "@convex/_generated/api";
import { useState } from "react";

type ConsentKey =
  | "visible_when_scanned"
  | "directory_listing"
  | "ai_fit_scoring"
  | "email_summaries"
  | "team_sharing";

const CONSENT_LABELS: Record<ConsentKey, string> = {
  visible_when_scanned: "Show my profile when scanned",
  directory_listing: "List me in the directory",
  ai_fit_scoring: "Use my profile for fit-scoring",
  email_summaries: "End-of-day email summary",
  team_sharing: "Team sharing (auto-pool with my team)",
};

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const goals = useQuery(api.goals.list);
  const consents = useQuery(api.consents.list);
  const addGoal = useMutation(api.goals.add);
  const removeGoal = useMutation(api.goals.remove);
  const setConsent = useMutation(api.consents.set);
  const restartOnboarding = useMutation(api.users.restartOnboarding);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const [newGoal, setNewGoal] = useState("");

  return (
    <div className="space-y-8 pt-2">
      <header className="space-y-1">
        <h1 className="font-mono text-xl tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400">{me?.email}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Goals</h2>
        <p className="text-xs text-zinc-500">
          Used for fit-scoring. Add what you&apos;re looking for at the event.
        </p>
        <ul className="space-y-2">
          {goals?.map((g) => (
            <li key={g._id} className="flex items-center gap-3 glass-card rounded-md px-3 py-2">
              <span className="text-sm flex-1">{g.label}</span>
              <button
                type="button"
                onClick={() => removeGoal({ goalId: g._id })}
                className="font-mono text-[10px] text-zinc-500 hover:text-red-300"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newGoal.trim()) return;
            await addGoal({ label: newGoal.trim() });
            setNewGoal("");
          }}
        >
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Hiring senior infra engineer"
            className="flex-1 px-3 py-2 bg-zinc-900/60 border border-white/10 rounded-md text-sm focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={!newGoal.trim()}
            className="px-4 py-2 bg-foreground text-background font-mono text-xs rounded-md disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Privacy preferences</h2>
        <p className="text-xs text-zinc-500">
          <Link href="/connect/consent-details" className="underline">
            What does each do?
          </Link>
        </p>
        <ul className="space-y-2">
          {(Object.keys(CONSENT_LABELS) as ConsentKey[]).map((key) => {
            const c = consents?.find((x) => x.key === key);
            const granted = c?.granted ?? false;
            return (
              <li key={key} className="flex items-center gap-3 glass-card rounded-md px-3 py-2">
                <span className="text-sm flex-1">{CONSENT_LABELS[key]}</span>
                <button
                  type="button"
                  onClick={() => setConsent({ key, granted: !granted })}
                  className={`font-mono text-[10px] uppercase px-2 py-1 rounded ${
                    granted
                      ? "bg-foreground/15 text-foreground"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {granted ? "on" : "off"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Account</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              await restartOnboarding({});
              router.push("/connect/onboarding");
            }}
            className="font-mono text-xs text-white/70 hover:text-white underline underline-offset-4"
          >
            Restart onboarding
          </button>
          <button
            type="button"
            onClick={() => auth.signOut({ returnTo: "/connect" })}
            className="font-mono text-xs text-white/70 hover:text-white underline underline-offset-4"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm text-foreground">Danger zone</h2>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Delete your account and all your data? This can't be undone.")) return;
            await deleteAccount({});
            window.location.href = "/connect";
          }}
          className="font-mono text-xs text-red-300 hover:text-red-200 underline"
        >
          Delete my account
        </button>
      </section>
    </div>
  );
}
