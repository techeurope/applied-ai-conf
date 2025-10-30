# Applied AI Conference - Codebase Context

## Overview

Next.js 15 conference website for "Applied AI in Europe" - a one-day technical conference scheduled for Summer 2026 in Berlin. Built with React 19, TypeScript, Tailwind CSS v4, and Spline 3D graphics.

## Architecture

**Framework:** Next.js 15.5.6 with App Router
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS v4 with PostCSS
**3D Graphics:** Spline via @splinetool/react-spline
**Font:** Kode Mono (Google Fonts)
**Build:** Standalone output mode

## File Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/            # Low-level UI primitives (Spline wrapper)
│   ├── Navigation.tsx # Fixed header navigation
│   ├── Footer.tsx     # Site footer
│   └── index.ts       # Component exports
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
- **Components** (`app/components/`): Reusable UI elements (Navigation, Footer, Spline wrapper)
- **Main Page** (`app/page.tsx`): Composes sections in order

### Styling Approach

- Tailwind CSS v4 with inline theme configuration
- Dark theme: black background (`#05070f`), white/gray text
- Custom scrollbar styling
- Gradient overlays for visual depth
- Typography: Kode Mono monospace font throughout

### Interactive Patterns

**Typing Animation:** Used in Overview and PartnershipTiers sections. Components reveal text character-by-character when scrolled into view, then loop with delete animation. Uses IntersectionObserver for scroll detection.

**Spline Integration:** Hero section includes 3D neural network visualization via Spline. Lazy-loaded with Suspense fallback.

**FAQ Accordion:** Client-side state manages open/close. First item open by default.

### Configuration Pattern

Path aliases: `@/*` maps to `./app/*` (configured in `tsconfig.json`). All imports use `@/` prefix.

### Data Structure

Conference data split by domain:

- `conference.ts`: Title, tagline, location, date, ticket pricing
- `partnerships.ts`: Partnership tiers (Platinum/Gold/Silver/Bronze), add-ons, audience segments, focus areas
- `navigation.ts`: Header links and action buttons
- Other data files: Speakers, sessions, sponsors, FAQs (prepared but may not be fully used)

## Current State

**Active Sections:**

- Hero (with Spline background, newsletter form)
- Overview (typing heading, focus areas, attendees)
- PartnershipTiers (typing heading, tier cards, stats, CTA)
- FAQ (typing heading, accordion)

**Commented Out:**

- FeaturedSpeakers section (exists but not rendered)

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

- Next.js configured for standalone output (Docker-friendly)
- Spline scenes loaded from remote URLs (prod.spline.design)
- Newsletter form in Hero is currently non-functional (needs backend integration)
- All sections use consistent gradient overlay backgrounds
- Smooth scroll behavior enabled globally
- Font loading optimized via next/font
