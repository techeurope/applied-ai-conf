import Link from "next/link";
import type { ReactNode } from "react";

// Day-of admin runbook. Short, scannable, "if X then do Y" format. Lives
// at /app/admin/playbook so anyone with admin access can pull it up on
// their phone while walking around the venue. Cover only the common
// failures — anything truly weird, ping Tim on Slack.

export default function PlaybookPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <header className="space-y-2">
        <h1 className="font-mono text-2xl font-bold">Help-desk playbook</h1>
        <p className="text-sm text-white/60">
          Common attendee issues at the conference and how to resolve them.
          If something here is wrong or missing, ping Tim.
        </p>
      </header>

      <Section title="🎟️ Ticket / sign-in problems">
        <Item q="“I can’t sign in” / “The app keeps asking me to verify a ticket.”">
          <p>
            They probably signed up with a different email than the one on Luma.
            Open <AdminLink href="/app/admin/attendees" label="Attendees" />,
            find their app account, scroll to <b>Luma ticket</b>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>
              If <b>not yet linked</b>: type their Luma email in the input and
              hit <b>Link</b>.
            </li>
            <li>
              If the input rejects with <i>“already linked to another
              account”</i>: that ticket is on a different account they made.
              Click the orange{" "}
              <b>Force-transfer if linked to another account →</b> link to
              move it.
            </li>
            <li>
              If they don’t have a Luma ticket at all (speaker, walk-in,
              vendor): mint a claim code from{" "}
              <AdminLink href="/app/admin/codes" label="Claim codes" /> and
              hand them the 8-char code — they paste it into{" "}
              <Mono>/app/link-ticket</Mono>.
            </li>
          </ul>
        </Item>

        <Item q="“I have two accounts and want to move the ticket between them.”">
          <p>
            <b>Self-serve path (preferred):</b> on the destination account, go
            to <Mono>/app/link-ticket</Mono> and enter the original Luma
            email. Code → enter → the holder gets an Approve / Decline email.
            Approve and the ticket moves with any unredeemed vouchers.
          </p>
          <p>
            <b>If the holder email is unreachable</b> (changed jobs, lost
            access): use the admin Force-transfer button described above. Use
            this only when self-serve isn’t possible — leave a reason in the
            prompt so the audit log is useful.
          </p>
        </Item>

        <Item q="“I never got the transfer-approval email.”">
          <p>
            Resend may have hiccupped. Two options:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>
              Wait 60 seconds, check spam. Re-trigger by entering the Luma
              email + code on <Mono>/app/link-ticket</Mono> again — the
              existing request is reused if it’s still the same requester.
            </li>
            <li>
              If urgent: admin-force the transfer from{" "}
              <AdminLink href="/app/admin/attendees" label="Attendees" /> →
              destination account → <b>Force-transfer</b>. The pending email
              request becomes moot.
            </li>
          </ul>
        </Item>
      </Section>

      <Section title="🍱 Voucher issues">
        <Item q="“My lunch voucher isn’t showing up.”">
          <p>
            Most attendees auto-get a <Mono>lunch</Mono> voucher the first
            time they open <Mono>/app/voucher</Mono>. If they show empty
            there, check:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>
              They’re signed in <i>and</i> their ticket is linked (Luma ticket
              card on their attendee detail page shows linked).
            </li>
            <li>
              Their account isn’t deactivated. If it is, reactivate from{" "}
              <AdminLink href="/app/admin/attendees" label="Attendees" />.
            </li>
            <li>
              Manually issue from the attendee detail page → Vouchers section
              → <b>+ Issue lunch</b>.
            </li>
          </ul>
        </Item>

        <Item q="“The voucher shows as redeemed but I didn’t use it.”">
          <p>
            Could be a duplicate scan at the counter. Check the voucher’s row
            on the attendee detail page (shows redeemed timestamp). If
            genuinely an error, issue them a fresh voucher (
            <b>+ Issue {`<kind>`}</b>) and leave a note. Don’t un-redeem the
            old one — keep the audit trail.
          </p>
        </Item>

        <Item q="“We just transferred their ticket — does the lunch follow?”">
          <p>
            <b>Yes for unredeemed vouchers</b> (admin force-transfer and
            self-serve approval both move them). Redeemed vouchers stay on
            the original account as history.
          </p>
          <p className="text-amber-200/90">
            <b>Caveat:</b> the external lunch link (Kalle Halle coupon) is
            already minted and stays on the same external URL. If the
            original holder already clicked it, the new holder might find it
            already “open”. Walk them to the counter and issue a manual lunch
            voucher there if needed.
          </p>
        </Item>
      </Section>

      <Section title="👤 Account issues">
        <Item q="“I’m an admin / speaker but the app doesn’t show it.”">
          <p>
            For <b>admin</b>: check{" "}
            <AdminLink href="/app/admin/attendees" label="Attendees" /> → the
            user → <i>role</i> badge. If wrong, use the bootstrap CLI (Tim
            knows) or grant via Convex dashboard. Self-serve grant isn’t a
            UI today.
          </p>
          <p>
            For <b>speaker</b>: same page, click <b>Edit profile</b>, flip
            the <i>Is speaker</i> toggle.
          </p>
        </Item>

        <Item q="“I want to delete my account.”">
          <p>
            Self-serve from <Mono>/app/settings</Mono> → Danger zone → Delete
            account. Cascades cleanly. If the user can’t reach Settings
            (offline, broken state), deactivate them from{" "}
            <AdminLink href="/app/admin/attendees" label="Attendees" /> →{" "}
            <b>Deactivate</b> — recoverable, doesn’t hard-delete.
          </p>
        </Item>
      </Section>

      <Section title="📱 App / offline issues">
        <Item q="“The app is stuck loading / shows skeletons.”">
          <p>
            Likely offline. Look for the amber <b>OFFLINE</b> chip in the
            header — if visible, get them on wifi and refresh. If the chip
            isn’t there but it’s still stuck, hard-refresh{" "}
            <Mono>Cmd+Shift+R</Mono> / pull-to-refresh.
          </p>
        </Item>

        <Item q="“Random ‘Server Error’ messages everywhere.”">
          <p>
            Usually a flaky network. Reload should fix. If it doesn’t, in
            DevTools → Application → Storage → <b>Clear site data</b>, then
            sign in again. Last resort: ping #conference on Slack with a
            screenshot.
          </p>
        </Item>

        <Item q="“I redeemed my voucher and now nothing works.”">
          <p>
            Redemption is final and shouldn’t affect anything else. If their
            whole app broke at the same time, it’s a network blip, not the
            redemption. Refresh.
          </p>
        </Item>
      </Section>

      <Section title="🛠️ Power tools">
        <ul className="list-disc pl-5 space-y-2 text-white/70 text-sm">
          <li>
            <AdminLink href="/app/admin/audit" label="Audit log" /> — every
            admin action and transfer is logged. Use this to figure out who
            did what when.
          </li>
          <li>
            <AdminLink href="/app/admin/luma" label="Luma" /> — force-sync
            Luma attendees on demand if someone just registered and isn’t
            showing up.
          </li>
          <li>
            <AdminLink href="/app/admin/codes" label="Claim codes" /> — mint
            8-char codes for speakers/walk-ins who never bought a Luma ticket.
          </li>
        </ul>
      </Section>

      <p className="text-xs text-white/40 pt-4 border-t border-white/10">
        Anything weirder than this? Slack <Mono>#conference</Mono> and
        screenshot what you’re seeing.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-lg font-bold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Item({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-2">
      <h3 className="font-mono text-sm font-bold text-white">{q}</h3>
      <div className="space-y-2 text-sm text-white/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="font-mono underline underline-offset-2">
      {label}
    </Link>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-white/95 bg-white/5 ring-1 ring-white/10 rounded px-1.5 py-0.5 text-[12px]">
      {children}
    </code>
  );
}
