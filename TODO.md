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
- [ ] Komponen dasar: Button, Badge/Pill (status color mapping), Chip, IconButton, Card/Panel, Input/Select/Textarea (dark style)
- [ ] Sidebar 236px, 5 grup nav (RINGKASAN, OPERASI, DATA ANGGOTA, LAPORAN, ASISTEN, SISTEM), 13 menu sesuai `10-struktur-navigasi.md`, collapse ke 0px via ☰ (transisi width+opacity 180ms)
- [ ] Topbar 52px: toggle sidebar → judul halaman+breadcrumb → indikator LIVE berdenyut → wilayah selector → tombol BUAT MISI → chip Readiness nasional → tombol MISI AKTIF (badge merah) → search → settings icon → tombol Masuk
- [ ] Routing: 13 route Command Center + halaman Sisi Anggota, layout terpisah per route group
- [ ] State UI sidebar-collapsed & panel show/hide persist di localStorage (NFR-09)

## Fase 2 — Auth & RBAC
- [ ] Auth.js Credentials provider, session JWT, halaman login (styling gelap sesuai brand)
- [ ] Model `User` + `Role` (Super Admin, Operator Komcad, Analis/Evaluator, Anggota Komcad)
- [ ] Middleware proteksi route per role (Command Center vs Sisi Anggota; Analis read-only di Misi aktif)
- [ ] Seed user demo per role untuk testing

## Fase 3 — Data Layer (Prisma Schema + Seed)
Entitas dari FRD §9.1 + `09-data-dummy.md` (baca dulu isi file itu kalau ada, atau derive dari mockup jika file belum lengkap).
- [ ] Model: `Anggota`, `ProfilDemografi`, `Lokasi`(riwayat titik), `Sertifikasi`, `Pelatihan`, `Misi`, `Penugasan`, `ReadinessScoreHistory`, `AktivitasPelatihan`, `Notifikasi`, `AuditLog`, `User`
- [ ] Field sensitif (NIK, kontak, sosial media) ditandai jelas di schema/comment sebagai data pribadi (NFR-05)
- [ ] Seed script: minimal 50–100 anggota dummy tersebar provinsi, sertifikasi bervariasi status, beberapa Misi contoh (draft/dimobilisasi/selesai), aktivitas pelatihan
- [ ] Util `calculateReadinessScore(anggota)` — formula placeholder terdokumentasi sebagai asumsi (FRD §11)

## Fase 4 — Modul Overview & Peta Situasi (FR-17 s.d. FR-25)
- [ ] Peta Leaflet + OpenStreetMap + filter CSS tactical dark, `maxBounds` Indonesia (§10.5)
- [ ] Marker anggota (siap=hijau, siaga=amber), zona Misi (radius per urgensi), pos komando (ikon gold)
- [ ] Panel Layers kiri-atas (checkbox toggle tanpa reload) — FR-18
- [ ] Mode layar penuh peta (⛶/✕, invalidateSize ≤300ms) — FR-19
- [ ] Panel Aktivitas Pelatihan Terbaru kanan-atas, scrollable, klik → drawer — FR-20
- [ ] 3 panel bawah urutan tetap: Statistik Anggota (FR-21), Misi Terbaru (FR-22), AI Mobilization (FR-23)
- [ ] Show/hide panel individual (tombol "−" → chip "+ Nama") — FR-24
- [ ] Show/hide semua panel sekaligus (situation bar) — FR-25

## Fase 5 — Modul Manajemen Data Anggota (FR-01 s.d. FR-07)
- [ ] Direktori Anggota: tabel, search, filter status, bar Readiness Score — FR-01, FR-04
- [ ] Drawer Profil CV Anggota: foto (placeholder siluet SVG), data pribadi, tautan WA/Email/IG/LinkedIn, kompetensi (chip), sertifikasi, riwayat pelatihan, riwayat penugasan — FR-02, dibuka ≤300ms
- [ ] Peta Overview terhubung ke perubahan status siaga (FR-03, FR-07) — update marker ≤5 detik
- [ ] Menu Kompetensi & Sertifikasi: tabel status (Aktif/Akan Kedaluwarsa/Kedaluwarsa), reminder H-30 — FR-06
- [ ] Menu Riwayat Pelatihan: tabel riwayat + status kelulusan
- [ ] CRUD Anggota (Admin/Operator) dengan audit log (timestamp + user pelaku), validasi NIK 16 digit — FR-01

## Fase 6 — Modul Manajemen Misi & AI Mobilization (FR-08 s.d. FR-16)
Ini modul paling kompleks — AI-nya benar-benar generate, bukan hardcode.
- [ ] Modal "Buat Misi": Pemberi Perintah, Jenis Kejadian (dropdown), Urgensi (dropdown), Lokasi, Deskripsi Misi (textarea) — FR-08
- [ ] Server Action / route handler: query kandidat dari DB (filter jarak/status/sertifikasi) → panggil OpenAI untuk skoring+ringkasan+alasan (grounded, bukan LLM mengarang personel) — FR-09, FR-10
- [ ] Hitung ETA per kandidat (jarak Haversine dari lokasi anggota ke lokasi Misi / kecepatan asumsi) — FR-11
- [ ] State loading ("AI Mobilization sedang menganalisis...") ≤ mockup 1.5 detik simulasi, target produksi ≤30 detik
- [ ] Approval "Setujui & Kirim Notifikasi" → generate ID Misi `MISI-{tahun}-{urutan}`, catat Penugasan, kirim Notifikasi — FR-12, FR-13
- [ ] Menu Manajemen Misi: tabel + search + filter chip (Semua/Kritis/Tinggi/Selesai), drawer detail — FR-14
- [ ] Pemantauan kehadiran & progres personel dalam drawer Misi — FR-15
- [ ] Penutupan Misi + form evaluasi → masuk Riwayat Mobilisasi otomatis — FR-16
- [ ] Menu AI Mobilization terpisah: parameter model (bobot Readiness/jarak/kompetensi, radius default 25km) dapat diatur Admin

## Fase 7 — Modul Analitik & Laporan (FR-26 s.d. FR-28)
- [ ] Dashboard Analitik: KPI Readiness nasional, Misi selesai 30 hari, sertifikasi kedaluwarsa, uptime — FR-26
- [ ] Bar Readiness Score per wilayah (horizontal, terurut)
- [ ] Laporan & Ekspor: daftar laporan + generate PDF/XLSX + form filter Wilayah/Misi/Periode — FR-27
- [ ] Riwayat Mobilisasi: tabel historis Misi selesai + evaluasi — FR-28

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
