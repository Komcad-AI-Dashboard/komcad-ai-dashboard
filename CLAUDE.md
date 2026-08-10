# CLAUDE.md — SIAGA Command Center Platform

Panduan kerja untuk siapa pun (manusia atau AI agent) yang melanjutkan development di repo ini. Baca file ini dulu sebelum mengubah apa pun.

## 1. Apa ini

**SIAGA — Sistem Identifikasi, Analitik & Gerak Anggota** adalah sistem dashboard untuk Komponen Cadangan (Komcad) di bawah Kementerian Pertahanan (Kemenhan) & Mabes TNI, komando & kendali di bawah Panglima TNI. Sistem ini punya dua sisi:

1. **Command Center** (desktop, full dark mode) — dipakai Super Admin / Operator Komcad / Analis-Evaluator untuk mengelola data anggota, membuat & memobilisasi **Misi** (insiden yang butuh mobilisasi personel) dengan bantuan **AI Mobilization**, memantau peta situasi nasional, dan menganalisis kesiapsiagaan.
2. **Sisi Anggota** (mobile-first web) — dipakai Anggota Komcad untuk melihat profil, riwayat, status kesiapan, dan merespons notifikasi mobilisasi.

Sumber kebenaran fungsional ada di [`FRD/`](FRD/) (khususnya `FRD_Komcad_Digital_Platform.docx` — dokumen gabungan lengkap Bab 1–14; file `.md` di folder yang sama adalah pecahan sebagian saja, tidak lengkap). Sumber kebenaran visual/interaksi ada di dua mockup statis:
- `komcad-dashboard.html` — Command Center
- `komcad-sisi-anggota-mobile.html` — Sisi Anggota

Mockup ini **bukan** dipakai langsung sebagai kode produksi — tapi jadi referensi 1:1 untuk warna, tipografi, komponen, dan copy (istilah Indonesia: "Misi" bukan "Case", "Pemberi Perintah", dsb). Saat ragu soal detail UI, buka mockup HTML-nya dan cocokkan.

### Nama produk & tema visual (Fase 15)

Nama produk resmi sejak Fase 15 adalah **SIAGA** — akronim dari *Sistem Identifikasi, Analitik & Gerak Anggota*. Sebelumnya "AI KOMCAD". Yang berubah hanya **nama produk**; kata **"Komcad"** tetap dipakai di mana pun ia merujuk pada program/entitas domain (Komponen Cadangan, "Anggota Komcad", "Operator Komcad", domain email `@komcad.mil.id`, nama unit `Komcad Yon Zeni 1`) — jangan diganti.

Tema visual mengikuti konsep **Sentinel HUD** ([`mockup-konsep/konsep-1-sentinel.html`](mockup-konsep/konsep-1-sentinel.html)): palet FRD §10.2 tidak berubah sedikit pun, yang ditambah hanya lapisan kedalaman — grid halus + vignette + scanline (overlay `body::before/::after`), corner bracket di panel, dan glow tactical green.

**Peta situasi TIDAK diberi overlay dekoratif apa pun.** Konsep aslinya sempat punya radar sweep berputar lalu crosshair statis; keduanya dicoret user karena menimpa lapisan marker tanpa menambah informasi. Jangan menambahkannya kembali. Dua konsep alternatif yang ditolak tetap disimpan di `mockup-konsep/` sebagai catatan keputusan desain.

**Konteks penting:** semua data personel (NIK, kontak, dsb.) pada tahap pengembangan ini adalah **data dummy/seed**, bukan data riil personel TNI/Komcad. Jangan pernah memasukkan data pribadi asli ke seed, commit, atau log.

## 2. Tech Stack & Keputusan Arsitektur

Satu aplikasi Next.js (bukan monorepo terpisah) — Command Center dan Sisi Anggota adalah dua route group dalam app yang sama, berbagi auth, data layer, dan design tokens (persis seperti dua mockup HTML berbagi CSS variable yang sama).

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript + React | Cocok untuk UI interaktif kompleks (drawer, modal, live map) yang dituntut mockup; Server Components + Server Actions mengurangi boilerplate API |
| Styling | Tailwind CSS, custom theme dari token warna FRD §10.2 | Mockup sudah pakai CSS variable yang jadi Tailwind theme 1:1 |
| Komponen UI | Radix primitives (dialog, drawer/sheet, tabs, dropdown) dibungkus custom, gaya "gelap taktis" | Aksesibilitas (WCAG AA per NFR di FRD §10.8) tanpa menulis primitive dari nol |
| Peta | react-leaflet + Leaflet.js, tile OpenStreetMap + filter CSS tactical dark | FRD §10.5 eksplisit minta OpenStreetMap + filter CSS, bukan provider lain |
| ORM & DB | Prisma + **PostgreSQL (Neon)**, dev dan deployment publik sama-sama Postgres, branch/project Neon terpisah untuk masing-masing | Sebelum deploy (Fase 15+) dev sempat pakai SQLite lokal karena mesin dev ini tidak ada Docker/Postgres terpasang — provider diganti sekali secara permanen saat pertama kali deploy ke Vercel, lihat `app/README.md` bagian Deployment. Hindari fitur khusus Postgres (native enum, full-text search) di schema — tetap pakai `String` + validasi Zod, bukan karena portabilitas provider lagi dibutuhkan, tapi supaya diff schema tetap kecil & mudah di-review. |
| Auth | Auth.js (NextAuth v5), Credentials provider + JWT session, RBAC middleware | 4 role eksplisit di FRD §4: Super Admin, Operator Komcad, Analis/Evaluator, Anggota Komcad |
| AI Mobilization | OpenAI API (`openai` SDK), server-side only, dipanggil dari Server Action/Route Handler | FRD FR-09–FR-11: skor + alasan (explainability) + ETA, dikutip dari data anggota riil di DB (bukan LLM mengarang kandidat — LLM meranking & menjelaskan kandidat yang sudah difilter dari DB) |
| AI Chat | OpenAI API, grounded ke DB (query dulu → susun context → LLM merangkai jawaban bahasa natural) | FRD FR-30/FR-31 mensyaratkan jawaban konsisten dengan data Analitik & Manajemen Misi — tidak boleh LLM freestyle |
| Validasi | Zod | dipakai di form client & Server Action input |
| Package manager | npm | Node diinstal manual (portable, tanpa admin) di mesin dev ini; npm paling minim asumsi lingkungan |

**Keputusan yang butuh divalidasi lagi sebelum rilis produksi** (lihat FRD §11 Asumsi & Batasan): formula bobot Readiness Score, radius pencarian AI Mobilization default 25km, integrasi verifikasi NIK, upload foto asli, dan AI Chat berbasis LLM live (bukan simulasi statis mockup).

## 3. Struktur Folder (target)

```
komcad-ai/
├── FRD/                          # sumber kebenaran fungsional (read-only, jangan diedit tanpa alasan kuat)
├── komcad-dashboard.html         # mockup referensi Command Center (read-only)
├── komcad-sisi-anggota-mobile.html  # mockup referensi Sisi Anggota (read-only)
├── CLAUDE.md                     # file ini
├── TODO.md                       # rencana kerja per fase (checklist FR-ID)
├── PROGRESS.md                   # log iteratif: apa yang sudah/belum/sedang dikerjakan
└── app/                          # Next.js application (dibuat di Fase 0)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/           # login
    │   │   ├── (command)/        # Command Center: layout sidebar+topbar, 13 menu sesuai sitemap FRD §5
    │   │   ├── (member)/         # Sisi Anggota: layout mobile
    │   │   └── api/              # route handlers (AI mobilization, AI chat, webhook notifikasi)
    │   ├── components/
    │   ├── lib/                  # prisma client, auth config, openai client, readiness-score calc
    │   └── styles/                # tailwind theme / design tokens
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts                # data dummy sesuai FRD 09-data-dummy (dan mockup)
    └── .env / .env.example
```

> Catatan: `app/CLAUDE.md` dan `app/AGENTS.md` di dalam folder `app/` **bukan** dokumen ini — itu file yang di-generate otomatis oleh `next dev` (Next.js 16) berisi catatan breaking-changes framework untuk AI agent. Biarkan apa adanya, jangan dihapus dari commit.

## 4. Konvensi Istilah (wajib dipakai konsisten di kode & UI)

Istilah domain di seluruh kode (nama variabel, model Prisma, komponen, copy UI) **memakai istilah FRD v2.0**, bukan istilah draf lama:
- "Misi" — bukan "Case"/"Kasus" (Prisma model `Misi`, bukan `Case`)
- "Pemberi Perintah", "Jenis Kejadian", "Urgensi" (Kritis/Tinggi/Sedang), "Deskripsi Misi"
- "AI Mobilization", "Readiness Score", "ETA"
- "Overview" — bukan "Dashboard" (untuk halaman utama Command Center)
- ID Misi format: `MISI-{tahun}-{urutan}` (mis. `MISI-2026-001`)
- Status siaga anggota: `Aktif` / `Siaga` / `Tidak Tersedia`
- Status Misi: mengikuti alur di mockup (draft → Dimobilisasi → Selesai)
- Status sertifikasi: `Aktif` / `Akan Kedaluwarsa` / `Kedaluwarsa`

## 5. Palet Warna & Tipografi (jangan diubah — 1:1 dengan mockup, FRD §10.2–10.3)

```
--bg-primary:    #000000   /* latar utama, hitam murni */
--bg-surface:    #060809   /* panel, card, tabel */
--bg-elevated:   #0E1215   /* input, dropdown, tombol sekunder, modal */
--bg-hover:      #171C20
--border:        #22282D
--text-primary:  #EDF1F4
--text-secondary:#8B96A0
--text-dim:      #565F67
--accent:        #22C577   /* accent-bright: #3CF29A — hijau taktis, brand utama */
--amber:         #E0A83E   /* siaga / warning */
--red:           #E14C45   /* kritis */
--cyan:          #3FA9C9   /* elemen AI */
--gold:          #B08D4F   /* pos komando */

Font sans: Inter / IBM Plex Sans / system-ui
Font mono (angka, ID, koordinat, jam): IBM Plex Mono / JetBrains Mono
```

## 6. Role & Akses (RBAC) — FRD §4

| Role | Akses |
|---|---|
| Super Admin | Full access: kelola pengguna & role, konfigurasi sistem, data anggota, Misi, AI, laporan |
| Operator Komcad | Buat & kelola Misi (modal Buat Misi), verifikasi rekomendasi AI, pantau mobilisasi, input/update data anggota |
| Analis/Evaluator | Baca penuh data & laporan, susun analitik/evaluasi, akses AI Chat, **tanpa** hak ubah Misi aktif |
| Anggota Komcad | Sisi Anggota saja: profil pribadi, riwayat, status kesiapan, notifikasi |

## 7. Environment Variables

Lihat `app/.env.example`. Isi nyata ada di `app/.env` (**gitignored, jangan pernah commit**). Kalau `OPENAI_API_KEY` habis kuota, tinggal ganti nilainya di `.env` — semua kode membaca dari env var ini, tidak ada key ter-hardcode di mana pun.

## 8. Perintah Dev (dari folder `app/`)

```bash
npm install
npm run db:push       # sync Prisma schema ke Postgres (Neon dev branch) — lihat DATABASE_URL di .env
npm run db:seed       # isi data dummy
npm run dev           # jalankan di http://localhost:3000
npm run lint
npm run build
```

## 9. Alur Kerja Dokumentasi Iteratif

- **TODO.md** — rencana kerja lengkap per fase, dibuat sekali di awal, referensi FR-ID. Checkbox di-centang saat fase/tugas benar-benar selesai (bukan saat baru mulai).
- **PROGRESS.md** — status hidup: Done / In Progress / Todo, diperbarui **setiap kali** sebuah fase/tugas berpindah status. Ini dokumen yang dibaca duluan untuk tahu "sekarang sampai mana".
- Setiap kali membuka sesi kerja baru di repo ini: baca CLAUDE.md → PROGRESS.md → lanjutkan dari situ. Jangan re-derive keputusan yang sudah didokumentasikan di sini.

## 10. Batasan & Hal yang Sengaja Belum Dikerjakan (Out of Scope MVP)

Sesuai FRD §13: modul logistik/peralatan, integrasi finansial/penggajian, aplikasi mobile native (web responsif/PWA saja), moderasi upload foto profil, fine-tuning model AI Chat produksi (MVP pakai OpenAI API langsung dengan grounding DB, bukan model custom).
