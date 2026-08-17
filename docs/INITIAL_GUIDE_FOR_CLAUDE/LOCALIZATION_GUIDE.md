# Localization guide: copy that reads native, not translated

The app ships bilingual (Indonesian default, English second). Every string must
read as if a domain-native wrote it from scratch, not as a translation. The hard
lesson here: the first Indonesian pass read like early Google Translate, and had
to be rebuilt. This is how to avoid that. The rules are general to any target
language; Indonesian is the worked example.

## 1. Compose, do not translate

Write directly in the target language's register. Do not draft in English and
swap words. Sentence structure, idiom, and word choice should be what a native
domain expert would write unprompted. In code, `copy.ts` types `id` against `en`
for KEY parity, not parallel wording: same meaning, native phrasing, never
clause-for-clause mirroring.

## 2. Use the domain register

Use the field's real vocabulary, not dictionary equivalents. Procurement (ID):
penyedia (not "vendor"), penawaran, HPS, pagu, prakualifikasi, pascakualifikasi,
Pokja Pemilihan, tender, paket, instansi, satker. A word a practitioner uses
daily beats a technically-correct translation no one says.

## 3. Kill calques and translationese

Word-for-word renders betray a translation. Avoid (real examples seen here):
"mengunci pintu masuk", "menguasai/menangkap % plafon", "jangka waktu terjepit",
"kesiapan asimetris", "miringkan lapangan", "menciptakan ketegangan". Avoid
literary or rare words: bermuara, berujung, menjegal, mengisyaratkan. Prefer
plain everyday verbs: berakhir dengan, menghasilkan, menyebabkan, menunjukkan,
menghalangi. Do not leave stray English in the body: "bidding"/"bid" becomes
"penawaran".

## 4. Keep technical jargon in its original language (the quirk)

The goal is the natural register, and for analytics, data, and technical terms
the natural register in Indonesian (and most languages) IS the English term.
Forcing a Bahasa translation reads stiffer and less native, not more. So keep in
the original:

- **Acronyms and proper nouns:** HPS, NPWP, LPSE, SPSE, INAPROC, CSV, OECD, LKPP,
  product/brand names.
- **Analytics / data / technical jargon:** dashboard, filter, sort, log, hover,
  scatter, histogram, baseline, outlier, dataset, query, and the like. When a
  Bahasa equivalent exists but sounds academic or obscure ("pencilan" for
  outlier, "papan instrumen" for dashboard), keep the English.

Rule of thumb: if a domain-native analyst would say the English word in a
meeting, keep it; if they would say the Bahasa word (penyedia, tender, ekspor,
unduh, tinjau), use that. Do not anglicize for its own sake, and do not translate
for its own sake. Natural usage decides, in both directions.

## 5. Numbers and locale

In prose, follow the locale: Indonesian uses comma decimals (98,7%) and keeps the
supplied rupiah unit words (juta/miliar/triliun) without recomputing. Where
numbers sit in data tables or scorecards, match the surrounding numeric-column
convention instead (this repo keeps period decimals there so columns align).
Date and digit-grouping follow the locale.

## 6. The test

Read it aloud as the target-language domain expert. Would they actually say this,
or does it only make sense as a mapping back to English? If a clause only parses
by translating it back, rewrite it. One natural sentence beats a faithful but
wooden one.

---
Pair with: `anti_ai_generated_guide_v3.md` (copy tells) and the repo's `copy.ts`.
