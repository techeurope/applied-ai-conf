"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { ScanLine, Users, CalendarDays, Settings, Compass, LogOut, Shield } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";

const tabs = [
  { href: "/connect/scan", label: "Scan", icon: ScanLine },
  { href: "/connect/contacts", label: "Contacts", icon: Users },
  { href: "/connect/directory", label: "Directory", icon: Compass },
  { href: "/connect/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/connect/settings", label: "Settings", icon: Settings },
];

const adminTab = { href: "/connect/admin", label: "Admin", icon: Shield } as const;

export function ConnectShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const ensureUser = useMutation(api.users.ensureFromWorkos);
  const hideNav =
    (pathname === "/connect" && !auth.user) ||
    pathname?.startsWith("/connect/login") ||
    pathname?.startsWith("/connect/onboarding") ||
    pathname?.startsWith("/connect/link-ticket") ||
    pathname?.startsWith("/connect/consent-details");

  const onGateBypassPath =
    pathname?.startsWith("/connect/link-ticket") ||
    pathname?.startsWith("/connect/settings") ||
    pathname?.startsWith("/connect/u/") ||
    pathname?.startsWith("/connect/consent-details");

  useEffect(() => {
    if (!auth.user) return;
    const fullName = [auth.user.firstName, auth.user.lastName].filter(Boolean).join(" ").trim();
    ensureUser({
      email: auth.user.email ?? undefined,
      name: fullName || auth.user.email || undefined,
    }).catch(() => undefined);
  }, [auth.user, ensureUser]);

  const verified =
    !!me &&
    (!!me.ticketLinkedAt || me.accessLevel === "admin");

  useEffect(() => {
    if (!auth.user || !me) return;
    if (!verified && !onGateBypassPath) {
      router.replace("/connect/link-ticket");
    }
  }, [auth.user, me, verified, onGateBypassPath, router]);

  useEffect(() => {
    if (!auth.user || !me?.onboardingRequired || hideNav) return;
    // Only push to onboarding once the user is verified — otherwise the
    // link-ticket gate takes precedence.
    if (!verified) return;
    router.replace("/connect/onboarding");
  }, [auth.user, hideNav, me?.onboardingRequired, verified, router]);

  useEffect(() => {
    if (me?.deactivatedAt) {
      auth.signOut({ returnTo: "/connect?kicked=1" });
    }
  }, [auth, me?.deactivatedAt]);

  const visibleTabs =
    me?.accessLevel === "admin" ? [...tabs, adminTab] : tabs;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col selection:bg-white/20">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between gap-3 py-3">
            <Link
              href="/"
              className="font-mono text-sm sm:text-base font-bold tracking-wide text-white hover:text-white/70 transition-colors"
            >
              Applied AI Conf
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/connect"
                className="font-mono text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
              >
                connect
              </Link>
              {auth.user && (
                <button
                  type="button"
                  onClick={() => auth.signOut({ returnTo: "/connect" })}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
                >
                  <LogOut className="size-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              )}
            </div>
          </div>

          {!hideNav && (
            <nav aria-label="Primary" className="-mx-4 sm:-mx-6 border-t border-white/5">
              <ul className="flex overflow-x-auto no-scrollbar px-4 sm:px-6">
                {visibleTabs.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname?.startsWith(href + "/");
                  return (
                    <li key={href} className="shrink-0">
                      <Link
                        href={href}
                        className={`flex items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] border-b-2 transition-colors ${
                          active
                            ? "text-white border-white"
                            : "text-white/40 border-transparent hover:text-white/80"
                        }`}
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">{children}</div>
      </main>
    </div>
  );
}
