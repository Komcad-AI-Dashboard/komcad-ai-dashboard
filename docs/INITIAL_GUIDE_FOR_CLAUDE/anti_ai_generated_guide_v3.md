## Anti-AI-Generated Principles

Every contributor (human or AI) must internalize these. The goal is a site that reads like a domain-expert policy analyst built it — not a chatbot.

Twenty principles, grouped into five buckets: **Copy** (how sentences sound), **Information design** (how data earns its space), **Visual** (color and chrome), **Foundations** (typography, grid, interaction physics), **Hygiene** (don't repeat yourself).

---

### Copy

#### 1. Kill filler

Delete any sentence that could appear on a generic Wikipedia article about Indonesia. Common offenders:

- "Indonesia is the world's fourth most populous country"
- "The Indonesian economy faces both challenges and opportunities"
- "This section provides an overview of..."
- "It is important to note that..."
- Any sentence starting with "In order to..."

If a sentence orients the reader without telling them something they couldn't have guessed, it's filler.

#### 2. Short, punchy copy

Written like an Economist briefing or a BCG slide. Each sentence carries weight. If you can cut a word without losing meaning, cut it. One strong sentence beats three hedged ones.

**Wrong:** "Indonesia has a large informal economy that presents significant challenges for policymakers seeking to implement broad-based fiscal policy instruments."

**Right:** "59% of workers are informal. They're harder to automate — but also invisible to tax policy and pension systems."

#### 3. Calibrate uncertainty; don't sprinkle it

AI defaults to hedging ("may," "could," "potentially," "various factors"). Real analysts are either confident or specifically uncertain — never both, never neither.

**Wrong:** "Automation may potentially impact various sectors of the Indonesian labor market."

**Right (confident):** "Automation hits formal wage jobs first. The informal 59% is shielded by accident, not policy."

**Right (specifically uncertain):** "Whether Danantara hits its 8% target is unknowable. At 5%, the math still works; at 3%, it doesn't."

Hedges are a budget, not a default. Two in a paragraph means one is filler.

#### 4. Ban the AI cadence patterns

A blacklist of constructions that read as chatbot even when the content is fine:

- "It's not just X — it's Y" / "More than just X, it's Y"
- "In the realm of..." / "When it comes to..." / "At its core..."
- "It is worth noting that" / "Notably" / "Importantly"
- Triplets where all three items are the same length ("efficient, scalable, and resilient")
- "Furthermore," "Moreover," "Additionally" as paragraph openers
- Closing sentences that zoom out to platitude ("The path forward will require careful coordination among stakeholders.")
- Em-dash parenthetical asides every paragraph

These aren't wrong individually. They're wrong as a texture.

#### 5. Specificity beats abstraction

Name names. Cite provinces, agencies, programs, years — not categories.

**Wrong:** "Several Indonesian provinces face acute fiscal stress."

**Right:** "Papua and NTT spend more on civil-service salaries than on everything else combined."

Every abstract noun ("stakeholders," "key sectors," "various challenges") is a place where a number, name, or example belongs.

---

### Information design

#### 6. Every subtext is a delta — no exceptions on scorecards

**Wrong (AI default):**
```
┌─────────────────────┐
│ GDP                  │
│ Rp 23,821 T         │
│ Total economic output│  ← describes what GDP IS. Useless.
└─────────────────────┘
```

**Right (analyst default):**
```
┌─────────────────────┐
│ GDP                  │
│ Rp 23,821 T         │
│ ▲ 5.1% YoY · rank 16│  ← delta + context = decision-relevant
└─────────────────────┘
```

The subtext answers "so what?" not "what is this?"

#### 7. Numbers always have an anchor

A number alone means nothing. Every stat carries at least one of:

- **YoY change:** `▲ 5.1% vs 2024`
- **Peer comparison:** `lowest in G20`
- **Ratio to something familiar:** `1/22 of US median`
- **Rank:** `rank 116 globally`
- **Threshold:** `below poverty line`

#### 8. Section titles are claims, not categories

| Wrong (category)         | Right (claim)                                       |
|--------------------------|-----------------------------------------------------|
| Income Composition       | 70% of income rides on one bucket                   |
| Fiscal Overview          | Indonesia collects half the tax it needs            |
| Automation Impact        | The jobs that pay wages are the jobs that go first  |
| Existing Programs        | The safety net covers breadth, not depth            |

A claim makes the reader think. A category makes them skim.

#### 9. Sourcing is structural, not decorative

The fastest way to make analyst-grade work look generated is unsourced confidence. Every non-obvious number carries:

- **Source** (BPS, Kemenkeu, World Bank) — inline or on hover
- **Year** — visible, not buried (`Rp 23,821 T (2024)` not `Rp 23,821 T`)
- **Status** — if it's a projection or estimate, that's part of the label

Confidence without sourcing reads as bluffing. Sourcing without confidence reads as a literature review. Pair them.

#### 10. Lede with the counterintuitive finding

Headlines should be the surprise, not the topic. Reorder by what's unexpected.

**Skim-bait:** "Indonesia's tax-to-GDP ratio remains low at 10.2%."

**Sticks:** "Indonesia taxes itself at the rate of a low-income country while spending like a middle-income one. The gap is 4 points of GDP."

If the first sentence of a section doesn't make the reader think *huh, really?* — the section is failing.

---

### Visual

#### 11. Color encodes meaning

- **Green/teal:** positive direction or enabled state
- **Red/rose:** negative direction, risk, or decline
- **Amber/gold:** caution, benchmark, or reference line
- **Gray/slate:** neutral, disabled, or baseline

Never color for decoration. A red bar means something is going the wrong way.

#### 12. No decorative elements

- No stock photos, illustrations, or abstract graphics
- No gradient backgrounds without purpose
- No hero images — the data is the hero
- Icons only where they aid scanning (navigation), not as ornament

#### 13. Chart annotations beat chart legends

Don't make readers map colors to labels mentally. Annotate directly on the chart:

- Label inflection points ("Danantara launched", "baby bonds mature", "wage crossover")
- Call out the gap between two lines with a measurement
- Use the gold dashed reference line pattern from the simulator ("Today: Rp 66 jt")

---

### Foundations

#### 14. Three-font system, deliberately chosen

One face for personality. One for working surfaces. One for numbers. **Never one face for everything; never a system default for any of them.**

- **Display — for personality moments only** (wordmark, hero title, section dividers, pull-quotes): **Fraunces**. Variable serif with optical-size and softness axes — tunes between "Economist editorial" and "designed-not-defaulted" without changing files. Free, self-hostable, contemporary without being trendy-shallow.
- **Workhorse sans — for body, UI, labels, navigation, scorecards:** **Plus Jakarta Sans**. Designed for Jakarta — the right signal for an Indonesia policy site. Free.
- **Mono — for numbers, data tables, code:** **IBM Plex Mono** with `font-variant-numeric: tabular-nums` enabled. Without tabular figures, numbers in a column shift left and right by 1–3 pixels — the loudest AI-default tell in data viz.

**Deviation is allowed but must be argued.** "Switching to GT Sectra for pull-quotes because we want hard-edged credibility instead of Fraunces's warmth" is a valid override. "I felt like using Lunaro" is not. The rule isn't *these specific fonts forever* — it's *no font appears on the site without a reason that names what's gained*.

#### 15. The grid is non-negotiable

All spacing is a multiple of 4. Prefer multiples of 8. No 13px, no 22px, no 35px.

AI generates pixel-eyeballed spacing — gaps that look "about right" but don't snap. Designer work snaps. Once you train your eye, the difference is the first thing you see on any page.

The same rule applies to type scale: pick a ratio (1.25× or 1.333×) and let every size derive from it. Random font sizes are random spacing's cousin.

#### 16. Fitts's Law: primary actions are large and edge-placed

The bigger and closer to a screen edge a target is, the faster the user hits it. Apply ruthlessly:

- Primary CTA per view: large, high-contrast, near an edge
- Secondary actions: smaller, central, lower contrast
- Tertiary (rare, destructive, expert): small, tucked, requires intent

Giving every button the same weight is an AI-default tell. It signals the designer didn't know which action mattered.

#### 17. Cap choices at 5–9 (Miller / Hick)

Any list of options — nav items, filter groups, simulator inputs, dropdown choices — caps at roughly 5–9. Beyond that, the design is asking the user to do the prioritization the analyst should have done.

If the simulator has 14 sliders, three of them move the answer and eleven are noise. Cut to three; expose the rest under "Advanced" only if someone asks.

#### 18. Group by proximity, not by box

Reach for spacing before borders. Related items get close; unrelated items get distance. Only add a box when spacing alone can't carry the grouping — e.g., when items must visually anchor against a busy background.

Boxes-around-everything is one of the loudest chatbot-UI tells. It signals the designer couldn't trust whitespace to do its job.

---

### Hygiene

#### 19. No explaining obvious things

If the label says "GDP," don't add "Gross Domestic Product — the total economic output of a country." The audience is policymakers and informed citizens, not students. If a term needs context, give the context as a comparison — not a definition.

#### 20. No redundant labels

If a card header says "PKH," don't repeat "Program Keluarga Harapan (PKH)" in the body. The full name appears once on the page (tooltip, first mention) — not on every card.

---

## The 30-second smell test

Before shipping a card, page, or section, run these six checks:

1. **Title** — does it make a claim, or just name a topic?
2. **Numbers** — does every figure have an anchor (delta, peer, rank, threshold) and a year + source?
3. **Wikipedia test** — is there a sentence that could appear on Wikipedia's "Indonesia" page? Cut it.
4. **Hedge audit** — more than one "may/could/potentially" per paragraph? Cut to one.
5. **Surprise** — could a reader skim this and learn the unexpected thing? If not, the surprise is buried.
6. **Foundations** — is every spacing value a multiple of 4? Are numbers rendering in tabular figures? Is any text falling back to a system default font?

A guide you read once doesn't shape output. A checklist you run every time does.
