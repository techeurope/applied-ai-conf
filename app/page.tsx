import { Navigation, Footer } from '@/components';
import { Hero, FeaturedSpeakers, Overview, PartnershipTiers, FAQ } from '@/sections';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      {/* <FeaturedSpeakers /> */}
      <Overview />
      <PartnershipTiers />
      <FAQ />
      <Footer />
    </div>
  );
}
