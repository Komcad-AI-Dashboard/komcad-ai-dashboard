# FRD — AI Komcad Command Center Platform

**Versi 2.0 — Final, disinkronkan dengan mockup interaktif (komcad-dashboard.html)**
5 Agustus 2026 — Status: Final (development-ready)

> Perubahan dari v1.0: rebranding nama produk & logo (AI Komcad), istilah **"Case" → "Misi"** di seluruh dokumen, penambahan **Modul AI Chat** & **Modul Guideline**, struktur navigasi sidebar lengkap, dan spesifikasi UI/UX presisi (warna, komponen, interaksi) yang sudah 1:1 dengan mockup.

## Daftar Isi

| # | File | Isi | Ditujukan untuk |
|---|---|---|---|
| 1 | [01-pendahuluan-dan-definisi.md](01-pendahuluan-dan-definisi.md) | Document Control, Pendahuluan, Definisi & Istilah, User Roles & Permissions | Semua stakeholder |
| 2 | [10-struktur-navigasi.md](10-struktur-navigasi.md) | Sitemap sidebar lengkap (5 grup, 13 menu) — 1:1 dengan mockup | **Product, UI/UX, QA** |
| 3 | [02-functional-requirements.md](02-functional-requirements.md) | Seluruh Functional Requirements (FR-01 s.d. FR-40) per modul, termasuk AI Chat & Guideline | Product, Engineering |
| 4 | [03-non-functional-requirements.md](03-non-functional-requirements.md) | Non-Functional Requirements (performance, security, fleksibilitas UI, dll.) | Engineering, Security |
| 5 | [04-use-cases.md](04-use-cases.md) | Use Case / User Story per role, termasuk alur Buat Misi & AI Chat | Product, QA |
| 6 | [05-data-requirements.md](05-data-requirements.md) | Entitas data, field form Buat Misi, sumber & privasi data | Data/Backend Engineering |
| 7 | [06-ui-ux-style-guide.md](06-ui-ux-style-guide.md) | Panduan visual Command Center — full dark mode, 1:1 dengan mockup | **UI/UX Design** |
| 8 | [09-data-dummy.md](09-data-dummy.md) | Data dummy/sample untuk seluruh entitas (Anggota, Misi, Statistik, Aktivitas Pelatihan) | **UI/UX Design, QA/Engineering** |
| 9 | [07-asumsi-dependencies-outofscope.md](07-asumsi-dependencies-outofscope.md) | Asumsi, Batasan, Dependencies, Out of Scope | Product, PM |
| 10 | [08-lampiran.md](08-lampiran.md) | Ringkasan alur end-to-end & status implementasi mockup | Semua stakeholder |

## Cara pakai
- Baca berurutan 01 → 10 → 02 → 03 → 04 → 05 → 06 → 09 → 07 → 08 untuk gambaran lengkap.
- Tim desain UI/UX mulai dari **10** (struktur navigasi) lalu **06** (style guide) dan **09** (data dummy).
- Tim engineering fokus ke **02, 03, 05, 09**.
- Dokumen ini merujuk langsung ke mockup `komcad-dashboard.html` — semua nama menu, warna, dan alur interaksi di dokumen ini identik dengan yang ada di mockup tersebut.
