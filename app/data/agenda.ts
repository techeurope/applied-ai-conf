import type { AgendaSlot } from '@/types';

export const AGENDA: AgendaSlot[] = [
  // ── 08:30 Registration (both stages) ──────────────────────────
  {
    id: 'reg',
    startTime: '08:30',
    endTime: '09:30',
    title: 'Registration & Coffee',
    stage: 'main',
    format: 'logistics',
  },
  {
    id: 'reg-side',
    startTime: '08:30',
    endTime: '09:30',
    title: 'Registration & Coffee',
    stage: 'side',
    format: 'logistics',
  },

  // ── 09:30 Opening (both stages) ───────────────────────────────
  {
    id: 'open',
    startTime: '09:30',
    endTime: '09:45',
    title: 'Opening Remarks',
    stage: 'main',
    format: 'logistics',
  },
  {
    id: 'open-side',
    startTime: '09:30',
    endTime: '09:45',
    title: 'Opening Remarks',
    stage: 'side',
    format: 'logistics',
  },

  // ── 09:45 Opening Keynote (Main Stage only, no parallel) ──────
  {
    id: 'keynote-open',
    startTime: '09:45',
    endTime: '10:15',
    title: 'To be announced',
    stage: 'main',
    format: 'keynote',
  },
  {
    id: 'keynote-open-side',
    startTime: '09:45',
    endTime: '10:15',
    title: 'Join Main Stage for Keynote',
    stage: 'side',
    format: 'logistics',
  },

  // ── 10:15 Morning Block 1 ─────────────────────────────────────
  // Main Stage
  {
    id: 'main-1',
    startTime: '10:15',
    endTime: '10:35',
    title: 'Building Dust: The Architecture Behind Deploying and Governing Fleets of AI Agents',
    speakerName: 'Stanislas Polu',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'main-2',
    startTime: '10:35',
    endTime: '10:55',
    title: 'Building a Universal Agent for Legal',
    speakerName: 'Zino Kader',
    stage: 'main',
    format: 'talk',
    description: 'Joint talk with Jakob Emmerling',
  },
  {
    id: 'main-3',
    startTime: '10:55',
    endTime: '11:15',
    title: 'Beyond Benchmarks: How Evaluations Ensure Safety at Scale in LLM Applications',
    speakerName: 'Clara Matos',
    stage: 'main',
    format: 'talk',
  },
  // Side Stage
  {
    id: 'side-1',
    startTime: '10:15',
    endTime: '10:45',
    title: 'The Anatomy of LobsterX, a Document Processing Agent',
    speakerName: 'Clelia Astra Bertelli',
    stage: 'side',
    format: 'talk',
  },
  {
    id: 'side-2',
    startTime: '10:45',
    endTime: '11:15',
    title: 'Teaching Agents to Pay: What Devs Need to Know',
    speakerName: 'Ben Smith',
    stage: 'side',
    format: 'talk',
  },

  // ── 11:15 Coffee Break (both stages) ──────────────────────────
  {
    id: 'break-1',
    startTime: '11:15',
    endTime: '11:35',
    title: 'Coffee Break',
    stage: 'main',
    format: 'break',
  },
  {
    id: 'break-1-side',
    startTime: '11:15',
    endTime: '11:35',
    title: 'Coffee Break',
    stage: 'side',
    format: 'break',
  },

  // ── 11:35 Morning Block 2 ─────────────────────────────────────
  // Main Stage
  {
    id: 'main-4',
    startTime: '11:35',
    endTime: '11:55',
    title: 'Building Voice AI Infrastructure: Ultra-Low Latency Model Serving at Scale',
    speakerName: 'Neil Zeghidour',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'main-5',
    startTime: '11:55',
    endTime: '12:15',
    title: 'Serving AI to 23M Students: Latency, Cost, and Quality at Scale',
    speakerName: 'Lucas Hild',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'main-6',
    startTime: '12:15',
    endTime: '12:35',
    title: 'From Batch to Streaming: Architecture Decisions for AI-Ready Data Pipelines',
    speakerName: 'Steffen Hoellinger',
    stage: 'main',
    format: 'talk',
  },
  // Side Stage
  {
    id: 'side-3',
    startTime: '11:35',
    endTime: '11:55',
    title: 'From SEO to GEO: How We Track Visibility Across AI Responses',
    speakerName: 'Marius Meiners',
    stage: 'side',
    format: 'talk',
  },
  {
    id: 'side-4',
    startTime: '11:55',
    endTime: '12:15',
    title: 'From Chat to Automation: Building AI-Native Workflows That Replace UIs',
    speakerName: 'Osman Ramadan',
    stage: 'side',
    format: 'talk',
  },

  // ── 12:35 Lunch (both stages) ─────────────────────────────────
  {
    id: 'lunch',
    startTime: '12:35',
    endTime: '13:30',
    title: 'Lunch Break',
    stage: 'main',
    format: 'break',
  },
  {
    id: 'lunch-side',
    startTime: '12:15',
    endTime: '13:30',
    title: 'Lunch Break',
    stage: 'side',
    format: 'break',
  },

  // ── 13:30 Afternoon Block ──────────────────────────────────────
  // Main Stage
  {
    id: 'main-7',
    startTime: '13:30',
    endTime: '13:50',
    title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half',
    speakerName: 'Balázs Csomor',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'main-8',
    startTime: '13:50',
    endTime: '14:10',
    title: 'Procurement Intelligence: When AI Meets Atoms & Bits',
    speakerName: 'Nico Bentenrieder',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'main-9',
    startTime: '14:10',
    endTime: '14:30',
    title: 'Making AI Understand ERPs',
    speakerName: 'Henry Thompson',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'panel-1',
    startTime: '14:30',
    endTime: '15:00',
    title: 'What Broke in Production and What We Changed',
    speakerName: 'Sabba Keynejad',
    stage: 'main',
    format: 'panel',
    description: 'War stories from across themes',
  },
  // Side Stage
  {
    id: 'side-5',
    startTime: '13:30',
    endTime: '14:00',
    title: 'To be announced',
    stage: 'side',
    format: 'talk',
  },
  {
    id: 'side-6',
    startTime: '14:00',
    endTime: '14:30',
    title: 'To be announced',
    stage: 'side',
    format: 'talk',
  },
  {
    id: 'side-7',
    startTime: '14:30',
    endTime: '15:00',
    title: 'To be announced',
    stage: 'side',
    format: 'talk',
  },

  // ── 15:00 Coffee Break (both stages) ──────────────────────────
  {
    id: 'break-2',
    startTime: '15:00',
    endTime: '15:20',
    title: 'Coffee Break',
    stage: 'main',
    format: 'break',
  },
  {
    id: 'break-2-side',
    startTime: '15:00',
    endTime: '15:20',
    title: 'Coffee Break',
    stage: 'side',
    format: 'break',
  },

  // ── 15:20 Closing Block ───────────────────────────────────────
  // Main Stage
  {
    id: 'main-10',
    startTime: '15:20',
    endTime: '15:40',
    title: 'AI in the Food Supply Chain',
    speakerName: 'Daniel Khachab',
    stage: 'main',
    format: 'talk',
  },
  {
    id: 'keynote-close',
    startTime: '15:40',
    endTime: '16:10',
    title: 'Shipping Fin to Production: What Worked, What Broke, What Changed',
    speakerName: 'Des Traynor',
    stage: 'main',
    format: 'keynote',
  },
  // Side Stage
  {
    id: 'side-8',
    startTime: '15:20',
    endTime: '15:40',
    title: 'To be announced',
    stage: 'side',
    format: 'talk',
  },

  // ── 15:40 Keynote + Closing (Main Stage only, no parallel) ────
  {
    id: 'close-side',
    startTime: '15:40',
    endTime: '16:30',
    title: 'Join Main Stage for Keynote & Closing',
    stage: 'side',
    format: 'logistics',
  },
  {
    id: 'close',
    startTime: '16:10',
    endTime: '16:30',
    title: 'Closing Remarks & Networking',
    stage: 'main',
    format: 'logistics',
  },
];
