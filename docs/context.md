# Applied AI Conf by {Tech: Europe} - Codebase Context

## Overview

Next.js 16 conference website for "Applied AI Conf by {Tech: Europe}" - an event series, with the first edition focused on Applied AI. Scheduled for May 28, 2026 at The Delta Campus in Berlin. Built with React 19, TypeScript, Tailwind CSS v4, and React Three Fiber shader graphics.

## Architecture

**Framework:** Next.js 16.0.7 with App Router
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS v4 with PostCSS
**Graphics:** React Three Fiber with Three.js for shader-based backgrounds
**Fonts:**

- **Headings/Mono:** Kode Mono (Google Fonts)
- **Body/UI:** Inter (Google Fonts) for maximum readability

## File Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/            # Low-level UI primitives (shader backgrounds, newsletter form, button, label, slider)
│   ├── Navigation.tsx # Floating pill navigation
│   ├── Footer.tsx     # Site footer
│   ├── SubpageLayout.tsx # Shared layout wrapper for subpages (Nav + Footer + spacing)
│   └── index.ts       # Component exports
├── lib/                # Utility functions
│   └── utils.ts       # Shared utilities (cn for className merging)
├── sections/          # Page sections (Hero, Overview, FAQ, etc.)
│   └── index.ts       # Section exports
├── data/              # Static data configuration
│   ├── conference.ts  # Conference metadata
│   ├── partnerships.ts # Partnership tiers and details
│   ├── navigation.ts  # Navigation links and actions
│   ├── faqs.ts        # FAQ items
│   ├── speakers.ts    # Speaker data
│   ├── sessions.ts    # Session data
│   └── sponsors.ts    # Sponsor data
├── types/             # TypeScript type definitions
│   └── index.ts       # Type exports
├── page.tsx           # Main page (composes sections)
├── layout.tsx         # Root layout with font configuration
└── globals.css        # Global styles and Tailwind config

docs/
└── context.md         # This file - project documentation
```

## Key Concepts

### Data Flow Pattern

Data lives in `app/data/` as typed constants, imported into components/sections. Types defined in `app/types/` ensure type safety. Example: `CONFERENCE_INFO` in `data/conference.ts` satisfies `ConferenceInfo` type.

### Component Organization

- **Sections** (`app/sections/`): Full-page sections with business logic (Hero, FeaturedSpeakers, PartnershipTiers, CallToAction)
- **Components** (`app/components/`): Reusable UI elements (Navigation, Footer, SubpageLayout, shader backgrounds, UI primitives)
- **Brand/Company Logos** (`app/components/ui/*-logo.tsx`): Inline SVG React components, consumed via `@/components` (e.g. speaker company badges) to avoid image assets + filter hacks.
- **Main Page** (`app/page.tsx`): Composes sections in order
- **Subpages** (`app/*/page.tsx`): Static pages (Team, Imprint, Privacy, Code of Conduct) use SubpageLayout for consistent spacing and structure

### Styling Approach

- **Vercel-like Aesthetic:** High contrast, glassmorphism (`.glass`, `.glass-card`), subtle borders (`border-white/10`), and glow effects (`.text-glow`).
- **Tailwind CSS v4:** Inline theme configuration in `globals.css`.
- **Dark Theme:** Deep black background (`#05070f`) with cleaner white/gray text.
- **Typography:**
  - `Kode Mono` for titles, numbers, and tech elements.
  - `Inter` for body text, descriptions, and UI elements to ensure high readability.
- **Animations:** Fade-ins (`animate-fade-in-up`) and refined shader movements.

### Interactive Patterns

**Shader Backgrounds:** Hero section uses React Three Fiber for a fluid wave effect (`FluidWaveBackground`). Tuned for a slower, more elegant "ethereal" movement with subtle color shifts.

**Navigation:** Floating pill design, sticky at the top, with glass effect.

### Configuration Pattern

Path aliases: `@/*` maps to `./app/*` (configured in `tsconfig.json`). All imports use `@/` prefix.

### Data Structure

Conference data split by domain:

- `conference.ts`: Title, tagline, location, date
- `partnerships.ts`: Partnership tiers, audience segments, focus areas
- `navigation.ts`: Header links and action buttons
- `footer.ts`: Footer navigation links
- `speakers.ts`: Speaker data with taglines, alt text, logos, transparent images
- `faqs.ts`: FAQ items (legacy, FAQ section uses inline data)

### Speaker Images

Speakers have two image fields:
- `image`: Original headshot (with background) - e.g. `/speakers/name.jpg`
- `imageTransparent`: Square transparent PNG (fullbody, background removed) - e.g. `/speakers/name_fullbody_transparent_square.png`

Components prefer `imageTransparent` when available, falling back to `image`.

**Image pipeline:**

```bash
# 1. Remove background from source image
node scripts/remove-background.mjs -i public/speakers/name_fullbody.png

# 2. Crop 16:9 to center-square for marketing
node scripts/crop-to-square.mjs -i public/speakers/name_fullbody_transparent.png
```

- `remove-background.mjs`: Uses fal-ai/birefnet/v2 for high-quality background removal
- `crop-to-square.mjs`: Center-crops 16:9 images to square for consistent marketing assets

### Marketing Asset Generator

Located at `/marketing/speakers`, the speaker asset generator creates promotional images for speakers. Features:

- **Background modes**: Toggle between lidar grid animation or solid color backgrounds
- **Solid color picker**: Any background color when grid is disabled
- **Global text color**: Override all text elements with a single color for consistent branding
- **Transparent images**: Automatically uses `imageTransparent` speaker images for clean compositing
- **Export**: High-res PNG exports at 1K/2K/4K resolutions

The twitter banner generator at `/marketing/twitter-banner` creates event banners with similar customization.

## Current State

**Landing Page Sections (in order):**

1. **Hero:** Lidar scape background, massive mono typography ("Applied / AI Conf"). HUD-style grid with subheadline ("A one-day applied AI conference in Berlin..."), supporting paragraph, venue/date info, newsletter signup, dual CTAs (Get Tickets + Become a Partner), and a scrolling marquee of speaker company logos.
2. **About:** Three subsections - "About Applied AI Conf" (conference description), "Who it's for" (target audience list), "What you'll walk away with" (outcomes list).
3. **FeaturedSpeakers:** Three-per-row layout. Each card shows: headshot with proper alt text, name, role line ("CTO, Legora"), company logo with alt text, tagline describing what the company does. Green CRT aesthetic on hover.
4. **Format:** Two-track format description (Main + Side track), workshops/panels/demos, expo area. Agenda coming soon notice.
5. **PartnershipTiers:** Partner benefits list, three tiers (Platinum, Gold, Community) as shader cards, dual CTAs ("Become a partner" + "Request sponsorship deck").
6. **CallToAction:** "Get Applied AI updates" newsletter section with benefits list, spinning border input, "No spam" notice.
7. **FAQ:** Accordion with 5 questions covering: beginner suitability, two tracks, ticket inclusions, group tickets, sponsorship.

**Deactivated Sections (still in codebase but not rendered):**

- **Overview:** Glass cards detailing focus areas and attendee profiles.

**Static Pages:**

- **Team** (`/team`): Dedicated page showcasing team members with grayscale photos and social links, mirroring speaker card aesthetic. Uses Nav + Footer layout, no Hero.
- **Imprint** (`/imprint`): Legal information, company details, contact info, and disclaimer per German TMG regulations. Uses Nav + Footer layout, no Hero.
- **Privacy** (`/privacy`): GDPR-compliant privacy policy covering data collection, processing, retention, and user rights. Uses Nav + Footer layout, no Hero.
- **Code of Conduct** (`/code-of-conduct`): Community guidelines adapted from JSConf EU Code of Conduct, covering anti-harassment policies, enforcement, reporting procedures, and inclusive language expectations. Uses Nav + Footer layout, no Hero.

**Navigation & CTAs:**

- **Header:** Floating pill with Logo and "Get Tickets" CTA.
- **Footer:** Links to Team, Imprint, Privacy, and Code of Conduct pages. Includes social icons (X, LinkedIn).
- **Primary CTA:** "Get Tickets" (links to Luma).
- **Secondary CTAs:** "Become a Partner" (email/form links).

## SEO

- **Title:** "Applied AI Conference Berlin | May 28, 2026"
- **Meta description:** Includes "applied AI", "AI in production", "Berlin", target audience
- **Event structured data:** JSON-LD Event schema with date, location, organizer, ticket URL
- **Canonical URL:** https://conference.techeurope.io

## Implementation Guidelines

1. **Add New Sections:** Create component in `app/sections/`, export from `sections/index.ts`, import and add to `app/page.tsx`
2. **Styling:** Use global utility classes (`glass`, `glass-card`, `text-glow`) for consistency.
3. **Components:** Prefer `lucide-react` for icons.
4. **Responsiveness:** Ensure all grids (`grid-cols-`) break down gracefully to single columns on mobile.
5. **Animations:** Use CSS animations for simple fades and IntersectionObserver for complex reveal effects.

## Environment Variables

```
# Beehiiv Newsletter Integration
# Get from: beehiiv dashboard > Settings > Integrations > API
BEEHIIV_API_KEY=your_api_key_here
BEEHIIV_PUBLICATION_ID=your_publication_id_here
```

## Technical Notes

- Graphics stack uses React Three Fiber (@react-three/fiber) with Three.js.
- `LidarScapeBackground` uses a custom shader to create a scrolling "lidar" terrain effect. Includes developer UI for tuning parameters.
- Images use Next.js `Image` component with `grayscale` effect on hover.
- Global CSS includes custom scrollbar and loader styles.
