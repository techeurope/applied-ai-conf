"use client";

import { CTANewsletterForm } from "@/components/ui/newsletter-form";

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 min-h-screen flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black" />

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-glow whitespace-nowrap">
            More coming soon
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            We are building this conf to bring the eu AI scene together.
          </p>
        </div>

        {/* CTA - Newsletter with spinning border */}
        <div className="flex justify-center">
          <div className="relative overflow-hidden group rounded-full w-full max-w-md">
            {/* Rotating Rectangle (Beam) */}
            <div
              className="absolute bottom-[50%] left-[-50%] w-[200%] h-[600%] origin-bottom animate-[spin_6s_linear_infinite]"
              style={{
                background:
                  "linear-gradient(to bottom, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f97316 75%, transparent 100%)",
              }}
            />

            {/* Dark Background Layer */}
            <div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] bg-zinc-950 z-10 rounded-full" />

            {/* Newsletter Form */}
            <div className="relative z-20 p-1">
              <CTANewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
