import type { NavigationAction, NavigationLink } from '@/types';

export const NAVIGATION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Partnership', href: '#tiers' },
  { label: 'FAQ', href: '#faq' },
] satisfies NavigationLink[];

export const NAVIGATION_ACTIONS = [
  { label: 'Get in touch with us', href: 'mailto:info@techeurope.io', variant: 'primary' },
] satisfies NavigationAction[];
