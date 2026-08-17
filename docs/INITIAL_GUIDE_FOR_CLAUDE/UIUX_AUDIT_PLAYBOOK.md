# UI/UX Audit — a post-implementation visual + interaction review

A reusable audit pass run **after any visual implementation, before the commit
that ships it**. It judges the surface (UI) and the task (UX) as two coupled
domains: a change in one almost always moves the other, so every finding is
checked on both sides. Project-agnostic in shape; pair it with this repo's token
law (CLAUDE.md) and its copy/density guides.

## Where this sits (no overlap)

Three audits, three jobs. Keep the boundaries clean:
- `DENSIFY_SPRINKLE_PLAYBOOK.md` → is there enough decision-relevant content, is
  it anchored. (density / value)
- `anti_ai_generated_guide_v3.md` → does the copy read human, claims-not-categories.
  (words)
- **this** → is the surface balanced/consistent and is the task doable. (layout,
  hierarchy, interaction, states, accessibility)

Handoff rule when a finding straddles: copy quality routes to the anti-AI guide,
content density routes to densify, and this audit only flags that a state is
**missing or visually broken**, never that its wording is weak.

## The three lenses

Audit every changed surface through all three. Each lens is anchored to a named
standard so findings cite a rule, not a vibe.

### Lens 1 — UX (the job). Anchor: Nielsen heuristics + interaction cost.
- Can the user complete the task? Is the right information present at the moment
  it's needed, not one click away?
- Affordance: does an interactive thing look interactive; does a static thing not
  look clickable? Feedback on every action. Visible system state.
- Information scent: does each label/entry predict what's behind it?
- Cognitive load + interaction cost (Fitts / Hick): target size, number of
  choices, distance to the next action. Cap option lists ~5–9.
- Error recovery: can the user get unstuck, and is the path obvious?
- All states exist and are coherent: loading / empty / error / null/partial.

### Lens 2 — UI (the surface). Anchor: Gestalt + visual hierarchy + token law.
- Hierarchy: does the eye land on the most important thing first? One primary
  per view.
- Alignment + spacing rhythm: everything on the 4px grid (`--spacing-*`); spacing
  carries grouping before borders do (Gestalt proximity).
- Balance / optical weight: no lopsided column, no orphaned element, no dead gutter.
- Consistency: reuse a component, don't reinvent it; tokens never raw hex;
  `tabular-nums` (`.num`) on every numeric column; chartreuse = interface, red =
  risk only; the three fonts in their assigned roles.
- Typographic scale discipline (use the `--text-*` steps), contrast (WCAG AA).

### Lens 3 — SEAM (the coupling). The reason this audit exists.
Every finding on lens 1 or 2 gets one more question: **what did this cost the
other domain?** No UI change ships without naming its UX consequence, and no UX
change without its UI consequence. Recurring seams on this project:
- **Truncation / ellipsis** — UI tidiness that hides info (UX cost). Only OK if
  the full value is reachable (hover title, detail view).
- **New column / badge / chip** — layout imbalance + row-height shift (UI) *and*
  added scan-load (UX). Widening one column steals from another; check the whole
  row, not the new cell. (See the classification rollout: risk columns widened to
  fit a stacked badge.)
- **Color as the sole signal** — looks clean, fails a11y and fails the
  colorblind/greyscale user (UX). Pair color with text/shape/position.
- **Pagination vs infinite scroll** — footprint (UI) traded against findability
  and sense-of-total (UX).
- **Prominent but unlabeled** — a bold threshold line or a multi-color series with
  no legend reads as intentional (UI) but communicates nothing (UX). Anything
  visually loud must say what it means.
- **Density vs breathing room** — packing more in (UX win: less scrolling) past a
  point becomes noise (UI loss: no hierarchy). Find the line per surface.

## The loop

`SEE IT → audit 3 lenses → triage → report → fix on approval → re-SEE IT → commit`

1. **SEE IT first.** Screenshot the changed surface across the matrix below and
   read the PNGs. Findings come off pixels + DOM, never imagination.
2. **Audit** through the three lenses. Write each finding in the format below.
3. **Triage** by severity × layer. Sort blockers first.
4. **Report** the findings table. Stop. (Report-then-approve: do not fix yet.)
5. **Fix on approval** — the user picks which blockers/majors to fix. Smallest
   coherent set; reuse components/tokens; match surrounding idiom.
6. **Re-SEE IT** — re-screenshot every fixed surface; confirm the fix and that it
   introduced no new seam (the fix is itself a change → re-audit its seam).
7. **Commit** when asked. Report honestly what was fixed, deferred, skipped.

### Finding format
```
<route> · <viewport/theme/locale> · [UI|UX|SEAM] · <blocker|major|minor>
  observed: <what is wrong, visible in the screenshot/DOM>
  rule:     <heuristic or CLAUDE.md non-negotiable violated>
  fix:      <the concrete change>
```
No "feels off." Every finding needs an **observed** pixel-level reason and a
named **rule**. If you can't name both, it's not a finding.

### Severity
- **blocker** — breaks the task, fails WCAG AA, or violates a CLAUDE.md
  non-negotiable (raw hex, no `.num` on a numeric column, a missing state,
  color-only signal, emoji in product).
- **major** — visual imbalance, component inconsistency, awkward placement, hidden
  info, hierarchy that misdirects.
- **minor** — polish: a few px off-grid, a softer-than-ideal contrast that still
  passes AA, optional flourish.

## The SEE-IT matrix (representative, not cartesian)

Default per surface — enough to catch the real failure modes without a
combinatorial explosion:
- **desktop (1280) + mobile (390)** — both, always (responsive break is where
  layout breaks).
- **light + dark** — both (contrast + token failures hide in one theme).
- **ID default + EN spot-check** — ID is the live locale; EN catches the longer/
  shorter string that reflows (e.g. "Requires investigation" vs "Mencurigakan").
- **every state that exists** — loading / empty / error / null. Don't shoot a
  state the surface can't reach; do shoot all it can.

Runner (this repo): `cd app && node scripts/shoot.mjs "<route>" <slug>` →
desktop-light / desktop-dark / mobile to `/tmp/<slug>-*.png`. For close-ups,
screenshot a `clip` box or a locator and verify the actual element, not just the
page. Locale via `localStorage` `tw-locale`, theme via `tw-theme`, set in an init
script before load. Localhost shots prove render/layout, not remote behavior.

## Sweep width: changed surface + its siblings

Audit the touched surface **plus every page that shares the components it
touched** — consistency drift shows up off-screen. Derive the sibling set
deterministically, don't guess: grep the changed component's import sites.
```
grep -rl "ClassBadge" app/src/routes app/src/components
```
Every hit is a sibling to re-SEE. A badge restyle that looks right on Detail can
imbalance a row on Bidders.

## Gate

This audit is a **hard gate before any commit that touches a visual surface.**
Two tiers so the gate stays cheap enough to actually run:
- **Triage (the gate itself, ~60s)** — SEE IT on the changed surface, scan the
  three lenses, surface blockers. Every incidental visual tweak clears this.
- **Full pass** — the whole loop incl. sibling sweep + full matrix. Run for
  focused UI work, new surfaces, or when triage surfaces a blocker.

Honest limit: unlike `banned_tells.txt`, "is this balanced" can't be grepped, so
no hook can enforce this. The gate is honor-system, backed by the report
artifact. The discipline is: **no UI commit without a SEE-IT and a findings call,
even if the call is "clean."**

## Guardrails
- Read a file before editing; match its conventions and tokens.
- Don't invent data to make a layout look better — real data only, all states.
- Reuse components/tokens; introducing a one-off when one exists is itself a major.
- Commit/push only when asked; one scoped commit; truthful message.

---
*Pair with: CLAUDE.md (token law, non-negotiables), `DENSIFY_SPRINKLE_PLAYBOOK.md`
(content density), `anti_ai_generated_guide_v3.md` (copy), `LOCALIZATION_GUIDE.md`
(EN/ID parity).*
