import type { Metadata } from "next";
import { Navigation, Footer } from "@/components";
import {
  Hero,
  Agenda,
  Venue,
  FeaturedSpeakers,
  PartnershipTiers,
  SideEvents,
  CallToAction,
  FAQ,
} from "./_sections";

export const metadata: Metadata = {
  title: "Applied AI Conf 2026 — The Archive",
  description:
    "The 2026 edition of Applied AI Conf by {Tech: Europe}, preserved as it was. May 28, 2026 · The Delta Campus, Berlin.",
};

// Frozen archive of the 2026 homepage. This composition and its sections are a
// snapshot under app/2026/ — editing the live sections in app/sections will not
// change this page.
export default function Archive2026() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <Navigation />
      <main>
        <Hero />
        <FeaturedSpeakers />
        <Agenda />
        <SideEvents />
        <PartnershipTiers />
        <Venue />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
