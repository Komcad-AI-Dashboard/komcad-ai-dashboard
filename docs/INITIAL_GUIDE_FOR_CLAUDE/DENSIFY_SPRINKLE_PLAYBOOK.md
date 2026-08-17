# Densify + Sprinkle — a web-app improvement playbook

A reusable working mode for iteratively improving a web app one page at a time:
add depth and information density where it earns its place, fix bugs, kill visual
inconsistencies, and add small high-signal flourishes ("sprinkles"). Project-
agnostic — pair it with the target repo's own stack/design guides.

## What the mode is

Pick a page. Make it materially better in one focused pass, then prove it works,
then commit. "Densify" = more real, decision-relevant information per screen
(not more chrome). "Sprinkle" = small touches that add signal or polish (a
status flag, a delta, a reference line, a sensible empty state). Always paired
with bug-fixing and visual consistency — a denser page that's broken or noisy is
worse, not better.

## The loop (repeat per page)

1. **Pick a target** — one page/feature. State the goal in a sentence.
2. **Study what exists** — read the page + its data sources/endpoints before
   touching anything. Know what data is actually available; don't invent fields.
3. **Improve** — density/depth, then bugs, then visual consistency, then
   sprinkles. Reuse existing components/tokens; match surrounding code's idiom.
4. **Verify for real** (see Verification) — lint, build, and look at it with real
   data. No "done" without observing it.
5. **Commit** — one focused commit, clear message (what + why). Push when asked.
6. **Report honestly** — what changed, what you verified, what's still open.

## Quality bars

**Information design**
- Every number earns its space: pair it with an anchor (delta, %, peer, rank,
  threshold) and, where relevant, a unit/date/source. A bare figure is failing.
- Subtext answers "so what?", not "what is this?".
- Density ≠ clutter. Tight rows, multi-panel, aligned columns — but each element
  must carry decision-relevant signal. Cut anything that doesn't.
- Cap option lists (~5–9). If longer, you're pushing prioritization onto the user.

**Copy (kill the AI tells)**
- Claims, not categories. Specifics, not definitions.
- No em-dash parenthetical asides as a texture; prefer short sentences or a
  mid-dot separator. (A literal `—` as a no-data placeholder in a table is fine.)
- No hedging pile-ups ("may/could/potentially"), no marketing filler
  ("seamless/robust/leverage/unlock"), no Wikipedia-tier sentences.
- 30-second smell test: would a domain expert write this, or a chatbot?

**Visual**
- Color encodes meaning (e.g. up/down, sentiment), not decoration.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`) so columns
  don't jitter — a top AI-default tell in data UI.
- Spacing snaps to the grid (e.g. 4px multiples). Use spacing before borders;
  add a box only when spacing can't carry the grouping.
- Use the design system's tokens/utilities; stop hardcoding hex once tokens exist.

**Every state ships** — loading, empty, error, and the "data is null/partial"
case. A page that only looks right with perfect data isn't finished. Coerce
nullable API payloads (`Array.isArray(x) ? x : []`), and give empty states a
real message + next action.

## Verification (non-negotiable before "done")

- Run the formatter/linter and the type-check/build. Zero errors.
- Exercise it with **real data**, not assumptions — hit the endpoint, check the
  shape, confirm counts/coords/units are what you think.
- **See it.** Screenshot the page (headless browser is fine) and actually look:
  layout, alignment, the change rendering, the states. Localhost screenshots can
  miss remote-origin issues — be aware of what the screenshot does/doesn't prove.
- Don't conclude "no data" from a small recent sample of a large dataset —
  aggregate/query the source before claiming absence.
- Report failures with the actual output. If a step was skipped, say so.

### Seeing it — Playwright (this repo)

Playwright (1.60, chromium cached) is the visual-confirm tool here. Runner:
`app/scripts/shoot.mjs` — headless chromium against the live server on `:4180`,
captures full-page screenshots at desktop-light / desktop-dark / mobile (390px)
to `/tmp/<slug>-*.png`, then Read the PNGs and actually look.

```
cd app && node scripts/shoot.mjs "/bidder/PT.PARINDO%20RAYA%20ENGINEERING" parindo
```

- Run from `app/` so ESM resolves `playwright` from `app/node_modules` (it is a
  devDep). Deep routes load directly — the static server does SPA fallback.
- Theme is set via `localStorage` (`tw-theme`) in an init script before load;
  locale defaults to `id`. `deviceScaleFactor: 2` for crisp close-ups.
- For element close-ups, screenshot with a `clip` box or a locator — verify the
  actual densified content (anchors, signal text, headers), not just layout.
- Localhost screenshots prove render/layout, not remote-origin behavior.

## Guardrails

- Read a file before editing it; match its conventions.
- Don't fabricate data fields or API behavior — verify against the backend.
- Secrets stay in gitignored env; never commit tokens/keys. Confirm `.gitignore`
  covers them.
- Branch + commit only what you changed; push only when asked. Keep commits
  scoped and messages truthful.
- Hard-to-reverse or outward-facing actions: confirm first.

## A good "sprinkle" looks like

A yield-curve inversion flag, an average-cost reference line on a position chart,
a 52-week range bar, a sentiment legend, a live status dot, a count badge on a
clustered marker, a recession banner, "X of Y geolocated" context. Small, real,
decision-relevant. Not animations for their own sake.

---
*Pair this with: the target repo's stack/run docs, its design-system tokens, and
any project-specific anti-AI/content guide.*
