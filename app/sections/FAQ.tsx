'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
      'Share a bit about your goals via the partners intake form. Our team will follow up with opportunities tailored to the audience segments you want to reach.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-mono font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl text-glow">
                Questions & Answers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Everything you need to know about the event.
            </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={item.question} 
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium text-white pr-8">{item.question}</span>
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all ${isOpen ? 'rotate-45 bg-white/20' : ''}`}>
                    {isOpen ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 text-base leading-relaxed text-gray-400">
                    {item.answer}
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
