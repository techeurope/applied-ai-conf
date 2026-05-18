import Link from "next/link";

export default function ConsentDetailsPage() {
  return (
    <article className="space-y-6 pt-4 max-w-prose">
      <header className="space-y-2">
        <h1 className="font-mono text-xl tracking-tight">What you&apos;re consenting to</h1>
        <p className="text-zinc-400 text-sm">
          Plain-language explanation of each toggle on the privacy screen. Every one of these is
          optional and can be flipped any time in Settings.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Show my profile when scanned</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          When someone points their camera at your QR code, your profile (name, role, company,
          LinkedIn URL, bio) is shown to them and saved into their contact list. Turn this off and
          your QR stops working — nobody can scan you.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">List me in the attendee directory</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Logged-in attendees can browse you in a searchable directory before and during the event,
          tap your row, and add you without scanning. Turn off to stay invisible to the directory
          but still scannable.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Use my profile for fit-scoring</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          We compute a numeric similarity between your stated goals and other attendees&apos;
          profiles, surfacing 2-3 overlap themes. The computation is static — no live AI calls at
          scan time. The embeddings are stored on Convex and deleted with your account.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Email me an end-of-day summary</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          One transactional email per event day listing who you scanned and your notes. No
          marketing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Team sharing (when on a team)</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          If you join a team account (typically a partner company), every contact your team scans
          is visible to every team member. This means when a team-member scans someone, the whole
          team sees that person&apos;s profile. The scanned person consents to this when they
          enable &quot;Show my profile when scanned&quot; — the consent text on that toggle calls
          out team sharing explicitly. Turn this off at the team level to keep your scans private
          to you.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Live reference, not snapshot</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Connect doesn&apos;t copy your profile into other people&apos;s contact lists. When you
          update your bio, everyone who scanned you sees the new version. When you delete your
          account, you vanish from every list and the notes other people wrote about you are
          deleted with you.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-mono text-sm text-foreground">Retention</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Your data lives on Convex (US) and WorkOS handles authentication. Both processors have
          DPAs. You can delete everything from Settings → Delete account. No backups outside the
          live system.
        </p>
      </section>

      <p className="text-xs text-zinc-500">
        See also the full <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </article>
  );
}
