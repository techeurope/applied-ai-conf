"use client";

import { NewsletterModal } from "@/components/ui/newsletter-form";
import { Mail } from "lucide-react";

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

        {/* CTA - Single Button */}
        <div className="flex justify-center">
          <div className="relative overflow-hidden group rounded-2xl">
            {/* Rotating Rectangle (Beam) */}
            <div
              className="absolute bottom-[50%] left-[-25%] w-[150%] h-[300%] origin-bottom animate-[spin_6s_linear_infinite]"
              style={{
                background:
                  "linear-gradient(to bottom, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f97316 75%, transparent 100%)",
              }}
            />

            {/* Dark Background Layer */}
            <div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] bg-zinc-950 z-10 transition-colors duration-300 group-hover:bg-zinc-900 rounded-[14px]" />

            <NewsletterModal>
              <button className="relative z-20 py-5 px-10 flex items-center justify-center gap-3 focus:outline-none cursor-pointer">
                <Mail className="h-5 w-5 text-white/80 group-hover:text-white transition-colors shrink-0" />
                <span className="text-lg font-semibold text-white">
                  Receive updates
                </span>
              </button>
            </NewsletterModal>
          </div>
        </div>
      </div>
    </section>
  );
}
