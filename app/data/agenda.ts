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
  { id: 'side-4', startTime: '11:15', endTime: '11:35', title: 'To be announced', speakerName: 'Alena Astrakhantseva', stage: 'side', format: 'talk' },

  // 5 min changeover (11:35–11:40)

  // ── 11:40–12:00 ──────────────────────────────────────────────
  { id: 'main-5', startTime: '11:40', endTime: '12:00', title: 'From Batch to Streaming: Architecture Decisions for AI-Ready Data Pipelines', speakerName: 'Steffen Hoellinger', stage: 'main', format: 'talk' },
  { id: 'side-5', startTime: '11:40', endTime: '12:00', title: 'To be announced', speakerName: 'Katia Gil Guzman', stage: 'side', format: 'talk' },

  // 5 min changeover (12:00–12:05)

  // ── 12:05–12:25 ──────────────────────────────────────────────
  { id: 'main-6', startTime: '12:05', endTime: '12:25', title: 'Building Voice AI Infrastructure: Ultra-Low Latency Model Serving at Scale', speakerName: 'Neil Zeghidour', stage: 'main', format: 'talk' },
  { id: 'side-6', startTime: '12:05', endTime: '12:25', title: 'To be announced', speakerName: 'Rachel Nabors', stage: 'side', format: 'talk' },

  // ── Lunch Break (12:30–13:30) ─────────────────────────────────
  { id: 'lunch', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'main', format: 'break' },
  { id: 'lunch-side', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'side', format: 'break' },

  // ── Post-lunch: Main stage (20 min + 5 min changeover) ────────
  { id: 'main-7', startTime: '13:30', endTime: '13:50', title: 'To be announced', speakerName: 'Simon Edwardsen', stage: 'main', format: 'talk' },
  { id: 'main-8', startTime: '13:55', endTime: '14:15', title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half', speakerName: 'Balázs Csomor', stage: 'main', format: 'talk' },
  { id: 'main-9', startTime: '14:20', endTime: '14:40', title: 'Making AI Understand ERPs', speakerName: 'Henry Thompson', stage: 'main', format: 'talk' },

  // ── Post-lunch: Demo stage (mix 20/30 min + 5 min changeover) ─
  { id: 'side-7', startTime: '13:30', endTime: '14:00', title: 'Teaching Agents to Pay: What Devs Need to Know', speakerName: 'Ben Smith', stage: 'side', format: 'talk' },
  { id: 'side-8', startTime: '14:05', endTime: '14:25', title: 'To be announced', speakerNames: ['Lucia Loher', 'Patrick Löber'], stage: 'side', format: 'talk' },
  { id: 'side-9', startTime: '14:30', endTime: '14:50', title: 'The 100x Inference Tax You Don\'t Have to Pay', speakerName: 'Jacek Golebiowski', stage: 'side', format: 'talk' },

  // ── Coffee Break (14:50–15:15) ────────────────────────────────
  { id: 'break-2', startTime: '14:50', endTime: '15:15', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-2-side', startTime: '14:50', endTime: '15:15', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Post-coffee2: Main stage (3 talks) ─────────────────────────
  { id: 'main-10', startTime: '15:15', endTime: '15:35', title: 'From SEO to GEO: How We Track Visibility Across AI Responses', speakerName: 'Oğuz Gültepe', stage: 'main', format: 'talk' },
  { id: 'main-11', startTime: '15:40', endTime: '16:00', title: 'Building a Universal Agent for Legal', speakerNames: ['Zino Kader', 'Jakob Emmerling'], stage: 'main', format: 'talk' },
  { id: 'main-12', startTime: '16:05', endTime: '16:25', title: 'To be announced', speakerName: 'Sabba Keynejad', stage: 'main', format: 'talk' },

  // ── Post-coffee2: Demo stage (2 talks) ────────────────────────
  { id: 'side-10', startTime: '15:15', endTime: '15:45', title: 'To be announced', speakerName: 'Nebius', stage: 'side', format: 'talk' },
  { id: 'side-11', startTime: '15:50', endTime: '16:10', title: 'To be announced', speakerName: 'Modal', stage: 'side', format: 'talk' },

  // ── Coffee Break (16:25–16:45) ────────────────────────────────
  { id: 'break-3', startTime: '16:25', endTime: '16:45', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-3-side', startTime: '16:25', endTime: '16:45', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Post-coffee3: Main stage (3 talks) ────────────────────────
  { id: 'main-13', startTime: '16:45', endTime: '17:05', title: 'To be announced', speakerName: 'Masashi Beheim', stage: 'main', format: 'talk' },
  { id: 'main-14', startTime: '17:10', endTime: '17:30', title: 'AI-Empowered Engineering Through Collaborative Tooling', speakerName: 'Łukasz Sągol', stage: 'main', format: 'talk' },
  { id: 'main-15', startTime: '17:35', endTime: '17:55', title: 'Model Routing in Production: What We Learned the Hard Way', speakerName: 'Bruno Show', stage: 'main', format: 'talk' },

  // ── Post-coffee3: Demo stage (3 talks) ────────────────────────
  { id: 'side-12', startTime: '16:45', endTime: '17:05', title: 'To be announced', speakerName: 'Stephan Ewen', stage: 'side', format: 'talk' },
  { id: 'side-13', startTime: '17:10', endTime: '17:40', title: 'To be announced', speakerName: 'Runpod', stage: 'side', format: 'talk' },
  { id: 'side-14', startTime: '17:45', endTime: '18:05', title: 'To be announced', speakerName: 'Linkup', stage: 'side', format: 'talk' },

  // ── Closing (18:00–18:40) ─────────────────────────────────────
  { id: 'keynote-close', startTime: '18:00', endTime: '18:30', title: 'Shipping Fin to Production: What Worked, What Broke, What Changed', speakerName: 'Des Traynor', stage: 'main', format: 'keynote' },
  { id: 'closing', startTime: '18:30', endTime: '18:40', title: 'Closing Remarks', stage: 'main', format: 'logistics' },
];
