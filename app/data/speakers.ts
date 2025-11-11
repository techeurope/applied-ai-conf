import type { Speaker } from '@/types';

export const SPEAKERS = [
  {
    name: 'Lennard Schmidt',
    title: 'CEO',
    company: 'Langdock',
    bio: '',
    initial: 'LS',
    accent: 'from-emerald-400/40 via-cyan-400/30 to-sky-500/40',
    image: '/speakers/lennard_schmidt.jpg',
  },
  {
    name: 'Daniel Khachab',
    title: 'CEO',
    company: 'Choco',
    bio: '',
    initial: 'DK',
    accent: 'from-purple-400/40 via-fuchsia-400/30 to-rose-500/40',
    image: '/speakers/daniel_khachab.jpg',
  },
  {
    name: 'Nico Bentenrieder',
    title: 'CTO',
    company: 'Tacto',
    bio: '',
    initial: 'NB',
    accent: 'from-orange-400/40 via-amber-400/30 to-yellow-500/40',
    image: '/speakers/nico-bentenrieder.jpg',
  },
  {
    name: 'Jacob Lauritzen',
    title: 'CTO',
    company: 'Legora',
    bio: '',
    initial: 'JL',
    accent: 'from-blue-400/40 via-indigo-400/30 to-violet-500/40',
    image: '/speakers/jacob_lauritzen.jpg',
  },
  {
    name: 'Lucas Hild',
    title: 'CTO',
    company: 'Knowunity',
    bio: '',
    initial: 'LH',
    accent: 'from-green-400/40 via-emerald-400/30 to-teal-500/40',
    image: '/speakers/lucas_hild.jpg',
  },
] satisfies Speaker[];
