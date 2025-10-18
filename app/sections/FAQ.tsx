'use client';

import { useState } from 'react';

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

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl sm:text-5xl font-bold text-center">Questions &amp; Answers</h2>
        <p className="mt-4 text-lg text-center text-gray-200">
          Tap into the details so you know what to expect before you arrive.
        </p>

        <div className="mt-12 divide-y divide-gray-800 rounded-3xl border border-gray-800 bg-zinc-900/60 backdrop-blur">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="text-lg font-semibold text-white">{item.question}</span>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-2xl font-bold text-gray-200"
                    aria-hidden="true"
                  >
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-panel-${index}`}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-base text-gray-200"
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
