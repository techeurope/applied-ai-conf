import type { PartnersByTier } from '@/types';

export const PARTNERS = {
  gold: [
    {
      name: 'RunPod',
      logo: '/logos/runpod.svg',
      url: 'https://runpod.io',
      logoAlt: 'RunPod logo',
    },
    {
      name: 'Stripe',
      logo: '/logos/stripe.svg',
      url: 'https://stripe.com',
      logoAlt: 'Stripe logo',
      logoScale: 1.35,
    },
  ],
  community: [
    {
      name: 'Peec AI',
      logo: '/logos/peec-ai.svg',
      url: 'https://peec.ai',
      logoAlt: 'Peec AI logo',
      logoScale: 0.65,
    },
    {
      name: 'Google DeepMind',
      logo: '/logos/google-deepmind.svg',
      url: 'https://deepmind.google',
      logoAlt: 'Google DeepMind logo',
      logoScale: 1.15,
    },
    {
      name: 'Elastic',
      logo: '/logos/elastic.svg',
      url: 'https://elastic.co',
      logoAlt: 'Elastic logo',
    },
  ],
} satisfies PartnersByTier;
