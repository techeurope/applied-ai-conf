"use client";

import posthog from "posthog-js";
import { Ticket } from "lucide-react";
import { LUMA_EVENT_ID } from "@/data/navigation";

export function TicketButton({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  return (
    <a
      href={`https://lu.ma/event/${LUMA_EVENT_ID}`}
      data-luma-action="checkout"
      data-luma-event-id={LUMA_EVENT_ID}
      onClick={() => posthog.capture("ticket_click", { location })}
      className={className}
    >
      <Ticket className="h-4 w-4 text-black" />
      <span className="text-base font-bold text-black">Get Tickets</span>
    </a>
  );
}
