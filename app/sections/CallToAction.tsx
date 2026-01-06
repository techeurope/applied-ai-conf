"use client";

import { CTANewsletterForm } from "@/components/ui/newsletter-form";

export default function CallToAction() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="glass-card rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-10 lg:p-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-mono font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
              Get Applied AI updates
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-300 leading-relaxed">
              We&apos;re building an Applied AI newsletter for builders. Expect
              curated updates on production AI, practical insights, and
              conference announcements when they matter.
            </p>
          </div>

          {/* Newsletter Form - keeping the original styling unchanged */}
          <div className="flex flex-col items-center">
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
            <p className="mt-4 text-sm text-gray-500">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
