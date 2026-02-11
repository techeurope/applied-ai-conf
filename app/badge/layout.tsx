import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Get Your Badge | Applied AI Conf Berlin",
  description:
    "Generate your personalized attendee badge for Applied AI Conf Berlin on May 28, 2026. Share it on social media!",
  openGraph: {
    title: "Get Your Badge | Applied AI Conf Berlin",
    description:
      "Generate your personalized attendee badge for Applied AI Conf Berlin on May 28, 2026.",
  },
};

export default function BadgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#05070f]">
      <Navigation />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
