"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { ReactNode } from "react";

const subTabs = [
  { href: "/app/admin", label: "Overview" },
  { href: "/app/admin/agenda", label: "Agenda" },
  { href: "/app/admin/attendees", label: "Attendees" },
  { href: "/app/admin/luma", label: "Luma" },
  { href: "/app/admin/partners", label: "Partners" },
  { href: "/app/admin/codes", label: "Claim codes" },
  { href: "/app/admin/stage", label: "Stage" },
  { href: "/app/admin/audit", label: "Audit" },
  { href: "/app/admin/playbook", label: "Playbook" },
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
        <Link href="/app" className="font-mono text-xs underline">
          ← back to connect
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Admin sub-nav — sits directly under the main tab bar with no
          intermediate headline. The "Admin" label and identity are already
          carried by the active primary tab + the breadcrumb in AppShell. */}
      <nav aria-label="Admin sections" className="border-b border-white/10">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar">
          {subTabs.map(({ href, label }) => {
            const active =
              href === "/app/admin"
                ? pathname === "/app/admin"
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
