# Applied AI Conf Platform — Production Plan

> Single-source plan for finishing the `/app` platform before the
> 28 May 2026 conference. Written for an agent picking this up cold.

## Where we are right now (May 2026 snapshot)

Already live on `https://conference.techeurope.io`:

- WorkOS Production auth wired (`client_01KRVT6FXFE2C1TGVQ2WD1ANR8`,
  env `01KRVT6FR4NKB1EYYPT6KRK274`). Staging env still wired for local dev.
- Convex Production deployment `neat-coyote-777` with full schema.
- Onboarding (single page: profile + 3 consent checkboxes).
- Scan / Contacts / Directory / Agenda / Settings pages.
- Admin area (`/app/admin/*`): overview, attendees search + detail
  with edit/reset-onboarding/kick, claim codes generate/list/revoke,
  audit feed.
- Walk-in admin flow via `pendingAttendees` + `claimCodes` tables.
- `/api/admin/kick/[userId]` route: deactivates Convex user + revokes
  every active WorkOS session.
- Gitignored `scripts/admin-grant.mjs` (wraps `npx convex run admin:bootstrap*`).

What is **NOT** built yet (this plan covers it):

- No link to Luma tickets — anyone with any email can sign up and use
  the platform.
- QR URL exposes the raw Convex `_id` (`/app/u/<convex_id>`).
- No personal agenda / favorite talks.
- No transactional email provider — admin-generated claim codes can
  only be read aloud at the desk.
- No "Partner" role: sponsors today have the same capabilities as any
  attendee (scanning works for everyone, but there's no partner-only
  lead capture / branding / export).

## Locked decisions

| Decision | Value |
|---|---|
| Email provider | **Resend** (added to plan — see Phase 1). |
| When does the ticket-link wall appear | Right after WorkOS sign-up, **before** profile onboarding. |
| What an unverified user can do | Nothing except `/app/settings` and `/app/link-ticket`. Admin claim-code redemption bypasses the wall. |
| Public QR token format | `aac_xxxxxxxx` — 8 chars after prefix, Crockford-style alphabet (no `0/O/1/I/L`), unique-indexed. |
| Onboarding shape | Single page: profile fields top, 3 small consent checkboxes underneath, one Continue button. (Already shipped.) |

## Locked verification flow (combines Resend + Luma + Partner invites)

```
1. WorkOS sign-up. WorkOS already proves email ownership
   (emailVerified=true after email+password code, or trusted from
   Google/Magic Auth).

2. On first /app visit, ensureFromWorkos runs three checks in order:

   a) partnerInvites.email == workosUser.email
      → attach to partner team, write partnerMembers row,
        set user.teamId, mark invite consumed.  ALSO merge any cached
        Luma profile data (company, name) onto the user.
        Considered "verified" — no ticket link required.

   b) autoLinkIfMatch():  workosUser.email ∈ lumaAttendees.email
      → create ticketLinks row, method="auto".  ALSO merge Luma
        profile data onto the user.

   c) Neither → user hits /app/link-ticket gate.

3. /app/link-ticket asks for the Luma email. Two paths:

   a) Auto-recognized in cache: send a 6-digit code via Resend to
      that email.  User enters the code → ticketLinks row,
      method="email_code".  Luma data merged.

   b) Not in our cache: live fallback to GET /v1/event/get-guest
      ?email=<x> to catch late Luma registrations.  If still no match,
      show help-desk message.

4. Help desk → admin uses existing claim-code flow OR a new "manual
   link" action on attendee detail (Phase 7a).

Gate (Phase 4): users without ticketLinks AND without partnerMembers
AND without accessLevel=admin get redirected to /app/link-ticket
from every page except /app/settings and /app/link-ticket itself.
```

`ticketLinks.method` records how the link was established:
`"auto" | "email_code" | "claim_code" | "admin_link"`.

Partner team membership counts as verification — partner reps without
Luma tickets are valid attendees by virtue of their employer's
sponsorship.

## Verified Luma API facts (don't re-research)

```
Auth header:    x-luma-api-key: $LUMA_API_KEY   (already in .env.local)
Conference event api_id: evt-EFJJfPGbyKg7PYU

GET /v1/event/get-guests?event_api_id=<evt>&pagination_limit=N[&pagination_cursor=...]
  entries[] fields: api_id, email, name, user_email, user_first_name,
  user_last_name, registered_at, approval_status, checked_in_at,
  event_ticket{}, check_in_qr_code, registration_answers
  paging: has_more, next_cursor

GET /v1/event/get-guest?event_api_id=<evt>&api_id=<gst-xxx>   → { guest: {...} }
GET /v1/event/get-guest?event_api_id=<evt>&email=<x>          → { guest: {...} }
```

**Luma email blasts do not support per-recipient merge variables**
(confirmed in their help center). Same body to everyone. Per-user codes
in the blast are impossible — that's why we need Resend.

## Convex schema additions

```ts
// users — ADD fields
publicToken: v.string()                  // aac_xxxxxxxx, index by_public_token (unique)
ticketLinkedAt: v.optional(v.number())   // mirror of ticketLinks for fast gate checks
lumaGuestId: v.optional(v.string())      // cached gst-xxx

// NEW tables

lumaAttendees: defineTable({
  lumaGuestId: v.string(),               // api_id
  email: v.string(),                     // lowercase
  name: v.optional(v.string()),
  ticketType: v.optional(v.string()),
  registeredAt: v.number(),
  approvalStatus: v.string(),
  checkedInAt: v.optional(v.number()),
  syncedAt: v.number(),
}).index("by_luma_guest_id", ["lumaGuestId"])
  .index("by_email", ["email"]),

ticketLinks: defineTable({
  userId: v.id("users"),
  lumaGuestId: v.string(),
  lumaEmail: v.string(),
  method: v.union(
    v.literal("auto"),
    v.literal("email_code"),
    v.literal("claim_code"),
    v.literal("admin_link"),
  ),
  verifiedAt: v.number(),
  verifiedByUserId: v.optional(v.id("users")),  // admin if method=admin_link
}).index("by_user", ["userId"])
  .index("by_luma_guest_id", ["lumaGuestId"]),

emailCodes: defineTable({                 // ephemeral 6-digit codes
  userId: v.id("users"),
  targetEmail: v.string(),
  code: v.string(),                       // hashed
  attempts: v.number(),
  expiresAt: v.number(),
  consumedAt: v.optional(v.number()),
}).index("by_user", ["userId"])
  .index("by_target_email", ["targetEmail"]),

favoriteSessions: defineTable({
  userId: v.id("users"),
  sessionSlug: v.string(),                // stable slug from agenda.ts
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_session", ["userId", "sessionSlug"]),  // unique

// teams — EXTEND existing schema with partner fields
teams: defineTable({
  name: v.string(),
  slug: v.string(),                       // url-safe, unique
  logoStorageId: v.optional(v.id("_storage")),
  createdByUserId: v.id("users"),
  // partner-specific (only set when kind="partner")
  kind: v.optional(v.union(v.literal("partner"), v.literal("regular"))),
  partnerTier: v.optional(v.string()),    // gold | silver | bronze | community
  partnerBoothLocation: v.optional(v.string()),
  partnerBio: v.optional(v.string()),
  partnerWebsite: v.optional(v.string()),
  partnerVerifiedAt: v.optional(v.number()),    // admin sets this once payment confirmed
  partnerVerifiedByUserId: v.optional(v.id("users")),
}).index("by_slug", ["slug"])
  .index("by_kind", ["kind"]),

partnerMembers: defineTable({
  teamId: v.id("teams"),
  userId: v.id("users"),
  role: v.union(v.literal("owner"), v.literal("member")),
  invitedAt: v.number(),
  invitedByUserId: v.id("users"),
  joinedAt: v.number(),                   // when the userId actually signed up
}).index("by_team", ["teamId"])
  .index("by_user", ["userId"])
  .index("by_team_user", ["teamId", "userId"]),   // unique

partnerInvites: defineTable({             // pre-invites for emails not yet signed up
  teamId: v.id("teams"),
  email: v.string(),                      // lowercase
  role: v.union(v.literal("owner"), v.literal("member")),
  invitedAt: v.number(),
  invitedByUserId: v.id("users"),
  consumedAt: v.optional(v.number()),
  consumedByUserId: v.optional(v.id("users")),
}).index("by_team", ["teamId"])
  .index("by_email", ["email"]),
```

`contacts.ownerType` / `contacts.ownerId` already exist and support
team-scoped lead pools. When `user.teamId` is set, `contacts.add`
already writes to the team pool — no schema change needed there.

## Phased implementation

Ship order: **1 → 2 → 3 → 4 → 7a → 5 → 6 → 7b → 8 → 9**.

| # | Phase | Outcome | Key files / new modules |
|---|---|---|---|
| 1 | **Resend + Luma sync** | Resend account, domain DNS verified, `convex/email.ts` action wrapper using `internalAction`. `lumaAttendees` table + `scripts/sync-luma-attendees.mjs` (cron-able). Admin view at `/app/admin/luma`. | `convex/email.ts`, `convex/luma.ts`, `scripts/sync-luma-attendees.mjs`, `app/app/admin/luma/page.tsx` |
| 2 | **Public QR tokens** | `users.publicToken` + indexed lookup. Backfill mutation for existing users. `UserQR` renders `/app/u/<token>`. `[token]/page.tsx` resolves by `publicToken`. Admin "rotate token" action. Keep `_id` fallback for one release. | `convex/users.ts`, `app/app/components/UserQR.tsx`, `app/app/u/[token]/page.tsx`, `convex/admin.ts` |
| 3 | **Ticket linking + Luma data merge** | `ticketLinks` + `emailCodes` tables. `convex/ticket.ts`: `lookupByEmail`, `autoLinkIfMatch` (called from `ensureFromWorkos`), `requestEmailCode`, `verifyEmailCode`. On any successful link, merge cached Luma profile fields (name, company from registration_answers) onto the user where empty. `convex/claim.ts`: extend `redeem` to also write a `ticketLinks` row with method=`claim_code`. New page `/app/link-ticket`. | `convex/ticket.ts`, `convex/claim.ts`, `convex/users.ts`, `app/app/link-ticket/page.tsx` |
| 4 | **Access gate** | `ConnectShell` redirects to `/app/link-ticket` unless user has `ticketLinks` OR `partnerMembers` OR `accessLevel==="admin"`. Server-side `requireActiveUser` in `_auth.ts` extended to enforce. Bypass list: settings, link-ticket itself, `/app/u/*` (public profile views). | `convex/_auth.ts`, `app/app/components/ConnectShell.tsx` |
| 5 | **Digital badge home** | `/app` (authenticated) becomes the badge page: big QR + "Show this to connect" + buttons to Scan / Contacts / Agenda. `/app/me` deprecated (redirect to `/app`). `/app/scan` stays for the explicit camera page. | `app/app/page.tsx`, `app/app/me/page.tsx` |
| 6 | **Personal agenda** | `favoriteSessions` table + `convex/favorites.ts` (add/remove/list). Stable slugs from `app/data/agenda.ts`. Heart icon on `/app/agenda` rows. New `/app/agenda/mine` view. | `convex/favorites.ts`, `app/data/agenda.ts` (add slug), `app/app/agenda/page.tsx`, `app/app/agenda/mine/page.tsx` |
| 7a | **Admin extensions — verification + Luma side** | "Linked ticket" section on attendee detail. Admin search Luma attendees → "Link to a user" action. "Unlink ticket" action. Audit-log entries for all of the above. | `app/app/admin/attendees/[id]/page.tsx`, `app/app/admin/luma/page.tsx`, `convex/admin.ts` |
| 7b | **Partner teams (paid sponsors)** | See dedicated section below. Schema: `teams` extended, `partnerMembers`, `partnerInvites`. Admin-only partner creation + verification. Pre-invite by email. Shared `contacts` ownership already wired via `ownerType="team"`. Member dashboard + CSV export + branded public profile. | `convex/partners.ts`, `app/app/admin/partners/*`, `app/app/team/*`, `app/app/partner/[slug]/page.tsx`, `convex/users.ts` (signup-time invite consumption) |
| 8 | **Admin extensions — bulk + email codes** | CSV import for bulk claim-code generation. "Resend code via email" button (uses Resend). | `app/app/admin/codes/page.tsx`, `convex/admin.ts` |
| 9 | **Pre-conf email + cleanup** | Draft Luma email blast copy ("register on the platform"). Migrate orphaned staging Convex user + test claim code `FVGK-UD6X` + pending attendee `anna.speaker@example.com`. Remove `_id` fallback on `/app/u/*`. | — |

### Phase 7b detail — Partner teams

**Why a real phase, not "future scope":** Sponsors paid for lead
capture and need it working on May 28. Without it, sponsor reps fall
back to their personal `/app/contacts` and there's no team-shared
lead pool, no CSV export, and no per-partner analytics.

**Verification model:**
- Partner teams are **admin-only to create** (`/app/admin/partners`
  has the form; nothing self-serve).
- A partner team is "verified" once admin sets `partnerVerifiedAt` —
  this is the gate for paid features being live.
- Sponsor reps **never need to be Luma attendees** — being on a
  partner team's `partnerMembers` row is itself the verification that
  unlocks the platform for them.

**Membership flow:**

```
Admin path A (pre-invite by email — most common):
  Admin enters teamId + email + role(owner|member)
  → partnerInvites row created
  → at some point the rep signs up via WorkOS
  → on first /app visit, ensureFromWorkos checks partnerInvites
    by email, consumes it, writes partnerMembers, sets user.teamId.

Admin path B (link existing user):
  Admin attaches an already-signed-up user to a partner team
  → writes partnerMembers, sets user.teamId.

Self-onboarding path (later, optional): a join code per team
  similar to claimCodes but team-scoped.  Not in v1.
```

**Lead pool (already works at the data layer):**
- `contacts.add` already checks `me.teamId` and writes
  `ownerType="team"` / `ownerId=teamId` when set. So once a partner
  member's `user.teamId` is populated, every scan they make lands in
  the team pool automatically.
- `contacts.list` and `contacts.updateNotes` already scope by team
  when present.
- **What's missing:** UI to view + manage the team's contacts as
  shared. Built in Phase 7b.

**Pages added in 7b:**

| Path | Purpose | Who can access |
|---|---|---|
| `/app/admin/partners` | List partner teams, "Create partner team" form | admin |
| `/app/admin/partners/[teamId]` | Edit team details, manage members, invite by email, view shared leads, CSV export | admin |
| `/app/team` | Partner member's dashboard: branding, member list, shared leads | partner members of that team |
| `/app/team/leads` | All shared leads from team scanning + notes editing | partner members |
| `/app/team/leads/export` | CSV download endpoint | partner team owner |
| `/app/partner/[slug]` | Public-facing partner profile: name, tier, logo, bio, booth location, optional member list | anyone |

**Nav:**
- Partner members see a new "Team" tab in `ConnectShell` (between
  Contacts and Directory) only when `user.teamId && team.kind==="partner"`.
- Admins also see "Partners" in the admin nav.

**CSV export shape (Phase 7b):**

```
columns: scanned_at, contact_name, contact_email, contact_company,
         contact_role, contact_linkedin, scanner_name, notes, tags
filter:  ownerType="team" AND ownerId=teamId
```

**Public partner profile (Phase 7b):**
- Same look-and-feel as `/app/u/<token>` (user profile)
- Logo + name + tier badge + booth location + bio + website link
- Optional: list of partner team members (each links to their
  `/app/u/<token>` if they opted in to `directory_listing` consent)
- Linkable from marketing-site sponsor pages too (separate from the
  authenticated `/app/*` scope, just a public read)

## Digital badge home page (Phase 5 detail)

```
/app (authenticated)
├─ Big QR centered (UserQR with new publicToken URL)
├─ Below: name · role · company  ·  edit → /app/settings
└─ Action row: [Scan to connect →]  [My contacts →]  [My agenda →]

Unauth /app keeps current splash + "Sign in to continue".
```

## Operational facts

```
Convex prod:           neat-coyote-777     (CONVEX_DEPLOY_KEY in Vercel + locally)
Vercel project:        0-nlyai/applied-ai-conf
Prod domain:           https://conference.techeurope.io
Stale alias to remove: conf.techeurope.io
WorkOS prod env id:    01KRVT6FR4NKB1EYYPT6KRK274
WorkOS staging env id: 01KRVT6F1ERYH07VBDVQAT69KM   (still used by local dev)
Luma event api_id:     evt-EFJJfPGbyKg7PYU
Admin grant script:    scripts/admin-grant.mjs  (gitignored)
```

## Risk register

Each item has: **what**, **why it matters**, and **status** (mitigated
already or open).

### Late Luma registrations

- **What:** A user registers on Luma 10 min before walking in.
  Our `lumaAttendees` table is stale.
- **Why it matters:** Without mitigation, they'd hit the verification
  wall with "we can't find your ticket" even though Luma has them.
- **Mitigation, in plan:** `convex/ticket.ts` `lookupByEmail` does
  cache-first, then on miss hits `GET /v1/event/get-guest?email=...`
  live and upserts. Cron also runs every 30 min, faster during event day.
- **Status:** Mitigated by design. Only a coding correctness item.

### Two people share a Luma email (rare)

- **What:** Exec + assistant both registered under one shared inbox.
- **Why it matters:** First claim wins. The other user can't link.
- **Mitigation, in plan:** Admin "unlink + relink" in Phase 7a.
- **Status:** Mitigated by admin tooling. Practically a non-issue at
  our 500-person scale.

### Luma rate limits

- **What:** Luma doesn't publish rate limits.
- **Why it matters:** A 500-person sync is ~5 paginated calls. Even
  pessimistic limits won't break us.
- **Status:** Not a real risk. Mention only.

### Bot protection on AuthKit hosted pages

- **What:** Cloudflare Turnstile blocks the CDP-controlled browser
  the agent uses, so the agent can't programmatically test a fresh
  sign-up.
- **Why it matters:** Testing-only friction. Real users on real
  browsers are fine.
- **Status:** Workarounds documented (user signs up in normal browser;
  agent picks up via WorkOS impersonation once enabled).

### "We have no email provider" — KILLED by adopting Resend in Phase 1

- This was the only architecturally open item from earlier drafts.
  Resolved by promoting Resend to Phase 1.

**Bottom line: no open risks block the build. The plan covers each.**

## Why Resend in Phase 1 vs deferring

Adopting Resend now eliminates the clunky "paste your Luma URL" fallback
and simplifies several downstream features:

1. **Email-code verification** for mismatched-email users — 6-digit
   code to their Luma inbox, type it in. Simple, well-understood UX.
2. **Auto-deliver admin claim codes** — admin enters email + name +
   kind; Resend emails the attendee the code with instructions. No
   reading codes aloud at the desk.
3. **End-of-day summary emails** (already a consent option in
   onboarding, currently a dead toggle — Resend makes it live).
4. **Talk reminders** for favorited sessions (Phase 6 extension).

Setup is one afternoon: account, API key, DNS records for
`techeurope.io` (SPF/DKIM/DMARC), `convex/email.ts` thin wrapper around
`internalAction`. Existing `BEEHIIV_*` env vars are unrelated (Beehiiv
is newsletter-only, not transactional).

## Partner / sponsor scanning — promoted into Phase 7b

Required for May 28. See **Phase 7b detail** above. Today scanning
works for everyone (contacts land on the rep's personal
`/app/contacts`), but there's no team-shared pool, no CSV export,
and no partner branding. Phase 7b builds all of that on top of the
existing `teams` table + `contacts.ownerType` plumbing that's already
in the schema.

## Future scope (not blocking May 28)

- Self-serve partner join codes (admin path A + B cover v1)
- Real-time scan notifications ("X scanned you")
- 10-minute-before favorited session reminder push
- Per-partner analytics dashboard (scans/day, conversion, top reps)
- Shareable profile link with OG tags (`/app/u/<token>` already
  serves the page; just needs OG metadata)
- Post-event recap email with contacts + notes
- A scanner picks scan-context (personal vs. partner team) for users
  who belong to multiple contexts. v1 assumes one `user.teamId`.
- WorkOS bot protection: revisit when we have a real spam problem

## Recurring agent instructions

- **Local-first:** type-check after edits, stop before `git commit`.
  Wait for explicit "push it" from Tim. This repo auto-deploys `main`
  to prod, so an accidental push goes live.
- **`npx convex dev --once` overwrites `.env.local`** and drops
  `WORKOS_*` vars. Use `npx convex codegen` instead — read-only.
- **Convex deploy from CLI:** `CONVEX_DEPLOY_KEY=<prod_key> npx convex
  deploy --yes`. Don't use `npx convex run --prod` without
  `CONVEX_DEPLOY_KEY` set.
- **Admin grant:** `node scripts/admin-grant.mjs grant <email> --prod`.
  Falls back to `bootstrapGrantByWorkosUserId` for users whose Convex
  `email` is empty.
- **WorkOS Impersonation** (Authentication → Features) is the right
  way for the agent to sign in as a user for testing — bypasses
  Cloudflare Turnstile.
