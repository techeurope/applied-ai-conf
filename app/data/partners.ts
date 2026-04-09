import type { PartnersByTier } from '@/types';

export const PARTNERS = {
  premium: [
    {
      name: 'Nebius',
      logo: '/logos/nebius.svg',
      url: 'https://nebius.com',
      logoAlt: 'Nebius logo',
    },
    {
      name: 'IT-Schulungen.com',
      logo: '/logos/it-schulungen.png',
      url: 'https://www.it-schulungen.com',
      logoAlt: 'IT-Schulungen.com logo',
    },
  ],
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
    {
      name: 'Dust',
      logo: '/logos/dust.svg',
      url: 'https://dust.tt',
      logoAlt: 'Dust logo',
      logoScale: 0.55,
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
