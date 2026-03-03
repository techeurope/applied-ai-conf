"use client";

import posthog from "posthog-js";
import { Ticket } from "lucide-react";
import { LUMA_EVENT_ID } from "@/data/navigation";

const LUMA_EMBED_URL = `https://luma.com/embed/event/${LUMA_EVENT_ID}/simple`;
const LUMA_EVENT_URL = `https://lu.ma/event/${LUMA_EVENT_ID}`;

function openLumaCheckout() {
  // If the Luma script already created its overlay, skip
  if (document.querySelector(".luma-checkout--overlay")) return;

  // Load Luma CSS if not already present
  if (!document.querySelector('link[href*="luma"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://embed.lu.ma/checkout-button.css";
    document.head.appendChild(link);
  }

  const overlay = document.createElement("div");
  overlay.className = "luma-checkout--overlay luma-show";

  const close = () => overlay.remove();

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "luma-checkout--close-btn";
  closeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.onclick = close;

  const modal = document.createElement("div");
  modal.className = "luma-checkout--modal";

  const iframe = document.createElement("iframe");
  iframe.src = LUMA_EMBED_URL;
  iframe.style.cssText = "border:0;width:100%;height:100%";
  iframe.onload = () => {
    overlay.classList.add("luma-iframe-loaded");
  };

  // If the iframe fails to load (blocked domain), fall back to opening
  // the Luma event page directly in a new tab after a timeout.
  const fallbackTimer = setTimeout(() => {
    if (!overlay.classList.contains("luma-iframe-loaded")) {
      close();
      window.open(LUMA_EVENT_URL, "_blank", "noopener,noreferrer");
    }
  }, 3000);

  iframe.onload = () => {
    clearTimeout(fallbackTimer);
    overlay.classList.add("luma-iframe-loaded");
  };

  modal.appendChild(iframe);
  overlay.appendChild(closeBtn);
  overlay.appendChild(modal);
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      clearTimeout(fallbackTimer);
      close();
    }
  };

  // Escape key to close
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      clearTimeout(fallbackTimer);
      close();
      document.removeEventListener("keydown", onKey);
    }
  };
  document.addEventListener("keydown", onKey);

  document.body.appendChild(overlay);
}

export function TicketButton({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  return (
    <a
      href="#"
      data-luma-action="checkout"
      data-luma-event-id={LUMA_EVENT_ID}
      onClick={(e) => {
        e.preventDefault();
        // Open the checkout fallback first — never let analytics block it
        setTimeout(openLumaCheckout, 50);
        try {
          posthog.capture("ticket_click", { location });
        } catch {
          // PostHog not initialized or failed — ignore
        }
      }}
      className={className}
    >
      <Ticket className="h-4 w-4 text-black" />
      <span className="text-base font-bold text-black">Get Tickets</span>
    </a>
  );
}
