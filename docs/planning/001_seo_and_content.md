# Applied AI Conf – Website Upgrade User Stories (Landing Page)

**Goal:** Make `conference.techeurope.io` instantly clear, SEO-friendly, and conversion-friendly for **attendees + sponsors**.  
**Event:** May 28, 2026 · The Delta Campus, Berlin.  
**Primary positioning:** “applied ai” + “ai in production” + “berlin”.

---

## Landing page structure (what goes where)

1. **Hero (top fold)**
2. **About Applied AI Conf**
3. **Who it’s for**
4. **What you’ll walk away with**
5. **Speakers**
6. **Format (two tracks)**
7. **Partners / Sponsorship**
8. **Newsletter (Applied AI updates)**
9. **FAQ**
10. **Footer (social links, imprint, etc.)**

---

## User Story 1 – Rewrite the Hero for clarity + keywords

**As a** potential attendee  
**I want** to understand in 10 seconds what this is and for whom  
**So that** I confidently click “Get tickets”

### Where

**Hero section** directly under the H1.

### Replace hero copy with this (paste-ready)

**H1:** Applied AI Conf (keep)

**Subheadline (directly under H1):**  
A one-day **applied AI conference in Berlin** for builders shipping **AI into production**.

**Supporting paragraph (2–3 lines):**  
Join Europe’s technical founders, engineering leaders, and the infra and devtools teams powering them. Learn how teams design, build, and scale production-grade AI systems through talks, panels, workshops, and live demos.

**Primary CTA button:** Get tickets  
**Secondary CTA button/link:** Become a partner  
**Microline (small text under CTAs):** May 28, 2026 · The Delta Campus, Berlin

### Acceptance criteria

- Hero includes keywords: **applied AI conference**, **Berlin**, **AI into production**
- Two CTAs exist (tickets + partner)
- No vague marketing words without concrete format (“talks, panels, workshops, demos”)

---

## User Story 2 – Add “About Applied AI Conf” section (answer the “it’s vague” feedback)

**As a** visitor  
**I want** a clear description of what this is  
**So that** I don’t need to ask the organizers for context

### Where

Immediately **below the hero** and **before Speakers**.

### Paste-ready copy

## About Applied AI Conf

Applied AI Conf is a one-day, highly curated conference for people who are actually putting AI into production: Europe’s leading technical founders, engineering leaders, and the global infra and devtools teams powering them.

Over one day, we’ll go deep on how to design, build, and scale production-grade AI systems. You’ll learn directly from teams shipping AI into real products every day.

**Expect a program packed with:**

- Engineering-focused talks on architecture, tooling, and best practices
- Hands-on workshops by next-gen infrastructure companies
- Technical panels on what’s working (and what isn’t) in production
- Live demos from companies running AI in production today

### Acceptance criteria

- Mirrors the meaning of the Luma description so both pages stay consistent
- Contains “production-grade AI systems” and “AI into production”
- A visitor can answer: what is this, who is it for, what happens there

---

## User Story 3 – Add “Who it’s for” (audience clarity)

**As a** visitor  
**I want** to quickly identify if I’m the target audience  
**So that** I decide fast

### Where

Right after “About”.

### Paste-ready copy

## Who it’s for

- Technical founders and CTOs building AI products
- Engineers shipping AI features into production
- ML / applied AI practitioners focused on real systems
- Product and engineering leaders scaling AI teams
- Infra and devtools teams enabling production AI

### Acceptance criteria

- Explicit roles are listed (founder, CTO, engineer, etc.)
- No generic “anyone interested in AI” positioning

---

## User Story 4 – Add “What you’ll walk away with” (conversion)

**As a** potential attendee  
**I want** to know what I get out of attending  
**So that** the ticket is an easy yes

### Where

Directly after “Who it’s for”.

### Paste-ready copy

## What you’ll walk away with

- Practical patterns for building and scaling production AI systems
- Honest lessons about what worked and what didn’t
- New tools and approaches from infra and devtools teams
- A stronger network of builders across Europe

### Acceptance criteria

- Outcomes are concrete (not “be inspired”)

---

## User Story 5 – Upgrade speaker cards (role + company + logo + “what they build”)

**As a** visitor  
**I want** immediate context about each speaker/company  
**So that** I can judge relevance at a glance

### Where

**Speakers section** (the cards).

### Standard speaker card template (what each card must contain)

- Name
- Role + Company (example: “CTO, Legora”)
- Company logo (small)
- One-line tagline (“what the company does”)
- Headshot alt text + logo alt text

### Speaker copy (paste-ready)

#### Jacob Lauritzen

- Role line: CTO, Legora
- Tagline: Collaborative AI powering lawyers
- Headshot alt text: Jacob Lauritzen headshot
- Logo alt text: Legora logo

#### Lennard Schmidt

- Role line: CEO, Langdock
- Tagline: Enterprise-ready AI platform to roll out AI to all employees
- Headshot alt text: Lennard Schmidt headshot
- Logo alt text: Langdock logo

#### Daniel Khachab

- Role line: CEO, Choco
- Tagline: AI platform for food and beverage wholesalers and distributors
- Headshot alt text: Daniel Khachab headshot
- Logo alt text: Choco logo

#### Nico Bentenrieder

- Role line: CTO, Tacto
- Tagline: Procurement intelligence platform for industry
- Headshot alt text: Nico Bentenrieder headshot
- Logo alt text: Tacto logo

#### Lucas Hild

- Role line: CTO, Knowunity
- Tagline: AI learning companion for students
- Headshot alt text: Lucas Hild headshot
- Logo alt text: Knowunity logo

#### Speaker TBA

- Role line: To be announced
- Tagline: More production AI builders announced soon
- Headshot alt text: Speaker to be announced
- Logo: none

### Acceptance criteria

- No more “CEO/” or “CTO/” without company name
- Logos exist and have correct alt text (not “Image: Knowunity”)
- Every speaker has a tagline (even if talk title is not final)

---

## User Story 6 – Add “Format” section (two tracks, even without a final agenda)

**As a** visitor  
**I want** to understand the structure of the day  
**So that** I can picture the experience before the full schedule is live

### Where

After Speakers, before Partners.

### Paste-ready copy

## Format

- One day in Berlin at The Delta Campus
- Two tracks: Main track and Side track (hands-on, technical sessions)
- Workshops, panels, and live demos focused on production AI
- Expo area with sponsors and community partners

_Full agenda coming soon. Speaker lineup updates will be posted regularly._

### Acceptance criteria

- “Two tracks” is explicitly stated
- Mentions workshops/panels/demos

---

## User Story 7 – Make Partners section sponsor-ready (benefits + next step)

**As a** potential sponsor  
**I want** to instantly understand the audience and what I get  
**So that** I can say yes without back-and-forth

### Where

Partners section.

### Paste-ready copy

## Partners

Meet Europe’s applied AI builders in one room. Get in front of founders, CTOs, and engineers shipping AI into real products.

**What partners get**

- Brand visibility across the website, email, and on-site signage
- Booth space to meet builders, customers, and hiring candidates
- Optional workshop/demo slot (technical, relevant content)
- A highly curated audience focused on production AI

**CTAs**

- Become a partner
- Request sponsorship deck

### Acceptance criteria

- Benefits are explicit (not implied)
- “Deck” is available as a clear next step

---

## User Story 8 – Frame the newsletter as an “Applied AI updates” list (not only conference spam)

**As a** visitor  
**I want** to know what I’ll get from the newsletter  
**So that** I subscribe and stay engaged

### Where

Replace the current “More coming soon” / generic section with newsletter framing.

### Paste-ready copy

## Get Applied AI updates

We’re building an Applied AI newsletter for builders. Expect curated updates on production AI, practical insights, and conference announcements when they matter.

- Production AI patterns and tooling
- What’s working in real teams
- Speaker and agenda drops first

_No spam. Unsubscribe anytime._

### Acceptance criteria

- Clearly “Applied AI” framing
- Sets expectations and reduces subscription friction

---

## User Story 9 – Add a small FAQ section (reduce DMs + increase conversions)

**As a** visitor  
**I want** quick answers to common questions  
**So that** I can purchase without hesitation

### Where

Near the bottom, above footer.

### Suggested FAQ questions (copy-paste)

## FAQ

**Is this conference for beginners?**  
It’s designed for people building or operating AI systems. If you’re shipping AI (or starting to), you’ll get the most value.

**Will there be two tracks?**  
Yes. A main track and a side track focused on hands-on and technical sessions.

**What’s included in the ticket?**  
Access to all talks, workshops, the partner expo, and networking. (Add catering details once confirmed.)

**Can my company buy multiple tickets?**  
Yes. (Add a contact email and/or group discount note if you want.)

**How can my company sponsor?**  
Use the partner form or request the sponsorship deck.

---

## User Story 10 – SEO + share metadata checklist (implementation tasks)

**As a** search engine + social platform  
**I want** clean metadata and event signals  
**So that** the page ranks and shares nicely

### Where

Site-wide metadata + social preview.

### Requirements (implementation checklist)

- Title tag includes: “Applied AI Conference” + “Berlin” + “May 28, 2026”
- Meta description includes: applied ai, ai in production, berlin, founders/engineers/ctos
- Open Graph + Twitter card set (title, description, share image)
- Canonical URL is correct
- Event structured data (Event schema): name, date, venue, ticket URL

---

## Consistency checkpoint (important)

The site currently mentions **700+** attendees. Your internal target is **~500**.  
Pick one and make it consistent across:

- website hero + partners section
- Luma page
- outreach / sponsorship deck

---

# Notes on “repeating the conference name” under the H1

It’s **not broken** to repeat it, but don’t repeat it verbatim.

**Rule of thumb:**

- **H1 = brand name** (“Applied AI Conf”)
- **Subheadline = descriptive keyword phrase** (“A one-day applied AI conference in Berlin…”)

This keeps the page readable for humans and still helps SEO because the subheadline includes the keywords people actually search for.
