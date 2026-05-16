"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
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

  const formatGroupDate = (dateStr: string) =>
    new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const groups = [
    { label: eveningBefore[0] && formatGroupDate(eveningBefore[0].date), events: eveningBefore },
    { label: afterConference[0] && formatGroupDate(afterConference[0].date), events: afterConference },
  ].filter((g) => g.events.length > 0);

  return (
    <section
      ref={ref}
      id="applied-ai-week"
      className="relative w-full bg-black pt-24 pb-16 lg:pt-32 lg:pb-20"
    >
      <div className="w-full px-6 lg:px-12">
        <SectionHeading
          title="Applied AI Week"
          description="Meetups, hack nights, and everything else the AI community is up to in Berlin."
          sectionId="applied-ai-week"
          className={`mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        />

        {groups.map((group, gi) => (
          <div
            key={group.label}
            className={`mb-20 last:mb-0 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${150 + gi * 100}ms` }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-white tracking-tight text-center">
              {group.label}
            </h3>

            {/* Divider between date headline and the first row */}
            <div className="mx-auto my-6 h-px w-80 sm:w-[32rem] md:w-[48rem] lg:w-[56rem] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Conference centerpiece - sits above Thursday's after-conf events */}
            {gi === 1 && (
              <div className="relative w-full overflow-hidden rounded-xl bg-black">
                {/* Extend lidar vertically beyond card so the animation fills full width */}
                <div className="absolute inset-x-0 -inset-y-48">
                  <LidarScapeBackground />
                </div>
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5">
                  <h4 className="font-mono font-bold tracking-tight text-sm sm:text-lg md:text-xl lg:text-2xl text-white">
                    <span className="hidden sm:inline text-white/70">{"{"}Tech: Europe{"}"} </span>
                    <span className="text-glow">Applied AI Conf</span>
                  </h4>

                  <div className="shrink-0 inline-flex items-center rounded-md border border-white/20 bg-black/70 backdrop-blur-sm px-3 py-1.5">
                    <span className="text-xs sm:text-sm font-mono tabular-nums text-white font-semibold whitespace-nowrap">
                      08:00 – 18:30
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Divider between conf card and after-conf events */}
            {gi === 1 && (
              <div className="mx-auto my-6 h-px w-32 sm:w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.events.map((event, i) => (
                <a
                  key={event.id}
                  href={event.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex items-start bg-black border border-white/15 rounded-xl overflow-hidden transition-all duration-500 hover:border-white/30 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${200 + gi * 100 + i * 60}ms` }}
                >
                  {event.image && (
                    <div className="relative shrink-0 w-32 sm:w-40 aspect-square">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={600}
                      />
                    </div>
                  )}

                  <div className="relative flex-1 min-w-0 bg-black p-4 sm:p-5 flex flex-col gap-2 self-stretch">
                    {/* Time badge - top right */}
                    <div className="absolute top-3 right-3 inline-flex items-center rounded-md border border-white/15 bg-white/[0.05] px-2 py-1">
                      <span className="text-[11px] font-mono tabular-nums text-white font-semibold whitespace-nowrap">
                        {event.time}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-mono font-semibold text-white leading-tight pr-28">
                      {event.title}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {event.location}
                    </p>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
