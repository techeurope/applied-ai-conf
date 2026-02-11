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

Uses `agent-media` CLI (install globally: `npm i -g agent-media`). Requires `FAL_API_KEY` in environment (source `~/.zshrc`).

**File naming:** `name.jpg` → `name_fullbody_square.png` → `name_fullbody_transparent_square.png`

**Step 1: Extend headshot to full body (1:1 square)**

The prompt is critical — use this exact prompt for consistency across all speakers:

```bash
agent-media image edit \
  --in public/speakers/name.jpg \
  --prompt "Zoom out and show the full person with complete head, shoulders and upper body. Add empty space at the top of the image above the person's head - the person should not touch the top edge. Position the person lower in the frame with padding above their head. Both shoulders must be fully visible with nothing cut off at any edge. Create a professional headshot with the person centered horizontally but positioned slightly lower with headroom above. Apply professional photo studio lighting with soft, even illumination. Apply consistent color grading: neutral to slightly warm tone (5500K), balanced contrast, natural skin tones. Keep the person exactly the same - same pose, expression, and appearance." \
  --out public/speakers/name_fullbody_square.png \
  --provider fal
```

**Step 2: Color correction (professional photo grade)**

Use sharp (NOT AI edit — AI edit destroys/regenerates the image). Write to a separate file first to avoid overwriting the original.

```bash
node -e "
const sharp = require('sharp');
const input = 'public/speakers/name_fullbody_square.png';
const output = 'public/speakers/name_fullbody_square.png';
sharp(input)
  .modulate({ brightness: 1.05, saturation: 1.25 })
  .linear([1.05, 1.0, 0.95], [5, 0, -5])
  .toFile(output + '.tmp')
  .then(() => { require('fs').renameSync(output + '.tmp', output); console.log('Done'); })
  .catch(e => console.error(e));
"
```

This applies: slight brightness boost, saturation increase, warm color shift (boost reds, reduce blues). Mimics professional studio color grading.

**Step 3: Remove background**

```bash
agent-media image remove-background \
  --in public/speakers/name_fullbody_square.png \
  --out public/speakers/name_fullbody_transparent_square.png \
  --provider fal
```

**Step 4: Crop to square (if needed)**

```bash
agent-media image crop \
  --in public/speakers/name_fullbody_transparent_square.png \
  --width 1024 --height 1024 \
  --out public/speakers/name_fullbody_transparent_square.png
```

**Troubleshooting:**
- Shoulders cut off → add "The [left/right] shoulder especially must be completely visible"
- No headroom → add "Make the person smaller in the frame"
- Color looks washed out/pale → run the color correction step (step 2)
- NEVER use AI edit for color correction — it regenerates the image and degrades quality

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
- **Analytics:** PostHog (posthog-js) with cookie consent banner. Requires `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` env vars.
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
