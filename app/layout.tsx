import type { Metadata } from "next";
import { Kode_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Applied AI Conf by {Tech: Europe}",
  description:
    "Europe's top founders & builders are shipping AI into production - May 28, 2026 at Delta Campus, Berlin",
  metadataBase: new URL("https://conference.techeurope.io"),
  openGraph: {
    title: "Applied AI Conf by {Tech: Europe}",
    description:
      "Europe's top founders & builders are shipping AI into production - May 28, 2026 at Delta Campus, Berlin",
    url: "https://conference.techeurope.io",
    siteName: "Applied AI Conf by {Tech: Europe}",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 1200,
        alt: "Applied AI Conf - Berlin | May 28, 2026",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Applied AI Conf by {Tech: Europe}",
    description:
      "Europe's top founders & builders are shipping AI into production - May 28, 2026 at Delta Campus, Berlin",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${kodeMono.variable} ${inter.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
