"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "cookie-consent";

export default function XPixel() {
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

  return (
    <Script
      id="x-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config','p7886');`,
      }}
    />
  );
}
