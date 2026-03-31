import { Navigation, Footer } from "@/components";
import {
  Hero,
  Agenda,
  Venue,
  FeaturedSpeakers,
  PartnershipTiers,
  // SideEvents,
  CallToAction,
  FAQ,
} from "@/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <Navigation />
      <main>
        <Hero />
        <FeaturedSpeakers />
        <Agenda />
        {/* <SideEvents /> */}
        <PartnershipTiers />
        <Venue />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
