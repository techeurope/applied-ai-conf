#!/usr/bin/env python3
"""
Build and format the Agenda sheet using a 5-minute grid.
Each row = 5 minutes. Events span multiple rows via merged cells.
Each stage has independent changeover timing.
Block headers are inserted as extra rows between content blocks.

Schedule structure:
  Block 1 + 2 (morning): Keynote + talks only, no panels
  Block 3 (after lunch): Panel first, then talks
  Block 4 (after coffee): Panel first, then talks
"""
import json

# -- Config -------------------------------------------------------------------
SPREADSHEET_ID = "1J3_lk00LJAER3LRDfQZi2iMamhmCNJ-QmO9e6YqGe1E"
AGENDA_SHEET_ID = 712657363
WIDE_COLS = 8
ROW_HEIGHT = 22  # px per 5-min row

# -- Colors -------------------------------------------------------------------
def rgb(r, g, b):
    return {"red": round(r, 3), "green": round(g, 3), "blue": round(b, 3)}

KEYNOTE_BG = rgb(0.102, 0.451, 0.910)   # Deep blue
TALK_BG    = rgb(0.404, 0.624, 0.957)   # Light blue
PANEL_BG   = rgb(0.557, 0.141, 0.667)   # Purple
SIDE_BG    = rgb(0.133, 0.588, 0.353)   # Green
BREAK_BG   = rgb(0.976, 0.859, 0.549)   # Amber
OPENING_BG = rgb(0.302, 0.302, 0.349)   # Dark gray
EMPTY_BG   = rgb(0.949, 0.949, 0.949)   # Very light gray
REG_BG     = rgb(0.910, 0.918, 0.929)   # Soft gray
HEADER_BG  = rgb(0.200, 0.200, 0.251)   # Near-black
NETWORK_BG = rgb(0.953, 0.761, 0.200)   # Gold
TURN_BG    = rgb(0.918, 0.918, 0.918)   # Light gray
TURN_FG    = rgb(0.5, 0.5, 0.5)         # Medium gray text
BLOCK_BG   = rgb(0.145, 0.220, 0.282)   # Dark teal/navy
BLOCK_FG   = rgb(0.749, 0.851, 0.925)   # Light blue-gray text
WHITE      = rgb(1, 1, 1)
DARK       = rgb(0.2, 0.2, 0.2)

# -- Helpers ------------------------------------------------------------------
def T(h, m=0): return h * 60 + m
def tstr(mins): return f"{mins // 60:02d}:{mins % 60:02d}"
def pad(row): return row + [""] * (WIDE_COLS - len(row))

# Event: (start, end, label, bg, fg, bold)
def E(s, e, label, bg, fg=WHITE, bold=True): return (s, e, label, bg, fg, bold)
def CH(s): return (s, s + 5, "Changeover", TURN_BG, TURN_FG, False)

# -- Schedule -----------------------------------------------------------------
#
# Main Stage: 1 keynote (30m) + 10 talks (20m) + 2 panels (30m) = 13 events
# Side Stage: 8 sessions (1×45m + 7×30m)
# Panels are 30 min. No panels before lunch. No side stage during keynote.
#
# Block 1 (09:10–10:30, 80 min): Keynote + 2 talks
# Block 2 (10:50–12:30, 100 min): 4 talks + changeover at end
# Block 3 (13:30–14:50, 80 min): Panel + 2 talks
# Block 4 (15:15–16:35, 80 min): Panel + 2 talks

# "both" events span both stage columns
BOTH = [
    E(T(8,0),  T(9,0),  "DOORS OPEN / REGISTRATION", REG_BG, DARK),
    E(T(9,0),  T(9,10), "Opening Remarks", OPENING_BG),
    E(T(10,30),T(10,50),"COFFEE BREAK", BREAK_BG, DARK),
    E(T(12,30),T(13,30),"LUNCH BREAK", BREAK_BG, DARK),
    E(T(14,50),T(15,15),"COFFEE BREAK", BREAK_BG, DARK),
    E(T(16,35),T(16,45),"Closing Remarks", OPENING_BG),
    E(T(16,45),T(16,50),"NETWORKING / DRINKS", NETWORK_BG, DARK),
]

# Main stage
MAIN = [
    # Block 1 — MORNING (09:10–10:30, 80 min): Keynote + 2 talks
    E(T(9,10), T(9,40), "OPENING KEYNOTE [30 min]", KEYNOTE_BG),
    CH(T(9,40)),
    E(T(9,45), T(10,5), "Talk 1 [20 min]", TALK_BG),
    CH(T(10,5)),
    E(T(10,10),T(10,30),"Talk 2 [20 min]", TALK_BG),

    # Block 2 — LATE MORNING (10:50–12:30, 100 min): 4 talks, no panels
    E(T(10,50),T(11,10),"Talk 3 [20 min]", TALK_BG),
    CH(T(11,10)),
    E(T(11,15),T(11,35),"Talk 4 [20 min]", TALK_BG),
    CH(T(11,35)),
    E(T(11,40),T(12,0), "Talk 5 [20 min]", TALK_BG),
    CH(T(12,0)),
    E(T(12,5), T(12,25),"Talk 6 [20 min]", TALK_BG),
    CH(T(12,25)),  # changeover at end → gives side stage room for 3rd session

    # Block 3 — EARLY AFTERNOON (13:30–14:50, 80 min): Panel + 2 talks
    E(T(13,30),T(14,0), "PANEL: What Broke in Prod [30 min]", PANEL_BG),
    CH(T(14,0)),
    E(T(14,5), T(14,25),"Talk 7 [20 min]", TALK_BG),
    CH(T(14,25)),
    E(T(14,30),T(14,50),"Talk 8 [20 min]", TALK_BG),

    # Block 4 — LATE AFTERNOON (15:15–16:35, 80 min): Panel + 2 talks
    E(T(15,15),T(15,45),"PANEL: The 2026 Prod Stack [30 min]", PANEL_BG),
    CH(T(15,45)),
    E(T(15,50),T(16,10),"Talk 9 [20 min]", TALK_BG),
    CH(T(16,10)),
    E(T(16,15),T(16,35),"Talk 10 [20 min]", TALK_BG),
]

# Side stage (independent changeovers, all sessions 30 min)
# No side stage during keynote
SIDE = [
    # Block 1 — 1 session (starts after keynote, fills to coffee break)
    E(T(9,45), T(10,30),"Side Stage 1 [45 min]", SIDE_BG),

    # Block 2 — 3 sessions
    E(T(10,50),T(11,20),"Side Stage 2 [30 min]", SIDE_BG),
    CH(T(11,20)),
    E(T(11,25),T(11,55),"Side Stage 3 [30 min]", SIDE_BG),
    CH(T(11,55)),
    E(T(12,0), T(12,30),"Side Stage 4 [30 min]", SIDE_BG),

    # Block 3 — 2 sessions (side stage runs during panel)
    E(T(13,30),T(14,0), "Side Stage 5 [30 min]", SIDE_BG),
    CH(T(14,0)),
    E(T(14,5), T(14,35),"Side Stage 6 [30 min]", SIDE_BG),

    # Block 4 — 2 sessions (side stage runs during panel)
    E(T(15,15),T(15,45),"Side Stage 7 [30 min]", SIDE_BG),
    CH(T(15,45)),
    E(T(15,50),T(16,20),"Side Stage 8 [30 min]", SIDE_BG),
]

# Block headers
BLOCKS = [
    (T(9,10),  "BLOCK 1 — MORNING  (09:10 – 10:30)"),
    (T(10,50), "BLOCK 2 — LATE MORNING  (10:50 – 12:30)"),
    (T(13,30), "BLOCK 3 — EARLY AFTERNOON  (13:30 – 14:50)"),
    (T(15,15), "BLOCK 4 — LATE AFTERNOON  (15:15 – 16:35)"),
    (T(16,35), "CLOSING"),
]

# -- Lookups ------------------------------------------------------------------
def build_lk(events):
    lk = {}
    for ev in events:
        for m in range(ev[0], ev[1], 5):
            lk[m] = ev
    return lk

both_lk = build_lk(BOTH)
main_lk = build_lk(MAIN)
side_lk = build_lk(SIDE)
block_at = {b[0]: b[1] for b in BLOCKS}

# -- Build sheet data ---------------------------------------------------------
data = [pad(["Time", "Main Stage", "Side Stage"])]
setup_reqs = []
base_reqs = []
merge_reqs = []
block_reqs = []
event_reqs = []

def add_fmt(target, r1, r2, c1, c2, bg, fg=None, bold=False):
    cf = {"backgroundColor": bg, "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP"}
    tf = {}
    if fg: tf["foregroundColor"] = fg
    if bold: tf["bold"] = True
    if tf: cf["textFormat"] = tf
    target.append({"repeatCell": {"range": {
        "sheetId": AGENDA_SHEET_ID, "startRowIndex": r1, "endRowIndex": r2,
        "startColumnIndex": c1, "endColumnIndex": c2,
    }, "cell": {"userEnteredFormat": cf},
    "fields": "userEnteredFormat(backgroundColor,verticalAlignment,wrapStrategy,textFormat)"}})

def add_merge(r1, r2, c1, c2):
    if r2 - r1 > 1 or c2 - c1 > 1:
        merge_reqs.append({"mergeCells": {"range": {
            "sheetId": AGENDA_SHEET_ID, "startRowIndex": r1, "endRowIndex": r2,
            "startColumnIndex": c1, "endColumnIndex": c2,
        }, "mergeType": "MERGE_ALL"}})

# Header
add_fmt(setup_reqs, 0, 1, 0, WIDE_COLS, HEADER_BG, WHITE, True)

# Track events
event_info = {}
block_header_rows = []
r = 1

# Grid: 08:00 to 16:50 (end of networking row)
for minute in range(T(8, 0), T(16, 50), 5):
    # Block header?
    if minute in block_at:
        data.append(pad(["", block_at[minute], ""]))
        add_merge(r, r + 1, 0, WIDE_COLS)
        add_fmt(block_reqs, r, r + 1, 0, WIDE_COLS, BLOCK_BG, BLOCK_FG, True)
        block_header_rows.append(r)
        r += 1

    # What's on each stage?
    both_ev = both_lk.get(minute)
    main_ev = main_lk.get(minute) if not both_ev else None
    side_ev = side_lk.get(minute) if not both_ev else None

    main_text = ""
    side_text = ""

    for ev, etype in [(both_ev, "both"), (main_ev, "main"), (side_ev, "side")]:
        if ev is None:
            continue
        eid = id(ev)
        if eid not in event_info:
            event_info[eid] = {"ev": ev, "start": r, "type": etype}
            if etype in ("both", "main"):
                main_text = ev[2]
            if etype == "side":
                side_text = ev[2]
        event_info[eid]["end"] = r + 1

    data.append(pad([tstr(minute), main_text, side_text]))
    r += 1

# -- Formatting (layered: base → merges → blocks → events) -------------------

# Base layers
add_fmt(base_reqs, 1, r, 0, 1, WHITE, DARK, False)
add_fmt(base_reqs, 1, r, 1, 3, EMPTY_BG, DARK, False)

# Default row height
setup_reqs.append({"updateDimensionProperties": {
    "range": {"sheetId": AGENDA_SHEET_ID, "dimension": "ROWS",
              "startIndex": 1, "endIndex": r},
    "properties": {"pixelSize": ROW_HEIGHT}, "fields": "pixelSize"}})

# Block header heights
for bh_r in block_header_rows:
    setup_reqs.append({"updateDimensionProperties": {
        "range": {"sheetId": AGENDA_SHEET_ID, "dimension": "ROWS",
                  "startIndex": bh_r, "endIndex": bh_r + 1},
        "properties": {"pixelSize": 28}, "fields": "pixelSize"}})

# Event merges + formatting
for eid, info in event_info.items():
    ev = info["ev"]
    sr, er = info["start"], info["end"]
    _, _, _, bg, fg, bold = ev

    if info["type"] == "both":
        add_merge(sr, er, 1, 3)
        add_fmt(event_reqs, sr, er, 1, 3, bg, fg, bold)
    elif info["type"] == "main":
        add_merge(sr, er, 1, 2)
        add_fmt(event_reqs, sr, er, 1, 2, bg, fg, bold)
    elif info["type"] == "side":
        add_merge(sr, er, 2, 3)
        add_fmt(event_reqs, sr, er, 2, 3, bg, fg, bold)

# Summary
data.append(pad(["", "", ""]))
data.append(pad(["", "MAIN STAGE: 1 keynote (30m) + 10 talks (20m) + 2 panels (30m) = 13 events", ""]))
data.append(pad(["", "SIDE STAGE: 8 sessions (1×45m + 7×30m)", ""]))
data.append(pad(["", "TOTAL: 21 content slots", ""]))

# Column widths
for ci, w in [(0, 60), (1, 350), (2, 300)]:
    setup_reqs.append({"updateDimensionProperties": {
        "range": {"sheetId": AGENDA_SHEET_ID, "dimension": "COLUMNS",
                  "startIndex": ci, "endIndex": ci + 1},
        "properties": {"pixelSize": w}, "fields": "pixelSize"}})

# Freeze header
setup_reqs.append({"updateSheetProperties": {
    "properties": {"sheetId": AGENDA_SHEET_ID, "gridProperties": {"frozenRowCount": 1}},
    "fields": "gridProperties.frozenRowCount"}})

# Combine: setup → base → merges → blocks → events
reqs = setup_reqs + base_reqs + merge_reqs + block_reqs + event_reqs

# -- Output -------------------------------------------------------------------
with open("/tmp/agenda_data.json", "w") as f:
    json.dump(data, f)
with open("/tmp/agenda_requests.json", "w") as f:
    json.dump(reqs, f)

n = len(data)
end_col = chr(ord('A') + WIDE_COLS - 1)
print(f"Data: {n} rows | Requests: {len(reqs)}")
print(f"Range: Agenda!A1:{end_col}{n}")
print()
print("Block 1 (09:10-10:30): Keynote + 2 talks")
print("Block 2 (10:50-12:30): 4 talks")
print("Block 3 (13:30-14:50): Panel + 2 talks")
print("Block 4 (15:15-16:35): Panel + 2 talks")
print()
print("MAIN STAGE: 1 keynote (30m) + 10 talks (20m) + 2 panels (30m)")
print("SIDE STAGE: 8 sessions (1×45m + 7×30m)")
print("TOTAL: 21 content slots")
