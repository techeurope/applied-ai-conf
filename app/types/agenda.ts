export type Stage = 'main' | 'side';
export type SessionFormat = 'keynote' | 'talk' | 'panel' | 'workshop' | 'break' | 'logistics';

export interface AgendaSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  title: string;
  speakerName?: string; // Matches SPEAKERS[].name for lookups
  speakerNames?: string[]; // Multiple speakers (e.g. joint talks)
  stage: Stage;
  format: SessionFormat;
  description?: string;
}
