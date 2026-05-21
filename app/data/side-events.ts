export interface SideEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  rsvpUrl?: string;
  image?: string;
  tags: string[];
  timing: "evening-before" | "after-conference" | "morning-after";
}

export const SIDE_EVENTS: SideEvent[] = [
  {
    id: "ticket-pickup-builders-brews",
    title: "Builders & Brews Berlin — Pre-Event & Ticket Pickup",
    date: "2026-05-27",
    time: "09:00 – 18:00",
    location: "St. Oberholz",
    description:
      "A laid-back day of agents, coffee, and good company with Tavily, Nebius, and n8n. Swing by anytime to pick up your conference badge a day early.",
    rsvpUrl: "https://luma.com/fpxsdfhl",
    image: "/side-events/builders-and-brews.jpg",
    tags: ["Pickup", "Coffee"],
    timing: "evening-before",
  },
  {
    id: "build-with-agents",
    title: "Build with Agents — Berlin night w/ Modal, dltHub",
    date: "2026-05-27",
    time: "18:00 – 20:00",
    location: "Techspace Kreuzberg",
    description:
      "Modal and dltHub host an evening for founders and engineers shipping agents in production. Two technical demos, then drinks with builders doing the same.",
    rsvpUrl: "https://luma.com/ac6rt5od",
    image: "/side-events/build-with-agents.png",
    tags: ["Talks", "Demos"],
    timing: "evening-before",
  },
  {
    id: "beyond-prompts-elastic",
    title: "Beyond Prompts: Building Agents that actually work",
    date: "2026-05-27",
    time: "18:00 – 21:00",
    location: "EBCONT, beyond Quartier",
    description:
      "Elastic Berlin User Group hosts two talks on production AI agents: context engineering with Elastic's Anderson Queiroz, and autonomous AI in security workflows with Tines' Jenny Pinheiro.",
    rsvpUrl: "https://www.meetup.com/elasticsearch-berlin/events/314757148/",
    image: "/side-events/beyond-prompts-elastic.jpg",
    tags: ["Meetup", "Agents"],
    timing: "evening-before",
  },
  {
    id: "mcp-connect-berlin",
    title: "MCP Connect Berlin with N26 & Alpic",
    date: "2026-05-27",
    time: "18:00 – 21:30",
    location: "After registration",
    description:
      "For developers and practitioners working with the Model Context Protocol and AI agents. Best practices, new tools, and real-world MCP server use cases.",
    rsvpUrl: "https://luma.com/o5gpj57z",
    image: "/side-events/mcp-connect-berlin.png",
    tags: ["Meetup", "MCP"],
    timing: "evening-before",
  },
  {
    id: "builders-happy-hour",
    title: "Builders Happy Hour",
    date: "2026-05-27",
    time: "18:00 – 22:00",
    location: "After registration",
    description:
      "Rooftop aperitivo the night before the conference. No panels, no pitches, just the builders and founders worth meeting one evening earlier.",
    rsvpUrl: "https://luma.com/kprpantf",
    image: "/side-events/builders-happy-hour.png",
    tags: ["Rooftop", "Drinks"],
    timing: "evening-before",
  },
  {
    id: "ship-first-mcp-app",
    title: "Ship Your First MCP App in One Evening",
    date: "2026-05-28",
    time: "18:00 – 21:00",
    location: "Mindspace Krausenstraße",
    description:
      "Hands-on hack night to build a working MCP App in 90 minutes using Alpic's open-source Skybridge framework. Pizza, prizes, and lightning pitches.",
    rsvpUrl: "https://luma.com/handpicked-hackathon-1",
    image: "/side-events/ship-first-mcp-app.jpg",
    tags: ["Hackathon", "MCP"],
    timing: "after-conference",
  },
  {
    id: "happy-hour-zero-peec-linkup",
    title: "Happy Hour (づ ◕‿◕ )づ",
    date: "2026-05-28",
    time: "19:30 – 22:30",
    location: "After registration",
    description:
      "Zero, Peec AI, and Linkup want to buy Berlin's AI people drinks. Builders, founders, engineers, GTM, designers, operators, all welcome.",
    rsvpUrl: "https://luma.com/mstsjx9s",
    image: "/side-events/happy-hour-zero-peec-linkup.png",
    tags: ["Drinks", "Open"],
    timing: "after-conference",
  },
  {
    id: "ai-builders-breakfast",
    title: "AI Builders Breakfast",
    date: "2026-05-29",
    time: "09:00 – 10:30",
    location: "telli office, Berlin Mitte",
    description:
      "Start your Friday at the telli office with good coffee, a proper breakfast, and good conversations with fellow AI builders. No pitch, no agenda, just a relaxed 1.5hrs to meet before the day kicks off.",
    rsvpUrl: "https://luma.com/pw865wdw",
    image: "/side-events/ai-builders-breakfast.png",
    tags: ["Breakfast", "Builders"],
    timing: "morning-after",
  },
];
