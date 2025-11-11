import type { NavigationAction, NavigationLink } from '@/types';

export const NAVIGATION_LINKS: NavigationLink[] = [];

export const NAVIGATION_ACTIONS = [
  { label: 'Get tickets', href: 'https://luma.com/applied-ai-europe', variant: 'primary' },
] satisfies NavigationAction[];
