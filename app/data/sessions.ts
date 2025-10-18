import type { Session } from '@/types';

export const SESSIONS = [
  {
    time: '10:45 AM–11:10 AM',
    title: 'Composition, Caching, and Architecture. Future proofing your apps.',
    description: 'Deep dive into modern architecture, covering React Server Components, modern routing, and caching techniques you can apply directly to real projects.',
    speaker: 'Aurora Scharff, Crayon Consulting',
    speakerInitial: 'A',
  },
  {
    time: '11:10 AM–11:35 AM',
    title: 'Build. Scale. Teach: Architecting and Scaling a Production-Ready Modern Course Platform',
    description: 'Lessons, architectural decisions, and real-world challenges of building and scaling a custom, production-ready course platform.',
    speaker: 'Ankita Kulkarni, Independent',
    speakerInitial: 'A',
  },
  {
    time: '1:30 PM–1:55 PM',
    title: 'Fully Integrated AI that Actually Ships',
    description: 'Sharing best practices from real projects, highlighting why modern frameworks are especially well-suited for AI-driven development.',
    speaker: 'Ryan Vogel, Databricks',
    speakerInitial: 'R',
  },
  {
    time: '2:20 PM–2:45 PM',
    title: 'Vibecoding: The new entry point to creation',
    description: 'Vibecoding, a new way of building where AI tools let anyone quickly scaffold applications.',
    speaker: 'Aileen Villaneuva, Orama',
    speakerInitial: 'A',
  },
] satisfies Session[];
