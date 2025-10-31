import type { ConferenceInfo, TicketPricing } from "@/types";

export const CONFERENCE_INFO = {
  title: "aico.nf",
  tagline: "Applied AI",
  location: "Delta Campus · Berlin · May 28, 2026",
  date: "2026-05-28",
  dateDisplay: "May 28, 2026",
} satisfies ConferenceInfo;

export const TICKET_PRICES = {
  inPerson: "Partners packages available",
  virtual: "Contact the team",
} satisfies TicketPricing;
