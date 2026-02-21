# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Next.js 16 conference website for "Applied AI Conf by {Tech: Europe}" - a one-day applied AI conference on May 28, 2026 at The Delta Campus in Berlin. Built with React 19, TypeScript (strict), Tailwind CSS v4, and React Three Fiber for shader graphics.

## Commands

```bash
pnpm dev          # Dev server with Turbopack (NEVER run this — user always has it running)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
```

**Important:** Never start the dev server (`pnpm dev`). The user always has it running already.

### Speaker Image Pipeline

Uses `agent-media` CLI (install globally: `npm i -g agent-media`). Requires `FAL_API_KEY` in environment (source `~/.zshrc`).

**Minimum source resolution:** 1280×1280 pixels. Always request at least this size from speakers. Smaller images must be upscaled before processing.

**File naming:** `name.jpg` → `name_fullbody_square.png` → `name_fullbody_transparent_square.png`

**Step 1: Extend headshot to full body (1:1 square)**

The prompt is critical — use this exact prompt for consistency across all speakers:

```bash
agent-media image edit \
  --in public/speakers/name.jpg \
  --prompt "Zoom out and show the full person with complete head, shoulders and upper body. Add empty space at the top of the image above the person's head - the person should not touch the top edge. Position the person lower in the frame with padding above their head. Both shoulders must be fully visible with nothing cut off at any edge. Create a professional headshot with the person centered horizontally but positioned slightly lower with headroom above. Apply professional photo studio lighting with soft, even illumination. Apply consistent color grading: neutral to slightly warm tone (5500K), balanced contrast, natural skin tones. Keep the person exactly the same - same pose, expression, and appearance." \
  --out public/speakers/name_fullbody_square.png \
  --provider fal
```

**Step 2: Color correction (professional photo grade)**

Use sharp (NOT AI edit — AI edit destroys/regenerates the image). Write to a separate file first to avoid overwriting the original.

```bash
node -e "
const sharp = require('sharp');
const input = 'public/speakers/name_fullbody_square.png';
const output = 'public/speakers/name_fullbody_square.png';
sharp(input)
  .modulate({ brightness: 1.05, saturation: 1.25 })
  .linear([1.05, 1.0, 0.95], [5, 0, -5])
  .toFile(output + '.tmp')
  .then(() => { require('fs').renameSync(output + '.tmp', output); console.log('Done'); })
  .catch(e => console.error(e));
"
```

This applies: slight brightness boost, saturation increase, warm color shift (boost reds, reduce blues). Mimics professional studio color grading.

**Step 3: Remove background**

```bash
agent-media image remove-background \
  --in public/speakers/name_fullbody_square.png \
  --out public/speakers/name_fullbody_transparent_square.png \
  --provider fal
```

**Step 4: Crop to square (if needed)**

```bash
agent-media image crop \
  --in public/speakers/name_fullbody_transparent_square.png \
  --width 1024 --height 1024 \
  --out public/speakers/name_fullbody_transparent_square.png
```

**Troubleshooting:**
- Shoulders cut off → add "The [left/right] shoulder especially must be completely visible"
- No headroom → add "Make the person smaller in the frame"
- Color looks washed out/pale → run the color correction step (step 2)
- NEVER use AI edit for color correction — it regenerates the image and degrades quality

## Architecture

**Path alias:** `@/*` maps to `./app/*` - all imports use `@/` prefix.

### Data-Driven Content

All content lives in `app/data/*.ts` as typed constants (using `satisfies`) with types in `app/types/*.ts`. Components import data directly - no CMS, no fetching. Example: `CONFERENCE_INFO` in `data/conference.ts` satisfies `ConferenceInfo` type.

### Component Organization

- **Sections** (`app/sections/`): Full-page sections composing the landing page (Hero, FeaturedSpeakers, PartnershipTiers, etc.). Export from `sections/index.ts`, compose in `app/page.tsx`.
- **Components** (`app/components/`): Reusable elements (Navigation, Footer, SubpageLayout). SubpageLayout wraps all static pages (Team, Imprint, Privacy, Code of Conduct) with consistent Nav + Footer.
- **UI primitives** (`app/components/ui/`): Low-level components - shader backgrounds (LidarScapeBackground, ShaderWaveBackground, FluidWaveBackground), newsletter form (3 variants), buttons, company logo SVGs.
- **Company logos** (`app/components/ui/*-logo.tsx`): Inline SVG React components for speaker companies, imported via `@/components`.

### Key Integrations

- **Ticketing:** Luma Events - buttons use `data-luma-action` and `data-luma-event-id` attributes, checkout script loaded in root layout.
- **Newsletter:** Beehiiv - `POST /api/subscribe` route. Requires `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` env vars.
- **Analytics:** PostHog (posthog-js) with cookie consent banner. Requires `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` env vars.
- **3D/Shaders:** React Three Fiber + Three.js for hero background effects.

### Slack

Use the `agent-slack` skill to read/search/reply to Slack messages in the **{Tech: Europe}** workspace (`techeurope-slack.slack.com`). Credentials are stored at `~/.agent-slack/credentials.json` (user-level, no project config needed).

**Team members:**

| Name | Slack ID | Role |
|------|----------|------|
| Tim Pietrusky | `U0A4333565N` | Tech lead, website, speaker programme |
| Nima Sadeghifard | `U0A023Z91NK` | Business, partnerships, sponsorship |
| Bela | `U09T15BEEUC` | Strategy, speaker acquisition, sales |

**Primary channel:** `#conference` (`C0A0HVBC2V8`) — all conference-related coordination.

If you get `invalid_auth`, the browser token has expired. Ask the user to grab a fresh cURL from Chrome DevTools (Network tab → any `api.slack.com` request → Copy as cURL) and re-run `agent-slack auth parse-curl` or manually add with `agent-slack auth add`.

### Google Workspace (gog CLI)

This project uses [gog](https://gogcli.sh/) to interact with Gmail, Calendar, Drive, and Sheets from the terminal.

**Prerequisites:**
- gog CLI installed (`brew install steipete/tap/gogcli` or binary from [releases](https://github.com/steipete/gogcli/releases))
- `GOG_ACCOUNT` and `GOG_KEYRING_PASSWORD` set in `~/.zshrc.local`
- Account: `tim@techeurope.io`

**Google Shared Drive:**
- **Drive name:** Applied AI Conf
- **Drive ID:** `0AAEkbn859sHwUk9PVA`
- **List contents:** `gog drive ls --parent 0AAEkbn859sHwUk9PVA`

**Key Documents:**

| Document | ID | Description |
|---|---|---|
| Speaker List | `1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E` | Speakers (sheet 1) + Agenda (sheet 2) |
| Speaker Submissions 2026 | `171VAgIJKTEPj8jPQuX_nXiQXMjbvL6FGiacov4PX9KY` | Speaker submission list |
| Partner Companies | `1iEFn8ArYGWXMAQrPJT0adEg9xBkOTY1uNBf3NSLODLg` | Partner/sponsor tracking |

**Common commands:**

```bash
# Sheets
gog sheets get <spreadsheet-id>

# Search emails
gog gmail search 'newer_than:7d' --json
gog gmail search 'from:speaker@company.com'

# Send email (always draft and review first!)
gog gmail send --to speaker@company.com --subject "Subject" --body "Body"

# Calendar
gog calendar events --today
```

**Spreadsheet rules:**
- **Never overwrite spreadsheet data.** The spreadsheet is the source of truth.
- When syncing data: always read the sheet first, diff against new data, only add/update rows. Never delete or replace existing rows.
- Before any bulk write operation, export current sheet contents and verify no data will be lost.

**Email rules:**
- **Never send emails automatically.** Always draft and review before sending.
- Speaker communications are relationship-based.

### Email Style (Tim's voice)

- **Never use em dashes.** Use commas, periods, or restructure instead.
- **Sound human, not AI.** No corporate speak, no flattery, no "resonates with our audience" type bullshit. Write like a real person texting a colleague. If it sounds like ChatGPT wrote it, rewrite it.
- **Never explain why we picked something.** Just pick it. No justifications like "with your background in X" or "this fits well because Y". Be direct, state the decision, move on.
- **Concise and on point.** No filler, no over-explaining. Short paragraphs, direct language. Get to the point fast.
- **Show genuine excitement when appropriate.** "Super excited to have you on board!" is human. "We're thrilled about the synergies" is not.
- **Match the language of the thread.** German thread = German reply. English = English.
- **Friendly but not overly formal.** Use "du" in German, first names, casual greetings (Hi/Hey).
- **German-specific:** Don't say "telefonieren", prefer "kurz austauschen". Use "Profilfoto" not "Headshot". Avoid unnatural anglicisms.
- **Always include the Cal.com link** when scheduling: https://cal.com/tim-pietrusky/15min
- **Structure:** Greeting, context (1 sentence), ask/action, sign-off. Max 3-4 short paragraphs.

### Agenda Script (`scripts/build_agenda.py`)

Generates the **Agenda** sheet in the Speaker List spreadsheet. Edit the event definitions in the script, then run:

```bash
# 1. Generate JSON
python3 scripts/build_agenda.py

# 2. Clear + write data
source ~/.zshrc.local
gog sheets clear 1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E "Agenda!A1:Z100" --account tim@techeurope.io

# 3. Unmerge old cells
ACCESS_TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$(python3 -c "import json; print(json.load(open('$HOME/.config/gogcli/credentials.json'))['client_id'])")" \
  -d "client_secret=$(python3 -c "import json; print(json.load(open('$HOME/.config/gogcli/credentials.json'))['client_secret'])")" \
  -d "refresh_token=$(python3 -c "import json; print(json.load(open('$HOME/.config/gogcli/credentials.json'))['refresh_token'])")" \
  -d "grant_type=refresh_token" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
curl -s -X POST "https://sheets.googleapis.com/v4/spreadsheets/1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E:batchUpdate" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"requests":[{"unmergeCells":{"range":{"sheetId":712657363,"startRowIndex":0,"endRowIndex":100,"startColumnIndex":0,"endColumnIndex":10}}}]}'

# 4. Write data
gog sheets update 1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E "Agenda!A1:H$(python3 -c "import json;print(len(json.load(open('/tmp/agenda_data.json'))))")" \
  --values-json "$(cat /tmp/agenda_data.json)" --account tim@techeurope.io

# 5. Apply formatting
curl -s -X POST "https://sheets.googleapis.com/v4/spreadsheets/1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E:batchUpdate" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d "{\"requests\": $(cat /tmp/agenda_requests.json)}"
```

### Marketing Tools (`/marketing/*`)

Speaker card generator, twitter banner generator, logo exporter, and favicon generator. The twitter banner uses a Zustand store with undo/redo history.

## Styling Conventions

- **Dark theme:** Background `#05070f`, foreground `#f5f7ff`. All design is dark-mode only.
- **Fonts:** Kode Mono (headings/mono elements), Inter (body/UI text).
- **Typography fix:** `applyKerning()` in `app/lib/utils.tsx` fixes 'j' character spacing in Kode Mono by wrapping characters with adjusted margins.
- **Utility:** `cn()` in `app/lib/utils.tsx` combines `clsx` + `tailwind-merge`.
- **Global classes:** `.glass` (frosted backdrop), `.glass-card` (hover card effect), `.text-glow` (gradient text white to gray-500).
- **Borders:** Subtle white borders at 5-30% opacity (`border-white/10`).

### Task Management (Beads)

This project uses [Beads](https://github.com/steveyegge/beads) for distributed, Git-backed task tracking. The `bd` CLI manages tasks that sync across agents via Git.

**Common commands:**

```bash
bd ready              # Show your claimed tasks and what's available
bd list               # List all open tasks
bd create "title" -t task -p 1 --description "Details"  # Create a task
bd update <id> --claim   # Claim a task before working on it
bd close <id> --reason "Done: summary"  # Close a completed task
bd sync               # Sync task database with Git
```

**Task types:** `task` (general work), `bug` (defects), `feature` (new functionality)

**Commit convention:** Include Beads ID in commit messages: `feat(speakers): add new speaker (bd-a1b2)`

**Multi-agent rules:**
- Always `bd update <id> --claim` before starting work on a task
- Always `bd sync` at session start and end
- Check `bd ready` to avoid working on already-claimed tasks

**Slack traceability:** When creating tasks from Slack messages, always include the Slack message URL in the task description for traceability. Scan `#conference` for actionable items (speaker requests, website changes, partnership inquiries, bugs).

## Git Conventions

Conventional commits, Angular style, all lowercase: `<type>(<scope>): <subject>`

Types: `fix`, `feat`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`. Present tense, under 72 characters. Always review all changes with `git status` and `git diff` before committing.

## Programme & Topic Clusters

The conference programme is organized around **6 topic clusters** for engineers shipping AI to production. These clusters cut across speaker verticals (legal, procurement, food, education, video, customer service, enterprise agents, workflow automation) and focus on shared production patterns.

### Topic Clusters

1. **Production Case Studies** — True implementation narratives: what shipped, what broke, what changed. Architecture decisions, rollout plans, incident postmortems, engineering/product trade-offs.
2. **LLM Application Architecture** — RAG vs fine-tuning vs hybrid, multi-model routing, tool calling, agent orchestration, context engineering. Patterns that survive contact with production.
3. **Evaluation, Observability & Quality** — Measurement-first approaches: offline eval, online A/B, regression suites, guardrails, golden datasets, eval harnesses, LLM-as-judge, tracing, user feedback loops.
4. **LLMOps & AI Infrastructure** — Cost control, latency, deployment, reliability. Serving patterns, batching/caching, streaming, fallback systems, model upgrades, cost-per-task design.
5. **Enterprise Readiness** — Security, privacy, governance, compliance. Prompt injection, data leakage, permissions, SOC2/GDPR readiness, policy-as-code.
6. **AI-Native Workflows** — From UI to workflow; copilots vs agents; human-in-the-loop design; reliability contracts; adoption patterns.

### Two-Stage Format

- **Main Stage**: Keynotes (30 min), talks (20 min), panels (45 min). For CTOs, founders, engineering leaders, senior engineers. Rule: no product pitches — tooling discussed only in context of production deployment stories. No parallel session on Side Stage during keynote.
- **Side Stage** (second stage): All slots 30 min. Deeper-dive sessions, workshops, teardowns, and partner demos.

### Panels (2 total)

1. **"What Broke in Production and What We Changed"** — War stories from across themes. Speakers share real failures, debugging journeys, and the changes they made.
2. **"The 2026 Production Stack"** — Eval + infra + architecture + constraints. What the production-grade AI stack actually looks like today.

### Anti-Repetition System

Every session gets two tags:
- **Primary area** (one of the 6 topic clusters above)
- **Engineering lens** (one of 6):
  1. Decision framework (why we chose X over Y)
  2. Failure postmortem (what broke + fix)
  3. Metrics-driven (what we measured + what moved)
  4. Reference architecture (pattern you can copy)
  5. Hard constraints (latency/cost/privacy/scale)
  6. Tooling workflow (pipeline end-to-end)

**Rule:** Within the same primary area, do not repeat the same lens on the same stage.

### Content Plan

The full content plan with agenda structure, speaker topic suggestions, format assignments, panel plans, and slot calculations lives in the **"Content Plan" tab** of the Speaker List spreadsheet (`1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E`). This is the single source of truth for programme planning. Main stage has 1 keynote (30 min), 9 talks (20 min), 2 panels (45 min). Side stage has 7 sessions (30 min). **Never commit content plan data to the repo** — the repo is public.

### Speaker-Topic Mapping

Each speaker maps to a primary cluster, engineering lens, and stage assignment:

| Speaker | Company | Primary Cluster | Lens | Stage | Suggested Talk Angles |
|---|---|---|---|---|---|
| Des Traynor | Intercom | Production case studies | Failure postmortem | Main (keynote) | "AI-first customer service at 159K companies: what works, what fails, and how we measure" |
| Stanislas Polu | Dust | LLM architecture | Reference architecture | Main (talk) | "The OS for AI agents: orchestrating, governing, and debugging agent fleets" |
| Sabba Keynejad | VEED.IO | LLM architecture | Hard constraints | Main (talk) | "AI-powered video at 4M+ users: multi-model orchestration and inference cost reality" |
| Lucas Hild | Knowunity | Production case studies | Metrics-driven | Main (talk) | "Serving AI to 23M students: latency, cost, and quality at scale" |
| Daniel Khachab | Choco | Production case studies | Decision framework | Main (talk) | "AI in supply chains: architecture decisions when your users aren't developers" |
| Lennard Schmidt | Langdock | Enterprise readiness | Tooling workflow | Main (talk) | "Rolling out AI to 4000+ businesses: permissions, governance, and adoption patterns" |
| Aymeric Zhuo | Codewords | AI-native workflows | Reference architecture | Main (talk) | "From chat to automation: building AI-native workflows that replace UIs" |
| Nico Bentenrieder | Tacto | Evaluation & observability | Failure postmortem | Main (talk) | "Building procurement intelligence: what broke when we moved from prototype to production" |
| Jacob Lauritzen | Legora | Enterprise readiness | Hard constraints | Main (talk) | "AI for lawyers: evaluation, compliance, and the trust bar that can't slip" |

### Speaker Outreach Process

When reaching out to a speaker about their talk topic, follow this process:

1. **Check beads** — Look for an existing outreach ticket (`bd list`). Each speaker has a ticket like "outreach: [speaker name] — discuss talk topic".
2. **Send personalized message** — Use the speaker-topic mapping above. Include:
   - Their primary area and suggested engineering lens from the table
   - Stage suggestion: Main Stage (20 min talk) or Side Stage (30 min deeper dive)
   - Ask for a 5-bullet outline (see talk brief framework below)
   - Freedom to propose their own angle
3. **Update the beads ticket** — Add notes on what was discussed, what direction they chose.
4. **Close the ticket** — Once a talk title and direction are confirmed.

**Talk brief framework** (send to speakers as guidance):

> Please send us a 5-bullet outline:
> 1. **System overview:** What it does, who uses it, one success metric.
> 2. **Constraints:** Latency budget, cost budget, privacy/compliance constraints.
> 3. **Evaluation:** How you measured quality (offline + online) and what surprised you.
> 4. **Failure mode:** What broke in production and how you fixed it.
> 5. **3 takeaways** people can reuse next week.

**Workshop brief framework:**

> - A concrete output (template, checklist, evaluation harness, reference architecture).
> - Prerequisites (assume competent engineers; avoid niche tooling lock-in).
> - Flow: explain → do → review → ship-home artefact.

**Outreach tone:** *"Here are some directions we think would resonate with our audience of engineers shipping AI. Pick one that excites you, or pitch your own — we just want it to be concrete and production-real."*

## Content Guidelines

- Avoid specific attendee count claims until confirmed. Use qualitative wording ("curated in-person audience", "builders, founders, CTOs, and engineers").
- Speaker data has two image fields: `image` (original headshot) and `imageTransparent` (square transparent PNG). Components prefer `imageTransparent` when available.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
