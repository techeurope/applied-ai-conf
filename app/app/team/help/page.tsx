"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  IdCard,
  Users,
  BarChart3,
  ScanLine,
  Mail,
  ChevronLeft,
  Globe,
  LifeBuoy,
} from "lucide-react";
import { api } from "@convex/_generated/api";

export default function TeamHelpPage() {
  const team = useQuery(api.partners.myTeam);

  return (
    <div className="space-y-8 pt-1 pb-12 max-w-3xl">
      <header className="space-y-2">
        <Link
          href="/app/team"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.75} />
          team
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // PARTNER GUIDE
        </p>
        <h1 className="font-mono font-bold text-3xl sm:text-4xl tracking-tighter leading-tight">
          How the partner section works
        </h1>
        <p className="text-sm text-white/60 leading-relaxed">
          Everything you need to run your booth at Applied AI Conf — scan
          visitors, share leads with your team, and review analytics afterwards.
        </p>
      </header>

      <Section icon={Users} title="// THE BASICS">
        <p>
          A <strong>partner team</strong> is a shared workspace for everyone at
          your booth. Anything one teammate scans becomes a lead for the whole
          team — you see each other&apos;s captures, notes, and lead status in
          one place at{" "}
          <Code>/app/team/leads</Code>.
        </p>
        <p>
          Teams have two roles:
        </p>
        <ul className="space-y-1.5 list-none">
          <Bullet>
            <strong>Owner</strong> — invites teammates and promotes/demotes
            members. There can be more than one owner.
          </Bullet>
          <Bullet>
            <strong>Member</strong> — scans, takes notes, sees the shared lead
            pool and team analytics.
          </Bullet>
        </ul>
        <p>
          {team?.role === "owner" ? (
            <>You&apos;re an <strong>owner</strong> of {team.team.name}.</>
          ) : team?.role === "member" ? (
            <>You&apos;re a <strong>member</strong> of {team.team.name}.</>
          ) : (
            <>You don&apos;t appear to be on a partner team right now.</>
          )}
        </p>
      </Section>

      <Section icon={ScanLine} title="// SCANNING ATTENDEES">
        <p>
          The <Code>Connect</Code> tab is where the action happens. It has two
          modes:
        </p>
        <ul className="space-y-2 list-none">
          <Bullet>
            <strong>Badge</strong> mode shows{" "}
            <em>your</em> QR. Use this when an attendee wants to scan you (e.g.
            they want to follow up later). Tap the QR to enlarge it.
          </Bullet>
          <Bullet>
            <strong>Scanner</strong> mode opens your phone camera. Point it at
            an attendee&apos;s QR (on their phone or printed badge). The scan
            captures their name, role, company, and (if shared) LinkedIn. It
            also creates a <em>lead</em> for your team automatically.
          </Bullet>
        </ul>
        <p className="text-white/60 text-xs">
          If the camera doesn&apos;t open, your browser may be blocking it.
          Tap &quot;Upload&quot; instead and pick a photo of the QR you took
          earlier.
        </p>
      </Section>

      <Section icon={Users} title="// LEADS — WHAT YOUR TEAM CAN SEE">
        <p>
          Go to <Link href="/app/team/leads" className="underline text-white hover:text-white/80">
          /app/team/leads</Link> for the shared list. Every row is one
          attendee your team has scanned, with:
        </p>
        <ul className="space-y-1.5 list-none">
          <Bullet>Their profile (name, role, company, LinkedIn)</Bullet>
          <Bullet>When they were first scanned + by whom</Bullet>
          <Bullet>A <strong>notes field</strong> any teammate can edit</Bullet>
          <Bullet>
            A <strong>lead status</strong> tag — Hot / Warm / Cold —
            for triage after the event
          </Bullet>
        </ul>
        <p className="text-white/60 text-xs">
          Notes are shared in real time. If two teammates open the same lead
          and type at the same time, the last save wins — write longer notes
          one at a time.
        </p>
      </Section>

      <Section icon={BarChart3} title="// ANALYTICS">
        <p>
          <Link
            href="/app/team/analytics"
            className="underline text-white hover:text-white/80"
          >
            /app/team/analytics
          </Link>{" "}
          shows you how your team is doing:
        </p>
        <ul className="space-y-1.5 list-none">
          <Bullet>
            <strong>Unique leads</strong> — distinct attendees scanned (re-scans
            of the same person don&apos;t double-count)
          </Bullet>
          <Bullet>
            <strong>Total scans</strong> — every scan event, including
            re-scans
          </Bullet>
          <Bullet>
            <strong>Active scanners / Members</strong> — how many of your
            teammates have scanned at least once
          </Bullet>
          <Bullet>
            <strong>Hot rate</strong> — the percent of leads marked Hot. The
            quickest measure of qualified pipeline from the booth.
          </Bullet>
          <Bullet>
            <strong>Lead status bar</strong> — distribution across Hot / Warm
            / Cold / unset
          </Bullet>
          <Bullet>
            <strong>Scans by hour</strong> — bar chart over the conference
            day, peak hour highlighted
          </Bullet>
          <Bullet>
            <strong>Leaderboard</strong> — per-teammate unique leads + total
            scans, sorted
          </Bullet>
        </ul>
      </Section>

      <Section icon={Mail} title="// INVITING TEAMMATES">
        <p>
          On{" "}
          <Link href="/app/team" className="underline text-white hover:text-white/80">/app/team</Link>{" "}
          → &quot;Invite a teammate&quot; → enter their email → Invite. They
          get an email with an Accept link. The pending invite shows up in
          the &quot;Pending invites&quot; section until they answer.
        </p>
        <p>
          <strong>If they decline:</strong> the status flips to{" "}
          <em>declined</em>. Hit &quot;Send again&quot; on their row to
          re-open the invite.
        </p>
      </Section>

      <Section icon={Globe} title="// YOUR TEAM'S PUBLIC PROFILE">
        <p>
          Attendees can find your booth on{" "}
          {team?.team?.slug ? (
            <Link
              href={`/app/partner/${team.team.slug}`}
              className="underline text-white hover:text-white/80"
            >
              /app/partner/{team.team.slug}
            </Link>
          ) : (
            <Code>/app/partner/&lt;your-slug&gt;</Code>
          )}{" "}
          — public, no sign-in required. It shows your team name, tier, booth
          location, website, bio, and the team members who opted into the
          directory.
        </p>
        <p className="text-white/60 text-xs">
          Members only appear publicly if they enable &quot;List me in the
          attendee directory&quot; in their settings. By default they&apos;re
          private. Their notes and scan history are <em>never</em> public.
        </p>
      </Section>

      <Section icon={IdCard} title="// WHAT ATTENDEES CAN SEE">
        <p>
          When you scan an attendee, you see their full profile. They
          don&apos;t see a notification that you scanned them — but the
          scan creates a contact record you can reach out to later.
        </p>
        <p>
          When an attendee scans <em>your</em> badge, they see your public
          profile (name, role, company, LinkedIn if you&apos;ve set it,
          headline). They <strong>don&apos;t</strong> see your team&apos;s
          internal notes about other leads.
        </p>
      </Section>

      <Section icon={LifeBuoy} title="// WHEN SOMETHING&apos;S WRONG">
        <ul className="space-y-1.5 list-none">
          <Bullet>
            <strong>Camera won&apos;t open in Scanner mode:</strong> your
            browser may have blocked it. Try Safari (iOS) or Chrome
            (Android). The in-app browser inside Slack / email apps often
            blocks camera access — open the URL in your real browser instead.
          </Bullet>
          <Bullet>
            <strong>Scan failed / &quot;not an attendee QR&quot;:</strong> the
            QR you scanned isn&apos;t from Applied AI Conf. Make sure the
            attendee opened their <Code>/app</Code> badge, not a third-party
            QR.
          </Bullet>
          <Bullet>
            <strong>A teammate joined but doesn&apos;t show up:</strong> they
            may have accepted but not refreshed yet. Have them hard-refresh{" "}
            <Link href="/app/team" className="underline">/app/team</Link>.
          </Bullet>
          <Bullet>
            <strong>Still stuck?</strong> Find a crew member in a black
            shirt at the venue, or email{" "}
            <a
              href="mailto:hello@techeurope.io"
              className="text-white underline hover:text-white/80"
            >
              hello@techeurope.io
            </a>
            .
          </Bullet>
        </ul>
      </Section>

      <div className="pt-4 border-t border-white/5">
        <Link
          href="/app/team"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.75} />
          Back to your team
        </Link>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
        <Icon className="size-3" strokeWidth={2} />
        {title}
      </p>
      <div className="space-y-3 text-sm text-white/80 leading-relaxed [&_strong]:text-white">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] text-white/90 bg-white/5 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="font-mono text-white/30 mt-0.5">›</span>
      <span className="flex-1">{children}</span>
    </li>
  );
}
