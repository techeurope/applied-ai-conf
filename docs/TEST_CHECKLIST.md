# Connect Platform — Test Checklist

What's left to test, what to provide, and what to run when ready to push.

## Quick state

- **13 commits sitting locally on `main`, nothing pushed to prod.**
- All Convex schema + functions live on **dev deployment**
  `uncommon-alpaca-482`.
- Resend wired with the sandbox sender `onboarding@resend.dev`.
- Luma sync: 1,457 cached → 395 approved, 1005 invited, 55 declined,
  2 pending, 0 waitlist.
- Your dev user is admin again (`k57d60c4tdf8d5k8mdyk303jgd86wy2m`).

## What I already verified in CDP on `https://conf.localhost`

- [x] Access gate (`/connect` → `/connect/link-ticket` for unverified)
- [x] Approval filter (my own `invited` email correctly rejected)
- [x] Admin bypass (granted admin → gate passes)
- [x] Onboarding single-page form
- [x] Claim-code generate + redeem → ticket-linked → gate passes
- [x] Token-based QR (`aac_b2haebd5`) + legacy `_id` fallback
- [x] Auto-link smoke test (patched email to real Luma → `ticketLinks` row created)
- [x] Badge home page at `/connect`
- [x] Favorite talks → heart on `/connect/agenda` → shows in `/connect/agenda/mine`
- [x] Created partner team **Stripe (gold)**, verified, invited self → auto-attached
- [x] **Team** tab appeared in nav
- [x] `/connect/team` dashboard renders, `/connect/partner/stripe` public page works

## 1. Tests you need to run (need a real inbox / second account)

### 1a. Verification flow — happy path
**Pre-req:** approve your Luma invitation for the email you used on
WorkOS (or change your WorkOS email to an already-approved Luma email).

- [ ] Sign in. Expected: skip the link-ticket page entirely, land on
      onboarding (or badge home if onboarding done).
- [ ] Convex audit log should show the `auto` link method.

### 1b. Verification flow — different email path
- [ ] Sign up with an email **different** from your Luma one.
- [ ] Bounce to `/connect/link-ticket`.
- [ ] Type your Luma email → click Continue.
- [ ] Check inbox for `onboarding@resend.dev`, get the 6-digit code.
- [ ] Enter the code → land on onboarding → verified.

### 1c. Verification flow — reject path
- [ ] Enter an email that's NOT on the Luma list at all.
- [ ] Expected: "We can't find that email on the Luma guest list."

### 1d. Verification flow — claim code path
- [ ] Admin generates a code at `/connect/admin/codes`.
- [ ] Click "email" next to the code → check inbox.
- [ ] Use the code on `/connect/link-ticket` → verified.

## 2. Bulk codes + email delivery (Phase 8)

- [ ] `/connect/admin/codes` → "Bulk import" panel.
- [ ] Paste sample rows:
      ```
      test1@yourdomain.com, Test One, Acme, CTO
      test2@yourdomain.com, Test Two
      ```
- [ ] Pick a kind (speaker / walkin / guest / staff). Click "Generate all".
- [ ] Get back a list of generated codes.
- [ ] Click "email" next to any code → it lands in the target inbox.

## 3. Partner team end-to-end (needs a second account)

- [ ] Create a partner team in `/connect/admin/partners`.
- [ ] Mark as Verified.
- [ ] Invite a teammate's email (different account).
- [ ] Teammate signs up via WorkOS → auto-attached, **Team** tab visible.
- [ ] Both you and teammate scan a third user's QR (or have the third user scan you).
- [ ] Visit `/connect/team/leads` — should show the same shared contacts for both members.
- [ ] Either member can edit notes inline.
- [ ] Click "Export CSV ↓" → downloads `<slug>-leads-YYYY-MM-DD.csv`.
- [ ] CSV columns: scanned_at, name, email, role, company, linkedin, notes, tags.

## 4. Public partner profile

- [ ] Visit `/connect/partner/stripe` in an incognito window.
- [ ] See branding (name, tier, booth, bio, website).
- [ ] See team members who have `directory_listing` consent ON.
- [ ] Unverified team → page returns null.

## 5. Personal agenda

- [ ] On `/connect/agenda`, heart 3-4 talks.
- [ ] `/connect/agenda/mine` shows only the hearted ones.
- [ ] Breaks and Logistics rows should NOT show a heart.

## What I need from you (one-time)

| Action | Why |
|---|---|
| **Resend DNS** for `techeurope.io` (SPF + DKIM records in your DNS host) | So emails go from `noreply@techeurope.io` instead of the sandbox sender. Sandbox works for personal testing but won't fly with sponsor recipients. |
| **A second test account** (different email) | Needed for partner-team end-to-end and two-user scanning. |
| **Approve your own Luma invitation** for `timpietrusky@gmail.com` (or any email you control) | Lets you test the auto-link happy path. Right now you're `invited`, which the approval filter correctly rejects. |
| **Push policy** for prod | These 13 commits are sitting locally. When you give the green light I push and run the four prod commands below. |

## Pushing to prod — checklist

When you're ready, in this order:

```bash
# 1. Push to main (auto-triggers Vercel build + deploy)
git push origin main

# 2. Set Convex prod env vars (one-time)
CONVEX_DEPLOY_KEY=<prod_key> npx convex env set RESEND_API_KEY <resend_key>
CONVEX_DEPLOY_KEY=<prod_key> npx convex env set EMAIL_FROM "Applied AI Conf <onboarding@resend.dev>"
# LUMA_API_KEY should already be set from earlier; verify:
CONVEX_DEPLOY_KEY=<prod_key> npx convex env list | grep LUMA

# 3. Populate prod Luma cache (runs the same sync that filled dev with 1,457)
CONVEX_DEPLOY_KEY=<prod_key> node scripts/sync-luma-attendees.mjs --prod

# 4. Backfill publicToken for existing prod users
CONVEX_DEPLOY_KEY=<prod_key> npx convex run users:backfillPublicTokens '{}'

# 5. Purge orphan staging artifacts in prod
node scripts/prod-cleanup.mjs --prod
# (CONVEX_DEPLOY_KEY env var must be set for the line above too)
```

The prod CONVEX_DEPLOY_KEY is:
```
prod:neat-coyote-777|eyJ2MiI6IjIwNWU3OTg0OTZhYTQzMmI5ZDAwZGMwYmJjYWNjZDMwIn0=
```

## Known gaps / non-blockers

- **DNS-verified Resend** — sandbox sender only until you add DNS records.
- **`/connect/u/<convex_id>` legacy fallback still in code** — kept for one
  release in case any old QR codes are in the wild.
- **Self-serve partner join codes** — admins invite by email; partner team
  owners can't generate codes for their own teammates yet. Future.
- **Push notifications for favorite talks** — not built.
- **Per-partner analytics dashboard** (scans/day, conversion) — not built.
- **Dev test data not cleaned** — Stripe partner, Tim's teamId, claimed
  `UCVS-RH68` code are still in dev. Harmless, kept for verification.
