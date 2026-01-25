import type { NavigationAction, NavigationLink } from '@/types';

export const LUMA_EVENT_ID = 'evt-EFJJfPGbyKg7PYU';

export const NAVIGATION_LINKS: NavigationLink[] = [];

export const NAVIGATION_ACTIONS = [
  { label: 'Partner', href: '#tiers', variant: 'secondary' },
  { label: 'Get tickets', href: `https://lu.ma/event/${LUMA_EVENT_ID}`, variant: 'primary' },
] satisfies NavigationAction[];
