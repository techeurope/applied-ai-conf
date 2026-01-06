import { Navigation, Footer } from "@/components";
import {
  Hero,
  About,
  FeaturedSpeakers,
  PartnershipTiers,
  CallToAction,
  FAQ,
} from "@/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <Navigation />
      <main>
        <Hero />
        <About />
        <FeaturedSpeakers />
        <PartnershipTiers />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
