"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { SectionHeading } from "@/components";
import { LidarScapeBackground } from "@/components/ui/lidar-scape-background";
import { SIDE_EVENTS } from "../_data/side-events";

function TagPills({
  tags,
  className = "",
}: {
  tags: string[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

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
  const morningAfter = SIDE_EVENTS.filter((e) => e.timing === "morning-after");

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
    { label: morningAfter[0] && formatGroupDate(morningAfter[0].date), events: morningAfter },
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
            className={`mb-20 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${150 + gi * 100}ms` }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-white tracking-tight text-center">
              {group.label}
            </h3>

            {/* Divider between date headline and the first row */}
            <div className="mx-auto my-6 h-px w-80 sm:w-[32rem] md:w-[48rem] lg:w-[56rem] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gi === 1 && (
                <a
                  href="https://luma.com/applied-ai-conf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-row min-h-[140px] sm:min-h-[220px] bg-black border border-white/15 rounded-xl overflow-hidden transition-all duration-500 hover:border-white/30 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${200 + gi * 100}ms` }}
                >
                  <div className="relative w-28 shrink-0 self-stretch overflow-hidden sm:w-[180px] md:w-[200px] lg:w-[220px]">
                    <LidarScapeBackground />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-2 text-center pointer-events-none">
                      <span className="font-mono text-[9px] sm:text-[10px] md:text-xs tracking-widest text-white">
                        {"{"}Tech: Europe{"}"}
                      </span>
                      <span className="font-mono font-bold text-white text-xl sm:text-3xl md:text-4xl leading-tight tracking-tight">
                        Applied
                        <br />
                        AI Conf
                      </span>
                    </div>
                  </div>

                  <div className="relative flex-1 min-w-0 bg-black px-4 sm:px-5 py-4 flex flex-col gap-3">
                    <span className="text-xs font-mono tabular-nums font-semibold text-white">
                      08:00 – 18:30
                    </span>

                    <h4 className="text-base sm:text-lg md:text-xl font-mono font-semibold text-white leading-tight">
                      Applied AI Conf
                    </h4>

                    <div className="mt-auto flex flex-col gap-5">
                      <TagPills tags={["Conf"]} />
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-white/70">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">Delta Campus</span>
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {group.events.map((event, i) => (
                <a
                  key={event.id}
                  href={event.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-row min-h-[140px] sm:min-h-[220px] bg-black border border-white/15 rounded-xl overflow-hidden transition-all duration-500 hover:border-white/30 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${200 + gi * 100 + i * 60}ms` }}
                >
                  {event.image && (
                    <div className="relative w-28 shrink-0 self-stretch overflow-hidden sm:w-auto sm:aspect-square">
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

                  <div className="relative flex-1 min-w-0 bg-black px-4 sm:px-5 py-4 flex flex-col gap-3">
                    <span className="text-xs font-mono tabular-nums font-semibold text-white">
                      {event.time}
                    </span>

                    <h4 className="text-base sm:text-lg md:text-xl font-mono font-semibold text-white leading-tight">
                      {event.title}
                    </h4>

                    <div className="mt-auto flex flex-col gap-5">
                      <TagPills tags={event.tags} />
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-white/70">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${150 + groups.length * 100}ms` }}
        >
          <p className="text-gray-400 mb-6">
            Are you hosting an event? Please let us know.
          </p>
          <a
            href="mailto:tim@techeurope.io?subject=Hosting%20an%20event%20during%20Applied%20AI%20Week"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black transition-all hover:bg-gray-100 hover:scale-105"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
