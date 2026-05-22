# `/app` Platform — Active TODO

Tracked work after the `/connect` → `/app` rename. Tackle in roughly
this order — items above unblock items below.

## 1. Move the agenda into Convex (foundation)

**Why:** today the agenda is hardcoded in `app/data/agenda.ts` so any
fix (typo, time change, swapping a talk) requires a deploy. The DMC
stage view (#2) and the agenda CMS (#3) both depend on a live source.

**Scope:**
- New `sessions` table in Convex schema mirroring `AgendaSlot`:
  `id (slug)`, `title`, `speakerName?`, `startTime`, `endTime`,
  `stage`, `format`, `order`, `description?`.
- Internal mutation `agenda:bootstrapSeed` that imports the current
  `AGENDA` array. Run once on dev + prod.
- `agenda:list` query (public — anyone can read the agenda).
- Switch `AgendaList`, `ScannerHome` live-strip, and
  `findSpeakerSlots` to read from Convex instead of the static
  import. Re-fetch on focus + via Convex's reactivity for live
  updates.
- Keep `app/data/agenda.ts` as a fallback / seed source until we're
  confident the DB copy is canonical, then delete it.

## 2. Admin agenda CMS

**Why:** organisers need to edit titles, swap speakers, shift times,
cancel sessions — without a deploy.

**Scope:**
- New admin route `/app/admin/agenda` listing all sessions grouped by
  stage and time, with inline edit for every field.
- Mutations `agenda:create`, `agenda:update`, `agenda:delete`,
  `agenda:reorder` — all admin-gated, audited.
- Drag-to-reorder by start time. Conflict checking (don't allow two
  sessions on the same stage overlapping).
- "Cancel session" toggle (soft-disable so favorites referencing it
  don't 404; render greyed-out + struck-through on the agenda).

## 3. DMC main-stage view

**Why:** the day-of MC running the main stage wants a giant
single-purpose screen: what's happening RIGHT NOW + what's NEXT,
auto-updating, no nav chrome.

**Scope:**
- New full-screen route `/app/stage/main` (and `/app/stage/side`).
- Probably admin-only (configurable). Big typography, dark
  background, "LIVE NOW" + "UP NEXT in N minutes".
- Re-uses `getConferenceClock` + the new agenda query.
- Refresh every 30s already covered by interval pattern in `AgendaList`.

## 4. Eating voucher (+ other vouchers)

**Why:** attendees get meal/coffee/etc. vouchers as part of their
ticket. Today the only way to manage that is paper / Luma's check-in.
Move it into the app so vendors can redeem digitally.

**Scope:**
- New `vouchers` table: `userId`, `kind` (`"lunch" | "coffee" | …`),
  `issuedAt`, `redeemedAt?`, `redeemedByUserId?` (vendor account),
  `eventId?` (if multi-day).
- Bootstrap mutation: issue 1× lunch voucher to every approved
  attendee on event day.
- Attendee dashboard card: "Today's vouchers" with a per-voucher QR
  the vendor scans.
- Vendor app flow: a new role/permission (`accessLevel: "vendor"` or
  a `vendors` table). Vendor opens `/app/vendor`, scans an attendee's
  voucher QR, marks it redeemed. Audit log entry.
- Admin can issue extra vouchers (VIP gets a second coffee, etc.).

**Open questions:**
- Voucher-QR format vs. attendee-QR format — do we reuse `aac_xxx` or
  a separate prefix like `vch_xxx`?
- Should the dashboard show used + unused, or hide used? (probably
  show with a strikethrough + redeemed-at timestamp).

## 5. Smaller follow-ups noted along the way

- **Page title metadata** still reads `Connect | Applied AI Conf`. If we
  fully retire the "Connect" name, update `app/app/layout.tsx` and
  the manifest's `name` / `short_name`.
- **Unauth splash on `/app`** (the marketing-style page before sign-in)
  still has a giant `<h1>connect</h1>`. Should probably say "Applied AI
  Conf — the app" or similar.
- **`ConnectShell` component name** is internal-only but renaming to
  `AppShell` would match the URL space.
- **Profile photo + partner logo upload UIs** — schema fields exist
  (`imageStorageId`, `logoStorageId`) but no upload flow.
- **Per-partner analytics dashboard** — scans/day, hot leads, etc.
- **Self-serve partner join code** — today only the owner can invite,
  the conference admin can also; no "share this link with your team"
  flow.

## Already-done audit after the rename

- ✅ Code: all `/connect/…` → `/app/…` (verified with grep).
- ✅ QR scanner keeps a backward-compat regex for legacy
  `/connect/u/<token>` payloads.
- ✅ WorkOS Production: App homepage URL + Sign-out redirects updated.
- ✅ WorkOS Staging: App homepage URL + Sign-out redirects updated.
- ✅ Convex prod + dev redeployed (email template text changes).
- ✅ Docs (`PLATFORM_PLAN.md`, `TEST_CHECKLIST.md`) updated.
- ✅ Vercel env vars: nothing to change (no `/connect` references in
  any var; redirect URI lives under `/api/auth/callback`).
