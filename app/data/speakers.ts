import type { Speaker } from '@/types';

export const SPEAKERS = [
  {
    name: 'Elena Kovacs',
    title: 'Head of AI Research',
    company: 'Helios Labs',
    bio: 'Designs multi-modal infrastructure and evaluations that keep high-stakes AI systems reliable in production.',
    initial: 'EK',
    accent: 'from-emerald-400/40 via-cyan-400/30 to-sky-500/40',
    socials: [
      { label: 'X', url: '#' },
      { label: 'LinkedIn', url: '#' },
    ],
  },
  {
    name: 'Rafael Diop',
    title: 'Chief Product Officer',
    company: 'Parallel Compute',
    bio: 'Builds orchestration platforms that stitch together GPU fleets for enterprise-scale inference workloads.',
    initial: 'RD',
    accent: 'from-purple-400/40 via-fuchsia-400/30 to-rose-500/40',
    socials: [
      { label: 'X', url: '#' },
      { label: 'LinkedIn', url: '#' },
    ],
  },
  {
    name: 'Mira Schultz',
    title: 'Director of Applied AI',
    company: 'Atlas Robotics',
    bio: 'Guides cross-functional teams deploying robotics perception models into factories across Europe.',
    initial: 'MS',
    accent: 'from-orange-400/40 via-amber-400/30 to-yellow-500/40',
    socials: [
      { label: 'LinkedIn', url: '#' },
    ],
  },
  {
    name: 'Jonah Mbaye',
    title: 'Principal ML Engineer',
    company: 'Signal Forge',
    bio: 'Architects evaluation pipelines and observability stacks that help teams ship trustworthy agents.',
    initial: 'JM',
    accent: 'from-blue-400/40 via-indigo-400/30 to-violet-500/40',
    socials: [
      { label: 'X', url: '#' },
      { label: 'GitHub', url: '#' },
    ],
  },
  {
    name: 'Sofia Marques',
    title: 'Founder',
    company: 'Opsense AI',
    bio: 'Runs field deployments of AI copilots for operations teams across logistics and energy clients.',
    initial: 'SM',
    accent: 'from-teal-400/40 via-emerald-400/30 to-lime-500/40',
    socials: [
      { label: 'LinkedIn', url: '#' },
    ],
  },
] satisfies Speaker[];
