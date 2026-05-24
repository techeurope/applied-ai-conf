import {
  CalendarDays,
  HelpCircle,
  IdCard,
  Map,
  Plane,
  Ticket,
  Users,
} from "lucide-react";

export type Tile = {
  href: string;
  label: string;
  blurb: string;
  icon: typeof IdCard;
  authOnly?: boolean;
};

// Canonical attendee-launcher tiles. Mirrors the tab nav but treats them as
// destinations from the home screen rather than just tabs.
export const TILES: Tile[] = [
  { href: "/app/connect", label: "Badge", blurb: "Your QR · scan others", icon: IdCard, authOnly: true },
  { href: "/app/agenda", label: "Agenda", blurb: "Every session, by minute", icon: CalendarDays },
  { href: "/app/voucher", label: "Voucher", blurb: "Lunch · drinks", icon: Ticket, authOnly: true },
  { href: "/app/contacts", label: "Contacts", blurb: "People you've met", icon: Users, authOnly: true },
  { href: "/app/venue", label: "Floor plan", blurb: "Walk the venue", icon: Map },
  { href: "/app/travel", label: "Travel", blurb: "Getting to Berlin", icon: Plane },
  { href: "/app/faq", label: "FAQ", blurb: "Practical answers", icon: HelpCircle },
];
