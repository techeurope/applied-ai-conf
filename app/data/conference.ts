import type { ConferenceInfo, TicketPricing } from '@/types';

export const CONFERENCE_INFO = {
  title: 'Applied AI in Europe',
  tagline: 'Applied AI Conference',
  location: 'Berlin · 1-Day Conference · Summer 2026',
  date: 'Summer 2026',
  dateDisplay: 'Summer 2026',
} satisfies ConferenceInfo;

export const TICKET_PRICES = {
  inPerson: 'Partnership packages available',
  virtual: 'Contact the team',
} satisfies TicketPricing;
