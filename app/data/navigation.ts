import type { NavigationAction, NavigationLink } from '@/types';

export const NAVIGATION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Audience', href: '#audience' },
  { label: 'Tiers', href: '#tiers' },
  { label: 'Q&A', href: '#faq' },
] satisfies NavigationLink[];

export const NAVIGATION_ACTIONS = [
  { label: 'Download prospectus', href: '#tiers', variant: 'secondary' },
  { label: 'Contact partnerships', href: 'mailto:partnerships@appliedai.com', variant: 'primary' },
] satisfies NavigationAction[];
