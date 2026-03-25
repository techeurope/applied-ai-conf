import type { AgendaSlot } from '@/types';

// All talks: 20 min. Keynotes & panels: 30 min. Gold/Premium demos: 30 min.
// 5 min changeover between sessions.
//
// Block 1 (09:10–10:30): Keynote(30) + 2 talks(20)
// Block 2 (10:50–12:25): 4 main talks(20) + side sessions
// Block 3 (13:30–14:50): Panel(30) + 2 main talks(20) + side sessions
// Block 4 (15:15–16:35): Panel(30) + 2 main talks(20) + side sessions

export const AGENDA: AgendaSlot[] = [
  // ── Shared: Doors + Opening ───────────────────────────────────
  { id: 'doors', startTime: '08:00', endTime: '09:00', title: 'Doors Open · Registration & Coffee', stage: 'main', format: 'logistics' },
  { id: 'opening', startTime: '09:00', endTime: '09:10', title: 'Welcome', stage: 'main', format: 'logistics' },

  // ── Block 1: Morning (09:10–10:30) ────────────────────────────
  // Main: Keynote(30) + 2 talks(20)
  { id: 'keynote-open', startTime: '09:10', endTime: '09:40', title: 'Keynote', stage: 'main', format: 'keynote' },
  { id: 'main-1', startTime: '09:45', endTime: '10:05', title: 'Building Dust: The Architecture Behind Deploying and Governing Fleets of AI Agents', speakerName: 'Stanislas Polu', stage: 'main', format: 'talk' },
  { id: 'main-2', startTime: '10:10', endTime: '10:30', title: 'Building a Universal Agent for Legal', speakerName: 'Zino Kader', stage: 'main', format: 'talk', description: 'Joint talk with Jakob Emmerling' },
  // Side: 2 talks(20) starting after keynote
  { id: 'side-1', startTime: '09:45', endTime: '10:05', title: 'The Anatomy of LobsterX, a Document Processing Agent', speakerName: 'Clelia Astra Bertelli', stage: 'side', format: 'talk' },
  { id: 'side-2', startTime: '10:10', endTime: '10:30', title: 'To be announced', stage: 'side', format: 'talk' },

  // ── Coffee Break (10:30–10:50) ────────────────────────────────
  { id: 'break-1', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-1-side', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Block 2: Late Morning (10:50–12:25) ───────────────────────
  // Main: 4 talks(20)
  { id: 'main-3', startTime: '10:50', endTime: '11:10', title: 'Beyond Benchmarks: How Evaluations Ensure Safety at Scale in LLM Applications', speakerName: 'Clara Matos', stage: 'main', format: 'talk' },
  { id: 'main-4', startTime: '11:15', endTime: '11:35', title: 'Building Voice AI Infrastructure: Ultra-Low Latency Model Serving at Scale', speakerName: 'Neil Zeghidour', stage: 'main', format: 'talk' },
  { id: 'main-5', startTime: '11:40', endTime: '12:00', title: 'Serving AI to 23M Students: Latency, Cost, and Quality at Scale', speakerName: 'Lucas Hild', stage: 'main', format: 'talk' },
  { id: 'main-6', startTime: '12:05', endTime: '12:25', title: 'From Batch to Streaming: Architecture Decisions for AI-Ready Data Pipelines', speakerName: 'Steffen Hoellinger', stage: 'main', format: 'talk' },
  // Side: Stripe(30, Gold) + 2 talks(20)
  { id: 'side-3', startTime: '10:50', endTime: '11:20', title: 'Teaching Agents to Pay: What Devs Need to Know', speakerName: 'Ben Smith', stage: 'side', format: 'talk' },
  { id: 'side-4', startTime: '11:25', endTime: '11:45', title: 'From SEO to GEO: How We Track Visibility Across AI Responses', speakerName: 'Marius Meiners', stage: 'side', format: 'talk' },
  { id: 'side-5', startTime: '11:50', endTime: '12:10', title: 'From Chat to Automation: Building AI-Native Workflows That Replace UIs', speakerName: 'Osman Ramadan', stage: 'side', format: 'talk' },

  // ── Lunch Break (12:30–13:30) ─────────────────────────────────
  { id: 'lunch', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'main', format: 'break' },
  { id: 'lunch-side', startTime: '12:15', endTime: '13:30', title: 'Lunch Break', stage: 'side', format: 'break' },

  // ── Block 3: Early Afternoon (13:30–14:50) ────────────────────
  // Main: Panel(30) + 2 talks(20)
  { id: 'panel-1', startTime: '13:30', endTime: '14:00', title: 'The State of AI', stage: 'main', format: 'panel' },
  { id: 'main-7', startTime: '14:05', endTime: '14:25', title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half', speakerName: 'Balázs Csomor', stage: 'main', format: 'talk' },
  { id: 'main-8', startTime: '14:30', endTime: '14:50', title: 'Procurement Intelligence: When AI Meets Atoms & Bits', speakerName: 'Nico Bentenrieder', stage: 'main', format: 'talk' },
  // Side: 2 sessions
  { id: 'side-6', startTime: '13:30', endTime: '13:50', title: 'To be announced', stage: 'side', format: 'talk' },
  { id: 'side-7', startTime: '13:55', endTime: '14:15', title: 'To be announced', stage: 'side', format: 'talk' },

  // ── Coffee Break (14:50–15:15) ────────────────────────────────
  { id: 'break-2', startTime: '14:50', endTime: '15:15', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-2-side', startTime: '14:20', endTime: '15:15', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Block 4: Late Afternoon (15:15–16:35) ─────────────────────
  // Main: 4 talks(20)
  { id: 'main-9', startTime: '15:15', endTime: '15:35', title: 'Making AI Understand ERPs', speakerName: 'Henry Thompson', stage: 'main', format: 'talk' },
  { id: 'main-10', startTime: '15:40', endTime: '16:00', title: 'To be announced', stage: 'main', format: 'talk' },
  { id: 'main-11', startTime: '16:05', endTime: '16:25', title: 'To be announced', stage: 'main', format: 'talk' },
  { id: 'main-12', startTime: '16:30', endTime: '16:50', title: 'To be announced', stage: 'main', format: 'talk' },
  // Side: 3 sessions
  { id: 'side-8', startTime: '15:15', endTime: '15:35', title: 'To be announced', stage: 'side', format: 'talk' },
  { id: 'side-9', startTime: '15:40', endTime: '16:00', title: 'To be announced', stage: 'side', format: 'talk' },
  { id: 'side-10', startTime: '16:05', endTime: '16:25', title: 'To be announced', stage: 'side', format: 'talk' },

  // ── Shared: Closing ───────────────────────────────────────────
  { id: 'keynote-close', startTime: '16:55', endTime: '17:25', title: 'Shipping Fin to Production: What Worked, What Broke, What Changed', speakerName: 'Des Traynor', stage: 'main', format: 'keynote' },
  { id: 'closing', startTime: '17:25', endTime: '17:35', title: 'Closing Remarks', stage: 'main', format: 'logistics' },
];
