"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "cookie-consent";
const LEMLIST_SRC =
  "https://app.lemlist.com/api/visitors/tracking?k=uefJ8tdF1TlFBqHRzIPGEd0Se%2Bx9%2BPoAtdyv%2FjwSyYLoTlEWDF0WoHZ2nLD5HU2j&t=tea_qd8sE3PL7LnZwshja";

export default function LemlistTracking() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === "accepted") {
      setAllowed(true);
      return;
    }
    const onAccepted = () => setAllowed(true);
    window.addEventListener("cookie-consent-accepted", onAccepted);
    return () => window.removeEventListener("cookie-consent-accepted", onAccepted);
  }, []);

  if (!allowed) return null;

  return <Script id="lemlist-tracking" strategy="afterInteractive" src={LEMLIST_SRC} />;
}
