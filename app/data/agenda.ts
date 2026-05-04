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
  { id: 'side-1', startTime: '09:45', endTime: '10:05', title: 'To be announced', speakerName: 'Osman Ramadan', stage: 'side', format: 'talk' },

  // 5 min changeover (10:05–10:10)

  // ── 10:10–10:30 ──────────────────────────────────────────────
  { id: 'main-2', startTime: '10:10', endTime: '10:30', title: 'Beyond Benchmarks: How Evaluations Ensure Safety at Scale in LLM Applications', speakerName: 'Clara Matos', stage: 'main', format: 'talk' },
  { id: 'side-2', startTime: '10:10', endTime: '10:30', title: 'Audio Intelligence: The Hidden Layer Driving Voice AI Reliability', speakerName: 'Fabian Seipel', stage: 'side', format: 'talk' },

  // ── Coffee Break (10:30–10:50) ────────────────────────────────
  { id: 'break-1', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-1-side', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── 10:50–11:10 ──────────────────────────────────────────────
  { id: 'main-3', startTime: '10:50', endTime: '11:10', title: 'To be announced', speakerName: 'Lucas Hild', stage: 'main', format: 'talk' },
  { id: 'side-3', startTime: '10:50', endTime: '11:10', title: 'The Anatomy of LobsterX, a Document Processing Agent', speakerName: 'Clelia Astra Bertelli', stage: 'side', format: 'talk' },

  // 5 min changeover (11:10–11:15)

  // ── 11:15–11:35 ──────────────────────────────────────────────
  { id: 'main-4', startTime: '11:15', endTime: '11:35', title: 'Procurement Intelligence: When AI Meets Atoms & Bits', speakerName: 'Nico Bentenrieder', stage: 'main', format: 'talk' },
  { id: 'side-4', startTime: '11:15', endTime: '11:35', title: 'Agents now build 10x more data pipelines than developers. Now what?', speakerName: 'Alena Astrakhantseva', stage: 'side', format: 'talk' },

  // 5 min changeover (11:35–11:40)

  // ── 11:40–12:00 ──────────────────────────────────────────────
  { id: 'main-5', startTime: '11:40', endTime: '12:00', title: 'To be announced', speakerName: 'Steffen Hoellinger', stage: 'main', format: 'talk' },
  { id: 'side-5', startTime: '11:40', endTime: '12:00', title: 'To be announced', speakerName: 'Katia Gil Guzman', stage: 'side', format: 'talk' },

  // 5 min changeover (12:00–12:05)

  // ── 12:05–12:25 ──────────────────────────────────────────────
  { id: 'main-6', startTime: '12:05', endTime: '12:25', title: 'Giving a Voice to LLMs: Scaling Real-Time Voice Interaction', speakerName: 'Neil Zeghidour', stage: 'main', format: 'talk' },
  { id: 'side-6', startTime: '12:05', endTime: '12:25', title: 'Your Agent Is an Infinite Canvas', speakerName: 'Rachel Nabors', stage: 'side', format: 'talk' },

  // ── Lunch Break (12:30–13:30) ─────────────────────────────────
  { id: 'lunch', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'main', format: 'break' },
  { id: 'lunch-side', startTime: '12:30', endTime: '13:30', title: 'Lunch Break', stage: 'side', format: 'break' },

  // ── Post-lunch: Main stage (4 × 20 min) ────────────────────────
  { id: 'main-7', startTime: '13:30', endTime: '13:50', title: 'To be announced', speakerName: 'Simon Edwardsson', stage: 'main', format: 'talk' },
  { id: 'main-8', startTime: '13:55', endTime: '14:15', title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half', speakerName: 'Balázs Csomor', stage: 'main', format: 'talk' },
  { id: 'main-9', startTime: '14:20', endTime: '14:40', title: "Deploying Intelligence into the World's Largest Enterprises", speakerName: 'Henry Thompson', stage: 'main', format: 'talk' },
  { id: 'main-10', startTime: '14:45', endTime: '15:05', title: 'Prompt Learning: Distilling Expensive Reasoning Into Fast Production Prompts', speakerName: 'Oğuz Gültepe', stage: 'main', format: 'talk' },

  // ── Post-lunch: Demo stage (3 × 30 min) ───────────────────────
  { id: 'side-7', startTime: '13:30', endTime: '14:00', title: 'Teaching Agents to Pay: What Devs Need to Know', speakerName: 'Ben Smith', stage: 'side', format: 'talk' },
  { id: 'side-8', startTime: '14:05', endTime: '14:35', title: 'Batch AI Pipelines: How to Go Fast Without Losing Work or Money', speakerNames: ['Marouane Khoukh', 'Mikhail Rozhkov'], stage: 'side', format: 'talk' },
  { id: 'side-9', startTime: '14:40', endTime: '15:10', title: 'To be announced', speakerName: 'Runpod', stage: 'side', format: 'talk' },

  // ── Coffee Break (15:10–15:30) ────────────────────────────────
  { id: 'break-2', startTime: '15:10', endTime: '15:30', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-2-side', startTime: '15:10', endTime: '15:30', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Post-coffee2: Both stages aligned (3 × 20 min) ───────────
  { id: 'main-11', startTime: '15:30', endTime: '15:50', title: 'Building a Universal Agent for Legal', speakerNames: ['Zino Kader', 'Jakob Emmerling'], stage: 'main', format: 'talk' },
  { id: 'side-10', startTime: '15:30', endTime: '15:50', title: 'From Caching to Batching to Flex — How to optimize AI system for production', speakerNames: ['Lucia Loher', 'Patrick Löber'], stage: 'side', format: 'talk' },

  { id: 'main-12', startTime: '15:55', endTime: '16:15', title: 'To be announced', speakerName: 'Sabba Keynejad', stage: 'main', format: 'talk' },
  { id: 'side-11', startTime: '15:55', endTime: '16:15', title: 'The 100x Inference Tax You Don\'t Have to Pay', speakerName: 'Jacek Golebiowski', stage: 'side', format: 'talk' },

  { id: 'main-13', startTime: '16:20', endTime: '16:40', title: 'Leading through AI change', speakerName: 'Masashi Beheim', stage: 'main', format: 'talk' },
  { id: 'side-12', startTime: '16:20', endTime: '16:40', title: 'Building the Missing Infrastructure Layer for Agents and Distributed Applications', speakerName: 'Stephan Ewen', stage: 'side', format: 'talk' },

  // ── Coffee Break (16:40–17:00) ────────────────────────────────
  { id: 'break-3', startTime: '16:40', endTime: '17:00', title: 'Coffee Break', stage: 'main', format: 'break' },
  { id: 'break-3-side', startTime: '16:40', endTime: '17:00', title: 'Coffee Break', stage: 'side', format: 'break' },

  // ── Post-coffee3: Both stages aligned (2 × 20 min) ───────────
  { id: 'main-14', startTime: '17:00', endTime: '17:20', title: 'AI-Empowered Engineering Through Collaborative Tooling', speakerName: 'Łukasz Sągol', stage: 'main', format: 'talk' },
  { id: 'side-13', startTime: '17:00', endTime: '17:20', title: 'To be announced', speakerName: 'Lucy Zhang', stage: 'side', format: 'talk' },

  { id: 'main-15', startTime: '17:25', endTime: '17:45', title: 'Model Routing in Production: What We Learned the Hard Way', speakerName: 'Bruno Show', stage: 'main', format: 'talk' },
  { id: 'side-14', startTime: '17:25', endTime: '17:45', title: 'To be announced', speakerName: 'Linkup', stage: 'side', format: 'talk' },

  // ── Closing (17:50–18:30) ─────────────────────────────────────
  { id: 'keynote-close', startTime: '17:50', endTime: '18:20', title: 'Shipping Fin to Production: What Worked, What Broke, What Changed', speakerName: 'Des Traynor', stage: 'main', format: 'keynote' },
  { id: 'closing', startTime: '18:20', endTime: '18:30', title: 'Closing Remarks', stage: 'main', format: 'logistics' },
];
