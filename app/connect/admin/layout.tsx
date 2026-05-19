"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { ReactNode } from "react";

const subTabs = [
  { href: "/connect/admin", label: "Overview" },
  { href: "/connect/admin/attendees", label: "Attendees" },
  { href: "/connect/admin/luma", label: "Luma" },
  { href: "/connect/admin/codes", label: "Claim codes" },
  { href: "/connect/admin/audit", label: "Audit" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  }
  if (me === null || me.accessLevel !== "admin") {
    return (
      <div className="space-y-2">
        <h1 className="font-mono font-bold text-xl">Not allowed</h1>
        <p className="text-sm text-white/60">This area is for admins only.</p>
        <Link href="/connect" className="font-mono text-xs underline">
          ← back to connect
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Admin</p>
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-[1.1] pb-1 text-glow">
          Conference desk
        </h1>
      </header>
      <nav aria-label="Admin sections" className="-mx-1 border-b border-white/10">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar">
          {subTabs.map(({ href, label }) => {
            const active =
              href === "/connect/admin"
                ? pathname === "/connect/admin"
                : pathname?.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`inline-flex items-center px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] border-b-2 transition-colors ${
                    active
                      ? "text-white border-white"
                      : "text-white/40 border-transparent hover:text-white/80"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div>{children}</div>
    </div>
  );
}
