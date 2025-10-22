'use client';

import { useState, useEffect, useRef } from 'react';

const FAQ_ITEMS = [
  {
    question: 'Who should attend the Applied AI Conference?',
    answer:
      'This event is designed for product leaders, engineering teams, investors, and founders who want to accelerate real-world AI adoption across their organizations.',
  },
  {
    question: 'What can I expect from the sessions?',
    answer:
      'Expect actionable case studies, candid conversations with industry peers, and hands-on tactical guidance for shipping AI-powered products responsibly.',
  },
  {
    question: 'Is there networking built into the agenda?',
    answer:
      'Yes. We curate targeted networking blocks, small-group roundtables, and curated introductions so you can meet the operators who can help you move faster.',
  },
  {
    question: 'How do I become a partner or sponsor?',
    answer:
      'Share a bit about your goals via the partnership intake form. Our team will follow up with opportunities tailored to the audience segments you want to reach.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fullText = 'Questions & Answers';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      if (headingRef.current) {
        observer.unobserve(headingRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      if (!isDeleting) {
        // Typing forward
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(animate, 100);
        } else {
          // Pause at end before deleting
          timeoutId = setTimeout(() => {
            isDeleting = true;
            animate();
          }, 2000);
        }
      } else {
        // Deleting backward
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayText(fullText.slice(0, currentIndex));
          timeoutId = setTimeout(animate, 50);
        } else {
          // Pause at start before typing again
          timeoutId = setTimeout(() => {
            isDeleting = false;
            animate();
          }, 500);
        }
      }
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  return (
    <section id="faq" className="relative py-12 pt-8 px-4 sm:px-6 lg:px-8 lg:py-16 lg:pt-12">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-black/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700/40 via-transparent to-transparent"></div>
      <div className="relative mx-auto max-w-6xl">
        <h2 ref={headingRef} className="text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl text-center min-h-[1.2em]">
          {displayText}
          <span className="animate-pulse">|</span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300 sm:text-xl lg:text-2xl text-center">
          Tap into the details so you know what to expect before you arrive.
        </p>

        <div className="mt-12 divide-y divide-gray-700/50 rounded-3xl border border-gray-700/70 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question} className="transition-colors hover:bg-zinc-800/30">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-all hover:px-7"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="text-lg font-semibold text-white">{item.question}</span>
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-600 bg-zinc-800/50 text-2xl font-bold text-gray-100 transition-all hover:border-gray-500 hover:bg-zinc-700/50"
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-panel-${index}`}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-base leading-relaxed text-gray-300"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
