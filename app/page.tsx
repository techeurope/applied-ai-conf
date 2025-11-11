import { Navigation, Footer } from "@/components";
import { Hero, FeaturedSpeakers, FAQ } from "@/sections";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-black text-white w-full"
      style={{ width: "100vw" }}
    >
      <Navigation />
      <Hero />
      <FeaturedSpeakers />
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-black/60"></div>
        <div className="relative mx-auto w-full max-w-4xl px-6 lg:px-12 text-center">
          <div className="mb-16 text-center lg:mb-24">
            <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
              Partners
            </h2>
          </div>
          <p className="mb-8 text-lg text-gray-300">
            Explore partnership opportunities and learn how to position your
            brand in front of Europe&apos;s leading AI builders.
          </p>
          <Link
            href="/partners"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-base font-medium uppercase tracking-wider text-black shadow-lg shadow-black/50 transition-all duration-300 hover:scale-105 hover:bg-gray-200 hover:shadow-xl"
          >
            <span>Become a Partner</span>
            <span
              aria-hidden
              className="text-xl transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </section>
      <FAQ />
      <Footer />
    </div>
  );
}
