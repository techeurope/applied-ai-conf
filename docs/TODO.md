# `/app` Platform — TODO

## ✅ Done (after the /connect → /app rename)

- **Agenda in Convex** — sessions table on dev + prod (42 rows). AgendaList,
  dashboard live strip, speaker callout all read from Convex (reactive).
  `app/data/agenda.ts` still exists as the seed source.
- **Admin agenda CMS** at `/app/admin/agenda` — inline edit every field,
  filter by stage, create, delete, cancel toggle. Cancelled sessions grey
  out + strike through but stay in the table so favorites resolve.
- **DMC stage views** at `/stage/main` + `/stage/side` — full-screen,
  public-readable, no auth, no nav chrome. LIVE NOW card with progress
  bar, UP NEXT card, giant current time, auto-refresh every 10s. Skips
  cancelled sessions.
- **Vouchers**:
  - Schema: `vouchers` table indexed by user, kind, public token
    (`vch_xxxxxxxx`). users.accessLevel extended with "vendor".
  - Attendee dashboard shows a card per voucher (QR + redeemed state).
  - `/app/vendor` — vendor-gated scanner that redeems with one tap.
  - `/v/[token]` — public landing for anyone who scans a voucher QR.
  - Admin per-attendee Vouchers panel with "+ Issue lunch / coffee".
  - `bootstrapIssueForVerifiedAttendees` mutation seeded lunch
    vouchers on dev (2) + prod (1, Tim).
- **Branding cleanup** — page title, PWA manifest, splash header, header
  brand link, marketing copy all dropped "Connect" → "Applied AI Conf".

## 🟡 Still open (smaller polish)

- **Profile photo upload** — schema has `imageStorageId`, no UI yet.
- **Cron-based partner attach** — deliberately not on a cron. Run
  `scripts/sync-partner-teams.mjs` manually after new partner staff get
  Luma tickets.

## ✅ Just landed

- **AppShell / AppLayout / AppHome** rename — internal symbols cleaned
  up after the `/connect` → `/app` move.
- **`admin:bootstrapSetAccessLevel`** — single mutation to set any user
  to `admin` / `member` / `vendor` by email. Replaces the manual
  Convex-dashboard tweak previously needed for vendor accounts.
- **Mission Control dashboard** — `/app` is now `Dashboard.tsx`. Status
  header with live clock + conference day countdown, speaker callout
  (auto-pulses when their talk is ≤2h away), Right-Now panel with
  real-time progress bars on live talks + Up Next, badge panel with
  tap-to-enlarge fullscreen QR, vouchers below.
- **`/app/scan`** — camera + upload extracted into their own route. The
  Home tab is no longer "Scan".
- **Agenda Right-Now panel** — `/app/agenda` now has a live panel at
  the top mirroring the dashboard, with tap-to-scroll to matching list
  rows. Replaces the previous "buried LIVE pill" UX.
- **Nav refresh** — Home / Scan / Contacts (with live count) / Agenda /
  Settings; admin/team/vendor tabs unchanged. Vendor tab relabeled from
  "Redeem" → "Vendor" (the role name, not a confusing verb).
- **Self-serve team join code** — `teamInviteCodes` table, one active
  shareable 8-char code per team. Owners generate / copy / rotate /
  revoke on `/app/team`. Anyone visits `/app/team/join/<code>` to join.
- **Per-partner analytics** — `/app/team/analytics`: unique leads,
  total scans, active scanners / member count, hot-lead conversion
  rate, lead-status stacked bar, scans-by-hour bar chart, per-member
  leaderboard. Powered by a single `myTeamAnalytics` Convex query.

## How to issue vouchers before the event

```bash
# Lunch for every verified attendee
CONVEX_DEPLOY_KEY=<prod_key> npx convex run \
  vouchers:bootstrapIssueForVerifiedAttendees '{"kind":"lunch"}'

# Add a per-attendee voucher via the admin UI:
# /app/admin/attendees/<id>  → "+ Issue lunch" / "+ Issue coffee"
```

To grant a user the vendor role (so they can redeem):

```bash
CONVEX_DEPLOY_KEY=<key> npx convex run \
  admin:bootstrapSetAccessLevel '{"email":"vendor@…", "accessLevel":"vendor"}'
```

## Recurring agent instructions

(unchanged from prior plan — local-first, npx convex codegen not dev,
prod CONVEX_DEPLOY_KEY, WorkOS impersonation for testing)
