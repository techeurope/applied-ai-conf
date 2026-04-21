import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Event Hub | Applied AI Conf Berlin",
  description:
    "Your on-site companion for Applied AI Conf: Wi-Fi, live schedule, lunch, and an interactive floor plan.",
  robots: { index: false, follow: false },
};

export default function HubLayout({
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
