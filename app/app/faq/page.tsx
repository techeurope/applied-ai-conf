import Link from "next/link";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "FAQ · Applied AI Conf",
};

type Q = { q: string; a: React.ReactNode };

const SECTIONS: { title: string; items: Q[] }[] = [
  {
    title: "On the day",
    items: [
      {
        q: "What time do doors open?",
        a: "08:00. The first session is at 09:10. Aim to be inside by 09:00 — the room fills up.",
      },
      {
        q: "Will sessions be recorded?",
        a: "Yes. We record everything on the main stage and most of the side stage. Recordings go up on YouTube in the weeks after the conference. Sign in with your Luma email to get notified.",
      },
      {
        q: "Can I bring a +1?",
        a: "Tickets are personal and curated, so we can't add walk-ins. If you have a strong case (a co-founder, a CTO you're hiring), email hello@techeurope.io and we'll see what's possible.",
      },
      {
        q: "Is there a dress code?",
        a: "No. Wear what you'd code in.",
      },
    ],
  },
  {
    title: "Food, wifi, power",
    items: [
      {
        q: "What about food?",
        a: "Lunch is 12:30–13:30 in the expo hall. Meat, vegetarian, vegan, gluten-free. Allergens are labelled at the counter. Coffee, tea, and snacks are out all day.",
      },
      {
        q: "Dietary requirements I didn't flag at signup?",
        a: "Walk up to Registration and tell us. We'll talk to catering.",
      },
      {
        q: "Wifi?",
        a: "Network: AppliedAIConf. Password: shipit2026. It's a single guest network, open across the building.",
      },
      {
        q: "Power outlets?",
        a: "Tables in the workshop area have them. Bring a multi-plug if you're staying for the day with a laptop — outlets fill up fast.",
      },
    ],
  },
  {
    title: "People & policy",
    items: [
      {
        q: "Can I take photos and post them?",
        a: "Yes, of stages and venues. For attendees and speakers, always ask first. The crew (black T-shirts) can help if you want a posed shot with a speaker.",
      },
      {
        q: "Code of conduct?",
        a: (
          <>
            We have one — read it at{" "}
            <Link
              href="/code-of-conduct"
              className="text-white underline underline-offset-4 hover:no-underline"
            >
              /code-of-conduct
            </Link>
            . Short version: treat others how you'd want to be treated; if in
            doubt, ask; harassment of any kind ends the day.
          </>
        ),
      },
      {
        q: "Lost something?",
        a: "Help Desk at registration. We collect lost items and reunite them the same day; anything left at the end of the day stays with us for two weeks.",
      },
      {
        q: "Speaker swag, signed books?",
        a: "Some partners bring giveaways at their booths. We don't pre-arrange book signings, but speakers usually stay around the foyer after their talks if you want to say hi.",
      },
    ],
  },
  {
    title: "After the conference",
    items: [
      {
        q: "When are recordings up?",
        a: "We aim for 2–3 weeks after the event. Sign in with your Luma email to get a notification.",
      },
      {
        q: "Will there be another one?",
        a: "Yes. Subscribe to the newsletter on techeurope.io for the next dates.",
      },
      {
        q: "I want to speak / sponsor next year. Who do I email?",
        a: "hello@techeurope.io — same place. We open speaker submissions in autumn and partner outreach earlier.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 05 · faq"
        title={<>Practical answers.</>}
        lede={
          <>
            Doors, food, wifi, photos, recordings. If your question isn't
            answered below, email{" "}
            <a
              href="mailto:hello@techeurope.io"
              className="text-white underline underline-offset-4 hover:no-underline"
            >
              hello@techeurope.io
            </a>
            .
          </>
        }
      />

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            // {section.title.toLowerCase()}
          </p>
          <ul className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
            {section.items.map((item, i) => (
              <li key={i} className="px-4 sm:px-5 py-4 space-y-1.5">
                <p className="text-sm sm:text-base text-white font-medium">
                  {item.q}
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <PageFooter />
    </div>
  );
}
