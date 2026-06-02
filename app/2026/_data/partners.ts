import type { PartnersByTier } from '@/types';

export const PARTNERS = {
  premium: [
    {
      name: 'Nebius',
      logo: '/logos/nebius.svg',
      url: 'https://nebius.com',
      logoAlt: 'Nebius logo',
    },
  ],
  gold: [
    {
      name: 'OpenAI',
      logo: '/logos/openai.svg',
      url: 'https://openai.com',
      logoAlt: 'OpenAI logo',
      logoScale: 0.8,
    },
    {
      name: 'RunPod',
      logo: '/logos/runpod.svg',
      url: 'https://runpod.io',
      logoAlt: 'RunPod logo',
      logoScale: 0.85,
    },
    {
      name: 'Stripe',
      logo: '/logos/stripe.svg',
      url: 'https://stripe.com',
      logoAlt: 'Stripe logo',
      logoScale: 1.15,
    },
    {
      name: 'Modal',
      logo: '/logos/modal.svg',
      url: 'https://modal.com',
      logoAlt: 'Modal logo',
      logoScale: 0.7,
    },
    {
      name: 'Dust',
      logo: '/logos/dust.svg',
      url: 'https://dust.tt',
      logoAlt: 'Dust logo',
      logoScale: 0.6,
    },
    {
      name: 'dltHub',
      logo: '/logos/dlthub.svg',
      url: 'https://dlthub.com',
      logoAlt: 'dltHub logo',
      logoScale: 0.65,
    },
    {
      name: 'Elastic',
      logo: '/logos/elastic.svg',
      url: 'https://elastic.co',
      logoAlt: 'Elastic logo',
      logoScale: 0.8,
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
      name: 'ai|coustics',
      logo: '/logos/ai-coustics.svg',
      url: 'https://ai-coustics.com',
      logoAlt: 'ai|coustics logo',
    },
    {
      name: 'distil labs',
      logo: '/logos/distil-labs.svg',
      url: 'https://www.distillabs.ai',
      logoAlt: 'distil labs logo',
    },
    {
      name: 'AI Nation',
      logo: '/logos/ai-nation.svg',
      url: 'https://www.ai-nation.de',
      logoAlt: 'AI Nation logo',
      logoScale: 0.9,
    },
    {
      name: 'Restate',
      logo: '/logos/restate.svg',
      url: 'https://restate.dev',
      logoAlt: 'Restate logo',
    },
    {
      name: 'Zero',
      logo: '/logos/zero.svg',
      url: 'https://zero.inc',
      logoAlt: 'Zero logo',
    },
    {
      name: 'Linkup',
      logo: '/logos/linkup-logo.svg',
      url: 'https://www.linkup.so',
      logoAlt: 'Linkup logo',
    },
  ],
} satisfies PartnersByTier;
