"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Is this conference for beginners?",
    answer:
      "It's designed for people building or operating AI systems. If you're shipping AI (or starting to), you'll get the most value.",
  },
  {
    question: "Will there be two tracks?",
    answer:
      "Yes. A main track and a side track focused on hands-on and technical sessions.",
  },
  {
    question: "What's included in the ticket?",
    answer:
      "Access to all talks, workshops, the partner expo, and networking. Food and non-alcoholic drinks throughout the day.",
  },
  {
    question: "Can my company buy multiple tickets?",
    answer: "Yes. Reach out to us via info@techeurope.io for group bookings.",
  },
  {
    question: "What's the refund and cancellation policy?",
    answer:
      "Tickets are refundable up to 30 days before the event. See full Terms of Service.",
    href: "/terms",
  },
  {
    question: "How can my company partner with us?",
    answer: "Check out our partnership options below and get in touch.",
    href: "#partners",
  },
  {
    question: "Where should I stay and how do I get to the venue?",
    answer: "See our travel guide for hotel recommendations and transport options.",
    href: "/travel",
  },
  {
    question: "When and where can I pick up my badge?",
    answer: "Badges can be collected at the venue on May 27, the day before the conference. More detailed information will follow soon.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleCopyAnchor = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#faq`;
    navigator.clipboard.writeText(url).catch(() => {});
    window.history.replaceState(null, "", "#faq");
  };

  return (
    <section id="faq" className="relative py-16 lg:py-20">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
            <button
              type="button"
              onClick={handleCopyAnchor}
              aria-label="Copy link to FAQ section"
              className="group inline-flex items-baseline gap-3 cursor-pointer"
            >
              <span>FAQ</span>
              <span
                aria-hidden="true"
                className="font-mono text-xl sm:text-2xl md:text-3xl text-gray-400 opacity-0 group-hover:opacity-40 transition-opacity"
              >
                #
              </span>
            </button>
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "bg-white/5 border-white/20"
                    : "bg-transparent border-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium text-white pr-8">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all ${
                      isOpen ? "rotate-45 bg-white/20" : ""
                    }`}
                  >
                    {isOpen ? (
                      <Plus className="h-4 w-4 rotate-45" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-base leading-relaxed text-gray-400">
                    {"href" in item ? (
                      <a
                        href={item.href}
                        className="text-white underline decoration-white/30 hover:decoration-white/60 transition-colors"
                      >
                        {item.answer}
                      </a>
                    ) : (
                      item.answer
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
