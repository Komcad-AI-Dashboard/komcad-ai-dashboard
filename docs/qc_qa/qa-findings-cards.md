# QA findings as Trello cards

Source: `Laporan QA Dashboard KOMCAD_31082026_2238.pdf` — Michael Rizky, QA from the Admin
role, 31 Aug 2026. Eight findings.

Each block below is one card: title, then a description ready to paste. Root causes were
traced in the source, so these are not restatements of the PDF.

Per the Fixing/Maintenance list guidelines these belong in that list — except QA-05 and
QA-07, which are feature requests rather than defects and belong in Backlog.

**Two need a decision before any code is written: QA-05 and QA-06.** Both would undo
something that was done deliberately.

| Card | Area | Type | Suggested list |
|---|---|---|---|
| QA-01 | Overview | Bug, Safari only | Fixing/Maintenance — blocked |
| QA-02 | Overview | Affordance | Fixing/Maintenance |
| QA-03 | Overview | Visual defect | Fixing/Maintenance |
| QA-04 | Overview | Missing interaction | Fixing/Maintenance |
| QA-05 | Overview | Feature request, conflicts with Fase 17 | Backlog — needs decision |
| QA-06 | Manajemen Misi | Behaviour, but deliberate | On Hold — needs decision |
| QA-07 | Laporan | Feature request | Backlog |
| QA-08 | Riwayat Mobilisasi | Missing interaction | Fixing/Maintenance |

QA-04 and QA-08 are the same defect in two places. Fix them as one card if you prefer.

---

## QA-01 — Buat Misi fails on Safari/macOS

**Severity: High. Blocked — cannot reproduce on the current dev machine.**

Reported: submitting Buat Misi on Safari/macOS shows "This page couldn't load — A server
error occurred". The same flow works normally in Chrome.

What makes this worth attention: the message is a **server-side 500**, which normally has
nothing to do with the browser. So something Safari sends differs enough to break the Server
Action. That narrows it, but not far enough to fix blind.

Not diagnosable here — the dev machine is Windows, there is no Safari for Windows, and
Playwright's WebKit is not Safari. It is close enough to miss exactly this class of quirk.

**Needed to proceed:** the server-side error from the Vercel logs at the moment of failure —
whoever can reproduce on macOS should submit the form, then pull the function log for that
request. The stack trace will almost certainly identify it immediately. Failing that, a
screen recording with Safari's Web Inspector network tab open.

Do not guess at a fix without a reproduction.

## QA-02 — Green location box looks clickable but is not

Reported: after pressing "Cari Lokasi" the resolved address appears in a green-bordered
box. It does not respond to clicks, but its styling — green border, list-item shape —
makes people try.

Confirmed. `app/src/components/misi/buat-misi-modal.tsx:201` renders it as a plain `div`
styled `border-accent-bright/30 bg-accent-bright/5`. That is the same treatment used for the
AI summary panel later in the same file, so the style means "confirmation surface" — but
here it sits directly beneath a search button, where the same shape reads as a result to
pick from.

The behaviour is correct: the location really is already set. The styling is what misleads.
Fix is visual — make it read as a status readout rather than an option.

Precedent worth following: Fase 17 hit this exact problem with the "Nasional" pill, which
was styled like a button while being static. It was rewritten as a labelled readout. Same
treatment applies here.

## QA-03 — "Kepadatan Wilayah" layer indistinguishable, blobs merge

Reported: the checkbox toggles, but the map indicator does not look different from other
layers, and some indicators merge together.

Confirmed, and the cause is a colour collision. `situation-map.tsx:82`:

```
heatColor(count) -> #E14C45 (>=6) | #E0A83E (>=3) | #3FA9C9 (<3)
```

Those are the palette's red, amber and cyan — already meaning Misi Kritis, Misi Siaga and AI
elements respectively. So a dense zone is drawn in the same red as a critical mission.

Two smaller contributors. The legend swatch in `layers-panel.tsx:15` is fixed at `#E0A83E`,
so it matches only one of the three states the layer can render. And the circles are 18–78 km
in radius at up to 0.35 fill opacity, so neighbouring bins genuinely overlap — that is the
"menyatu" in the report, not an illusion.

Note the bins are computed client-side on a ~1° grid from already-loaded member points, so
this is a rendering change only, no data work.

Fix needs a colour scheme that does not reuse marker semantics, plus a legend that reflects
the scale.

## QA-04 — Misi Terbaru items not clickable

Reported: the region filter works correctly, but sidebar mission items cannot be clicked to
see detail.

Confirmed. `app/src/components/overview/feed-panel-content.tsx` renders each item as a plain
`div` with no handler — no `onClick`, no link, no cursor affordance.

The target already exists: the Misi detail drawer opens via `?openId=`, which is how the
global search modal already navigates to a mission. So this is wiring an existing drawer to
an existing list, not building anything new.

Same defect as QA-08. QA flagged the pattern themselves and recommended sweeping every
similar table — that is the right call, and it should be part of this work rather than
fixing only the two reported spots. Fase 17 already ran a dead-element audit and these were
missed, so a second pass should be systematic.

## QA-05 — "Cakupan Nasional" should be a real filter

**Feature request, not a bug. Conflicts with a deliberate decision — needs a decision before
any work.**

Reported: the pill should be clickable and act as a scope filter, with options like Nasional,
Provinsi, or per-Pangdam. Currently it only displays that the dashboard is showing everything
nationally.

The current behaviour is intentional. In Fase 17 this element was styled like the Cari button
despite being static, users tried to click it, and it was rewritten as a labelled readout
specifically so it would stop looking interactive. QA has landed on that fix and is asking
for the opposite.

That does not make the request wrong — a scope filter is reasonable. But it is a feature,
and a larger one than it appears: filtering by Provinsi or Pangdam touches the map, every
panel, the KPI figures, and the Misi feed, and it needs a decision on whether scope persists
across pages.

This is the same conflict as the "bendera merah putih" Trello card. Both are cases of a
deliberate reversal never being recorded where the requester could see it.

## QA-06 — "Aktif" filter includes draft missions

**Needs a decision. The fix is one line, but the one line is not the whole problem.**

Reported: with the "Aktif" chip selected, `draft` missions appear alongside `dimobilisasi`.
Expected: drafts are excluded because they have not been mobilised.

Confirmed — and it is explicit, not accidental. `misi-view.tsx:58`:

```ts
filter === "Aktif"
  ? m.status === STATUS_MISI.DRAFT || m.status === STATUS_MISI.DIMOBILISASI
```

**The important part: the same definition is used in two other places.** `misi-data.ts:92`
counts the `misiAktif` KPI as `DRAFT + DIMOBILISASI`, and that same count feeds both the
sidebar badge and the "MISI AKTIF" pill in the topbar.

So "Aktif" consistently means "not finished" across the whole application. Changing only the
filter chip would desynchronise it from the badge: the topbar would read "MISI AKTIF 20"
while clicking through showed fewer than 20 rows. That is a worse bug than the one being
reported.

Two options, and this is a product decision:

- **Redefine "Aktif" as mobilised only** — change all three sites together, and accept that
  the headline count on every screen drops.
- **Keep the definition and fix the label** — the chip and KPI say something more honest, and
  drafts get their own filter.

Do not fix the chip alone.

## QA-07 — Kesiapsiagaan PDF has no charts or tables

**Feature request, not a defect.**

Reported: the report contains only a national KPI summary and per-region Readiness Score as
plain text. Expected: charts or tables so the data is readable.

Accurate — the report was only ever built to emit text. Nothing is broken.

Worth deciding scope before starting: which figures actually earn a chart. Readiness Score
across ~15 provinces is a bar chart; the KPI summary is four numbers and a chart would make
it worse, not better. Ask the requester which decisions the report is meant to support.

## QA-08 — Riwayat Mobilisasi rows not clickable, Evaluasi truncated

Reported: the Evaluasi column is cut off with "...", and clicking the row opens nothing, so
the full text cannot be read.

Confirmed. `app/src/app/(command)/riwayat/page.tsx:39` applies `xl:max-w-[280px] xl:truncate`
to the Evaluasi cell, and the row has no click handler.

One nuance: the cell does carry `title={r.hasilEvaluasi}`, so the full text is reachable via
the browser's native tooltip on hover. That is not discoverable, and it does not work on
touch — but it means the data is present in the DOM, so no query change is needed.

Also note the truncation is `xl:` only. On smaller screens the table becomes stacked cards
and the text is already full. The defect is desktop-only.

Same root cause as QA-04. Treat them together, and sweep the other tables while there.

---

## Suggested order

1. **QA-04 and QA-08 together** — one defect, existing drawer, no decisions needed. Sweep
   the remaining tables in the same pass.
2. **QA-03** — self-contained rendering fix, no data work.
3. **QA-02** — small, and there is a Fase 17 precedent to copy.
4. **QA-06** — one-line change, but get the definition decided first.
5. **QA-01** — blocked until someone reproduces on macOS and captures the server log.
6. **QA-05 and QA-07** — features. Scope them separately, do not let them ride in as fixes.
