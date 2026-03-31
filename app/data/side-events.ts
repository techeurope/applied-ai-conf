export interface SideEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  rsvpUrl?: string;
  tags: string[];
  timing: "evening-before" | "after-conference";
}

export const SIDE_EVENTS: SideEvent[] = [
  {
    id: "pre-conference-dinner",
    title: "Speaker & Community Dinner",
    date: "2026-06-24",
    time: "19:00 – 22:00",
    location: "TBA, Berlin",
    description:
      "An intimate dinner for speakers, partners, and community members. Meet the people behind the talks before the conference kicks off.",
    rsvpUrl: undefined,
    tags: ["Networking", "Invite Only"],
    timing: "evening-before",
  },
  {
    id: "pre-conference-drinks",
    title: "Pre-Conference Drinks",
    date: "2026-06-24",
    time: "20:00 – 23:00",
    location: "TBA, Berlin",
    description:
      "Casual drinks for all attendees arriving the evening before. No agenda, just good conversations with fellow builders.",
    rsvpUrl: undefined,
    tags: ["Open", "Networking"],
    timing: "evening-before",
  },
  {
    id: "afterparty",
    title: "Official Afterparty",
    date: "2026-06-25",
    time: "18:30 – 22:00",
    location: "TBA, Berlin",
    description:
      "Wind down after a full day of talks. Music, drinks, and the conversations that didn't fit into the hallway track.",
    rsvpUrl: undefined,
    tags: ["Open", "Party"],
    timing: "after-conference",
  },
  {
    id: "ai-founders-meetup",
    title: "AI Founders Meetup",
    date: "2026-06-25",
    time: "19:00 – 21:00",
    location: "TBA, Berlin",
    description:
      "A focused meetup for founders building AI-first companies. Share war stories, compare stacks, and connect with potential collaborators.",
    rsvpUrl: undefined,
    tags: ["Founders", "Networking"],
    timing: "after-conference",
  },
];
