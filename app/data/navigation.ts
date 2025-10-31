import type { NavigationAction, NavigationLink } from '@/types';

export const NAVIGATION_LINKS = [
] satisfies NavigationLink[];

export const NAVIGATION_ACTIONS = [
  { label: 'Get in touch with us', href: 'mailto:info@techeurope.io', variant: 'primary' },
] satisfies NavigationAction[];
