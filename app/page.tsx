import { Navigation, Footer } from "@/components";
import { Hero, FeaturedSpeakers, Overview, PartnershipTiers, FAQ } from "@/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <Navigation />
      <main>
        <Hero />
        <FeaturedSpeakers />
        <Overview />
        <PartnershipTiers />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
