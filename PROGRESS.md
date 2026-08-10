# PROGRESS — AI Komcad Command Center Platform

Status hidup development. Diperbarui setiap kali sebuah tugas di `TODO.md` berpindah status. Baca ini duluan untuk tahu "sekarang sampai mana" — lihat `CLAUDE.md` untuk konteks arsitektur lengkap.

Terakhir diperbarui: **2026-08-10**

## Ringkasan
Fase 0 (Setup Proyek) **selesai**. Fase 1 (Design System & App Shell) **selesai** — komponen UI, drawer/modal, shell navigasi, semua jadi. Fase 2 (Auth & RBAC) **selesai** dan diverifikasi end-to-end (login, redirect per role, logout). Fase 3 (Data Layer) **schema selesai, seed starter (20 anggota) sudah ada** — belum diperluas ke skala penuh (50-100). Fase 4–13 belum dimulai.

## Status per Fase

| Fase | Status | Catatan |
|---|---|---|
| 0 — Setup Proyek & Infrastruktur | ✅ **Done** | |
| 1 — Design System & App Shell | ✅ **Done** | Komponen UI reusable + Drawer/Modal primitive selesai; panel show/hide individual (FR-24) ditunda ke Fase 4 karena itu fitur halaman Overview, bukan shell umum |
| 2 — Auth & RBAC | ✅ **Done** | Login, session, RBAC redirect, sign-out — semua diverifikasi via curl end-to-end (lihat detail di bawah) |
| 3 — Data Layer (Prisma Schema + Seed) | 🟡 **In Progress** | Schema lengkap. Seed starter: 4 user demo + 20 anggota + 2 Misi contoh. Belum diperluas ke 50-100 anggota; `calculateReadinessScore()` belum ada (nilai seed masih acak, bukan hasil formula) |
| 4 — Modul Overview & Peta Situasi | ⬜ Todo | Placeholder page saja |
| 5 — Modul Manajemen Data Anggota | ⬜ Todo | Placeholder page saja |
| 6 — Modul Manajemen Misi & AI Mobilization | ⬜ Todo | Placeholder page saja |
| 7 — Modul Analitik & Laporan | ⬜ Todo | Placeholder page saja |
| 8 — Modul AI Chat Assistant | ⬜ Todo | Placeholder page saja |
| 9 — Modul Guideline | ⬜ Todo | Placeholder page saja |
| 10 — Modul Sistem | ⬜ Todo | Placeholder page saja |
| 11 — Sisi Anggota (Mobile Web) | ⬜ Todo | Hanya halaman placeholder `/m`, tapi sudah role-protected & tahu siapa yang login |
| 12 — Non-Functional Requirements | ⬜ Todo | |
| 13 — Testing, QA, Deployment Prep | ⬜ Todo | |

## Detail — Apa yang Sudah Jadi

**Fase 0 & 1** — lihat riwayat sebelumnya (Node.js portable, Next.js 16 + Tailwind v4 scaffold, Prisma schema, shell navigasi). Tambahan sesi ini:
- Komponen UI reusable di `src/components/ui/`: `Button` (variant default/outline/solid/danger/ghost), `Badge` (+ helper `statusSiagaColor`/`statusMisiColor`/`urgensiColor`/`statusSertifikasiColor` — badge status FRD §10.8 selalu ada label teks, bukan cuma warna), `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Input`/`Textarea`/`Select`/`Label`, `Chip`
- `Drawer` (slide dari kanan, untuk profil CV anggota / detail Misi nanti) & `Modal` (untuk form Buat Misi nanti) — keduanya Radix Dialog based, animasi didefinisikan di `globals.css` (`overlay-show`, `modal-show`, `drawer-slide-in`)
- **Next.js 16 migration**: `middleware.ts` di-rename ke `src/proxy.ts` (Next 16 mendeprecate nama "middleware", lihat `node_modules/next/dist/docs/.../proxy.md`) — build sekarang bersih tanpa warning deprecation

**Fase 2 — Auth & RBAC (selesai, diverifikasi end-to-end):**
- `src/lib/auth.ts` — Auth.js v5, Credentials provider, password di-hash bcrypt, session JWT dengan `role` & `anggotaId` di token (lihat `src/types/next-auth.d.ts` untuk type augmentation — **catatan penting**: augmentasi `JWT` harus target modul `@auth/core/jwt`, BUKAN `next-auth/jwt` yang cuma re-export dan tidak ke-merge oleh TypeScript)
- `src/app/login/` — halaman login (Server Action `loginAction` via `useActionState`, bukan client-side `signIn` dari `next-auth/react`) + `src/lib/auth-actions.ts` (`signOutAction`)
- `src/proxy.ts` — RBAC: belum login → redirect `/login`; role `ANGGOTA` terkunci ke `/m/*`; role lain (Super Admin/Operator/Analis) terkunci ke Command Center; sudah login tapi buka `/login` → redirect otomatis ke area masing-masing
- Topbar & Sidebar sekarang menerima `user` (session asli) dari `(command)/layout.tsx` (server component, panggil `auth()`) — nama, role label, dan tombol Keluar semua nyata, bukan dekoratif lagi
- **Diverifikasi manual via curl** (bukan cuma asumsi): login benar → cookie session ter-set & `/overview` menampilkan nama+role asli; password salah → redirect `?error=CredentialsSignin`; role ANGGOTA ke `/overview` → auto-redirect ke `/m`; role lain ke `/m` → auto-redirect ke `/overview`; sign-out → cookie ter-clear, `/overview` kembali redirect ke `/login`

**Fase 3 (sebagian) — Seed data:**
- `prisma/seed.ts`: 4 akun demo (satu per role, password sama untuk semua: `komcad123`) + 20 anggota dummy tersebar 8 provinsi dengan profil demografi, lokasi, sertifikasi; 2 aktivitas pelatihan; 2 Misi contoh (satu Selesai dengan evaluasi, satu Dimobilisasi dengan Penugasan berstatus "Menunggu Respons")
- Akun `anggota@komcad.mil.id` ditautkan ke salah satu record Anggota (bukan user tanpa data) supaya Sisi Anggota nanti punya sesuatu untuk ditampilkan
- Idempotent untuk user (pakai `upsert`), tapi anggota/misi/aktivitas pakai `create` biasa — **menjalankan `npm run db:seed` dua kali akan duplikasi anggota/misi**. Kalau perlu reset: hapus `app/prisma/dev.db` lalu `npm run db:push && npm run db:seed`

## Cara Login untuk Testing Manual

Jalankan `npm run dev` dari `app/`, buka `http://127.0.0.1:3000` (lihat catatan `localhost` vs `127.0.0.1` di bawah), lalu masuk dengan salah satu akun (password sama semua): `komcad123`

| Email | Role | Diarahkan ke |
|---|---|---|
| admin@komcad.mil.id | Super Admin | Command Center |
| operator@komcad.mil.id | Operator Komcad | Command Center |
| analis@komcad.mil.id | Analis/Evaluator | Command Center |
| anggota@komcad.mil.id | Anggota Komcad | Sisi Anggota (`/m`) |

## Catatan Lingkungan Dev (penting untuk sesi lanjutan)

Mesin dev ini **tidak** punya Node.js/npm bawaan dan **tidak** ada akses admin (MSI installer Node gagal — Error 1925 insufficient privileges). Solusinya:
- Node.js v24.19.0 diinstal sebagai **portable zip** ke `%LOCALAPPDATA%\Programs\node-v24.19.0-win-x64` (bukan via installer resmi)
- Ditambahkan ke **User PATH** (registry) — berlaku untuk sesi shell baru
- Untuk Git Bash yang sesi-nya sudah berjalan sebelum PATH diubah: dibuat wrapper `node`/`npm`/`npx` (bash script) di `~/bin` — folder ini sudah ada di PATH bawaan Git Bash
- **Penting:** subprocess native Windows (cmd.exe, yang dipanggil banyak install script npm seperti Prisma postinstall) butuh file `.cmd` asli, bukan bash script. Maka dibuat juga `node.cmd`, `npm.cmd`, `npx.cmd` di `~/bin` yang memanggil `node.exe` asli dengan path absolut — tanpa ini, `npm install` gagal dengan `'node' is not recognized` setiap kali sebuah package menjalankan install script.
- Kalau lingkungan dev berubah (mesin baru / container baru), langkah instalasi Node portable + shim `.cmd` ini perlu diulang kalau tidak ada akses admin untuk installer resmi.
- npm 11+ punya fitur `allow-scripts` (block install script secara default) — kalau ada package baru yang install-nya gagal diam-diam, cek `npm approve-scripts --allow-scripts-pending` dulu.
- **`localhost` sempat tidak resolve** di dalam sesi kerja ini tapi `127.0.0.1` selalu jalan — kalau curl/browser gagal connect ke `localhost:3000`, coba `127.0.0.1:3000`.
- Git Bash + `cmd.exe /c "..."` sering memangkas argumen `/c` jadi path (MSYS path-mangling) — pakai `cmd.exe //c "..."` (garis miring ganda) kalau perlu menjalankan command lewat cmd.exe dari Git Bash.

## Keputusan Teknis yang Diambil Selama Sesi Ini

- **Prisma versi**: dipin ke `^6` (bukan v7 terbaru) karena Prisma 7 mengubah cara konfigurasi datasource (butuh `prisma.config.ts` + driver adapter, breaking change besar). v6 tetap pakai `url` di `schema.prisma` seperti biasa.
- **Tailwind v4**: dipakai apa adanya dari default `create-next-app` — theming lewat `@theme` block di CSS, bukan `tailwind.config.js`.
- **Next.js 16 "proxy" bukan "middleware"**: file route-protection ada di `src/proxy.ts`, bukan `src/middleware.ts` (nama lama dideprecate mulai Next 16.0.0).
- **Login pakai Server Action, bukan client `signIn()`**: `src/app/login/actions.ts` memanggil `signIn` dari `@/lib/auth` (server-side), ditangkap lewat `useActionState`. Ini menghindari perlu `"use client"` untuk seluruh logic auth dan `AuthError` ditangani rapi tanpa expose detail error ke user.
- **RBAC di level proxy (route), bukan cuma UI**: halaman Command Center & Sisi Anggota benar-benar saling terkunci di server (redirect), bukan cuma sembunyi-tampil elemen di client.

## Langkah Selanjutnya (rekomendasi urutan)
1. Fase 4 — Modul Overview & Peta Situasi (peta Leaflet + panel bawah) — ini yang paling terlihat & jadi fondasi visual untuk modul lain
2. Fase 5 — Direktori Anggota + Drawer Profil CV (drawer primitive sudah siap dipakai)
3. Fase 6 — Manajemen Misi & AI Mobilization (baru sentuh OpenAI API di sini)
4. Perluas seed data ke skala FRD (50-100 anggota) begitu ada modul yang benar-benar butuh melihat skala itu (Direktori Anggota / Analitik)
