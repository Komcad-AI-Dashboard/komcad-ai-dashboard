# TODO — AI Komcad Command Center Platform

Rencana kerja per fase. Setiap fase harus selesai (build jalan, fitur bisa dicoba manual) sebelum lanjut ke fase berikutnya, kecuali dicatat lain. FR-ID merujuk ke `FRD/FRD_Komcad_Digital_Platform.docx` Bab 6 & `FRD/02-functional-requirements.md`.

Centang `[x]` hanya kalau sudah benar-benar selesai & sudah dicoba jalan. Status hidup (mana yang sedang dikerjakan sekarang) ada di `PROGRESS.md`, bukan di sini.

---

## Fase 0 — Setup Proyek & Infrastruktur
- [ ] Install Node.js (lingkungan dev tidak punya Node/npm bawaan)
- [ ] `create-next-app` (TypeScript, App Router, Tailwind, ESLint) di folder `app/`
- [ ] Setup Prisma + SQLite dev, `.env` / `.env.example` (`OPENAI_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- [ ] `.gitignore` mencakup `.env`, `node_modules`, `prisma/dev.db`, `.next`
- [ ] `git init`, remote `origin` → `https://github.com/arsyiadlani/komcad-ai-dashboard.git`, commit awal, push
- [ ] Setup Tailwind theme = token warna & font di CLAUDE.md §5
- [ ] Install dependency inti: `@prisma/client`, `prisma`, `next-auth`, `zod`, `openai`, `react-leaflet`, `leaflet`, `@radix-ui/*` yang dipakai (dialog, tabs, dropdown-menu), `clsx`
- [ ] `npm run dev` jalan tanpa error, halaman default tampil

## Fase 1 — Design System & App Shell
Referensi visual: FRD §10.4, `komcad-dashboard.html` baris 1–830-an (CSS & markup shell).
- [x] Komponen dasar: Button, Badge/Pill (status color mapping), Chip, Card/Panel, Input/Select/Textarea/Label (dark style) — `src/components/ui/`
- [x] Drawer & Modal primitive (Radix Dialog based) — `src/components/ui/drawer.tsx`, `modal.tsx`
- [x] Sidebar 236px, 5 grup nav (RINGKASAN, OPERASI, DATA ANGGOTA, LAPORAN, ASISTEN, SISTEM), 13 menu sesuai `10-struktur-navigasi.md`, collapse ke 0px via ☰ (transisi width+opacity 180ms)
- [x] Topbar 52px: toggle sidebar → judul halaman+breadcrumb → indikator LIVE berdenyut → wilayah selector → tombol BUAT MISI → chip Readiness nasional → tombol MISI AKTIF (badge merah) → search → settings icon → tombol Masuk/Keluar (terhubung ke session asli)
- [x] Routing: 13 route Command Center + halaman Sisi Anggota, layout terpisah per route group
- [x] State UI sidebar-collapsed persist di localStorage (NFR-09) — panel show/hide individual (FR-24) belum, itu bagian Fase 4
- [ ] IconButton generik terpisah (saat ini masih inline per komponen) — nice-to-have, bukan blocker

## Fase 2 — Auth & RBAC
- [x] Auth.js (NextAuth v5) Credentials provider, session JWT, halaman login (styling gelap sesuai brand) — `src/lib/auth.ts`, `src/app/login/`
- [x] Model `User` + `Role` (Super Admin, Operator Komcad, Analis/Evaluator, Anggota Komcad) — sudah ada di `prisma/schema.prisma` sejak Fase 0
- [x] Proxy/middleware proteksi route per role (`src/proxy.ts`): unauthenticated → `/login`; ANGGOTA terkunci ke `/m/*`; role lain terkunci ke Command Center — diverifikasi end-to-end (login benar/salah, redirect per role, sign-out)
- [x] Seed user demo per role untuk testing (lihat Fase 3 — satu seed script yang sama)
- [ ] Analis read-only di Misi aktif — belum relevan, menunggu UI Misi (Fase 6) benar-benar ada aksi tulis untuk dibatasi

## Fase 3 — Data Layer (Prisma Schema + Seed)
Entitas dari FRD §9.1 + `09-data-dummy.md` (baca dulu isi file itu kalau ada, atau derive dari mockup jika file belum lengkap).
- [x] Model: `Anggota`, `ProfilDemografi`, `Lokasi`(riwayat titik), `Sertifikasi`, `Pelatihan`, `Misi`, `Penugasan`, `ReadinessScoreHistory`, `AktivitasPelatihan`, `Notifikasi`, `AuditLog`, `User` — schema lengkap sejak Fase 0
- [x] Field sensitif (NIK, kontak, sosial media) ditandai jelas di schema/comment sebagai data pribadi (NFR-05)
- [x] Seed script starter: 4 user demo (satu per role) + 20 anggota dummy tersebar 8 provinsi, sertifikasi bervariasi status, 2 aktivitas pelatihan, 2 Misi contoh (Selesai & Dimobilisasi) dengan Penugasan — `prisma/seed.ts`
- [ ] **Belum**: perluas ke 50–100 anggota (target FRD) — starter set 20 sudah cukup untuk uji UI, tapi belum representatif skala
- [ ] Util `calculateReadinessScore(anggota)` — belum ada, saat ini `readinessScore` di seed cuma angka acak, bukan hasil kalkulasi. Formula placeholder terdokumentasi sebagai asumsi (FRD §11)

## Fase 4 — Modul Overview & Peta Situasi (FR-17 s.d. FR-25)
- [x] Peta Leaflet + OpenStreetMap + filter CSS tactical dark, `maxBounds` Indonesia (§10.5) — react-leaflet, dynamic import `ssr:false`
- [x] Marker anggota (siap=hijau, siaga=amber), zona Misi (radius per urgensi), pos komando (ikon gold)
- [x] Panel Layers kiri-atas (checkbox toggle tanpa reload) — FR-18
- [x] Mode layar penuh peta (invalidateSize otomatis via ResizeObserver, bukan cuma trigger manual) — FR-19
- [x] Panel Aktivitas Pelatihan Terbaru kanan-atas, scrollable, klik → drawer — FR-20
- [x] 3 panel bawah urutan tetap: Statistik Anggota (FR-21), Misi Terbaru (FR-22), AI Mobilization (FR-23) — data agregat asli dari Prisma, bukan hardcode
- [x] Show/hide panel individual (tombol "−" → chip "+ Nama") — FR-24
- [x] Show/hide semua panel sekaligus (situation bar) — FR-25
- [x] Diverifikasi dengan Playwright (browser headless sungguhan, bukan cuma curl): tiles peta termuat, klik marker membuka drawer, toggle panel individual jalan, nol console error
- [x] Klik marker anggota di peta membuka Drawer ringkas; profil CV lengkap sekarang ada tapi cuma dari menu Direktori Anggota (Fase 5) — drawer dari peta belum diarahkan ke CV lengkap, masih versi ringkas (nice-to-have, bukan blocker)
- [x] Ringkasan AI di panel bawah kini terisi nyata — `Misi.ringkasanAI` diisi oleh AI Mobilization (Fase 6) begitu Misi dibuat lewat modal Buat Misi
- [ ] Klik zona Misi di peta masih membuka Drawer ringkas — drawer detail Misi penuh (dengan rekomendasi AI) sudah ada, tapi cuma di menu Manajemen Misi (Fase 6); drawer dari peta belum diarahkan otomatis ke sana (nice-to-have, bukan blocker)

## Fase 5 — Modul Manajemen Data Anggota (FR-01 s.d. FR-07)
- [x] Direktori Anggota: tabel, search, filter status, bar Readiness Score — FR-01, FR-04
- [x] Drawer Profil CV Anggota: foto (placeholder siluet SVG), data pribadi, tautan WA/Email/IG/LinkedIn (LinkedIn/Instagram pakai ikon generik — lucide-react versi terpasang tidak lagi menyertakan ikon brand), kompetensi (chip, diturunkan dari daftar jenis Sertifikasi karena skema tidak punya field kompetensi terpisah), sertifikasi, riwayat pelatihan, riwayat penugasan — FR-02
- [x] Peta Overview terhubung ke perubahan status siaga (FR-03, FR-07) — kontrol ubah status ada di drawer CV (Admin/Operator), `revalidatePath` bikin Overview ikut ter-update di load berikutnya. **Catatan jujur**: ini refresh-on-navigate, BUKAN push real-time ≤5 detik seperti diminta acceptance criteria FR-07 — perlu polling/websocket kalau mau benar-benar real-time, ditunda ke Fase 12 (NFR)
- [x] Menu Kompetensi & Sertifikasi: tabel status (Aktif/Akan Kedaluwarsa/Kedaluwarsa), status dihitung otomatis dari `tanggalBerlaku` tiap kali di-query (bukan dipercaya dari kolom tersimpan) — FR-06. Reminder H-30 terwakili lewat status "Akan Kedaluwarsa" otomatis; belum ada notifikasi terpisah (belum ada sistem notifikasi in-app sampai Fase 6/8)
- [x] Menu Riwayat Pelatihan: tabel riwayat + status kelulusan
- [x] CRUD Anggota (Admin/Operator) dengan audit log (timestamp + user pelaku otomatis lewat `AuditLog`), validasi NIK 16 digit (Zod regex) — FR-01. RBAC ditegakkan DI SERVER ACTION (bukan cuma sembunyi tombol di UI) — Analis dapat pesan error kalau nekat manggil action-nya langsung
- [x] Diverifikasi dengan Playwright: search/filter, buka drawer, ubah status siaga, edit, **create anggota baru** — nemu & benerin 1 bug nyata (lihat catatan bug di PROGRESS.md)

## Fase 6 — Modul Manajemen Misi & AI Mobilization (FR-08 s.d. FR-16)
Ini modul paling kompleks — AI-nya benar-benar generate, bukan hardcode.
- [x] Modal "Buat Misi" (global, dibuka dari tombol BUAT MISI di topbar via `AppShell`): Pemberi Perintah, Jenis Kejadian (dropdown), Urgensi (dropdown), Lokasi (dropdown dari `lib/wilayah.ts`, bukan teks bebas — lihat catatan di bawah), Deskripsi Misi (textarea), Kebutuhan Personel — FR-08. Hanya tampil untuk Super Admin/Operator (Analis read-only, akhirnya ditegakkan di sini)
- [x] `generateMisiAction` (`lib/misi-actions.ts`): query kandidat dari DB (`getKandidatPool` — anggota Aktif/Siaga terdekat by Haversine) → panggil OpenAI (`lib/ai-mobilization.ts`, model `gpt-4o-mini`, `response_format: json_schema` dengan `anggotaId` di-enum ke pool asli) untuk skoring+ringkasan+alasan grounded — FR-09, FR-10. **Fallback deterministik** (skor dari formula readiness/jarak/kompetensi/jeda) otomatis aktif kalau `OPENAI_API_KEY` kosong atau panggilan API gagal — diuji manual keduanya, ringkasan menandai "mode fallback" secara eksplisit di UI, tidak pernah gagal total
- [x] ETA dihitung deterministik (bukan dari AI) via Haversine + asumsi kecepatan 40 km/jam (`lib/geo.ts`) — FR-11
- [x] State loading "AI Mobilization sedang menganalisis..." selama request OpenAI asli berjalan (bukan simulasi setTimeout) — FR-09
- [x] Approval "Setujui & Kirim Notifikasi" (`approveMisiAction`) → Misi Draft→Dimobilisasi, buat `Notifikasi` per kandidat — FR-12, FR-13. **Catatan**: `kodeMisi` (`MISI-{tahun}-{urutan}`) di-generate saat submit form (bukan saat approval) supaya field unique di skema selalu terisi sejak status Draft — beda kecil dari urutan di mockup, didokumentasikan di sini
- [x] Menu Manajemen Misi (`/misi`): KPI row + tabel + search + filter chip (Semua/Kritis/Tinggi/Selesai), drawer detail lengkap (info Misi + Ringkasan AI + daftar kandidat+alasan+ETA) — FR-14
- [x] Pemantauan kehadiran: dropdown status per personel (Menunggu Respons/Dikonfirmasi/Ditolak/Hadir/Selesai) di drawer Misi Dimobilisasi, via `updateKehadiranAction` — FR-15. **Catatan jujur**: ini kontrol manual Operator, BUKAN respons real dari Anggota via app mobile (menyusul Fase 11)
- [x] Tombol "Tutup Misi & Evaluasi" (status Dimobilisasi saja) → form catatan evaluasi → `closeMisiAction` set status Selesai, `selesaiAt`, semua Penugasan jadi "Selesai" — otomatis akan muncul di Riwayat Mobilisasi begitu Fase 7 dibangun (field-nya sudah benar di DB, halaman listnya menyusul) — FR-16
- [x] Menu AI Mobilization terpisah (`/ai-mobilization`): daftar Misi Draft menunggu approval + tombol approve langsung dari sini, plus kartu "Parameter Model" (radius 25km, bobot Readiness 40%/jarak 35%/kompetensi 25%). **Belum**: parameter ini masih nilai tampilan statis dari kode, belum ada UI untuk Admin mengubah & menyimpannya — butuh tabel pengaturan baru, ditunda ke Fase 10 (Modul Sistem → Pengaturan) supaya tidak scope-creep di sini
- [ ] **Simplifikasi yang perlu diketahui**: field "Lokasi" di form Buat Misi memakai dropdown 8 kota referensi (`lib/wilayah.ts`, sama dengan sebaran provinsi seed), bukan input teks bebas + geocoding sungguhan — dibutuhkan supaya tiap Misi punya koordinat pasti untuk kalkulasi jarak/ETA. Produksi: ganti dengan geocoding API alamat bebas teks
- [x] Diverifikasi dengan Playwright end-to-end sungguhan (bukan mock): login Operator → buka drawer Misi Dimobilisasi & ubah kehadiran → BUAT MISI lewat topbar → submit form → **OpenAI beneran dipanggil** (bukan fallback) → ringkasan AI menyebut Pemberi Perintah & kutip Deskripsi Misi persis → 3 kandidat dengan skor/alasan/ETA nyata → Setujui & Kirim Notifikasi → ID Misi baru muncul di tabel → Tutup Misi + evaluasi → status jadi Selesai. Nol console error di semua langkah. Data uji dihapus, dev DB direset & di-reseed ulang ke starter set bersih sebelum commit

## Fase 7 — Modul Analitik & Laporan (FR-26 s.d. FR-28)
- [x] Dashboard Analitik (`/analitik`): KPI Readiness nasional, Misi selesai 30 hari, sertifikasi kedaluwarsa (dihitung ulang dari `tanggalBerlaku`, bukan kolom stale — konsisten dengan pola FR-06) — FR-26. **Adaptasi jujur**: kartu "UPTIME SISTEM" di mockup diganti "AI MOBILIZATION UPTIME" dan dihitung dari data nyata (`AuditLog` aksi `AI_MOBILIZATION_GENERATE`, persentase `sumber: "openai"` vs fallback) — tidak ada monitoring infrastruktur sungguhan di app ini untuk uptime server beneran, jadi dipakai metrik nyata yang memang tersedia daripada angka hardcode
- [x] Bar Readiness Score per wilayah (provinsi, dari `ProfilDemografi`), diurutkan skor tertinggi ke rendah — data live tiap kali halaman dibuka (refresh-on-navigate, sama seperti pola FR-07/FR-26 acceptance "ter-refresh otomatis")
- [x] Laporan & Ekspor (`/laporan`): 3 laporan siap unduh (Laporan Kesiapsiagaan Nasional & Evaluasi AI Mobilization = PDF via `pdfkit`, Rekap Mobilisasi = XLSX via `exceljs`) + form "Buat Laporan Baru" filter Per Wilayah/Per Misi/Per Periode (XLSX) — FR-27. **File digenerate ASLI dari data Prisma saat tombol Unduh diklik** (bukan file dummy statis dari mockup), lewat Route Handler `src/app/api/laporan/*`. RBAC: unduh dibatasi Super Admin & Analis (sesuai kolom Aktor FR-27 di FRD — Operator tidak eksplisit disebut, jadi tidak diberi akses unduh; halaman tetap bisa dibuka tapi tombol nonaktif dengan penjelasan)
- [x] Riwayat Mobilisasi (`/riwayat`): tabel historis Misi berstatus Selesai, terurut `selesaiAt` terbaru, kolom evaluasi dari `closeMisiAction` Fase 6 — FR-28
- [x] **Catatan teknis penting**: `pdfkit` awalnya gagal di runtime (Turbopack membungkus route handler sehingga `__dirname` jadi path virtual, file font `.afm` bawaan pdfkit tidak ketemu → 500 error). Diperbaiki dengan `serverExternalPackages: ["pdfkit"]` di `next.config.ts` supaya Next me-require paket ini langsung dari `node_modules` asli, bukan di-bundle. Kalau nanti ada paket lain yang punya asset non-JS dibaca via `fs` relatif ke `__dirname` (native binding, font, dsb), ingat pola ini
- [x] Diverifikasi dengan Playwright: login Analis → buka Analitik (KPI & bar wilayah tampil benar) → Riwayat (tabel Misi Selesai) → Laporan & Ekspor → **unduh ketiga laporan tetap (PDF/XLSX) sungguhan berhasil dengan ukuran file wajar** → isi & submit form Buat Laporan Baru (Per Wilayah) → file XLSX custom ter-unduh. Nol console error. PDF hasil unduh dibaca ulang manual untuk pastikan teksnya benar & tidak corrupt (bukan cuma cek ukuran byte)

## Fase 8 — Modul AI Chat Assistant (FR-29 s.d. FR-32)
- [ ] UI chat: bubble kiri/kanan, indikator mengetik (~700ms), chip pertanyaan cepat, percakapan awal pre-filled — FR-29
- [ ] Backend: query DB dulu (jumlah anggota per kondisi, agregasi) → susun context → OpenAI merangkai jawaban natural + tabel/bar mini — FR-30, FR-31
- [ ] Jawaban ≤2 detik dari sisi UX (indikator mengetik menutupi latency nyata)
- [ ] Fallback jawaban tak dikenali → arahkan ke menu/kategori pertanyaan terkait, tidak pernah blank — FR-32

## Fase 9 — Modul Guideline (FR-33 s.d. FR-36)
- [ ] Tab Panduan Pengguna: kartu instruksional bertahap (alur BUAT MISI, alur kelola anggota) — FR-33
- [ ] Tab FAQ: minimal 5 pertanyaan — FR-34
- [ ] Tab Modul: kartu per modul (judul, badge Aktif/Beta, deskripsi ≥3 kalimat, chip fitur) — FR-35
- [ ] Navigasi 3 tab tanpa reload, konten disembunyikan bukan dihapus dari DOM — FR-36

## Fase 10 — Modul Sistem
- [ ] Pengguna & Role: kelola daftar user Command Center + role
- [ ] Pengaturan: preferensi notifikasi & preferensi peta

## Fase 11 — Sisi Anggota (Mobile Web) (FR-37 s.d. FR-40)
Referensi: `komcad-sisi-anggota-mobile.html`.
- [ ] Layout mobile shell (header, bottom nav/screen switcher, phone-width max 430px responsive)
- [ ] Portal Profil Pribadi: lihat & lengkapi profil, kompetensi, kontak, sosial media — FR-37 (perubahan data sensitif butuh approval Admin)
- [ ] Riwayat Pelatihan & Penugasan Pribadi, data isolation (hanya milik sendiri) — FR-38
- [ ] Status Kesiapan Pribadi: ring Readiness Score, ubah status Aktif/Siaga/Tidak Tersedia, sync real-time ke peta Overview — FR-39
- [ ] Notifikasi & Respons Mobilisasi: konfirmasi/tolak, tercatat & terlihat Operator ≤1 menit — FR-40

## Fase 12 — Non-Functional Requirements
- [ ] Audit log immutable untuk approval Misi, perubahan data anggota, keputusan AI — NFR-08
- [ ] RBAC granular + enkripsi field sensitif at-rest (minimal untuk NIK) — NFR-04
- [ ] Retry/fallback channel notifikasi (push → in-app sebagai simulasi SMS) — NFR-07
- [ ] Aksesibilitas: kontras WCAG AA, target klik ≥30×30px, badge status selalu ada label teks — §10.8
- [ ] Performance check: Overview load ≤2 detik (dev), tidak ada layout shift besar

## Fase 13 — Testing, QA, Deployment Prep
- [ ] Smoke test manual seluruh 13 menu Command Center + 5 screen Sisi Anggota
- [ ] Cek alur end-to-end: Buat Misi → Generate AI → Setujui & Kirim → muncul di Manajemen Misi & Overview → Tutup Misi → muncul di Riwayat Mobilisasi (§14.1)
- [ ] README.md di root `app/` untuk onboarding developer baru
- [ ] Catatan deployment: migrasi SQLite → Postgres, hosting target (belum diputuskan — TBD bareng user)

---

## Backlog / Perlu Klarifikasi User (jangan asumsikan sendiri saat sampai sini)
- Formula final Readiness Score & bobot AI Mobilization (radius, %Readiness/jarak/kompetensi)
- Provider notifikasi SMS/push produksi
- Kebijakan retensi data pasca-nonaktif keanggotaan
- Target hosting/deployment (Vercel? on-prem Kemenhan/TNI?) — relevan karena data ini sensitif secara keamanan nasional
