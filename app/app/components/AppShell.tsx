"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { ScanLine, Users, CalendarDays, Settings, Compass, LogOut, Shield, Briefcase, UtensilsCrossed, Home } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { applyDemoClockFromUrl } from "@/lib/conference-time";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  countKey?: "contacts";
};

const tabs: Tab[] = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/scan", label: "Scan", icon: ScanLine },
  { href: "/app/contacts", label: "Contacts", icon: Users, countKey: "contacts" },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const adminTab: Tab = { href: "/app/admin", label: "Admin", icon: Shield };
const teamTab: Tab = { href: "/app/team", label: "Team", icon: Briefcase };
const vendorTab: Tab = { href: "/app/vendor", label: "Redeem", icon: UtensilsCrossed };

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const myTeam = useQuery(api.partners.myTeam);
  const contacts = useQuery(api.contacts.list);
  const ensureUser = useMutation(api.users.ensureFromWorkos);
  const hideNav =
    (pathname === "/app" && !auth.user) ||
    pathname?.startsWith("/app/login") ||
    pathname?.startsWith("/app/onboarding") ||
    pathname?.startsWith("/app/link-ticket") ||
    pathname?.startsWith("/app/consent-details");

  const onGateBypassPath =
    pathname?.startsWith("/app/link-ticket") ||
    pathname?.startsWith("/app/settings") ||
    pathname?.startsWith("/app/u/") ||
    pathname?.startsWith("/app/consent-details");

  useEffect(() => {
    applyDemoClockFromUrl();
  }, [pathname]);

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
      router.replace("/app/link-ticket");
    }
  }, [auth.user, me, verified, onGateBypassPath, router]);

  useEffect(() => {
    if (!auth.user || !me?.onboardingRequired || hideNav) return;
    // Only push to onboarding once the user is verified — otherwise the
    // link-ticket gate takes precedence.
    if (!verified) return;
    router.replace("/app/onboarding");
  }, [auth.user, hideNav, me?.onboardingRequired, verified, router]);

  useEffect(() => {
    if (me?.deactivatedAt) {
      auth.signOut({ returnTo: "/app?kicked=1" });
    }
  }, [auth, me?.deactivatedAt]);

  const visibleTabs = (() => {
    const base = [...tabs];
    if (myTeam?.team) {
      // Insert team tab after Contacts (index of contacts tab + 1).
      const contactsIdx = base.findIndex((t) => t.href === "/app/contacts");
      base.splice(contactsIdx + 1, 0, teamTab);
    }
    if (me?.accessLevel === "vendor" || me?.accessLevel === "admin") {
      base.push(vendorTab);
    }
    if (me?.accessLevel === "admin") base.push(adminTab);
    return base;
  })();

  const counts = {
    contacts: contacts?.length,
  } as const;

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
                href="/app"
                className="font-mono text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
              >
                app
              </Link>
              {auth.user && (
                <button
                  type="button"
                  onClick={() => auth.signOut({ returnTo: "/app" })}
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
                {visibleTabs.map(({ href, label, icon: Icon, countKey }) => {
                  // /app must be an exact match (otherwise it'd light up on every nested route).
                  const active =
                    href === "/app"
                      ? pathname === "/app"
                      : pathname === href || pathname?.startsWith(href + "/");
                  const count = countKey ? counts[countKey] : undefined;
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
                        {count !== undefined && count > 0 && (
                          <span
                            className={`tabular-nums text-[10px] tracking-normal ${
                              active ? "text-white/70" : "text-white/30"
                            }`}
                          >
                            · {count}
                          </span>
                        )}
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
