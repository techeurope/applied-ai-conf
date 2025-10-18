import type { SponsorsByTier } from '@/types';

export const SPONSORS = {
  diamond: ['Auth0'],
  platinum: ['Arcjet', 'BigCommerce', 'Blazity', 'Resend', 'Slalom', 'Strapi'],
  gold: [],
} satisfies SponsorsByTier;
