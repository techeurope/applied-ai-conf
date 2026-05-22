# `/app` Platform — TODO

## ✅ Shipped

### Schedule
- **Agenda in Convex** — sessions table on dev + prod (42 rows).
  AgendaList, dashboard right-now panel, speaker callout all read from
  Convex (reactive). `app/data/agenda.ts` still exists as the seed source.
- **Admin agenda CMS** at `/app/admin/agenda` — inline edit every field,
  filter by stage, create, delete, cancel toggle. Cancelled sessions grey
  out + strike through but stay in the table so favorites resolve.
- **DMC stage views** at `/stage/main` + `/stage/side` — full-screen,
  public-readable, no auth, no nav chrome. LIVE NOW card with progress
  bar, UP NEXT card, giant current time, auto-refresh every 10s. Skips
  cancelled sessions.
- **Agenda Right-Now panel** at the top of `/app/agenda` mirrors the
  dashboard. Tapping a live card scrolls + highlights its list row.

### Attendee experience
- **Mission Control dashboard** at `/app`: status header with live
  clock + conference-day countdown, speaker callout (≤2h glow), Right-
  Now panel with real-time progress bars + Up Next, badge panel with
  tap-to-enlarge fullscreen QR. Speakers see their next talk first.
- **`/app/scan`** — camera + upload as their own route.
- **`/app/voucher`** — dedicated tab with full-size voucher QR(s).
  Tab only shows when the user has ≥1 voucher. Replaces the cramped
  dashboard voucher card and the deleted `/app/vendor` scanner (we
  don't redeem in-app; vendors use their own scanner).
- **Inline contact count** in nav.
- **Internal rename** ConnectShell/Layout/Home → AppShell/AppLayout/AppHome.

### Partners
- **Self-serve team join code** — `teamInviteCodes` table, one active
  shareable 8-char code per team. Owners generate / copy / rotate /
  revoke on `/app/team`. Anyone visits `/app/team/join/<code>` to join
  (works pre-ticket-link; auto-marks them verified on join).
- **Per-partner analytics** at `/app/team/analytics`: unique leads,
  total scans, active scanners / member count, hot-lead conversion
  rate, lead-status stacked bar, scans-by-hour bar chart, per-member
  leaderboard. Powered by a single `myTeamAnalytics` Convex query.

### Vouchers (issuance only — no in-app redemption)
- Schema: `vouchers` table indexed by user, kind, public token
  (`vch_xxxxxxxx`).
- Admin per-attendee Vouchers panel with "+ Issue lunch / coffee".
- `bootstrapIssueForVerifiedAttendees` mutation for bulk issuance.
- `/v/[token]` — public landing page if someone scans the voucher QR
  with a generic camera app.

### Admin
- **`admin:bootstrapSetAccessLevel`** mutation to set any user to
  `admin` / `member` / `vendor` by email.
- **Branding cleanup** — every "Connect" string dropped → "Applied AI Conf".

## 🟡 Still open

- **Profile photo upload** — schema has `imageStorageId`, no UI yet.
- **Cron-based partner attach** — deliberately not on a cron. Run
  `scripts/sync-partner-teams.mjs` manually after new partner staff get
  Luma tickets.

## How to issue vouchers before the event

```bash
# Lunch for every verified attendee
CONVEX_DEPLOY_KEY=<prod_key> npx convex run \
  vouchers:bootstrapIssueForVerifiedAttendees '{"kind":"lunch"}'

# Add a per-attendee voucher via the admin UI:
# /app/admin/attendees/<id>  → "+ Issue lunch" / "+ Issue coffee"
```

To grant a user admin (or vendor, if we ever need it again):

```bash
CONVEX_DEPLOY_KEY=<key> npx convex run \
  admin:bootstrapSetAccessLevel '{"email":"tim@…", "accessLevel":"admin"}'
```

## Recurring agent instructions

(unchanged from prior plan — local-first, npx convex codegen not dev,
prod CONVEX_DEPLOY_KEY, WorkOS impersonation for testing)
