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

- **ConnectShell / ConnectHome / ConnectLayout** function names — internal
  handles, not user-visible. Rename for consistency, low value.
- **Profile photo upload** — schema has `imageStorageId`, no UI yet.
- **Partner logo upload** — schema has `logoStorageId` AND seeded
  `logoUrl`; the static path approach works for now, no manual upload
  needed unless a partner sends a new logo.
- **Per-partner analytics dashboard** — scans/day, hot lead conversion.
  Out of scope for May 28.
- **Self-serve partner join code** — today only the team owner or
  conference admin invites; no "share this code with your colleagues"
  flow. Manual invite scales fine for our team count.
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

To grant a user the vendor role (so they can redeem):

```bash
CONVEX_DEPLOY_KEY=<key> npx convex run \
  admin:bootstrapSetAccessLevel '{"email":"vendor@…", "accessLevel":"vendor"}'
```

*(That mutation doesn't exist yet — currently you can promote to admin
via `scripts/admin-grant.mjs`, but vendor needs to be set manually in
the Convex dashboard or via a new bootstrap mutation. Easy follow-up
if/when needed.)*

## Recurring agent instructions

(unchanged from prior plan — local-first, npx convex codegen not dev,
prod CONVEX_DEPLOY_KEY, WorkOS impersonation for testing)
