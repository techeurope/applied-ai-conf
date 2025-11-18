import type { Metadata } from "next";
import { Kode_Mono, Inter } from "next/font/google";
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
  title: "Applied AI Conf by {Tech: Europe} - Applied AI",
  description: "First edition - May 28, 2026 at Delta Campus, Berlin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kodeMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
