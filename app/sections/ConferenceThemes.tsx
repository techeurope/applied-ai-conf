"use client";

import { useEffect, useRef, useState } from "react";

const THEMES = [
  {
    number: "01",
    label: "Production Case Studies",
    tagline: "Real systems, real constraints, real lessons",
  },
  {
    number: "02",
    label: "LLM Application Architecture",
    tagline: "Patterns for RAG, tool use, agents, and routing",
  },
  {
    number: "03",
    label: "Evaluation & Observability",
    tagline: "Measuring quality, monitoring drift, debugging failures",
  },
  {
    number: "04",
    label: "LLMOps & Infrastructure",
    tagline: "Serving, latency, cost, reliability, scaling",
  },
  {
    number: "05",
    label: "Enterprise Readiness",
    tagline: "Security, privacy, governance as engineering work",
  },
  {
    number: "06",
    label: "AI-Native Workflows",
    tagline: "How teams build and ship faster with AI-native processes",
  },
];

export default function ConferenceThemes() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="themes"
      className="relative w-full bg-black py-28 lg:py-40"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05]">
            One day. Two stages.
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-4">
            What keeps engineers and builders up at night.
          </p>
        </div>

        {/* Theme grid - gap-px on a tinted wrapper creates subtle divider lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {THEMES.map((theme, i) => (
            <div
              key={theme.number}
              className={`bg-black p-8 lg:p-10 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              <span className="text-[11px] font-mono text-white/15 tracking-[0.4em]">
                {theme.number}
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-mono font-bold text-white mt-3 mb-3 tracking-tight leading-tight">
                {theme.label}
              </h3>
              <p className="text-sm lg:text-[0.95rem] text-gray-500 leading-relaxed">
                {theme.tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
