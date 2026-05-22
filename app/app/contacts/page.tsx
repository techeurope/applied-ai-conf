"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function ContactsPage() {
  const contacts = useQuery(api.contacts.list);

  return (
    <div className="space-y-5 pt-1">
      <div className="flex justify-end">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          {contacts?.length ?? 0} {contacts?.length === 1 ? "person" : "people"}
        </span>
      </div>

      {contacts === undefined && (
        <p className="font-mono text-xs text-white/40">Loading…</p>
      )}

      {contacts && contacts.length === 0 && (
        <div className="rounded-2xl glass-card p-8 text-center">
          <p className="text-base text-white/80 mb-1">No contacts yet.</p>
          <p className="text-sm text-white/50 mb-6">Scan someone&apos;s QR to add them.</p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-medium hover:scale-[1.02] transition-all ring-1 ring-white/30"
          >
            Open scanner
          </Link>
        </div>
      )}

      {contacts && contacts.length > 0 && (
        <ul className="space-y-2">
          {contacts.map(({ contact, user }) => (
            <li key={contact._id}>
              <Link
                href={`/app/contacts/${contact._id}`}
                className="block glass-card rounded-2xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="font-mono text-sm text-white">{user?.name}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {[user?.role, user?.company].filter(Boolean).join(" · ")}
                </div>
                {contact.notes && (
                  <div className="text-xs text-white/60 mt-2 line-clamp-2">{contact.notes}</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
