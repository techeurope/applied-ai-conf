import { Footer } from "@/components";
import { CallToAction } from "@/sections";
import { Hero2027, Gallery2026, Logos2026 } from "@/sections/y2027";

// 2027 homepage: the conference is over — thank you for 2026, partner with us for 2027.
// The full 2026 site lives, frozen, at /2026.
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <main>
        <Hero2027 />
        <Gallery2026 />
        <Logos2026 />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
