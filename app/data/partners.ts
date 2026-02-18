import type { PartnersByTier } from '@/types';

export const PARTNERS = {
  gold: [
    {
      name: 'RunPod',
      logo: '/logos/runpod.svg',
      url: 'https://runpod.io',
      logoAlt: 'RunPod logo',
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
  ],
} satisfies PartnersByTier;
