# Trello crosscheck — DIGIKOMCAD board

Board exported 31 Aug 2026. Every work card is still in **Backlog/Inbox**; none were moved
while the work was being done, so the board's position tells you nothing about status.

Scope: the 10 work cards. The 6 `[READ ME]` cards are list guidelines, not work.

Verdicts come from the repository — commits, source files, and a running local instance —
not from `PROGRESS.md` alone. Where the two disagree, the repo wins.

| # | Card | Verdict |
|---|---|---|
| 1 | Penambahan data profil menjadi 50 orang | Done, exceeded |
| 2 | Penambahan lokasi kodim, kodam di maps | Done |
| 3 | Penambahan misi sesuai kejadian/bencana terbaru | Done |
| 4 | Simulasi Bencana gempa NTT | Done |
| 5 | AI Chat dibuat bisa LLM untuk kebutuhan present | Done — already worked, verified |
| 6 | Penginputan dari web anggota masuk ke direktori dashboard | Done — already worked, verified |
| 7 | Pembuatan halaman login | Done |
| 8 | Ada bendera merah putihnya di halaman login | **Reversed — needs a decision** |
| 9 | List spek server dan deployment (50 ribu akun) | **Not started** |
| 10 | Misi terbaru kanan atas, riwayat pelatihan di panel bawah | Done |

8 done, 1 reversed, 1 untouched.

---

## Card notes

Each block below is written to be pasted into the card as a comment.

### 1. Penambahan data profil menjadi 50 orang — DONE

Delivered in `4a3cbfc` (110 to 160 members). A later commit `4f15152` added Maluku, Maluku
Utara and Papua, bringing the dev database to **175**. Verified by direct query, not by
reading the changelog.

Data lives in three separate Neon databases that do not sync. 175 is the dev figure;
staging and production need checking separately before this is called finished everywhere.

### 2. Penambahan lokasi kodim, kodam di maps — DONE

`4a3cbfc` added `app/src/lib/komando-teritorial.ts` — 11 Kodam and 11 Kodim, exposed as a
map layer toggle that defaults to off.

Two things worth knowing. Sulawesi Utara has no Kodim entry: no reliable source for the
unit number was found, and the call was made to omit it rather than invent a number for a
real military unit. And coverage is one representative unit per seeded province, not the
full national structure — that was confirmed as a deliberate scope decision, not an
oversight.

### 3. Penambahan misi sesuai kejadian/bencana terbaru — DONE

17 missions added across Fase 17 (`af75f4d`), 2 more in Fase 18. Codes 022 and 023 were
created; `7309100` later dropped 023 (Banjir Kepulauan Riau). Dev now holds 18 missions.

Incident data follows real BNPB/BPBD releases for August 2026. Personnel remain fictional.
The "Longsor" category is still empty — no verified August 2026 landslide was found, and
filling it with an out-of-window event was rejected on purpose.

### 4. Simulasi Bencana gempa NTT — DONE

Built as `JENIS_KEJADIAN_KOMPETENSI` in `app/src/lib/constants.ts`, mapping each incident
type to its three most relevant competencies, and wired into the Buat Misi modal plus AI
Mobilization scoring.

It was built into the existing Buat Misi flow rather than as a separate what-if page —
that shape was confirmed before the work started.

The competency mapping is an **assumption**. It has not been validated against military
doctrine, and it now influences which personnel get recommended first. Same status as the
Readiness Score weights.

### 5. AI Chat dibuat bisa LLM untuk kebutuhan present — DONE (verification, not new work)

AI Chat was already calling OpenAI. Fase 18 confirmed it end to end: real questions
answered in about 5 seconds with no fallback in the server log.

Nothing was built for this card. If the intent was something more than "prove it is real",
reopen it with the specific gap.

### 6. Penginputan dari web anggota masuk ke direktori dashboard — DONE (verification)

Also already working, since Fase 11. Verified by editing a profile as an Anggota and seeing
the change appear in the Operator's Direktori drawer with no approval step.

That is the designed behaviour: only NIK changes route through an approval flow. Everything
else is a live query. If NIK should behave the same way, that is a separate card.

### 7. Pembuatan halaman login — DONE

Redesigned in `37ae801`: two-column layout, hero panel on desktop, hidden on phones.

Three new controls are real, not decorative — password visibility toggle, guest/observer
sign-in (a genuine read-only ANALIS session), and remember-me (30 days versus 1).

**"Lupa kata sandi?" was deliberately not built.** The application has no email capability
at all — no SMTP, no mail provider, notifications are database writes. Building the link
would have produced a dead button. Deferred on purpose.

### 8. Ada bendera merah putihnya di halaman login — REVERSED, NEEDS A DECISION

This one is not "not done". It was done, then undone.

Commit `37ae801` is titled *"Desain ulang halaman login + ganti bendera jadi lambang
Komcad"* — replace the flag with the Komcad emblem. It was swapped in five places: login
card, hero wordmark, Command Center sidebar, and the mobile header and desktop sidebar of
the member side.

Confirmed in the current source: `app/src/app/login/page.tsx` references
`/brand/logo-komcad.png` with alt text "Lambang Komponen Cadangan". There is no flag asset
in `app/public/brand/`.

So the board asks for a flag and the shipped product deliberately removed it. Someone
decided to reverse this and the card was never updated. **Do not close this card and do not
re-add the flag** until whoever asked for the emblem confirms which one is wanted.

### 9. List spek server dan deployment (50 ribu akun) — NOT STARTED

No such document exists anywhere in the repository. The only related material is a code
comment in `app/src/lib/anggota-data.ts` noting that `getAnggotaFullList()` sends every
member's full detail to the client, and that this must become server-side per-row search
before approaching NFR-02 scale.

Note the mismatch: the card assumes 50,000 accounts, the FRD's NFR-02 specifies 500,000
profiles and 100 concurrent missions. Those need reconciling before any sizing work, since
they are an order of magnitude apart.

This is the only card with no work behind it at all.

### 10. Misi terbaru kanan atas, riwayat pelatihan di panel bawah — DONE

`af75f4d`, "Tukar posisi panel Misi Terbaru & Aktivitas Pelatihan". Misi Terbaru now floats
over the map, Aktivitas Pelatihan moved to the lower panel row. The floating frame was
extracted as `FloatingPanel` so any panel can occupy that slot.

---

## Board hygiene

Three things to fix while updating the cards.

**Eight cards belong in Released/Done, not Backlog.** The list's own guidelines say to create
a card named for the month and year of completion — so a "Released/Done — August 2026" card
with the eight beneath it.

**Card 8 belongs in On Hold, not Done or Backlog.** It is blocked on a decision, not on
work. The list guidelines ask for the context and the date of the hold; both are above.

**Card 9 is the only genuine backlog item left.** Once the eight move out, the Backlog is
one card, and that one needs the 50,000 versus 500,000 question answered first.

Separately: the QA report in `docs/qc_qa/` produces 8 findings that are not on this board at
all. Per the Fixing/Maintenance list guidelines they belong there. Two of them are real
bugs, two are unbuilt features rather than defects, and one — the "Cakupan Nasional" pill —
asks to undo a deliberate Fase 17 decision, so it carries the same conflict as card 8.
