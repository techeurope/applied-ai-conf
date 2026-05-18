"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { UserQR } from "../components/UserQR";

export default function MyQRPage() {
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (me === null) {
    return <p className="text-sm text-white/60">Not signed in.</p>;
  }

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Your QR
        </h1>
        <p className="text-sm text-white/60">
          Show this to people you meet. They scan, they get your profile.
        </p>
      </header>

      <UserQR userId={me._id} />

      <div className="glass-card rounded-2xl p-5 space-y-2">
        <div className="font-mono text-sm text-white">{me.name}</div>
        <div className="text-xs text-white/50">
          {[me.role, me.company].filter(Boolean).join(" · ") || "Add a role and company in Settings"}
        </div>
      </div>
    </div>
  );
}
