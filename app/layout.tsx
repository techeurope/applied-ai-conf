import type { Metadata } from "next";
import { Kode_Mono, Inter } from "next/font/google";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const kodeMono = Kode_Mono({
  variable: "--font-kode-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Applied AI Conference Berlin | May 28, 2026",
  description:
    "A one-day applied AI conference in Berlin for technical founders, CTOs, and engineers shipping AI into production. Talks, panels, workshops, and live demos.",
  metadataBase: new URL("https://conference.techeurope.io"),
  alternates: {
    canonical: "https://conference.techeurope.io",
  },
  openGraph: {
    title: "Applied AI Conference Berlin | May 28, 2026",
    description:
      "A one-day applied AI conference in Berlin for technical founders, CTOs, and engineers shipping AI into production. Talks, panels, workshops, and live demos.",
    url: "https://conference.techeurope.io",
    siteName: "Applied AI Conf by {Tech: Europe}",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 1200,
        alt: "Applied AI Conference - Berlin | May 28, 2026",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Applied AI Conference Berlin | May 28, 2026",
    description:
      "A one-day applied AI conference in Berlin for technical founders, CTOs, and engineers shipping AI into production.",
    images: ["/og-image.jpg"],
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Applied AI Conf",
  description:
    "A one-day applied AI conference in Berlin for technical founders, CTOs, and engineers shipping AI into production.",
  startDate: "2026-05-28T09:00:00+02:00",
  endDate: "2026-05-28T18:00:00+02:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "The Delta Campus",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Berlin",
      addressCountry: "DE",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Tech: Europe",
    url: "https://techeurope.io",
  },
  offers: {
    "@type": "Offer",
    url: "https://lu.ma/appliedaiconf",
    availability: "https://schema.org/InStock",
  },
  image: "https://conference.techeurope.io/og-image.jpg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <script id="luma-checkout" src="https://embed.lu.ma/checkout-button.js" async />
      </head>
      <body className={`${kodeMono.variable} ${inter.variable} antialiased`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
