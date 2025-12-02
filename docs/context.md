# Applied AI Conf by {Tech: Europe} - Codebase Context

## Overview

Next.js 15 conference website for "Applied AI Conf by {Tech: Europe}" - an event series, with the first edition focused on Applied AI. Scheduled for May 28, 2026 at The Delta Campus in Berlin. Built with React 19, TypeScript, Tailwind CSS v4, and React Three Fiber shader graphics.

## Architecture

**Framework:** Next.js 15.5.6 with App Router
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
- `speakers.ts`, `faqs.ts`: Section specific content

## Current State

**Landing Page Sections (in order):**

1. **Hero:** Lidar scape background, massive mono typography ("Applied / AI Conf"). Features a "HUD" style grid layout containing the intro pitch, venue info, date, newsletter subscription (via modal), and ticket action with spinning gradient border.
2. **FeaturedSpeakers:** Three-per-row layout. Default state: clean grayscale images, white HUD name boxes. Hover state: Green "CRT monitor" aesthetic with scanlines, glowing text, and green accents.
3. **PartnershipTiers:** Partner CTA section with "Become a Partner" button. Features three distinct tiers (Platinum, Gold, Community) displayed as shader-based cards with direct text overlay (no containers) for a cleaner, integrated look.
4. **CallToAction:** Final CTA section with "Want to get updates and buy tickets?" heading and two hot elements (spinning gradient borders) for newsletter signup and ticket purchase.

**Deactivated Sections (still in codebase but not rendered):**
- **Overview:** Glass cards detailing focus areas and attendee profiles.
- **FAQ:** Glass-card accordion with static heading.

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

**Todo Items** (from `todo.md`):

- Newsletter signup via beehiiv embed (completed, integrated in Hero)
- Speaker section implementation (completed, refined)
- Hero updates (completed, refined)
- Partnership page (completed via PartnershipTiers section)
- Static pages (Imprint, Privacy) (completed)

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
