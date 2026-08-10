# PROGRESS — AI Komcad Command Center Platform

Status hidup development. Diperbarui setiap kali sebuah tugas di `TODO.md` berpindah status. Baca ini duluan untuk tahu "sekarang sampai mana" — lihat `CLAUDE.md` untuk konteks arsitektur lengkap.

Terakhir diperbarui: **2026-08-10**

## Ringkasan
Fase 0 (Setup Proyek) selesai. Fase 1 (Design System & App Shell) — bagian inti (shell navigasi, routing, token warna) selesai; komponen UI reusable & modal/drawer primitives belum. Fase 2–13 belum dimulai.

## Status per Fase

| Fase | Status | Catatan |
|---|---|---|
| 0 — Setup Proyek & Infrastruktur | ✅ **Done** | Lihat detail di bawah |
| 1 — Design System & App Shell | 🟡 **In Progress** | Shell navigasi + token warna selesai; komponen UI dasar (Button/Badge/Card/Input reusable), drawer & modal primitive belum dibuat |
| 2 — Auth & RBAC | ⬜ Todo | |
| 3 — Data Layer (Prisma Schema + Seed) | 🟡 **In Progress** | Schema Prisma lengkap sudah dibuat (semua entitas FRD §9.1) & di-push ke SQLite dev. Seed data dummy **belum** diisi (`prisma/seed.ts` masih placeholder kosong) |
| 4 — Modul Overview & Peta Situasi | ⬜ Todo | Placeholder page saja |
| 5 — Modul Manajemen Data Anggota | ⬜ Todo | Placeholder page saja |
| 6 — Modul Manajemen Misi & AI Mobilization | ⬜ Todo | Placeholder page saja |
| 7 — Modul Analitik & Laporan | ⬜ Todo | Placeholder page saja |
| 8 — Modul AI Chat Assistant | ⬜ Todo | Placeholder page saja |
| 9 — Modul Guideline | ⬜ Todo | Placeholder page saja |
| 10 — Modul Sistem | ⬜ Todo | Placeholder page saja |
| 11 — Sisi Anggota (Mobile Web) | ⬜ Todo | Hanya halaman placeholder `/m` |
| 12 — Non-Functional Requirements | ⬜ Todo | |
| 13 — Testing, QA, Deployment Prep | ⬜ Todo | |

## Detail — Apa yang Sudah Jadi

**Fase 0:**
- Node.js v24.19.0 LTS terinstal portable (mesin dev tidak punya Node bawaan, tanpa akses admin — lihat catatan lingkungan di bawah)
- Next.js 16.3.0 (App Router, Turbopack) + React 19.2.8 + TypeScript + Tailwind CSS v4 di-scaffold ke `app/`
- Prisma 6.19.3 + `@prisma/client` terpasang, SQLite dev DB (`app/prisma/dev.db`) sudah dibuat & sinkron dengan schema
- Dependency inti terpasang: next-auth (beta v5), zod, openai, leaflet + react-leaflet, Radix primitives (dialog/tabs/dropdown/checkbox/select/label), lucide-react, class-variance-authority, clsx, tailwind-merge, tsx
- `.env` (berisi `OPENAI_API_KEY` asli) & `.env.example` (template) dibuat; `.env` ter-gitignore
- Git repo terhubung ke `https://github.com/arsyiadlani/komcad-ai-dashboard.git` (remote `origin`), commit awal & push dilakukan di akhir sesi ini
- `npm run lint`, `npx tsc --noEmit`, dan `npm run build` semua lolos tanpa error

**Fase 1 (sebagian):**
- Token warna & tipografi FRD §10.2/10.3 dipetakan ke Tailwind `@theme` di `src/app/globals.css` (full black dark mode, tidak ada mode terang — sesuai FRD)
- Font Inter (sans) & IBM Plex Mono (mono) dimuat via `next/font/google`
- `src/lib/constants.ts`: struktur navigasi 5 grup/13 menu (identik `10-struktur-navigasi.md`), role, status Misi/siaga/sertifikasi, urgensi — satu sumber kebenaran istilah domain
- Sidebar (236px, collapsible ke 0px, transisi 180ms, state persist localStorage) + Topbar (toggle, judul+breadcrumb, indikator LIVE, tombol BUAT MISI, chip Readiness, tombol MISI AKTIF, search, settings, Masuk) — struktur & styling sesuai mockup, **tapi sebagian besar elemen topbar masih statis/dekoratif** (belum terhubung ke data nyata atau modal Buat Misi)
- 13 route Command Center + 1 route Sisi Anggota (`/m`) semua render sebagai halaman placeholder yang menyebutkan FR-ID & fase terkait, supaya siapa pun yang lanjut tahu persis apa yang harus diisi di mana
- Root `/` redirect ke `/overview`
- Diverifikasi manual: `npm run dev`, semua 15 route mengembalikan HTTP 200, tidak ada error hydration/console, `npm run build` sukses (semua halaman prerender statis)

## Catatan Lingkungan Dev (penting untuk sesi lanjutan)

Mesin dev ini **tidak** punya Node.js/npm bawaan dan **tidak** ada akses admin (MSI installer Node gagal — Error 1925 insufficient privileges). Solusinya:
- Node.js v24.19.0 diinstal sebagai **portable zip** ke `%LOCALAPPDATA%\Programs\node-v24.19.0-win-x64` (bukan via installer resmi)
- Ditambahkan ke **User PATH** (registry) — berlaku untuk sesi shell baru
- Untuk Git Bash yang sesi-nya sudah berjalan sebelum PATH diubah: dibuat wrapper `node`/`npm`/`npx` (bash script) di `~/bin` — folder ini sudah ada di PATH bawaan Git Bash
- **Penting:** subprocess native Windows (cmd.exe, yang dipanggil banyak install script npm seperti Prisma postinstall) butuh file `.cmd` asli, bukan bash script. Maka dibuat juga `node.cmd`, `npm.cmd`, `npx.cmd` di `~/bin` yang memanggil `node.exe` asli dengan path absolut — tanpa ini, `npm install` gagal dengan `'node' is not recognized` setiap kali sebuah package menjalankan install script.
- Kalau lingkungan dev berubah (mesin baru / container baru), langkah instalasi Node portable + shim `.cmd` ini perlu diulang kalau tidak ada akses admin untuk installer resmi.
- npm 11+ punya fitur `allow-scripts` (block install script secara default) — kalau ada package baru yang install-nya gagal diam-diam, cek `npm approve-scripts --allow-scripts-pending` dulu.

## Keputusan Teknis yang Diambil Selama Sesi Ini

- **Prisma versi**: dipin ke `^6` (bukan v7 terbaru) karena Prisma 7 mengubah cara konfigurasi datasource (butuh `prisma.config.ts` + driver adapter, breaking change besar). v6 tetap pakai `url` di `schema.prisma` seperti biasa — lebih stabil & terdokumentasi luas untuk proyek ini.
- **Tailwind v4**: dipakai apa adanya dari default `create-next-app` (bukan v3) — theming lewat `@theme` block di CSS, bukan `tailwind.config.js`.
- **Auth belum diwire**: tombol "Masuk" & elemen role-gated di topbar/sidebar masih dekoratif. NextAuth sudah terpasang tapi konfigurasinya (provider, middleware RBAC) adalah pekerjaan Fase 2.

## Langkah Selanjutnya (rekomendasi urutan)
1. Selesaikan sisa Fase 1: komponen UI dasar (Button/Badge/Pill/Card/Input) reusable + primitif Drawer & Modal (pakai Radix Dialog yang sudah terpasang)
2. Fase 2 — Auth & RBAC (perlu ini duluan supaya halaman-halaman berikutnya bisa role-aware sejak awal, bukan ditambal belakangan)
3. Fase 3 — lengkapi seed data dummy (skema sudah siap, tinggal isi)
4. Baru lanjut Fase 4 (Overview/peta) dst. sesuai urutan di `TODO.md`
