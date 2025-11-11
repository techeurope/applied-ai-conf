# Applied AI Conf by {Tech: Europe} - Codebase Context

## Overview

Next.js 15 conference website for "Applied AI Conf by {Tech: Europe}" - an event series, with the first edition focused on Applied AI. Scheduled for May 28, 2026 at Delta Campus in Berlin. Built with React 19, TypeScript, Tailwind CSS v4, and React Three Fiber shader graphics.

## Architecture

**Framework:** Next.js 15.5.6 with App Router
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS v4 with PostCSS
**Graphics:** React Three Fiber with Three.js for shader-based backgrounds
**Font:** Kode Mono (Google Fonts)

## File Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/            # Low-level UI primitives (shader backgrounds, button, label, slider)
│   ├── Navigation.tsx # Fixed header navigation
│   ├── Footer.tsx     # Site footer
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

- **Sections** (`app/sections/`): Full-page sections with business logic (Hero, Overview, PartnershipTiers, FAQ)
- **Components** (`app/components/`): Reusable UI elements (Navigation, Footer, shader backgrounds, UI primitives)
- **Main Page** (`app/page.tsx`): Composes sections in order

### Styling Approach

- Tailwind CSS v4 with inline theme configuration
- Dark theme: black background (`#05070f`), white/gray text
- Custom scrollbar styling
- Gradient overlays for visual depth
- Typography: Kode Mono monospace font throughout

### Interactive Patterns

**Typing Animation:** Used in Overview and PartnershipTiers sections. Components reveal text character-by-character when scrolled into view, then loop with delete animation. Uses IntersectionObserver for scroll detection.

**Shader Backgrounds:** Hero section uses React Three Fiber with Three.js for shader-based animated backgrounds. FluidWaveBackground component provides a simple, performant fluid wave effect using multiple overlapping sine waves, noise variation, and distortion for natural movement. Shader approach prioritizes simplicity and performance over complex controls.

**FAQ Accordion:** Client-side state manages open/close. First item open by default.

### Configuration Pattern

Path aliases: `@/*` maps to `./app/*` (configured in `tsconfig.json`). All imports use `@/` prefix.

### Data Structure

Conference data split by domain:

- `conference.ts`: Title, tagline, location, date, ticket pricing
- `partnerships.ts`: Partnership tiers (Platinum/Gold/Silver/Bronze), add-ons, audience segments, focus areas
- `navigation.ts`: Header links and action buttons (primary CTA is Tickets, linking to external ticket platform)
- Other data files: Speakers, sessions, sponsors, FAQs (prepared but may not be fully used)

## Current State

**Active Sections:**

- Hero (with React Three Fiber fluid wave shader background, newsletter form, value prop emphasizing speakers who implement AI at scale)
- FeaturedSpeakers (speaker cards with images from public/speakers/)
- Overview (typing heading, focus areas, attendees)
- PartnershipTiers (typing heading, tier cards, stats, dual CTAs: "Become a Partner" primary button and "Get Partnership Info" secondary link)
- FAQ (typing heading, accordion)

**Navigation & CTAs:**

- Primary navigation CTA: Tickets (external link to Luma ticket platform)
- Navigation component handles external links with proper security attributes (target="_blank", rel="noopener noreferrer")
- Partnership CTAs are secondary, located in PartnershipTiers section

**Todo Items** (from `todo.md`):

- Email waitlist/newsletter functionality
- Speaker section implementation
- Hero updates
- Partnership page (separate route)

## Implementation Guidelines

1. **Add New Sections:** Create component in `app/sections/`, export from `sections/index.ts`, import and add to `app/page.tsx`
2. **Add Data:** Create or update file in `app/data/`, ensure types exist in `app/types/`
3. **Styling:** Use Tailwind classes, maintain dark theme consistency
4. **Types:** Always define TypeScript interfaces/types before creating data structures
5. **Components:** Keep sections business-logic heavy, components reusable and simple
6. **Animations:** Typing animation pattern can be reused via `TypingHeading` component (currently duplicated - could be extracted)

## Technical Notes

- Image optimization enabled with `sharp` package required for production (speaker images optimized via Next.js Image component)
- Graphics stack uses React Three Fiber (@react-three/fiber) with Three.js for shader rendering
- UI component utilities use clsx and tailwind-merge for className management
- Newsletter form in Hero is currently non-functional (needs backend integration)
- All sections use consistent gradient overlay backgrounds
- Smooth scroll behavior enabled globally
- Font loading optimized via next/font
- Navigation component conditionally renders anchor tags for external URLs (starts with "http") vs Next.js Link for internal routes

## Branding

- Event series name: "Applied AI Conf by {Tech: Europe}"
- First edition focus: "Applied AI"
- Location: Delta Campus, Berlin
- Date: May 28, 2026
