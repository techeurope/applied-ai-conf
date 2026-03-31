"use client";

import { useEffect, useRef, useState } from "react";
import { SIDE_EVENTS } from "@/data/side-events";

export default function SideEvents() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const eveningBefore = SIDE_EVENTS.filter((e) => e.timing === "evening-before");
  const afterConference = SIDE_EVENTS.filter((e) => e.timing === "after-conference");

  return (
    <section ref={ref} id="side-events" className="relative w-full bg-black py-16 lg:py-20">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter leading-[1.05]">
            Side Events
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mt-2">
            Connect before and after the conference
          </p>
        </div>

        {[
          { label: "Evening Before", events: eveningBefore },
          { label: "After Conference", events: afterConference },
        ].map((group, gi) => (
          <div
            key={group.label}
            className={`mb-10 last:mb-0 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${150 + gi * 100}ms` }}
          >
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-4">
              {group.label}
            </h3>

            <div className="relative border-l border-white/10 pl-6 space-y-4">
              {group.events.map((event, i) => (
                <div
                  key={event.id}
                  className={`relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 transition-all duration-500 hover:bg-white/[0.07] hover:border-white/15 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${200 + gi * 100 + i * 60}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[calc(1.5rem+4.5px)] top-6 h-2 w-2 rounded-full bg-white/20 ring-2 ring-black" />

                  <div className="flex flex-col sm:flex-row sm:gap-5">
                    {/* Time */}
                    <div className="shrink-0 mb-2 sm:mb-0 sm:w-32">
                      <span className="text-sm font-mono tabular-nums text-gray-300 font-semibold">
                        {event.time}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-mono font-semibold text-white leading-tight">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">{event.location}</p>
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono uppercase tracking-wider text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {event.rsvpUrl && (
                          <a
                            href={event.rsvpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs font-mono text-white/60 border border-white/10 rounded-full px-3 py-1 hover:bg-white/[0.06] hover:text-white transition-all"
                          >
                            RSVP
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
