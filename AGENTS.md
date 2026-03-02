# CLAUDE.md

Non-obvious conventions, gotchas, and workflows that can't be inferred from reading the code.

## Gotchas

- **Never run `pnpm dev`** — the user always has the dev server running already.
- **Avoid specific attendee count claims** until confirmed. Use qualitative wording ("curated in-person audience", "builders, founders, CTOs, and engineers").
- **Never commit content plan data to the repo** — the repo is public. Content plan lives in the "Content Plan" tab of the Speaker List spreadsheet.

## Speaker Image Pipeline

Uses `agent-media` CLI (install globally: `npm i -g agent-media`). Requires `FAL_API_KEY` in environment (source `~/.zshrc`).

**Minimum source resolution:** 1280x1280 pixels. Always request at least this size from speakers. Smaller images must be upscaled before processing.

**File naming:** `name.jpg` -> `name_fullbody_square.png` -> `name_fullbody_transparent_square.png`

**Step 1: Extend headshot to full body (1:1 square)**

Uses the reference template as a direct input so the model matches the exact framing. Generate 3 variants and let the user pick the best one.

```bash
source ~/.zshrc && for v in v1 v2 v3; do agent-media image edit \
  --in public/speakers/_reference_template.png public/speakers/name.jpg \
  --prompt "Take the person from image two and place them into the same head-and-shoulders framing as the silhouette in image one. The person must face directly forward, looking straight at the camera, with both shoulders square and symmetrical, exactly like the silhouette. Make the person slightly smaller in the frame with more headroom above, matching the exact proportions of the silhouette template. Keep their exact facial expression from the original photo - their smile, eyes, and mood must stay exactly the same. Keep their original clothing, hair, and appearance exactly as they are. Output on a clean white background with no silhouette visible." \
  --aspect-ratio "1:1" \
  --resolution "2K" \
  --model fal-ai/nano-banana-2/edit \
  --provider fal \
  --out public/speakers/name_fullbody_square_${v}.png; done
```

After the user picks the best variant, rename it to `name_fullbody_square.png` for the next steps.

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

**Reference template:** `public/speakers/_reference_template.png` — abstract silhouette used as direct input to Step 1. The model matches this framing automatically. Key proportions to verify:
- Head starts ~8% from top edge (clear headroom above)
- Shoulders fill ~85-90% of frame width
- Body extends to bottom edge
- Person centered horizontally

**Quality checks (MANDATORY after every step):**
1. Verify proportions match the reference template
2. Verify dimensions are square (2K from Step 1, 1024x1024 after crop)
3. Verify head is NOT cut off at top
4. Verify both shoulders are fully visible
5. If output is not square: PAD with background color (do NOT center-crop — that cuts heads)

**Troubleshooting:**
- Shoulders cut off -> add "The [left/right] shoulder especially must be completely visible"
- No headroom -> add "Make the person smaller in the frame"
- Color looks washed out/pale -> run the color correction step (step 2)
- NEVER use AI edit for color correction — it regenerates the image and degrades quality
- Output not square -> pad to square, NEVER center-crop (cuts off heads)

## Slack

Use the `agent-slack` skill to read/search/reply to Slack messages in the **{Tech: Europe}** workspace (`techeurope-slack.slack.com`). Credentials are stored at `~/.agent-slack/credentials.json` (user-level, no project config needed).

**Team members:**

| Name | Slack ID | Role |
|------|----------|------|
| Tim Pietrusky | `U0A4333565N` | Tech lead, website, speaker programme |
| Nima Sadeghifard | `U0A023Z91NK` | Business, partnerships, sponsorship |
| Bela | `U09T15BEEUC` | Strategy, speaker acquisition, sales |

**Primary channel:** `#conference` (`C0A0HVBC2V8`) — all conference-related coordination.

If you get `invalid_auth`, the browser token has expired. Ask the user to grab a fresh cURL from Chrome DevTools (Network tab -> any `api.slack.com` request -> Copy as cURL) and re-run `agent-slack auth parse-curl` or manually add with `agent-slack auth add`.

## Google Workspace (gog CLI)

Uses [gog](https://gogcli.sh/) to interact with Gmail, Calendar, Drive, and Sheets from the terminal.

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
| Newsletter Subscriber Tracking | `1bAQWcAjAdR142m0SnYwTsVlFIji3BEIHoGrOa-MFQbg` | Luma ticket vs Beehiiv subscriber sync (auto-updated every 6h) |

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

## Email Style (Tim's voice)

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
- **First-time speaker intro:** When emailing a speaker for the first time, always open with: "Nice to meet you! I'm Tim, responsible for coordinating with all speakers for Applied AI Conf." Then follow with excitement about having them on stage before getting to the ask.

## Agenda Script (`scripts/build_agenda.py`)

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

## Task Management (Beads)

Include Beads ID in commit messages: `feat(speakers): add new speaker (bd-a1b2)`

When creating tasks from Slack messages, always include the Slack message URL in the task description for traceability.

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

The full content plan with agenda structure, speaker topic suggestions, format assignments, panel plans, and slot calculations lives in the **"Content Plan" tab** of the Speaker List spreadsheet (`1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E`). This is the single source of truth for programme planning. Main stage has 1 keynote (30 min), 9 talks (20 min), 2 panels (45 min). Side stage has 7 sessions (30 min).

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
> - Flow: explain -> do -> review -> ship-home artefact.

**Outreach tone:** *"Here are some directions we think would resonate with our audience of engineers shipping AI. Pick one that excites you, or pitch your own — we just want it to be concrete and production-real."*

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
