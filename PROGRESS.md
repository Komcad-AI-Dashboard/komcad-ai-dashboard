# PROGRESS — AI Komcad Command Center Platform

Status hidup development. Diperbarui setiap kali sebuah tugas di `TODO.md` berpindah status. Baca ini duluan untuk tahu "sekarang sampai mana" — lihat `CLAUDE.md` untuk konteks arsitektur lengkap.

Terakhir diperbarui: **2026-08-10**

## Ringkasan
Fase 0–2 **selesai**. Fase 3 (Data Layer) **schema selesai, seed diperkaya** — belum diperluas ke skala penuh (50-100 anggota). Fase 4 (Overview & Peta Situasi) **selesai**. Fase 5 (Manajemen Data Anggota) **selesai** — CRUD lengkap dengan RBAC server-side & audit log, diverifikasi dengan Playwright yang menemukan & memperbaiki 1 bug nyata (lihat detail di bawah). Fase 6–13 belum dimulai.

## Status per Fase

| Fase | Status | Catatan |
|---|---|---|
| 0 — Setup Proyek & Infrastruktur | ✅ **Done** | |
| 1 — Design System & App Shell | ✅ **Done** | Komponen UI reusable + Drawer/Modal primitive selesai |
| 2 — Auth & RBAC | ✅ **Done** | Login, session, RBAC redirect, sign-out — semua diverifikasi via curl end-to-end (lihat detail di bawah) |
| 3 — Data Layer (Prisma Schema + Seed) | 🟡 **In Progress** | Schema lengkap (`kodeAnggota` ditambahkan Fase 4). Seed diperkaya di Fase 5: tanggal lahir, pekerjaan sipil, kontak darurat, 2 sertifikasi/anggota, riwayat Pelatihan personal. Masih 20 anggota (belum 50-100); `calculateReadinessScore()` belum ada (nilai seed masih acak, bukan hasil formula) |
| 4 — Modul Overview & Peta Situasi | ✅ **Done** | Peta Leaflet nyata (bukan mock), layers, training panel, 3 panel bawah dengan agregasi data asli, show/hide individual & sekaligus. Diverifikasi visual + console-error check pakai Playwright headless |
| 5 — Modul Manajemen Data Anggota | ✅ **Done** | Direktori + Drawer CV lengkap + Kompetensi&Sertifikasi + Riwayat Pelatihan + CRUD (create/edit/nonaktifkan/ubah status siaga) dengan RBAC di server action + audit log. Diverifikasi Playwright — nemu 1 bug nyata (stale action binding), sudah diperbaiki & diverifikasi ulang |
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

**Fase 4 — Overview & Peta Situasi (selesai, diverifikasi dengan browser sungguhan):**
- `src/lib/overview-data.ts` — semua data panel Overview di-query & diagregasi dari Prisma (bukan hardcode): posisi anggota siap/siaga dari `Lokasi` terbaru, zona Misi aktif, statistik gender/provinsi via `groupBy`, feed Misi terbaru, ringkasan AI Mobilization dari `Misi` berstatus Dimobilisasi + `Penugasan`-nya
- `src/lib/pos-komando.ts` — daftar lokasi Pos Komando sebagai konstanta statis (bukan entitas Prisma, karena FRD tidak mendefinisikan atribut/CRUD untuk data ini — didokumentasikan sebagai asumsi FRD §11)
- `src/components/overview/situation-map.tsx` — react-leaflet, dynamic-imported dengan `ssr:false` (Leaflet butuh `window`), dibatasi `maxBounds` Indonesia, filter CSS tactical dark (`.tactical-tiles` di `globals.css`), auto `invalidateSize` via `ResizeObserver` (jadi otomatis benar baik saat mode layar penuh maupun saat sidebar di-collapse, tidak perlu wiring manual ke event toggle manapun)
- Panel Layers, Legend, Training Panel (klik → Drawer), 3 panel bawah (Statistik/Misi Terbaru/AI Mobilization) dengan show/hide individual + show/hide semua sekaligus — state di-manage di satu client component orchestrator `overview-view.tsx`
- Klik marker anggota/zona Misi membuka Drawer ringkas (bukan profil CV lengkap — itu Fase 5) — reuse `Drawer` primitive dari Fase 1
- **Keamanan**: awalnya feed Misi Terbaru dirakit sebagai string HTML lalu di-render dengan `dangerouslySetInnerHTML` (niru pola mockup). Diperbaiki sebelum commit — field `Lokasi` pada Misi adalah teks bebas yang diisi Operator (FR-08), jadi berpotensi stored-XSS kalau di-render sebagai HTML mentah. Sekarang dirender sebagai JSX biasa (auto-escaped), tidak ada `dangerouslySetInnerHTML` di modul ini
- **Perbaikan skema**: `Anggota` awalnya cuma punya primary key cuid internal, sehingga popup peta menampilkan ID acak (`cmsn0g1oa...`) alih-alih ID yang manusiawi. Ditambahkan field `kodeAnggota` (format `ANG-00001`, unique) — relevan juga untuk Fase 5 (tabel Direktori Anggota di mockup menampilkan kolom ID seperti ini)
- **Verifikasi**: dites pakai Playwright headless Chromium (bukan sekadar curl, karena peta Leaflet cuma jalan di client) — login berhasil, 15 tile peta termuat, 18 shape interaktif (marker/circle) muncul, klik marker membuka Drawer dengan data benar, klik "−" pada panel menyembunyikannya dan memunculkan chip "+ Nama Panel", nol console error. Playwright ditambahkan sebagai devDependency untuk verifikasi browser di sesi-sesi berikutnya

**Fase 5 — Manajemen Data Anggota (selesai, RBAC server-side + CRUD teruji end-to-end):**
- `src/lib/anggota-data.ts` — `getAnggotaFullList()` memuat seluruh detail (profil, lokasi, sertifikasi, pelatihan, penugasan) sekaligus untuk 20 anggota (didokumentasikan eksplisit di kode: kalau data mendekati skala NFR-02/500rb, ini WAJIB diganti pencarian & drawer server-side per-baris, bukan kirim semua ke client)
- `src/lib/sertifikasi.ts` — `computeSertifikasiStatus()` menghitung status (Aktif/Akan Kedaluwarsa/Kedaluwarsa) dari `tanggalBerlaku` setiap kali di-query, BUKAN dipercaya dari kolom `status` tersimpan — ini yang bikin FR-06 ("badge berubah warna otomatis") benar-benar valid, bukan cuma snapshot statis. Dipakai konsisten di Direktori Anggota, drawer CV, dan menu Kompetensi & Sertifikasi
- `src/lib/anggota-actions.ts` — Server Actions `createAnggotaAction`/`updateAnggotaAction`/`deactivateAnggotaAction`/`updateStatusSiagaAction`, semua: (1) cek role via `auth()` di dalam action itu sendiri (RBAC di server, bukan cuma sembunyi tombol di client — Analis yang coba manggil action tetap ditolak), (2) validasi Zod (NIK regex 16 digit), (3) tulis `AuditLog` via helper baru `src/lib/audit-log.ts`, (4) `revalidatePath` supaya UI ter-update otomatis tanpa reload manual
- Drawer CV: foto placeholder siluet, data pribadi (usia dihitung dari tanggal lahir), kompetensi (diturunkan dari daftar jenis Sertifikasi — skema tidak punya field kompetensi terpisah dari sertifikasi formal, disederhanakan secara sadar), sertifikasi, riwayat pelatihan, riwayat penugasan (join ke Misi), tombol ubah status siaga + edit + nonaktifkan (khusus Super Admin/Operator)
- **Bug nyata ditemukan & diperbaiki lewat testing Playwright** (bukan cuma "kelihatan jalan"): alur Edit → Escape → Tambah Anggota → Simpan ternyata memanggil `updateAnggotaAction` dengan id anggota LAMA, bukan `createAnggotaAction` — root cause: `AnggotaFormModal` dipakai berulang untuk create & edit dengan `action` yang berbeda tiap kali (`updateAnggotaAction.bind(null, id)` vs `createAnggotaAction`), dan komponennya tidak pernah unmount sehingga `useActionState` di dalamnya bisa membawa binding lama. Diperbaiki dengan `key={formTarget ? `edit-${id}` : "create"}` supaya React memaksa remount komponen (dan hook di dalamnya) tiap kali target berpindah. Reproduksi & fix dikonfirmasi lewat pengecekan log server (`createAnggotaAction` vs `updateAnggotaAction` yang benar-benar terpanggil), bukan cuma asumsi dari UI yang terlihat benar
- **Verifikasi lengkap**: search/filter tabel, buka drawer, ubah status siaga (server action beneran ke-invoke, dicek dari log), buka modal edit dengan data ter-isi benar, create anggota baru (row baru muncul otomatis lewat `revalidatePath`, tanpa reload), halaman Sertifikasi & Pelatihan — semua lewat browser Playwright sungguhan, nol console error di sepanjang alur

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
- **RBAC di level proxy (route), bukan cuma UI**: halaman Command Center & Sisi Anggota benar-benar saling terkunci di server (redirect), bukan cuma sembunyi-tampil elemen di client. Pola yang sama dilanjutkan di level Server Action untuk operasi CRUD (Fase 5) — jangan pernah cuma andalkan sembunyi tombol di UI untuk otorisasi.
- **lucide-react tidak lagi punya ikon brand** (Instagram, LinkedIn, dll — versi 1.31.0 yang terpasang). Kalau butuh ikon sosial media lagi di modul lain, pakai ikon generik (`AtSign`, `Link2`, dll) seperti di CV drawer, bukan asumsi nama ikon brand tersedia.
- **`key` prop untuk memaksa remount komponen form yang dipakai ulang untuk create/edit**: kalau ada component dengan `useActionState` yang di-reuse untuk beberapa "target" berbeda (create vs edit-anggota-X vs edit-anggota-Y) tanpa pernah unmount, action binding bisa nyangkut ke target lama. Pola ini kemungkinan akan terulang di Fase 6 (form Misi) — ingat kasus ini kalau nemu gejala serupa (state/action nyasar ke record lain).

## Langkah Selanjutnya (rekomendasi urutan)
1. Fase 6 — Manajemen Misi & AI Mobilization (baru sentuh OpenAI API di sini; panel AI Mobilization di Overview sudah siap nampilin `ringkasanAI` begitu field itu diisi; hati-hati pola `key`-untuk-remount di atas kalau bikin form Misi yang dipakai ulang)
2. Fase 7 — Analitik & Laporan (regionReadiness, KPI nasional — sebagian data source-nya udah ada dari Fase 4/5)
3. Perluas seed data ke skala FRD (50-100 anggota) begitu ada modul yang benar-benar butuh melihat skala itu (Analitik terutama)
