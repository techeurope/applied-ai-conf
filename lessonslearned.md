# Applied AI Conf — Lessons Learned

Retrospective on the build-up and the day itself. Captures what broke, what
worked, and what to do differently for the next event. Written after the
conference, by the people who lived it.

## What worked well

- **Live-patchable agenda.** The admin `agenda:bootstrapPatchSession`
  internal mutation plus the reactive `useQuery(api.agenda.list)` on the
  stage host view and the home "Right Now" card meant that when the
  agenda slipped 15 minutes mid-day, a single batch shell loop updated
  every session and every open tab repainted within 10 seconds.
  No emails. No "please refresh." Worth keeping this pattern for any
  data that might change live.

- **Holder-approval ticket transfer flow.** Built day-before to fix the
  Nima duplicate-link incident. Worked end-to-end on prod once attendees
  needed it: requester proves Luma inbox ownership, current holder
  approves via emailed token link, atomic swap moves unredeemed
  vouchers with the ticket. The admin force-transfer escape hatch was
  used zero times — the self-serve path was enough.

- **Service worker for offline reload.** After the false starts (see
  below), the final shape — runtime caching only, NetworkFirst on
  `/app/*` docs, NetworkOnly on admin/Convex/WorkOS, CacheWarmer
  pre-fetching key routes after sign-in — meant attendees who reloaded
  their voucher page on flaky venue wifi saw the QR instead of the
  Chrome dino.

- **Pre-minted lunch vouchers on onboarding completion.** Once we moved
  voucher minting from JIT to the onboarding mutation, the entire offline
  lunch flow worked from the user's first online second. The
  `CacheWarmer` populated the SW cache, `useCachedQuery` snapshotted the
  voucher data with `externalUrl` to localStorage, and people could
  flash the lunch QR at the counter without ever having opened the
  voucher tab while online.

- **Admin playbook.** A scannable `/app/admin/playbook` page with
  "if X then click these buttons" instructions for the common day-of
  issues. Day-of, nobody had time to read a doc — the inline links to
  the right admin sub-pages were the actual win.

- **Diagnostic tooling pattern.** Several incidents (Nima, legacy
  voucher gap, orphan accounts, "where are the missing 6", the
  `lunch_test_only` voucher leak) were solved within minutes by writing
  a one-off `internalQuery` or `internalMutation`, running it, reading
  the result, and either applying a fix or deleting the helper. Keep
  the pattern; the file-and-delete cycle was effective.

- **Auto-recovery crons saved conference day.** The WorkOS signup
  pipeline leaks ghost unverified records (see below). Mid-day we
  shipped three 5-minute crons in `convex/workos_recovery.ts`:
  (1) `sweepUnverified` — finds `email_verified=false` records older
  than 5 min and converts them into 7-day invitation links;
  (2) `sweepMissingConvexUsers` — bootstraps a Convex row for anyone
  WorkOS thinks signed in but our app has no record for;
  (3) `sweepUnlinkedWithApprovedTicket` — auto-links approved Luma
  tickets that `ensureFromWorkos`'s `tryAutoLink` missed. Dedup log
  (`workosRecoveryLog`, capped at 1 attempt per email) means nobody
  gets a duplicate email. Once these were live, day-of "I can't log
  in" went from constant fire-fight to background noise.

- **Cross-system reconciliation as the diagnostic.** "Count WorkOS
  signed-in users; count Convex active users; diff." That one query
  found four invisible trapped accounts (jakob, italo, chris, luis)
  who were authenticated by WorkOS but had no Convex row, sitting at
  /app/link-ticket forever. Worth promoting to a permanent admin page.

- **Independent Convex / Vercel deploy paths.** Convex functions
  deploy via `npx convex deploy` straight from the dev machine; the
  Next.js app deploys via Vercel from a git push. When Vercel builds
  were broken for hours by a stale committed file (see below), the
  Convex side still received fixes immediately. Decoupled deploy
  paths meant we could ship the recovery crons live even though the
  matching frontend change was stuck.

- **Pre-event bulk comp-ticket approval via Luma API.** For the
  volunteer roster (~20 people from the Notion Volunteers DB) and a
  late-add named extra, a one-shot script pulled emails from Notion,
  deduped via `GET /v1/event/get-guest`, then
  `POST /v1/event/add-guests` to add+approve in a single call. Each
  recipient got Luma's standard confirmation email; their first `/app`
  sign-in auto-linked via `tryAutoLink`. No claim codes, no manual
  touches; ~30 s for 20 people. Same pattern works for staff,
  partners, walk-ins-promoted-to-comp; canonicalize as a script in
  `scripts/`. Two gotchas surfaced doing it the first time: Luma's
  public API sits behind Cloudflare and blocks Python `urllib`'s
  default User-Agent (`403 error code: 1010`) — set a browser-like
  UA. And `.env.local` doesn't export shell vars by default —
  `set -a; source .env.local; set +a` before invoking scripts that
  read via `os.environ`.

## What broke and why

### Two ticket-linking code paths missed a guard the third one had

`convex/admin.ts:manualLinkTicket` checked `by_luma_guest_id` for an
existing link and refused duplicates. The two attendee-facing paths,
`convex/ticket.ts:verifyEmailCode` and `tryAutoLink`, didn't. Result:
the same Luma ticket got attached to multiple Convex accounts (Nima
nima@techeurope.io + nima@netbird.io). Both accounts saw the same QR;
either could nominally check in.

**Root cause:** three paths to the same write, only one with the
guard. The other two were written earlier when the duplicate case
wasn't anticipated.

**Fix shipped:** added the same guard to the two attendee paths, plus
a self-serve transfer flow so legitimate "same person, two emails"
moves don't require a help-desk ticket.

**Next time:** invariants on write paths should live in a shared
helper, not be re-implemented per call-site. A single
`assertTicketUnclaimed(lumaGuestId)` would have caught this at write
time.

### Manifest 404 in production console

The dynamic metadata route at `app/app/manifest.ts` doesn't serve
under Turbopack in the version we deployed; every page load logged
`GET /app/manifest.json 404`. Static file at `public/app/manifest.json`
fixed it instantly.

**Next time:** prefer static files for things that don't need to be
dynamic. The manifest never needed runtime computation.

### Service worker scope leaked across experiments

During PWA development we registered a SW at `/` scope at one point
to test something. Removing the registration code from new builds
didn't unregister the SW from users' browsers. It kept intercepting
every request — including `/stage/*` chunks and CSS — and floated
`no-response` errors when its runtime cache strategies fell through.

**Fix shipped:** `SwRegistration` now enumerates all existing
registrations on mount and unregisters anything outside `/app` before
registering its own. Existing affected users get cleaned up on their
next `/app` visit.

**Next time:** SW scope is a sticky decision. Don't experiment with a
broad scope (`/`) on a domain that ships to real users. Use a
subdomain or a separate site for SW experiments.

### Lunch tab was invisible to new users

`AppShell` gated the Lunch tab on `vouchers.length > 0`, but lunch
vouchers were JIT-minted on first `/app/voucher` visit. Brand-new
attendees saw no Lunch tab, no breadcrumb to the voucher page, and
only stumbled into it via the home-page "Show your voucher" card.

**Fix shipped:** gate on `me.ticketLinkedAt || me.accessLevel === "admin"`
(mirroring the server-side check in `ensureAndClaimForMyVoucher`), and
pre-mint the voucher in `completeOnboarding` so the row exists from the
first paint.

**Next time:** JIT-materialize-on-view is a UX trap whenever the
existence of the row gates UI affordances. Materialize at well-defined
lifecycle points (onboarding completion, ticket link, etc.) instead.

### Right Now card filtered out logistics

`rightNowPeek` dropped every session with `format=logistics` —
including Doors Open, Opening Remarks, Closing Remarks. Attendees on
the home tab during Opening Remarks saw "Up next: 09:15 keynote" with
zero indication that something was happening on the main stage right
now.

**Fix shipped:** include every format in the live/next computation.
Breaks surface via `liveBreak` and `nextBreak` separately so they don't
crowd talk slots.

**Next time:** "what's happening now" should default to "show
everything" and let the user filter, not bake in editorial choices
about which session types are interesting.

### Solo attendees were second-class scanner users

The Connect → Scanner mode was originally gated on `teamId`, with the
reasoning that "non-team scans create a personal contact the lead-
qualification flow can't act on." This left solo attendees unable to
use the scanner, and the "Add to my leads" button on `/app/u/<token>`
created contacts they had no nav tab to find — they were trapped on
the detail page they got redirected to.

**Fix shipped, day-of:** scanner enabled for every ticket-linked user.
Solo scans create personal contacts (`ownerType="user"`). New
"Contacts" tab in nav for solo users. List + detail views branch on
ownerType — solo gets name/role/company/LinkedIn/bio + first-met
timestamp; partners keep lead status, notes, scanned-by, CSV export.

**Next time:** don't gate primary features on team membership. The
overwhelming majority of attendees are solo, not partners. Solo should
be the default flow; partner should be the additive feature.

### Admin overview math looked contradictory

"Onboarded: 129 / Not onboarded: 8 / Ticket linked: 131" — three
numbers without a shared denominator. The relationship was a funnel
but the layout didn't make that obvious, and 131 > 129 looked
self-contradictory at a glance.

**Fix shipped:** funnel view — "Signed up · Ticket linked · Onboarded"
against the same denominator, with each non-root tile's hint showing
the gap explicitly. Plus a note that Luma-linked count and claim-code
users diverge.

**Next time:** dashboard tiles should either share a denominator or
explicitly state their own. "Bare number" tiles are easy to misread.

### Confusing labels persisted across roles

"Leads" terminology was in the scan modal, the contact detail page,
the nav, the empty state, and the "Save" button copy. When we split
solo vs partner, we found six different files using the same string.

**Next time:** UI labels that vary by role should be threaded from a
single source. The current "branch on `isTeamView` in every component"
works but is fragile.

### Test fixtures leaked into shared environments

A `lunch_test_only` voucher created by an earlier seed fixture
survived all the cleanups and started rendering as a QR voucher on
the lunch tab (because the voucher page only treats `kind === "lunch"`
as external; anything else gets the QR view). Caused a moment of "wait
what is this on my screen" mid-day.

**Next time:** test-only fixture data should be tagged (suffix like
`test:lunch`, `test:contact`) and the prod render paths should filter
those out. The fixture should also be in a separate kind enum, not a
free-form string.

### Communicating the app to attendees

One speaker (Karan) couldn't find a "download link" for the app
because there isn't one — it's a PWA. Email chains went in circles
because nobody upfront said "the conference app is a website you open
in your browser at `conference.techeurope.io/app`."

**Next time:** put the URL in the Luma confirmation, in the welcome
email subject line, and at the badge desk on a card. "No download —
just open this URL on your phone" should be the lead, not buried.

### WorkOS signup leaked "ghost" unverified user records

The single biggest day-of fire. An attendee enters email + password
on AuthKit's hosted sign-up screen, AuthKit creates a user row with
`email_verified=false`, and then the 6-digit verification step never
completes (email delayed, tab closed, mail server dropping WorkOS's
emails). The half-created record persists. On retry, AuthKit sees
the existing record and rejects with "email not available" — so the
user is now permanently locked out of self-service: signup says "no",
sign-in says "no password set." Cron #1 (above) papers over it by
converting the ghost into a 7-day invitation. 11 attendees hit this
the morning of; many more would have over the day without the cron.

**Root cause:** unknown — WorkOS's hosted signup flow is the
black box. May be email-deliverability (their verification email
silently bouncing on Tier-2 corporate mail hosts), may be a race
between user navigation and code-screen render. Out of scope to
debug live.

**Fix shipped:** the recovery cron. Plus admin mutations
(`bootstrapConvexUserFromWorkos`, `adminLinkByEmail`,
`adminLinkUserToLumaGuestByEmails`, `adminClaimInventoryVoucherByEmail`)
for one-off rescues without waiting for the cron tick.

**Next time:** WorkOS support ticket *before* the event asking why
their signup leaks records, and whether there's a flag to make the
flow idempotent on retry. The "email not available" error message
is also too vague to be acted on by attendees.

### AppShell silently swallowed ensureFromWorkos errors

`useEffect ... ensureUser({...}).catch(() => undefined)` ate every
exception. `ensureFromWorkos` is one transactional mutation whose
sub-calls (`tryAutoLink`, `consumePartnerInviteIfAny`,
`consumeAdminInviteIfAny`) can throw and roll the whole user-insert
back. Symptom: user authenticates against WorkOS, AppShell mounts,
the mutation throws, no Convex row is created, no error is shown,
user is stuck at /app/link-ticket forever. Found four of these by
cross-referencing WorkOS signed-in vs Convex active.

**Fix shipped:** `.catch()` now `console.error`s with email +
workosUserId. Cron #2 (above) bootstraps the missing Convex row
within 5 min as a safety net.

**Next time:** never `.catch(() => undefined)` on a write that
materializes the user's state. If you must swallow, route to
Sentry/PostHog so we see counts. Better: split `ensureFromWorkos`
into "create user row" (must succeed) and "best-effort enrichment"
(non-throwing sub-calls).

### Vercel deploys silently broke for 5 hours

I added `convex/workos_recovery.ts` and the matching cron entries,
ran `npx convex codegen` locally, committed the three source files,
and pushed. Vercel built and failed every push for 5 hours because
`convex/_generated/api.d.ts` (which `codegen` had regenerated to
include `workos_recovery`) wasn't committed. Local `pnpm build`
passed because my working tree had the new types; Vercel's tsc ran
against the stale committed file and didn't know the module existed.
Prod stayed on 5-hour-old code while I thought every fix was live.

The Convex functions (the crons, the recovery actions) were healing
users anyway because Convex deploys directly from CLI and didn't go
through Vercel. So the symptoms were inconsistent: "the cron worked
but my AppShell logging fix isn't there" — confusing for a while.

**Fix shipped:** committed `_generated/api.d.ts`. Vercel went green
on the next push.

**Next time:** either commit the generated files (current convention,
just enforce it), or add a pre-push hook running `pnpm build`, or
`vercel logs --prod` as part of the "did the deploy land" check.
Don't assume a local green build means Vercel will accept it. Also
worth a runbook entry: "if prod looks stale, check the actual
deployment status in Vercel before re-pushing."

### Email delivery to corporate mail hosts can't be assumed

Würth (`@wuerth.com`, MX `witglobal.net`), DKB (`@dkb.de`), and
several other Tier-2 European mail hosts silently dropped both
WorkOS's verification emails and our own Resend/Gmail follow-ups.
Pragati Shaw couldn't get any of three emails we sent her — WorkOS
invite, Resend with the link, Gmail from Tim — even though her
mailbox exists and accepts SMTP. We ended up hand-delivering URLs
in person.

**Next time:** the conference app needs a non-email recovery
channel. SMS via Twilio for the magic-auth code, or a QR-printed
fallback that an admin can scan at the badge desk to log the
attendee in. Counting on email-to-corp-domain at a real-time event
is brittle.

### Auto-link missed when sign-in email differs from Luma email

Several attendees bought tickets under one email (work address paid
for by colleague, personal address, etc.) and signed up to the app
with a different one. `tryAutoLink` looks up the Luma row by
`user.email`, finds nothing, returns null silently. User lands on
/app/link-ticket needing to know an email they may not realise
they're supposed to use (Mathias Conradt's ticket was under his
colleague Nidhi's address; Nicolai Gruber signed up under his
new-company email but the ticket was on his Mercedes one).

**Fix shipped (day-of):** `adminLinkUserToLumaGuestByEmails` for
manual rescue once an admin knows both addresses.

**Next time:** the link-ticket UI should explicitly say "if your
ticket was bought under a different email, paste it here." Right
now the page reads like "verify your own email" — confusing for
the "colleague bought it" case which was 5–10% of stuck users.

### Free-plan Convex disabled prod silently — looked like auth break

Three days after the event, prod Convex was auto-disabled for
exceeding free-plan limits. Login broke site-wide because every
Convex query returned "You have exceeded the free plan limits, so
your deployments have been disabled" and the post-WorkOS-callback
`ensureFromWorkos` died on it. Reported and initially diagnosed as
"WorkOS redirect failure", which sent the investigation in the
wrong direction. The redirect was fine; the entire backend was off.

**Fix:** upgrade plan in Convex dashboard. Code-clean.

**Next time:** wire up Convex usage alerts before the event. When
the whole site breaks at once, the first instinct should be "check
backend service status / quota" before "audit auth code." Memory
`project_convex_plan_limit_outage` captures the symptom-to-fix
mapping for the next time someone trips over it.

### Hydration mismatches from localStorage-backed initial state

`useCachedQuery` returns the localStorage snapshot synchronously on
the client, so the server-rendered first paint (which sees the value
as `undefined`) didn't match the client-side first paint (which read
the cache). The visible symptom was the AppShell nav skeleton flashing
to the real nav, plus React hydration warnings in the console.

**Fix shipped:** `useHasHydrated` (built on `useSyncExternalStore`)
gates the cache-backed render until after hydration.

**Next time:** any client-side persistence layer that wants to
short-circuit SSR loading needs a hydration gate. The Next 16 / React
18 pattern is `useSyncExternalStore`.

### Offline-reload expectations weren't set

Tim tested Phase 1 (friendly errors, offline chip, gated writes) by
hitting reload while offline and saw the Chrome dino. That's the
intended Phase 1 behavior — Phase 1 is "in-session resilience," Phase
2 (SW) is what survives a hard reload. We had to clarify mid-build.

**Next time:** when shipping offline support, lead with the
**user-facing scenarios** ("wifi drops mid-session", "hard reload at
the venue") and explicitly say which scenarios each phase covers. The
"Phase 1 / Phase 2" framing was internal jargon that didn't map onto
real failure modes.

### Speaker dropped out the morning of the event

Igal Shilman sick day-of; his joint side-stage talk with Giselle van
Dongen had to convert to solo in the four hours before doors. Four
surfaces needed coordinated patching: `app/data/speakers.ts` (remove
the entry; Restate company logo stays through the co-speaker),
`app/data/agenda.ts` (slot's `speakerNames: [...]` array → solo
`speakerName: 'Giselle van Dongen'`), the Convex `sessions` table in
prod (via the `agenda:bootstrapPatchSession` internal mutation,
because the admin-gated `agenda:update` mutation needs an
authenticated request the CLI doesn't carry), and Notion (mark Igal
"On Website" + "Agenda Slot" = false plus a dated note; update
Giselle's note to "presenting solo — Igal out sick"). Missing any
one of the four leaves the cancelled speaker visible somewhere.

**Next time:** one script — `pnpm speaker:remove --slug side-12
--remove "Igal Shilman"` — that patches all four in coordinated
order. Used at least twice this event (Stephan Ewen days before,
Igal day-of).

### Stage enum doubled as a venue/location label

The agenda pill in `/app/agenda` and the session detail page render
the literal `stage` value as the location chip: "MAIN", "SIDE",
"EXPO". The lunch break carries `stage="expo"` (siblings: coffee
breaks at the bar), but lunch is physically at Kalle Halle next
door, not the expo hall. Attendees saw an "EXPO" pill on the lunch
slot and got confused about where to go.

**Fix shipped:** special-case `slug === "lunch"` in the agenda
renderers to label that pill "Kalle Halle"; coffee breaks keep
"EXPO".

**Next time:** add an optional `location?: string` to `AgendaSlot`
(and matching Convex schema field). Renderers show `location ||
stage`. The enum is internal layout routing; the label is a
user-facing string and the two should be allowed to disagree.

### Hand-maintained agenda prose on the home card went stale

The home Lunch card hardcoded "Coffee breaks at 10:30 & 15:10" — but
the agenda actually has three (10:30, 15:10, 16:40). A copy-paste of
a partial subset rotted silently. Same family as the "single source"
problem captured in the patterns section, but the specific bug here
is **enumerating agenda items in prose**.

**Fix shipped:** added the missing time.

**Next time:** any copy that lists agenda items either maps over the
agenda data at render time, or uses language that doesn't enumerate
("coffee breaks throughout the day, see the agenda for times"). Don't
mentally `.map()` — let the code do it.

### Hydration gate needed everywhere `useCachedQuery` is used

After fixing AppShell's hydration mismatch with `useHasHydrated`, the
same error surfaced minutes later in `LumaCheckInCard`. Same root
cause: `useCachedQuery` returns the localStorage snapshot
synchronously on the client, the server first-paint sees `undefined`,
React flags the diff. The gate is structural — every render path
that branches on cache presence needs it, not just the first one we
noticed.

**Fix shipped:** extracted `useHasHydrated` to
`app/lib/use-has-hydrated.ts` and applied to every cache-gated render
path. Convention: any component using `useCachedQuery` whose JSX
differs between "snapshot present" and "snapshot absent" must also
gate the render on `useHasHydrated()`.

**Next time:** make this enforceable in the hook itself. Either
return `{value, hasHydrated}` from `useCachedQuery` so the gate is
inseparable, or document the convention explicitly so the next agent
doesn't repeat the AppShell → LumaCheckIn discovery cycle.

### CacheWarmer prefetch list rotted, plus a swallowed-non-2xx bug

`WARM_ROUTES` listed `/app/faq` long after the route was removed.
Every page load logged a 404. Worse, the surrounding
`.catch(() => undefined)` catches network errors but **not** HTTP
error responses — `response.ok = false` resolves the promise, the
failing response gets handed to the SW cache anyway, and the URL
still shows red in the network panel. Two private routes
(`/app/voucher`, `/app/connect`) were also returning 500 during the
authenticated prefetch (cause not chased — left with the
dev-server-log requirement attached).

**Fix shipped:** removed `/app/faq`. The 500s remain a known issue.

**Next time:** generate `WARM_ROUTES` from the App Router's actual
segments instead of hand-maintaining. And: `if (!response.ok) skip`
— a fetch that returns 5xx is not a successful prefetch and should
be excluded from the SW cache, not stored.

### Service worker kept serving stale chunks after a code fix

After pushing the `useSyncExternalStore` hydration fix to `main`,
the dev-mode error persisted because the SW was still handing back
the previous AppShell chunk from cache. Validating "did the fix
land" required Cmd+Shift+R **and** DevTools → Application → Service
Workers → Unregister. We almost re-broke the fix chasing a bug that
was already fixed but invisible.

**Next time:** in dev, the SW should be opt-in (env flag or
`?sw=1`), not always-on. Or at minimum, a `?nosw=1` query that
auto-unregisters on landing. "Test the fix" silently meaning "and
also remember to clear the SW" wasted hours during the build-up.

### Wi-Fi card and Lunch CTA stubbed "TBA" to logged-out visitors

Pre-event visitors who hadn't signed in saw a Wi-Fi card with
"Network: TBA / Password: TBA" — confusing and pointlessly visible.
Same shape on the home Lunch card's "Show your voucher" CTA, which a
logged-out visitor couldn't action.

**Fix shipped:** signed-out users see "Please log in to see the
Wi-Fi" on the Wi-Fi card and "Log in to see your lunch voucher" on
the Lunch card. Signed-in users see the real values and an active
CTA. Password also became click-to-copy with a confirmation icon
flip.

**Next time:** auth-gated cards should branch on auth state up
front, not stub with "TBA". Generalize into a small wrapper:
`<AuthGated signedIn={…} signedOut={…} />`.

## Patterns to change next time

### Single source for any data that ships to both marketing and app

Right now `app/data/agenda.ts` (static, marketing site, home "Right
Now" card, AGENDA constant) and Convex `sessions` (live app's
agenda tab, stage host view, `useQuery(api.agenda.list)`) duplicate
the schedule. When the agenda slipped, both needed updating, by hand.
Speakers data has the same shape: `app/data/speakers.ts` plus a
constellation of marketing references.

Either:
- Have the marketing site read from Convex too (with a build-time
  fetch + revalidation), or
- Have a build step generate one from the other (Convex → static
  TypeScript) so the static is always derived

Next event, the schedule WILL change live. Don't repeat the hand-edit.

### Bulk admin operations

The agenda shift was 22 individual `npx convex run` invocations in a
shell loop. The Nima voucher move was a one-off internal mutation. The
83-user legacy backfill was another one-off. Pattern: every event will
have at least three "shift everything 15 min", "move things between
accounts", or "backfill the field we just added" moments.

Build a tiny generic batch tool — internal mutation taking a JSON
patch array — and a CLI for it. Saves time on the hot path.

### Pre-mint everything possible at onboarding

Lunch voucher was the obvious case but the same logic applies to badge
QR token, public token, default consents, etc. — anything the app
needs to render correctly should exist by the time the user lands on
`/app`. JIT-mint is a tax: every consumer needs to handle the "not
yet" state, the loading skeleton, the gated tab. Pre-mint in
`completeOnboarding` (or `tryAutoLink` for ticket-only flows) keeps
the render paths simple.

### Solo-first design

Make the solo attendee flow the trunk and partner team flow the
branch, not the other way around. Most attendees aren't on a partner
team. Every gate that started with `if (teamId)` cost us during the
event.

### CSV export columns should be obviously partial when they are

`contactsAdded` looked like "everything they did" when it was actually
"personal-list contacts only." Either name the column explicitly
(`personalContactsAdded`) from the start, or compute both (personal +
team) and show both. Don't silently report a partial number.

### Don't experiment with SW scope on the prod domain

A SW registered at any scope sticks in users' browsers until something
unregisters it. Use a subdomain or staging URL for SW experiments. The
auto-cleanup we shipped saved us this time but a less-careful future
edit could blow it up again.

### Stat tiles should split "actionable" from "noise"

The admin "X of Y not linked" hint lumped four unrelated categories
together: actually-stuck users, walk-ins not on Luma, Luma RSVP
declines, and duplicate work-vs-personal accounts. With all four in
one number, the dashboard tripped false alarms ("17 not linked!")
even when nothing was wrong, *and* hid the one real stuck user
inside the noise. We split it into `unlinkedNeedsAttention` +
breakdown counts of the noise. Now the rule is simple: if needs-
attention is 0, you ignore the tile.

**Next time:** every alert-able number on a dashboard needs the same
treatment. Compose the metric from "this is actionable" + "this is
expected friction"; show only the actionable count loudly, footnote
the rest. "Total minus expected" is a stat you can trust.

### Auto-recovery > interactive rescue

By the end of the day we'd written six different "fix one user"
admin mutations. The first five fired manually, the cron #1/#2/#3
trio fired automatically. The automatic ones won — once they were
live, the team stopped getting "I can't log in" reports because the
problem self-healed within 5 min of happening. The interactive
mutations were still useful for ad-hoc fixes (different-email tickets,
voucher inventory pre-claim) but the cron lifted the floor for
everyone equally.

**Next time:** any class of failure that's likely to recur should be
auto-healing within minutes, with an idempotent dedup log so
recovery never spams the user. Build the cron before the interactive
admin tool — the cron handles the volume, the tool handles the
edge cases the cron can't.

### Don't assume the local build matches the deploy

Local `pnpm build` passing tells you nothing about whether Vercel
will accept the build, because the working tree may contain
uncommitted files (regenerated types, env-derived configs). Make
"did the deploy actually land" a separate, verifiable step — check
`vercel ls --prod` for `● Ready` status on the latest commit SHA.
"I pushed and the local build was green" is not the same as
"Vercel deployed it."

### Lead with concrete user scenarios in offline work

"Phase 1" and "Phase 2" meant nothing to the person testing. "Wifi
drops mid-voucher-tap", "user reloads at lunch counter", "user opens
fresh tab offline" are scenarios that map to actual code paths and
that everyone can sanity-test against. Pre-write the scenarios before
the work.

### Don't enumerate canonical data in prose or hand-maintained arrays

`WARM_ROUTES`, the home "coffee breaks at 10:30 & 15:10" prose, the
company logo carousel, the hosts `LOGO_MAP`, the static speakers
sheet duplicating Convex — every place we hand-maintained a subset
of something that lives elsewhere rotted at least once this event.
The rule is stronger than "single source": **don't enumerate
anything in prose or arrays that exists as structured data
elsewhere**. Either map over it at render time, or use language that
doesn't enumerate. "X, Y, and Z" goes stale; "see the agenda"
doesn't.

## Specific technical TODOs

- [ ] Move agenda + speakers to single source (Convex with build-time
      export to a `.ts` for marketing site SSR, or vice versa).
- [ ] Centralize ticket-write invariants. One helper that asserts
      `assertTicketUnclaimed(lumaGuestId, exceptForUser?)` and is
      called by every path that inserts into `ticketLinks`.
- [ ] Generic bulk-patch internal mutation, takes JSON of
      `{table, where, patch}[]`.
- [ ] Audit every `if (vouchers/contacts/etc).length > 0` UI gate.
      Replace with role/lifecycle predicates that don't depend on JIT
      materialization.
- [ ] Speaker-photo/data ingest pipeline: today, adding a speaker
      requires editing the static file, Notion DB, two logo files, and
      the marketing carousel. Build a CLI.
- [ ] CSV export column naming convention: prefix with scope where it
      matters (`personal_*`, `team_*`, `luma_*`).
- [ ] Mark every test fixture row with `metadata: { test: true }` or a
      reserved kind prefix; production render paths filter on it.
- [ ] Welcome-email template that opens with the conference app URL,
      not buried under the badge pickup details.
- [ ] Hydration-safe `useCachedQuery` is good — write the pattern up
      in CLAUDE.md so future client-side caching follows the same
      shape.
- [ ] Document the SW lifecycle in `CLAUDE.md`: registration scope,
      dev opt-in env var, cleanup story, build flag.
- [ ] Reconciliation admin page that diffs WorkOS signed-in vs Convex
      active vs Luma checked-in, with action buttons per category
      (bootstrap, admin-link, force-onboard).
- [ ] Pre-event WorkOS support ticket: ask why hosted signup leaks
      `email_verified=false` records on retry, and whether there's a
      flag to make it idempotent. Also: improve the "email not
      available" copy on their side so attendees can self-diagnose.
- [ ] SMS fallback for sign-in recovery (Twilio + magic-auth code),
      so corporate-mail-server drops don't lock attendees out.
- [ ] Document non-obvious WorkOS API behavior in CLAUDE.md:
      `POST /user_management/invitations` atomically creates a user
      record alongside the invitation; deleting one without the
      other leaves dangling state.
- [ ] `.env.local` is staging WorkOS, prod key in Vercel. Memory
      already captures it (`reference_workos_env_keys`) but worth a
      one-liner in CLAUDE.md so it's the first thing a new agent
      sees.
- [ ] Upgrade Convex plan ahead of the next event, with usage alerts
      configured. Site-wide auth break from a quota cap is the
      worst-looking version of an outage.
- [ ] Pre-push hook (or CI check) that runs `pnpm build` and refuses
      commits where `convex/_generated/` is stale.
- [ ] Link-ticket UI: explicit "ticket bought under a different
      email?" path that prompts for the original purchase email
      instead of assuming sign-in email == Luma email.
- [ ] Surface `ensureFromWorkos` failures to Sentry/PostHog. The
      `console.error` we added is better than silence but invisible
      unless someone opens DevTools.
- [ ] One-shot speaker-removal CLI: `pnpm speaker:remove --slug X
      --remove "Name"` that patches `speakers.ts`, `agenda.ts`,
      Convex sessions (via internal mutation), and Notion in
      coordinated order. Used at least twice per event (Stephan,
      Igal).
- [ ] Add optional `location?: string` to `AgendaSlot` and the Convex
      sessions schema. Renderers show `location || stage`. Kills the
      Kalle Halle / expo-pill confusion structurally instead of via
      a slug special-case.
- [ ] Reusable `<AuthGated signedIn={…} signedOut={…} />` wrapper
      for any card whose contents are login-gated. Current callers:
      Wi-Fi card and Lunch voucher CTA on home.
- [ ] Generate `WARM_ROUTES` from the App Router's segments at build
      time instead of hand-maintaining. Filter on `response.ok`
      before treating a prefetch as successful — non-2xx shouldn't
      be cached.
- [ ] Dev-only `?nosw=1` query that unregisters all SWs on landing,
      plus an env flag (`NEXT_PUBLIC_DISABLE_SW=1`) that skips
      registration entirely during dev iteration. The current
      "always-on SW" silently caches stale chunks across pushes.
- [ ] Codify the `useCachedQuery` + `useHasHydrated` pairing — either
      have the hook return `{value, hasHydrated}` so callers can't
      forget the gate, or write it up in CLAUDE.md so the next agent
      doesn't rediscover it the same way (AppShell → LumaCheckIn).
- [ ] Bulk Luma comp-ticket script in `scripts/` — pulls emails
      from a Notion DB, dedupes via `get-guest`, then `add-guests`
      to add+approve in one call. Browser-like User-Agent baked in
      (Cloudflare 1010 trap). Used for the volunteer roster; reuse
      for any future comp/staff/partner batch.

## Things that would have helped but we didn't have time for

- **Background mutation queue.** Scans that happen offline get dropped
  on the floor (button gated, friendly error). For a partner team
  doing 50 booth scans, this is real lost data. Workbox background
  sync would address it; we deliberately skipped it because the
  voucher double-spend risk wasn't trivial to reason about under time
  pressure.
- **Sentry / Posthog hook on SW errors.** We have no idea how many
  attendees hit a `no-response` console error during the event. The
  rogue-SW cleanup might still be missing edge cases.
- **iOS Safari specific testing.** Most attendees are on iPhone.
  Browser behavior diverges enough that "works on Chrome" is not a
  full QA pass. Build a real device test cycle next time.
- **A "what's currently happening" stage view shareable URL** for
  attendees, not just hosts. The host view at `/stage/[stage]` is
  great but undocumented for general use.
- **Pre-event reconciliation run.** If we'd diffed WorkOS / Convex /
  Luma the morning of the event, we'd have caught the duplicate
  work-vs-personal accounts before they got to the link-ticket gate
  and had to ask for help. A 2-minute script saves 2 hours of "wait,
  did this person actually pay?" investigation.
- **Self-serve "I can't sign in" page.** A public page that takes an
  email and reports: "you have no WorkOS record → click here to sign
  up", or "your invitation is pending → here's your accept link", or
  "you're signed in but your ticket isn't linked → enter your Luma
  email." Three categories of stuck account covered with one form.
  We did this by hand in DMs all day.
- **Quota/usage alerts on Convex.** The post-event plan-limit outage
  came as a complete surprise because we had nothing watching usage.
  Even a daily Slack message of "current usage X% of plan" would
  have prevented the dark-backend incident.
- **Convex deploy as a named, gating step in the agent runbook.**
  Several times during the build-up an agent added an
  `internalMutation`, committed and pushed, then `npx convex run
  --prod` errored "function not found" — because Convex prod
  deploys live and not via git push. The
  `CONVEX_DEPLOYMENT=prod:neat-coyote-777 npx convex deploy
  --typecheck disable` step needs to be a labelled block in the
  deploy flow, not a "wait, did I do that?" afterthought.
