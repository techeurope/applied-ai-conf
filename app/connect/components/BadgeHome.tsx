"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ScanLine, Users, CalendarDays, Pencil } from "lucide-react";
import { api } from "@convex/_generated/api";
import { UserQR } from "./UserQR";

export function BadgeHome() {
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }
  if (me === null) {
    return null;
  }

  return (
    <div className="space-y-8 pt-2">
      <header className="space-y-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Your conference badge
        </p>
        <h1 className="font-mono font-bold text-2xl tracking-tighter pb-0.5 text-glow">
          {me.name || "Unnamed"}
        </h1>
        <p className="text-sm text-white/60">
          {[me.role, me.company].filter(Boolean).join(" · ") ||
            "Add a role and company in Settings"}
        </p>
        {me.isSpeaker && (
          <p className="inline-block font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-white/10 text-white/80 mt-1">
            Speaker
          </p>
        )}
      </header>

      <UserQR token={me.publicToken ?? me._id} />

      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 text-center">
        Show this to people you meet. They scan, they get your profile.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <ActionLink href="/connect/scan" icon={ScanLine} label="Scan" />
        <ActionLink href="/connect/contacts" icon={Users} label="Contacts" />
        <ActionLink href="/connect/agenda" icon={CalendarDays} label="Agenda" />
      </div>

      <div className="text-center pt-2">
        <Link
          href="/connect/settings"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
        >
          <Pencil className="size-3.5" strokeWidth={1.75} />
          Edit profile
        </Link>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof ScanLine;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors"
    >
      <Icon className="size-5 text-white/70" strokeWidth={1.75} />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
        {label}
      </span>
    </Link>
  );
}
