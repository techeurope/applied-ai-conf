"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { IdCard, Users, CalendarDays, Settings, Compass, LogIn, LogOut, Shield, Briefcase, Ticket, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { applyDemoClockFromUrl } from "@/lib/conference-time";
import { StatusPill } from "./StatusPill";

type Tab = {
  href: string;
  label: string;
  icon: typeof IdCard;
  countKey?: "contacts";
};

const tabs: Tab[] = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/connect", label: "Connect", icon: IdCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const adminTab: Tab = { href: "/app/admin", label: "Admin", icon: Shield };
const teamTab: Tab = { href: "/app/team", label: "Team", icon: Briefcase };
const leadsTab: Tab = {
  href: "/app/contacts",
  label: "Leads",
  icon: Users,
  countKey: "contacts",
};
const voucherTab: Tab = { href: "/app/voucher", label: "Lunch", icon: Ticket };

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const me = useQuery(api.users.me);
  const myTeam = useQuery(api.partners.myTeam);
  const contacts = useQuery(api.contacts.list);
  const vouchers = useQuery(api.vouchers.myVouchers);
  const pendingTeamInvite = useQuery(api.partners.myPendingTeamInvite);
  const ensureUser = useMutation(api.users.ensureFromWorkos);
  // Routes that don't require authentication. The landing + public agenda
  // are obviously public. The team accept/join pages are also reachable
  // signed-out — they render their own sign-in CTA — so we must NOT
  // auto-redirect to /api/auth/sign-in from there, or the user never gets
  // to see what they were invited to.
  const isPublicAppPath =
    pathname === "/app" ||
    pathname === "/app/agenda" ||
    pathname?.startsWith("/app/agenda/") ||
    pathname?.startsWith("/app/about") ||
    pathname?.startsWith("/app/programme") ||
    pathname?.startsWith("/app/venue") ||
    pathname?.startsWith("/app/travel") ||
    pathname?.startsWith("/app/faq") ||
    pathname?.startsWith("/app/team/accept/");

  const hideNav =
    !auth.user ||
    pathname?.startsWith("/app/login") ||
    pathname?.startsWith("/app/onboarding") ||
    pathname?.startsWith("/app/link-ticket") ||
    pathname?.startsWith("/app/consent-details");

  const onGateBypassPath =
    pathname?.startsWith("/app/link-ticket") ||
    pathname?.startsWith("/app/settings") ||
    pathname?.startsWith("/app/u/") ||
    pathname?.startsWith("/app/consent-details") ||
    pathname?.startsWith("/app/team/accept/");

  // Routes that require auth. Anything in the public list, the sign-in page,
  // or the API surface is OK to render without a user. Everything else gets
  // a placeholder until the sign-in redirect (below) bounces them — otherwise
  // we briefly flash the private page (Voucher, Contacts, …) before the
  // redirect kicks in.
  const onPrivatePath =
    !isPublicAppPath &&
    !pathname?.startsWith("/app/login") &&
    !pathname?.startsWith("/api/");
  const blockedByAuth = onPrivatePath && !auth.loading && !auth.user;

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
    // A user with a pending partner-team invite never needs to verify a
    // ticket first — accepting the invite sets ticketLinkedAt for them.
    // So we skip the link-ticket gate in that case and let the
    // pending-invite redirect (below) route them to the accept page.
    if (pendingTeamInvite) return;
    if (!verified && !onGateBypassPath) {
      router.replace("/app/link-ticket");
    }
  }, [auth.user, me, verified, onGateBypassPath, pendingTeamInvite, router]);

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

  // Newly-signed-in invitee with a pending team invite → route them to the
  // explicit Accept / Decline page. Takes precedence over the verified
  // gate: accepting the invite sets ticketLinkedAt, so a Luma ticket isn't
  // a prerequisite here.
  useEffect(() => {
    if (!auth.user) return;
    if (!pendingTeamInvite) return;
    if (pathname?.startsWith("/app/team/accept/")) return;
    if (pathname?.startsWith("/app/onboarding")) return;
    router.replace(`/app/team/accept/${pendingTeamInvite.inviteId}`);
  }, [auth.user, pendingTeamInvite, pathname, router]);

  // If a signed-out visitor lands on an account-bound route, bounce them to
  // sign-in and bring them back here after auth.
  useEffect(() => {
    if (auth.loading) return;
    if (auth.user) return;
    if (isPublicAppPath) return;
    if (
      pathname?.startsWith("/app/login") ||
      pathname?.startsWith("/api/")
    ) {
      return;
    }
    if (typeof window === "undefined") return;
    const returnTo = encodeURIComponent(pathname ?? "/app");
    window.location.href = `/api/auth/sign-in?return_to=${returnTo}`;
  }, [auth.loading, auth.user, isPublicAppPath, pathname]);

  const visibleTabs = (() => {
    const base = [...tabs];
    // Team + Leads are partner-team-only (admins always get them too).
    // Order is Connect → [Voucher] → Team → Leads → Settings, so the
    // partner flow reads top-down: scan, then check the team rollup,
    // then drill into individual leads.
    const isAdmin = me?.accessLevel === "admin";
    if (myTeam?.team || isAdmin) {
      const settingsIdx = base.findIndex((t) => t.href === "/app/settings");
      base.splice(settingsIdx, 0, teamTab, leadsTab);
    }
    if (vouchers && vouchers.length > 0) {
      // Slot Voucher after Connect so it's easy to flash at the lunch table.
      const connectIdx = base.findIndex((t) => t.href === "/app/connect");
      base.splice(connectIdx + 1, 0, voucherTab);
    }
    if (isAdmin) base.push(adminTab);
    return base;
  })();

  // All Convex queries that gate which tabs render must resolve before we
  // paint the nav — otherwise tabs pop in one at a time as each query
  // finishes, causing visible layout shift.
  const tabsReady =
    me !== undefined && myTeam !== undefined && vouchers !== undefined;

  const counts = {
    contacts: contacts?.length,
  } as const;

  // Sticky descendants (the agenda's filter bar) need to know the header
  // height so they can sit just below it. The header's height shifts when
  // we add/remove rows (status pill, nav) — easier to measure at runtime
  // than hardcode. We expose it via a CSS var on the page wrapper.
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState<number | null>(null);
  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const update = () => setHeaderH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="min-h-[100dvh] bg-background text-foreground flex flex-col selection:bg-white/20"
      style={headerH ? ({ "--app-header-h": `${headerH}px` } as React.CSSProperties) : undefined}
    >
      <header
        ref={headerRef}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-white/10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-baseline gap-2.5 min-w-0 flex-1">
              <Link
                href="/"
                className="font-mono text-sm sm:text-base font-bold tracking-wide text-white/55 hover:text-white transition-colors shrink-0"
              >
                Applied AI Conf
              </Link>
              <span className="font-mono text-white/25 text-sm sm:text-base shrink-0" aria-hidden>
                /
              </span>
              <Link
                href="/app"
                className="font-mono text-sm tracking-wide truncate text-white hover:text-white/80 transition-colors"
                aria-current={pathname === "/app" ? "page" : undefined}
              >
                Conf day
              </Link>
              <span className="hidden sm:inline-flex items-baseline gap-2 font-mono text-sm text-white/55 tracking-wide shrink-0">
                <span className="text-white/30">·</span>
                <span>May 28, 2026</span>
              </span>
              <span className="ml-2 shrink-0">
                <StatusPill />
              </span>
            </div>
            <div className="flex items-center gap-4">
              {auth.user ? (
                <button
                  type="button"
                  onClick={() => auth.signOut({ returnTo: "/app" })}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
                >
                  <LogOut className="size-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              ) : (
                <a
                  href={`/api/auth/sign-in?return_to=${encodeURIComponent(pathname ?? "/app")}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 hover:text-white transition-colors"
                >
                  <LogIn className="size-3.5" strokeWidth={1.75} />
                  Sign in
                </a>
              )}
            </div>
          </div>

          {!hideNav && (
            <nav aria-label="Primary" className="-mx-4 sm:-mx-6 border-t border-white/5">
              <ul className="flex overflow-x-auto no-scrollbar px-4 sm:px-6">
                {tabsReady
                  ? visibleTabs.map(({ href, label, icon: Icon, countKey }) => {
                      // /app must be exact-match so it doesn't light up on every
                      // nested route.
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
                    })
                  : /* Skeleton tabs — render the same labels the real nav
                       will show with text-transparent + a pulsing background,
                       so the chip widths match the real labels exactly. When
                       the gating queries (me, myTeam, vouchers) resolve and
                       we swap to the real nav, individual chips don't move. */
                    [
                      { label: "Home", icon: Home },
                      { label: "Agenda", icon: CalendarDays },
                      { label: "Connect", icon: IdCard },
                      { label: "Lunch", icon: Ticket },
                      { label: "Team", icon: Briefcase },
                      { label: "Leads", icon: Users },
                      { label: "Settings", icon: Settings },
                      { label: "Admin", icon: Shield },
                    ].map(({ label, icon: Icon }) => (
                      <li key={label} className="shrink-0" aria-hidden>
                        <span className="flex items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] border-b-2 border-transparent">
                          <Icon
                            className="size-4 text-white/[0.08] animate-pulse"
                            strokeWidth={1.75}
                          />
                          <span className="text-transparent bg-white/[0.08] rounded animate-pulse leading-tight">
                            {label}
                          </span>
                        </span>
                      </li>
                    ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 w-full">
        {blockedByAuth ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center text-sm text-white/50">
            Sign in required — redirecting…
          </div>
        ) : pathname === "/app" ? (
          // The /app home owns its full-width layout.
          children
        ) : (
          // Every other /app/* route shares the same wide rail as the home and
          // admin so they can use horizontal space (two-column lists, tables,
          // photo + meta layouts, etc).
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-12">{children}</div>
        )}
      </main>
    </div>
  );
}
