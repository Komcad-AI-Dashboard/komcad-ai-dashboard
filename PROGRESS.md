# PROGRESS — AI Komcad Command Center Platform

Status hidup development. Diperbarui setiap kali sebuah tugas di `TODO.md` berpindah status. Baca ini duluan untuk tahu "sekarang sampai mana" — lihat `CLAUDE.md` untuk konteks arsitektur lengkap.

Terakhir diperbarui: **2026-08-10**

## Ringkasan
Fase 0–2 **selesai**. Fase 3 (Data Layer) **schema selesai, seed diperkaya** — belum diperluas ke skala penuh (50-100 anggota). Fase 4 (Overview & Peta Situasi) **selesai**. Fase 5 (Manajemen Data Anggota) **selesai** — CRUD lengkap dengan RBAC server-side & audit log, diverifikasi dengan Playwright yang menemukan & memperbaiki 1 bug nyata (lihat detail di bawah). Fase 6 (Manajemen Misi & AI Mobilization) **selesai** — OpenAI benar-benar dipanggil (bukan hardcode), dengan fallback deterministik kalau API gagal; diverifikasi end-to-end lewat Playwright termasuk approval & penutupan Misi sungguhan. Fase 7–13 belum dimulai.

## Status per Fase

| Fase | Status | Catatan |
|---|---|---|
| 0 — Setup Proyek & Infrastruktur | ✅ **Done** | |
| 1 — Design System & App Shell | ✅ **Done** | Komponen UI reusable + Drawer/Modal primitive selesai |
| 2 — Auth & RBAC | ✅ **Done** | Login, session, RBAC redirect, sign-out — semua diverifikasi via curl end-to-end (lihat detail di bawah) |
| 3 — Data Layer (Prisma Schema + Seed) | 🟡 **In Progress** | Schema lengkap (`kodeAnggota` ditambahkan Fase 4). Seed diperkaya di Fase 5: tanggal lahir, pekerjaan sipil, kontak darurat, 2 sertifikasi/anggota, riwayat Pelatihan personal. Masih 20 anggota (belum 50-100); `calculateReadinessScore()` belum ada (nilai seed masih acak, bukan hasil formula) |
| 4 — Modul Overview & Peta Situasi | ✅ **Done** | Peta Leaflet nyata (bukan mock), layers, training panel, 3 panel bawah dengan agregasi data asli, show/hide individual & sekaligus. Diverifikasi visual + console-error check pakai Playwright headless |
| 5 — Modul Manajemen Data Anggota | ✅ **Done** | Direktori + Drawer CV lengkap + Kompetensi&Sertifikasi + Riwayat Pelatihan + CRUD (create/edit/nonaktifkan/ubah status siaga) dengan RBAC di server action + audit log. Diverifikasi Playwright — nemu 1 bug nyata (stale action binding), sudah diperbaiki & diverifikasi ulang |
| 6 — Modul Manajemen Misi & AI Mobilization | ✅ **Done** | Buat Misi (modal global dari topbar) → OpenAI grounded scoring+ringkasan+ETA → approval+notifikasi → Manajemen Misi (tabel+drawer+kehadiran) → Tutup Misi+evaluasi. Fallback deterministik kalau OpenAI gagal. Diverifikasi Playwright dengan OpenAI asli terpanggil |
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

**Fase 6 — Manajemen Misi & AI Mobilization (selesai, AI benar-benar dipanggil & diverifikasi):**
- `src/lib/geo.ts` — Haversine + estimasi ETA (asumsi kecepatan gabungan 40 km/jam + 10 menit persiapan, didokumentasikan sebagai asumsi FRD §11, bukan hasil routing API sungguhan)
- `src/lib/wilayah.ts` — 8 kota referensi (sama dengan sebaran provinsi seed) dipakai sebagai dropdown "Lokasi" di form Buat Misi, supaya tiap Misi punya koordinat pasti untuk kalkulasi jarak/ETA. **Simplifikasi disengaja**: bukan input teks bebas + geocoding sungguhan seperti mockup — produksi butuh geocoding API
- `src/lib/misi-data.ts` — `getKandidatPool()` (anggota Aktif/Siaga terdekat dari lokasi Misi via Haversine, diambil pool 15 teratas untuk diserahkan ke AI), `getMisiListFull()`/`getMisiKpi()`/`getMisiMenungguApproval()` untuk halaman Manajemen Misi & AI Mobilization
- `src/lib/ai-mobilization.ts` — `generateAiMobilizationRecommendation()`: panggil OpenAI (`gpt-4o-mini`) dengan `response_format: json_schema` (`anggotaId` di tiap kandidat di-*enum*-kan ke daftar pool asli — AI **tidak bisa** mengarang personel di luar itu, hanya bisa memilih & menjelaskan dari yang diberi). Kalau `OPENAI_API_KEY` kosong atau panggilan API gagal (network/timeout/parsing), otomatis jatuh ke **fallback deterministik** (formula readiness×0.4 + jarak×0.3 + kompetensi×0.2 + jeda×0.1) — ringkasan AI di UI menandai eksplisit "mode fallback" kalau ini terjadi, supaya Operator tahu itu bukan hasil AI sungguhan
- `src/lib/misi-actions.ts` — `generateMisiAction` (buat Misi status Draft + Penugasan dari hasil AI, audit log `AI_MOBILIZATION_GENERATE`), `approveMisiAction` (Draft→Dimobilisasi, kirim `Notifikasi` ke tiap kandidat, audit log `APPROVE_MISI`), `closeMisiAction` (Dimobilisasi→Selesai + evaluasi, semua Penugasan jadi "Selesai", audit log `CLOSE_MISI`), `updateKehadiranAction` (dropdown manual per personel, audit log `UPDATE_KEHADIRAN`) — RBAC ditegakkan di tiap action (Super Admin/Operator saja), sama seperti pola Fase 5
- `BuatMisiModal` — dipasang sekali secara global di `AppShell` (bukan per-halaman), state wizard 4 langkah (form → loading → result → done) dikelola lokal, jadi tombol BUAT MISI di topbar jalan dari halaman manapun seperti di mockup. Tombol topbar sendiri sekarang digate role (Analis tidak melihatnya sama sekali, bukan cuma disembunyikan CSS)
- Menu Manajemen Misi (`/misi`): KPI row (Misi Aktif, Selesai bulan ini, rata-rata waktu berkumpul, personel termobilisasi — semua dihitung dari data asli), search+filter chip, drawer detail dengan kehadiran & tutup-misi
- Menu AI Mobilization (`/ai-mobilization`): daftar Misi Draft menunggu approval (bisa langsung disetujui dari sini juga) + kartu Parameter Model (radius/bobot) — **catatan jujur**: parameter ini masih nilai statis di kode, belum ada UI Admin untuk mengubahnya (persistensi pengaturan ditunda ke Fase 10, supaya tidak scope-creep di sini)
- **Verifikasi Playwright end-to-end dengan API sungguhan** (bukan mock OpenAI): login Operator → buka Misi Dimobilisasi yang sudah ada dari seed → ubah kehadiran salah satu personel (dropdown) → berhasil tersimpan → klik BUAT MISI di topbar → isi form → submit → **`sumber: "openai"` terkonfirmasi** (bukan fallback) → ringkasan AI menyebut nama Pemberi Perintah persis & mengutip Deskripsi Misi → 3 kandidat dengan skor/alasan (≥3 poin, mengutip angka jarak/readiness/kompetensi nyata)/ETA → Setujui & Kirim Notifikasi → kode Misi baru (`MISI-2026-XXX`) muncul di tabel → buka drawer Misi itu lagi → Tutup Misi & Evaluasi → status berubah jadi Selesai. **Nol console error** di semua langkah. Data uji dibersihkan, dev database di-reset & di-reseed ulang ke starter set bersih sebelum commit (lihat catatan izin reset di bawah)

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
- **`key` prop untuk memaksa remount komponen form yang dipakai ulang untuk create/edit**: kalau ada component dengan `useActionState` yang di-reuse untuk beberapa "target" berbeda (create vs edit-anggota-X vs edit-anggota-Y) tanpa pernah unmount, action binding bisa nyangkut ke target lama. Di Fase 6, `BuatMisiModal` dihindarkan dari masalah ini karena selalu single global instance (bukan di-reuse per-record) dan wizard state di-reset manual saat modal ditutup — tapi kalau nanti ada form Misi yang di-reuse per-record (mis. edit Misi), ingat pola ini.
- **Server Action dipanggil langsung dari client (bukan via `useActionState`+form)** untuk alur multi-step: `generateMisiAction`/`approveMisiAction`/`closeMisiAction` dipanggil sebagai fungsi async biasa di dalam `startTransition`, bukan di-bind ke `<form action>`. Ini valid untuk fungsi `"use server"` yang diimpor ke client component, dan lebih cocok untuk wizard (form → loading → result → approve) dibanding `useActionState` yang mengasumsikan satu form dengan satu hasil.
- **Prisma destructive command (`db push --force-reset`) diblokir otomatis** oleh guard Claude Code sendiri kalau dijalankan tanpa konfirmasi user eksplisit di pesan itu — ini best-practice yang sengaja tidak dilewati (bukan di-bypass pakai flag tersembunyi). Kalau perlu reset dev DB lagi nanti, minta izin dulu ke user sebelum menjalankan `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=... npx prisma db push --force-reset`.
- **OpenAI structured output (`response_format: json_schema` + `enum` pada field)** efektif untuk grounding: dengan meng-*enum*-kan `anggotaId` ke daftar kandidat asli yang dikirim, model API secara struktural tidak bisa mengembalikan personel di luar itu — divalidasi ulang juga di kode (`validIds.has(...)`) sebagai defense-in-depth, bukan cuma percaya skema.

## Langkah Selanjutnya (rekomendasi urutan)
1. Fase 7 — Analitik & Laporan (regionReadiness, KPI nasional, Laporan & Ekspor PDF/XLSX, Riwayat Mobilisasi — field `hasilEvaluasi`/`selesaiAt` sudah lengkap dari Fase 6, tinggal bikin halaman listing-nya)
2. Fase 8 — AI Chat Assistant (pola grounding OpenAI dari `ai-mobilization.ts` bisa dipakai lagi sebagai referensi)
3. Perluas seed data ke skala FRD (50-100 anggota) begitu ada modul yang benar-benar butuh melihat skala itu (Analitik terutama)
4. Fase 10 (Pengaturan) perlu balik ke AI Mobilization untuk bikin parameter model (radius/bobot) benar-benar editable & tersimpan, bukan cuma tampilan statis seperti sekarang
