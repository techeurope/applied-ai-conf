import type { AgendaSlot } from '@/types';

// Source of truth: Notion Speakers/Agenda DB table
// Main stage talks: 20 min. Keynotes: 30 min. Demo stage sponsor slots: 30 min.
// 5 min changeover between sessions.

export const AGENDA: AgendaSlot[] = [
  // ── Doors + Opening ──────────────────────────────────────────
  { id: 'doors', startTime: '08:00', endTime: '09:00', title: 'Doors Open · Registration & Coffee', stage: 'main', format: 'logistics' },
  { id: 'opening', startTime: '09:00', endTime: '09:10', title: 'Opening Remarks', stage: 'main', format: 'logistics' },

  // ── 09:10–09:40 ──────────────────────────────────────────────
  { id: 'keynote-open', startTime: '09:10', endTime: '09:40', title: 'Opening Keynote', speakerName: 'Danila Shtan', stage: 'main', format: 'keynote' },

  // 5 min changeover (09:40–09:45)

  // ── 09:45–10:05 ──────────────────────────────────────────────
  { id: 'main-1', startTime: '09:45', endTime: '10:05', title: 'Building Dust: The Architecture Behind Deploying and Governing Fleets of AI Agents', speakerName: 'Stanislas Polu', stage: 'main', format: 'talk' },
  { id: 'side-1', startTime: '09:45', endTime: '10:05', title: 'From Chat to Automation: Building AI-Native Workflows That Replace UIs', speakerName: 'Osman Ramadan', stage: 'side', format: 'talk' },

  // 5 min changeover (10:05–10:10)

  // ── 10:10–10:30 ──────────────────────────────────────────────
  { id: 'main-2', startTime: '10:10', endTime: '10:30', title: 'Beyond Benchmarks: How Evaluations Ensure Safety at Scale in LLM Applications', speakerName: 'Clara Matos', stage: 'main', format: 'talk' },
  { id: 'side-2', startTime: '10:10', endTime: '10:30', title: 'Audio Intelligence: The Hidden Layer Driving Voice AI Reliability', speakerName: 'Fabian Seipel', stage: 'side', format: 'talk' },

  // ── Coffee Break (10:30–10:50) ────────────────────────────────
  { id: 'break-1', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-1-side', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── 10:50–11:10 ──────────────────────────────────────────────
  { id: 'main-3', startTime: '10:50', endTime: '11:10', title: 'Serving AI to 23M Students: Latency, Cost, and Quality at Scale', speakerName: 'Lucas Hild', stage: 'main', format: 'talk' },
  { id: 'side-3', startTime: '10:50', endTime: '11:10', title: 'The Anatomy of LobsterX, a Document Processing Agent', speakerName: 'Clelia Astra Bertelli', stage: 'side', format: 'talk' },

  // 5 min changeover (11:10–11:15)

  // ── 11:15–11:35 ──────────────────────────────────────────────
  { id: 'main-4', startTime: '11:15', endTime: '11:35', title: 'Procurement Intelligence: When AI Meets Atoms & Bits', speakerName: 'Nico Bentenrieder', stage: 'main', format: 'talk' },
  { id: 'side-4', startTime: '11:15', endTime: '11:35', title: '', speakerName: 'Alena Astrakhantseva', stage: 'side', format: 'talk' },

  // 5 min changeover (11:35–11:40)

  // ── 11:40–12:00 ──────────────────────────────────────────────
  { id: 'main-5', startTime: '11:40', endTime: '12:00', title: 'From Batch to Streaming: Architecture Decisions for AI-Ready Data Pipelines', speakerName: 'Steffen Hoellinger', stage: 'main', format: 'talk' },
  { id: 'side-5', startTime: '11:40', endTime: '12:00', title: '', speakerName: 'Katia Gil Guzman', stage: 'side', format: 'talk' },

  // 5 min changeover (12:00–12:05)

  // ── 12:05–12:25 ──────────────────────────────────────────────
  { id: 'main-6', startTime: '12:05', endTime: '12:25', title: 'Building Voice AI Infrastructure: Ultra-Low Latency Model Serving at Scale', speakerName: 'Neil Zeghidour', stage: 'main', format: 'talk' },
  { id: 'side-6', startTime: '12:05', endTime: '12:25', title: 'To be announced', stage: 'side', format: 'talk' },

  // ── Lunch Break (12:30–13:30) ─────────────────────────────────
  { id: 'lunch', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'main', format: 'break' },
  { id: 'lunch-side', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'side', format: 'break' },

  // ── 13:30–14:00 ──────────────────────────────────────────────
  { id: 'main-7', startTime: '13:30', endTime: '13:50', title: 'To be announced', stage: 'main', format: 'talk' },
  { id: 'side-7', startTime: '13:30', endTime: '14:00', title: 'Teaching Agents to Pay: What Devs Need to Know', speakerName: 'Ben Smith', stage: 'side', format: 'talk' },

  // 5 min changeover (14:00–14:05)

  // ── 14:05–14:25 ──────────────────────────────────────────────
  { id: 'main-8', startTime: '14:05', endTime: '14:25', title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half', speakerName: 'Balázs Csomor', stage: 'main', format: 'talk' },
  { id: 'side-8', startTime: '14:05', endTime: '14:25', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (14:25–14:30)

  // ── 14:30–14:50 ──────────────────────────────────────────────
  { id: 'main-9', startTime: '14:30', endTime: '14:50', title: 'Making AI Understand ERPs', speakerName: 'Henry Thompson', stage: 'main', format: 'talk' },
  { id: 'side-9', startTime: '14:30', endTime: '14:50', title: 'The 100x Inference Tax You Don\'t Have to Pay', speakerName: 'Jacek Golebiowski', stage: 'side', format: 'talk' },

  // ── Coffee Break (14:50–15:15) ────────────────────────────────
  { id: 'break-2', startTime: '14:50', endTime: '15:15', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-2-side', startTime: '14:50', endTime: '15:15', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── 15:15–15:45 ──────────────────────────────────────────────
  { id: 'main-10', startTime: '15:15', endTime: '15:35', title: 'From SEO to GEO: How We Track Visibility Across AI Responses', speakerName: 'Oğuz Gültepe', stage: 'main', format: 'talk' },
  { id: 'side-10', startTime: '15:15', endTime: '15:45', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (15:45–15:50)

  // ── 15:50–16:10 ──────────────────────────────────────────────
  { id: 'main-11', startTime: '15:50', endTime: '16:10', title: 'Building a Universal Agent for Legal', speakerNames: ['Zino Kader', 'Jakob Emmerling'], stage: 'main', format: 'talk' },
  { id: 'side-11', startTime: '15:50', endTime: '16:10', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (16:10–16:15)

  // ── 16:15–16:35 ──────────────────────────────────────────────
  { id: 'main-12', startTime: '16:15', endTime: '16:35', title: '', speakerName: 'Sabba Keynejad', stage: 'main', format: 'talk' },
  { id: 'side-12', startTime: '16:15', endTime: '16:35', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (16:35–16:40)

  // ── 16:40–17:00 ──────────────────────────────────────────────
  { id: 'main-13', startTime: '16:40', endTime: '17:00', title: '', speakerName: 'Masashi Beheim', stage: 'main', format: 'talk' },
  { id: 'side-13', startTime: '16:40', endTime: '17:00', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (17:00–17:05)

  // ── 17:05–17:25 ──────────────────────────────────────────────
  { id: 'main-14', startTime: '17:05', endTime: '17:25', title: 'AI-Empowered Engineering Through Collaborative Tooling', speakerName: 'Łukasz Sągol', stage: 'main', format: 'talk' },
  { id: 'side-14', startTime: '17:05', endTime: '17:25', title: 'To be announced', stage: 'side', format: 'talk' },

  // 5 min changeover (17:25–17:30)

  // ── 17:30–17:50 ──────────────────────────────────────────────
  { id: 'main-15', startTime: '17:30', endTime: '17:50', title: 'To be announced', stage: 'main', format: 'talk' },

  // ── Closing (18:00–18:40) ─────────────────────────────────────
  { id: 'keynote-close', startTime: '18:00', endTime: '18:30', title: 'Shipping Fin to Production: What Worked, What Broke, What Changed', speakerName: 'Des Traynor', stage: 'main', format: 'keynote' },
  { id: 'closing', startTime: '18:30', endTime: '18:40', title: 'Closing Remarks', stage: 'main', format: 'logistics' },
];
