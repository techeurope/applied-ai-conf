export type Variation = {
  slug: string;
  number: string;
  codename: string;
  title: string;
  tagline: string;
  hook: string;
  vibe: string;
  accent: string;
};

export const VARIATIONS: Variation[] = [
  {
    slug: "v1",
    number: "01",
    codename: "MISSION CONTROL",
    title: "Mission Control",
    tagline: "The conference as a control room.",
    hook: "Tabular clock, status pills, launcher tiles. Dense, numeric, on-brand mono.",
    vibe: "Dense · terminal · numeric",
    accent: "emerald",
  },
  {
    slug: "v2",
    number: "02",
    codename: "BOARDING PASS",
    title: "Boarding Pass",
    tagline: "Your conference day, as a journey.",
    hook: "Warm hero, a single boarding-pass card for today, then trip tiles.",
    vibe: "Warm · transit · tactile",
    accent: "amber",
  },
  {
    slug: "v3",
    number: "03",
    codename: "HERO LANDING",
    title: "Hero Landing",
    tagline: "The marketing hero, but for attendees.",
    hook: "Lidar-style background, huge mono title, countdown, one CTA, launcher tiles below.",
    vibe: "Cinematic · brand · familiar",
    accent: "violet",
  },
  {
    slug: "v4",
    number: "04",
    codename: "THE FLOOR",
    title: "Floor Plan First",
    tagline: "Walk the venue — the map is the homepage.",
    hook: "Full-bleed floor plan with live pulse. Tap a zone to see what's there.",
    vibe: "Spatial · ambient · live",
    accent: "sky",
  },
];
