# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Next.js 16 conference website for "Applied AI Conf by {Tech: Europe}" - a one-day applied AI conference on May 28, 2026 at The Delta Campus in Berlin. Built with React 19, TypeScript (strict), Tailwind CSS v4, and React Three Fiber for shader graphics.

## Commands

```bash
pnpm dev          # Dev server with Turbopack
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
```

### Speaker Image Pipeline

```bash
node scripts/generate-image.mjs -p "<prompt>" -i public/speakers/name.jpg -o public/speakers/name_fullbody_square.png -a 1:1
node scripts/remove-background.mjs -i public/speakers/name_fullbody_square.png -o public/speakers/name_fullbody_transparent_square.png
node scripts/crop-to-square.mjs -i public/speakers/name_fullbody_transparent.png
```

## Architecture

**Path alias:** `@/*` maps to `./app/*` - all imports use `@/` prefix.

### Data-Driven Content

All content lives in `app/data/*.ts` as typed constants (using `satisfies`) with types in `app/types/*.ts`. Components import data directly - no CMS, no fetching. Example: `CONFERENCE_INFO` in `data/conference.ts` satisfies `ConferenceInfo` type.

### Component Organization

- **Sections** (`app/sections/`): Full-page sections composing the landing page (Hero, FeaturedSpeakers, PartnershipTiers, etc.). Export from `sections/index.ts`, compose in `app/page.tsx`.
- **Components** (`app/components/`): Reusable elements (Navigation, Footer, SubpageLayout). SubpageLayout wraps all static pages (Team, Imprint, Privacy, Code of Conduct) with consistent Nav + Footer.
- **UI primitives** (`app/components/ui/`): Low-level components - shader backgrounds (LidarScapeBackground, ShaderWaveBackground, FluidWaveBackground), newsletter form (3 variants), buttons, company logo SVGs.
- **Company logos** (`app/components/ui/*-logo.tsx`): Inline SVG React components for speaker companies, imported via `@/components`.

### Key Integrations

- **Ticketing:** Luma Events - buttons use `data-luma-action` and `data-luma-event-id` attributes, checkout script loaded in root layout.
- **Newsletter:** Beehiiv - `POST /api/subscribe` route. Requires `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` env vars.
- **Analytics:** Vercel Analytics.
- **3D/Shaders:** React Three Fiber + Three.js for hero background effects.

### Marketing Tools (`/marketing/*`)

Speaker card generator, twitter banner generator, logo exporter, and favicon generator. The twitter banner uses a Zustand store with undo/redo history.

## Styling Conventions

- **Dark theme:** Background `#05070f`, foreground `#f5f7ff`. All design is dark-mode only.
- **Fonts:** Kode Mono (headings/mono elements), Inter (body/UI text).
- **Typography fix:** `applyKerning()` in `app/lib/utils.tsx` fixes 'j' character spacing in Kode Mono by wrapping characters with adjusted margins.
- **Utility:** `cn()` in `app/lib/utils.tsx` combines `clsx` + `tailwind-merge`.
- **Global classes:** `.glass` (frosted backdrop), `.glass-card` (hover card effect), `.text-glow` (gradient text white to gray-500).
- **Borders:** Subtle white borders at 5-30% opacity (`border-white/10`).

## Git Conventions

Conventional commits, Angular style, all lowercase: `<type>(<scope>): <subject>`

Types: `fix`, `feat`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`. Present tense, under 72 characters. Always review all changes with `git status` and `git diff` before committing.

## Content Guidelines

- Avoid specific attendee count claims until confirmed. Use qualitative wording ("curated in-person audience", "builders, founders, CTOs, and engineers").
- Speaker data has two image fields: `image` (original headshot) and `imageTransparent` (square transparent PNG). Components prefer `imageTransparent` when available.
