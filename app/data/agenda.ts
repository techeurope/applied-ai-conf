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
  { id: 'side-1', startTime: '09:45', endTime: '10:05', title: 'From Writing Code to Trusting Code: How AI Flipped the Engineering Bottleneck', speakerName: 'Osman Ramadan', stage: 'side', format: 'talk' },

  // 5 min changeover (10:05–10:10)

  // ── 10:10–10:30 ──────────────────────────────────────────────
  { id: 'main-2', startTime: '10:10', endTime: '10:30', title: 'Beyond Benchmarks: How Evaluations Ensure Safety at Scale in LLM Applications', speakerName: 'Clara Matos', stage: 'main', format: 'talk' },
  { id: 'side-2', startTime: '10:10', endTime: '10:30', title: 'Always Be Committing: The Scalable LLM Eval Loop', speakerName: 'Carl Brenssell', stage: 'side', format: 'talk' },

  // ── Coffee Break (10:30–10:50) ────────────────────────────────
  { id: 'break-1', startTime: '10:30', endTime: '10:50', title: 'Coffee Break', stage: 'expo', format: 'break' },

  // ── 10:50–11:10 ──────────────────────────────────────────────
  { id: 'main-3', startTime: '10:50', endTime: '11:10', title: 'Building an AI learning companion: the architecture behind millions of daily interactions', speakerName: 'Lucas Hild', stage: 'main', format: 'talk' },
  { id: 'side-3', startTime: '10:50', endTime: '11:10', title: 'The Anatomy of LobsterX, a Document Processing Agent', speakerName: 'Clelia Astra Bertelli', stage: 'side', format: 'talk' },

  // 5 min changeover (11:10–11:15)

  // ── 11:15–11:35 ──────────────────────────────────────────────
  { id: 'main-4', startTime: '11:15', endTime: '11:35', title: 'Procurement Intelligence: When AI Meets Atoms & Bits', speakerName: 'Nico Bentenrieder', stage: 'main', format: 'talk' },
  { id: 'side-4', startTime: '11:15', endTime: '11:35', title: 'Agents now build 10x more data pipelines than developers. Now what?', speakerName: 'Alena Astrakhantseva', stage: 'side', format: 'talk' },

  // 5 min changeover (11:35–11:40)

  // ── 11:40–12:00 ──────────────────────────────────────────────
  { id: 'main-5', startTime: '11:40', endTime: '12:00', title: 'Context Engineering and Anomaly Detection for event-driven AI Agents with Apache Flink and Kafka', speakerName: 'Steffen Hoellinger', stage: 'main', format: 'talk' },
  { id: 'side-5', startTime: '11:40', endTime: '12:00', title: 'From Engineer to Orchestrator: How Codex changes the way engineers work', speakerName: 'Katia Gil Guzman', stage: 'side', format: 'talk' },

  // 5 min changeover (12:00–12:05)

  // ── 12:05–12:25 ──────────────────────────────────────────────
  { id: 'main-6', startTime: '12:05', endTime: '12:25', title: 'Giving a Voice to LLMs: Scaling Real-Time Voice Interaction', speakerName: 'Neil Zeghidour', stage: 'main', format: 'talk' },
  { id: 'side-6', startTime: '12:05', endTime: '12:25', title: 'Stop Paying for Frontier Models', speakerName: 'Rachel Nabors', stage: 'side', format: 'talk' },

  // ── Lunch Break (12:30–13:45) — extended 15 min to make up running-late ───
  { id: 'lunch', startTime: '12:30', endTime: '13:45', title: 'Lunch Break', stage: 'expo', format: 'break' },

  // ── Post-lunch: Main stage (4 × 20 min) ────────────────────────
  { id: 'main-7', startTime: '13:45', endTime: '14:05', title: 'Building Sandcastles for Agents: Safe Execution at Production Scale', speakerName: 'Simon Edwardsson', stage: 'main', format: 'talk' },
  { id: 'main-8', startTime: '14:10', endTime: '14:30', title: 'Cache Money: How Prompt Caching Cut Our LLM Bills in Half', speakerName: 'Balázs Csomor', stage: 'main', format: 'talk' },
  { id: 'main-9', startTime: '14:35', endTime: '14:55', title: 'Deploying Context Graphs into the Fortune 500: Lessons Building the Context Layer for Large Enterprise', speakerName: 'Henry Thompson', stage: 'main', format: 'talk' },
  { id: 'main-10', startTime: '15:00', endTime: '15:20', title: 'Prompt Learning: Distilling Expensive Reasoning Into Fast Production Prompts', speakerName: 'Oğuz Gültepe', stage: 'main', format: 'talk' },

  // ── Post-lunch: Demo stage (3 × 30 min) ───────────────────────
  { id: 'side-7', startTime: '13:45', endTime: '14:15', title: 'Teaching Agents to Pay: What Devs Need to Know', speakerName: 'Ben Smith', stage: 'side', format: 'talk' },
  { id: 'side-8', startTime: '14:20', endTime: '14:50', title: 'Batch AI Pipelines: How to Go Fast Without Losing Work or Money', speakerNames: ['Marouane Khoukh', 'Mikhail Rozhkov'], stage: 'side', format: 'talk' },
  { id: 'side-9', startTime: '14:55', endTime: '15:25', title: 'Inference Without the Wait: A Live Demo of Instant-On Model Deployment', speakerName: 'Emmett Fear', stage: 'side', format: 'talk' },

  // ── Coffee Break (15:25–15:45) ────────────────────────────────
  { id: 'break-2', startTime: '15:25', endTime: '15:45', title: 'Coffee Break', stage: 'expo', format: 'break' },

  // ── Post-coffee2: Both stages aligned (3 × 20 min) ───────────
  { id: 'main-11', startTime: '15:45', endTime: '16:05', title: 'Building a Universal Agent for Legal', speakerName: 'Jakob Emmerling', stage: 'main', format: 'talk' },
  { id: 'side-10', startTime: '15:45', endTime: '16:05', title: 'From Caching to Batching to Flex — How to optimize AI system for production', speakerNames: ['Lucia Loher', 'Patrick Löber'], stage: 'side', format: 'talk' },

  { id: 'main-12', startTime: '16:10', endTime: '16:30', title: 'Reinventing VEED for the agentic era', speakerName: 'Sabba Keynejad', stage: 'main', format: 'talk' },
  { id: 'side-11', startTime: '16:10', endTime: '16:30', title: 'The 100x Inference Tax You Don\'t Have to Pay', speakerName: 'Jacek Golebiowski', stage: 'side', format: 'talk' },

  { id: 'main-13', startTime: '16:35', endTime: '16:55', title: 'Leading through AI change', speakerName: 'Masashi Beheim', stage: 'main', format: 'talk' },
  { id: 'side-12', startTime: '16:35', endTime: '16:55', title: 'Building the Missing Infrastructure Layer for Agents and Distributed Applications', speakerName: 'Giselle van Dongen', stage: 'side', format: 'talk' },

  // ── Coffee Break (16:55–17:15) ────────────────────────────────
  { id: 'break-3', startTime: '16:55', endTime: '17:15', title: 'Coffee Break', stage: 'expo', format: 'break' },

  // ── Post-coffee3: Both stages aligned (2 × 20 min) ───────────
  { id: 'main-14', startTime: '17:15', endTime: '17:35', title: 'AI-Empowered Engineering Through Collaborative Tooling', speakerName: 'Łukasz Sągol', stage: 'main', format: 'talk' },
  { id: 'side-13', startTime: '17:15', endTime: '17:35', title: 'Build Your Own Background Agent: The infra that scales it to millions', speakerName: 'Lucy Zhang', stage: 'side', format: 'talk' },

  { id: 'main-15', startTime: '17:40', endTime: '18:00', title: 'Model Routing in Production: What We Learned the Hard Way', speakerName: 'Bruno Show', stage: 'main', format: 'talk' },
  { id: 'side-14', startTime: '17:40', endTime: '18:00', title: 'Turning the World into Your Context Window: Rebuilding Web Search to Make AI Reliable in Production', speakerName: 'Sacha Uzan', stage: 'side', format: 'talk' },

  // ── Closing (18:05–18:45) ─────────────────────────────────────
  { id: 'keynote-close', startTime: '18:05', endTime: '18:35', title: 'Shipping Fin to Production: What Worked, What Broke, What Changed', speakerName: 'Des Traynor', stage: 'main', format: 'keynote' },
  { id: 'closing', startTime: '18:35', endTime: '18:45', title: 'Closing Remarks', stage: 'main', format: 'logistics' },
];
