# Help Desk — Applied AI Conf · May 28, 2026

Quick scripts for the help desk laptop at the venue. Keep this open in a
browser tab.

## Who can use the admin tools

Three admins on prod (as of 2026-05-24):

| Name | Email | Role |
|---|---|---|
| Tim Pietrusky | `timpietrusky@gmail.com` | Tech lead |
| Bela Wiertz | `bela@techeurope.io` | Help desk lead |
| Nima Sadeghifard | `nima@techeurope.io` | Help desk |
| Jan-Peter Schatten | `jan@techeurope.io` | Help desk |

Sign in at https://conference.techeurope.io/app — admin status grants
access to `/app/admin/*` (attendees, codes, agenda, Luma cache, audit).

## Common scenarios + scripts

### 1. "I can't log in"

1. Ask their email.
2. Open `/app/admin/attendees`, search the email.
3. **If found, status active**: probably a WorkOS Turnstile issue (especially
   in an in-app browser from Slack / Gmail). Tell them to open the URL in
   their default mobile browser (Safari/Chrome) instead.
4. **If found, status `deactivated`**: someone kicked them. Talk to admin
   before reactivating. Use `/app/admin/attendees/<id>` → Reactivate.
5. **If not found**: they've never signed in. Proceed to scenario 3.

### 2. "I'm not on the guest list / live-lookup failed"

The app does a live Luma lookup when they hit `/app/link-ticket`. If that
says "not found" it means:

- Their Luma email differs from the email they signed up with → enter the
  Luma email in the page form, they get a 6-digit code via Resend, paste
  it back.
- They genuinely aren't on Luma yet → desk creates a claim code.

**Mint a claim code on the spot:**
- Go to `/app/admin/codes`
- Click "+ New code", fill in their email + name, kind = `walkin` (or
  `speaker` / `staff` if relevant), Expires in: 1 day
- Hand them the XXXX-XXXX code on a Post-it
- They paste it on `/app/link-ticket` → "Got a desk claim code instead?"

### 3. "I want to be an attendee but never registered" (walk-up)

- If we're accepting walk-ins: create a free guest in Luma's web UI for
  their email (~30s).
- They sign up at https://conference.techeurope.io/app with the same
  email → live Luma lookup picks them up → they're verified.
- If Luma is offline or you don't have access: mint a claim code (scenario 2).

### 4. "I lost my QR / my phone won't open the app"

- Their QR URL is `conference.techeurope.io/app/u/<publicToken>`. The
  publicToken format is `aac_xxxxxxxx`.
- Open `/app/admin/attendees`, find them, copy the publicToken from their
  profile. Write it on a sticker.
- They (or a friend) can type the URL on any phone to see their profile
  and effectively act as a paper QR.

### 5. "My lunch voucher is missing"

- All verified attendees + admins are auto-issued a lunch voucher when
  the bulk-issue script runs. If they don't see one in their `/app/voucher`:
  1. Refresh `/app` in their browser (Convex queries are live, sometimes
     a hard refresh helps).
  2. If still missing, run the bulk-issue against prod:
     ```bash
     CONVEX_DEPLOY_KEY=<prod_key> npx convex run \
       vouchers:bootstrapIssueForVerifiedAttendees '{"kind":"lunch"}'
     ```
     It's idempotent + email-deduped — safe to re-run.
  3. If they had one before but it's gone, check `/app/admin/audit` for
     `user.self_delete` or `voucher.bulk_revoke` entries on their email.

### 6. "I'm a speaker — where do I go?"

- Their `/app` landing shows a speaker callout 2h before their talk.
- Otherwise: `/app/agenda` → tap their session → details + speaker bio.
- DMC monitors at the main + side stage show what's live now.

### 7. "Add me as an admin"

You can't just promote anyone. Tim must approve. If approved:
```bash
CONVEX_DEPLOY_KEY=<prod_key> npx convex run \
  admin:bootstrapQueueAdminInvite '{"email":"name@example.com"}'
CONVEX_DEPLOY_KEY=<prod_key> npx convex run \
  admin_email:sendAdminInvite '{"email":"name@example.com","inviterName":"Tim"}'
```

If the user already has a Convex row, the first command promotes them
immediately and the second is a courtesy email. If not, the invite waits
in the `adminInvites` table and auto-consumes on their first sign-in.

## Key infrastructure URLs

- **App (prod)**: https://conference.techeurope.io/app
- **Convex dashboard (prod)**: https://dashboard.convex.dev/d/neat-coyote-777
- **WorkOS dashboard**: https://dashboard.workos.com (Production env)
- **Vercel project**: https://vercel.com/0-nlyai/applied-ai-conf
- **Luma event**: https://lu.ma/event/edit/evt-EFJJfPGbyKg7PYU (admin)
- **Resend dashboard**: https://resend.com/emails

## CLI prerequisites

Get the prod CONVEX_DEPLOY_KEY from 1Password (shared with Bela / Nima)
or from the Convex dashboard (Settings → Deploy Keys). Never paste it
into a committed file.

```bash
export CONVEX_DEPLOY_KEY=prod:neat-coyote-777|<...>
# Now `npx convex run --prod ...` works
```

## Emergency: Convex is unreachable

- Mint claim codes ahead of time (pre-print 30 walk-in stickers).
- Help desk laptop should have a printed CSV of all currently-verified
  attendees as a fallback to look people up by name.
- The `/stage/main` and `/stage/side` monitors poll Convex every 10s; if
  they go blank, fall back to a printed agenda.

## Emergency: WorkOS is unreachable

- Nobody can sign in. There's no fallback — wait for WorkOS to recover.
- Pre-signed-in attendees on the day continue to work via cookie
  sessions until they expire.

## Emergency: tech lead is unreachable

- Bela, Nima, Jan all have admin access on prod and can run most of the
  above scripts. They share the prod deploy key in 1Password.
- For a full system-down incident, contact Vercel + Convex support via
  their dashboard.

---

Last updated 2026-05-24.
