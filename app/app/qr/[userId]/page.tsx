"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { UserQR } from "../../components/UserQR";

export default function QRForUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const user = useQuery(api.users.getById, { userId: userId as Id<"users"> });

  if (user === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (user === null) {
    return <p className="text-sm text-white/60">User not found.</p>;
  }

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <h1 className="font-mono font-bold text-2xl sm:text-3xl tracking-tighter leading-[1.1] pb-1 text-glow">
          {user.name}
        </h1>
        <p className="text-sm text-white/60">
          {[user.role, user.company].filter(Boolean).join(" · ")}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
          {user.isSpeaker ? "Speaker" : "Attendee"}
        </p>
      </header>

      <UserQR token={user.publicToken ?? user._id} />

      <p className="text-xs text-white/40 leading-relaxed">
        Open this page on a phone or another device, then scan with the Connect scanner on a
        different device.
      </p>
    </div>
  );
}
