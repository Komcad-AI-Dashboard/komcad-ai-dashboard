# SIAGA — Sistem Identifikasi, Analitik & Gerak Anggota

Dashboard AI untuk Komponen Cadangan (Komcad) di bawah Kemenhan/Mabes TNI. Aplikasi Next.js tunggal dengan dua sisi: **Command Center** (desktop, Super Admin/Operator/Analis) dan **Sisi Anggota** (mobile web, Anggota Komcad).

> **Nama produk = SIAGA. Nama program = Komcad.** Keduanya beda dan tidak saling menggantikan: "Komcad" tetap dipakai untuk entitas domain (Anggota Komcad, Operator Komcad, `@komcad.mil.id`, nama unit). Jangan cari-ganti buta.

> Baca [`../CLAUDE.md`](../CLAUDE.md) dulu untuk konteks arsitektur & keputusan teknis lengkap, lalu [`../PROGRESS.md`](../PROGRESS.md) untuk status pengerjaan terkini. File ini (`README.md`) fokus ke "cara menjalankan & mengembangkan", bukan riwayat keputusan.

## Prasyarat

- Node.js 20+ dan npm
- Database Postgres (Neon direkomendasikan, tier gratis cukup untuk dev & demo) — sejak deploy ke Vercel, dev **dan** prod sama-sama Postgres, bukan lagi SQLite lokal. Pakai branch/project Neon terpisah untuk dev vs prod supaya data uji tidak bercampur

## Setup Pertama Kali

```bash
npm install
cp .env.example .env
# edit .env: isi DATABASE_URL (connection string Neon — dashboard Neon > Connect > Prisma),
# OPENAI_API_KEY (AI Mobilization & AI Chat), dan ENCRYPTION_KEY
# generate ENCRYPTION_KEY dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# generate AUTH_SECRET dengan:    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npx prisma migrate dev --name init   # bikin tabel di Postgres + riwayat migrasi (sekali di awal)
npm run db:seed                       # isi 60 anggota dummy + 4 user demo + 3 contoh Misi
npm run dev                            # http://localhost:3000
```

`npm run db:push` (tanpa riwayat migrasi) masih ada dan valid untuk iterasi schema cepat saat dev, tapi begitu schema dianggap stabil, tetap butuh `prisma migrate dev` supaya migrasinya bisa dipakai `migrate deploy` di prod (lihat bagian Deployment).

Kalau `localhost:3000` tidak resolve di mesin kamu, coba `http://127.0.0.1:3000` — tapi perhatikan: Next dev di Next.js 16 memblokir cross-origin dev resource secara default untuk origin yang bukan `localhost` (lihat warning `allowedDevOrigins` di terminal). Paling aman selalu akses lewat `localhost`, bukan `127.0.0.1`, kecuali kamu tambahkan origin itu ke `allowedDevOrigins` di `next.config.ts`.

## Akun Demo

Password sama untuk semua: **`komcad123`**

| Email | Role | Diarahkan ke |
|---|---|---|
| admin@komcad.mil.id | Super Admin | Command Center — akses penuh |
| operator@komcad.mil.id | Operator Komcad | Command Center — kelola Misi & data anggota |
| analis@komcad.mil.id | Analis/Evaluator | Command Center — baca-saja, tanpa Buat Misi |
| anggota@komcad.mil.id | Anggota Komcad | Sisi Anggota (`/m`) |

Semua data (nama, NIK, kontak, dsb.) adalah **data dummy**, bukan data personel TNI/Komcad sungguhan.

## Perintah yang Tersedia

```bash
npm run dev         # dev server, Turbopack
npm run build        # production build
npm run start         # jalankan hasil build
npm run lint          # ESLint
npx tsc --noEmit      # typecheck (tidak ada script npm terpisah untuk ini)

npm run db:push       # sync schema.prisma -> dev.db (non-destruktif kalau tidak ada breaking change)
npm run db:seed       # isi data dummy — HANYA untuk database kosong, lihat catatan di bawah
npm run db:studio     # buka Prisma Studio (browser UI ke isi database)

npm run db:misi-bencana     # tambah Misi bencana ke database yang SUDAH terisi (aman diulang)
npm run db:hapus-misi-lama  # hapus Misi demo lama (daftar kodenya eksplisit di skripnya)
```

**`db:seed` hanya untuk database kosong.** Seed tidak menghapus apa pun, jadi menjalankannya ke database yang sudah terisi akan gagal menabrak constraint unik anggota/user. Untuk mengubah data di database terisi, pakai dua skrip perawatan di atas.

**Menyasarkan skrip perawatan ke database lain** (mis. staging atau produksi yang berbeda dari `.env` lokal) — pakai `TARGET_DATABASE_URL`, **jangan** menimpa `DATABASE_URL`:

```bash
TARGET_DATABASE_URL="postgresql://..." npm run db:misi-bencana
```

Alasannya: Prisma memuat `.env` otomatis, jadi menimpa `DATABASE_URL` lewat shell mudah tertukar antara database lokal dan database deployment — berbahaya untuk skrip yang menghapus. Karena itu dipakai nama variabel terpisah yang tidak mungkin bentrok, dan skripnya selalu mencetak host tujuan sebelum bertindak. Baca baris itu dan pastikan benar sebelum membiarkannya lanjut.

**Reset penuh database dev** (kalau schema berubah dengan cara yang butuh drop kolom/tabel, atau data uji perlu dibersihkan):

```bash
npx prisma db push --force-reset
npm run db:seed
```

`--force-reset` **menghapus semua data** di database yang ditunjuk `DATABASE_URL` saat itu. Kalau kamu menjalankan ini lewat AI coding agent (Claude Code dkk), agent akan/harus minta konfirmasi eksplisit dulu sebelum menjalankan — ini bukan perintah yang aman dijalankan tanpa sadar. **Pastikan `.env` menunjuk ke branch/project Neon dev, bukan yang dipakai deployment publik** — kalau `DATABASE_URL` kebetulan menunjuk ke database demo yang sedang diakses orang lain, perintah ini akan menghapus data mereka juga. Untuk database yang sudah dipakai (demo publik atau produksi sungguhan), **jangan pernah** pakai `--force-reset` — pakai `prisma migrate deploy` (lihat bagian Deployment di bawah).

## Testing

Tidak ada test runner otomatis (Jest/Vitest) yang terpasang — verifikasi selama pengembangan dilakukan manual lewat **Playwright** (sudah ada di `devDependencies`) yang dijalankan sebagai script sekali-pakai, bukan suite test permanen. Kalau perlu verifikasi ulang sebuah alur:

```js
// contoh: script sekali-pakai, jalankan dengan `node nama-file.mjs` dari folder app/
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/login");
// ... isi form, klik, assert lewat page.locator(...).innerText(), dst.
```

Pola yang dipakai selama pengembangan (lihat `PROGRESS.md` per-fase untuk detail): login per role → jalankan alur → cek `page.on("console", ...)` untuk error → screenshot kalau perlu debug visual → **selalu reset & reseed `dev.db`** setelah test yang menulis data supaya starter set tetap bersih untuk sesi berikutnya.

Smoke test manual minimum sebelum menganggap sebuah perubahan selesai: buka sebagai Super Admin, Operator, Analis, dan Anggota — pastikan tidak ada console error di halaman yang disentuh perubahan itu.

## Struktur Kode Penting

```
src/
├── app/
│   ├── (command)/     # 13 menu Command Center — masing-masing route punya layout sidebar+topbar
│   ├── m/              # Sisi Anggota (mobile web) — layout terpisah, phone-width shell
│   ├── login/           # halaman + Server Action login
│   └── api/laporan/    # Route Handler untuk unduh PDF/XLSX (generate on-demand, bukan file statis)
├── components/         # UI per modul, dikelompokkan per domain (misi/, anggota/, overview/, m-shell/, dst.)
├── lib/                 # Server-only: data-fetcher Prisma (*-data.ts), Server Action (*-actions.ts),
│                         # integrasi OpenAI, kripto NIK (crypto.ts), audit log, auth
└── proxy.ts             # RBAC route-level (Next 16 mengganti nama middleware.ts -> proxy.ts)
```

**Aturan penting kalau menambah kode baru** (dilanggar sekali di Fase 12, jadi ditulis eksplisit di sini): file `lib/*-data.ts` berisi `import { prisma }` di baris atas dan dieksekusi utuh begitu diimpor — **client component (`"use client"`) tidak boleh melakukan value-import (non-`type`) dari file itu**, walau cuma untuk satu fungsi util murni di dalamnya, karena seluruh modul (termasuk Prisma) ikut ter-bundle ke browser dan Prisma Client akan melempar error runtime di sana. Dari client component, cuma `import type { ... } from "@/lib/xxx-data"` yang aman; util murni yang dipakai bersama server & client harus tinggal di file terpisah tanpa dependensi Prisma (lihat `src/lib/usia.ts`).

## Environment Variables

Lihat `.env.example` untuk daftar lengkap dengan komentar. Ringkasan:

| Variable | Untuk apa |
|---|---|
| `DATABASE_URL` | Prisma — connection string Postgres (Neon). Pakai branch/project **berbeda** untuk dev lokal vs deployment publik |
| `AUTH_SECRET` | Auth.js (NextAuth) — tanda tangan JWT session. **Generate nilai baru khusus untuk tiap environment** (dev/demo publik/prod), jangan pakai ulang |
| `NEXTAUTH_URL` | Base URL aplikasi (dipakai Auth.js untuk redirect callback). Di Vercel: URL deployment sungguhan (mis. `https://siaga-xxx.vercel.app`), bukan `localhost` |
| `OPENAI_API_KEY` | AI Mobilization (FR-09/10) & AI Chat (FR-30/31). Kalau kosong/invalid, kedua fitur otomatis jatuh ke fallback deterministik — **tidak pernah blank/error**, cuma kehilangan kualitas ranking/jawaban natural |
| `ENCRYPTION_KEY` | Enkripsi at-rest NIK (NFR-04), 32 byte hex. **Wajib diisi** — server akan throw runtime error saat menyentuh data NIK kalau kosong |

## Deployment

Ada dua skenario berbeda di bawah ini — **jangan tertukar**:

1. **Demo publik** (bagian ini) — deploy dengan data dummy yang sudah ada, supaya orang lain bisa membuka & mencoba dashboard-nya. Ini yang sedang berjalan sejak Fase 15+.
2. **Rilis produksi sungguhan** dengan data personel TNI/Komcad asli — keputusan terpisah yang jauh lebih berat (klasifikasi data, hosting, retensi), lihat sub-bagian "Rilis Produksi Sungguhan" di bawah. **Belum dilakukan, dan tidak boleh diasumsikan sendiri kapan itu terjadi.**

### Demo Publik: Vercel + Neon Postgres

Schema (`prisma/schema.prisma`) sudah di-set ke provider `postgresql`. Dev lokal sekarang juga memakai Postgres (bukan lagi SQLite) — lihat "Setup Pertama Kali" di atas.

**1. Provisikan database (Neon)**
- Buat akun di [neon.tech](https://neon.tech) (free tier cukup untuk demo)
- Buat project baru, misal nama `siaga` — Neon otomatis membuatkan **dua branch**: `production` (default) dan `main`. Pakai `production` untuk demo publik (Vercel), `main` untuk dev lokal — supaya `prisma db push --force-reset` yang dijalankan saat iterasi lokal tidak pernah menyentuh data yang sedang diakses orang lain. (Kalau versi Neon kamu cuma bikin satu branch, buat satu lagi manual lewat tombol **New Branch**.)
- Ambil connection string tiap branch: klik branch itu → **Connect** → tab **Postgres database** → connection string yang tampil (dengan `-pooler` di hostname, `Connection pooling` menyala) itu yang dipakai — Neon versi terbaru tidak lagi punya dropdown preset per-framework ("Prisma"/"Next.js"), cuma satu connection string generik yang sudah cocok dipakai Prisma apa adanya
- **`DATABASE_URL_UNPOOLED` / `directUrl` tidak perlu diisi** — itu cuma relevan untuk Prisma <5.10, sedangkan repo ini pakai Prisma 6. `schema.prisma` sudah benar apa adanya (satu `url = env("DATABASE_URL")`, tanpa `directUrl`), jangan diubah

**2. Push kode ke GitHub**

Repo ini sudah terhubung ke `https://github.com/Komcad-AI-Dashboard/komcad-ai-dashboard.git` — pastikan branch `main` sudah ter-push (lihat riwayat commit terakhir).

> Repo sempat dipindah dari akun pribadi `arsyiadlani` ke organization `Komcad-AI-Dashboard` supaya app **GitHub for Atlassian** bisa menyambungkannya ke Jira (app itu dibangun untuk organization, tidak mendukung repo di akun pribadi). GitHub membuat redirect otomatis dari URL lama, jadi clone/remote lama tetap jalan — tapi sebaiknya `git remote set-url` ke URL baru. Setelah transfer, koneksi Git di Vercel perlu disambungkan ulang dan **Vercel GitHub App harus diberi akses ke repo itu di organization-nya**, kalau tidak push tidak akan memicu deployment sama sekali.

**3. Buat project di Vercel**
- Buat akun di [vercel.com](https://vercel.com), **Add New Project**, import repo `komcad-ai-dashboard` dari GitHub
- **Root Directory**: set ke `app` (kode Next.js ada di subfolder `app/`, bukan di root repo) — ini wajib diisi manual, Vercel tidak selalu mendeteksinya otomatis
- Framework Preset akan otomatis terdeteksi "Next.js" — biarkan default

**4. Set Environment Variables** (Project Settings → Environment Variables, isi untuk Production)

| Variable | Nilai |
|---|---|
| `DATABASE_URL` | Connection string branch Neon `production` (dari langkah 1) |
| `AUTH_SECRET` | Generate baru: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` — **jangan pakai nilai dev** |
| `NEXTAUTH_URL` | Isi setelah deploy pertama berhasil dan kamu tahu domain Vercel-nya (mis. `https://siaga-xxx.vercel.app`), lalu redeploy |
| `OPENAI_API_KEY` | Key OpenAI kamu. Kalau belum ada/mau hemat kuota untuk demo publik, boleh dikosongkan — AI Mobilization & AI Chat otomatis jatuh ke fallback deterministik, tidak pernah blank/error |
| `ENCRYPTION_KEY` | Generate baru: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — **jangan pakai nilai dev** |

**5. Set Build Command supaya migrasi jalan otomatis tiap deploy**

Di Project Settings → Build & Development Settings → Build Command, override jadi:

```
prisma generate && prisma migrate deploy && next build
```

(`postinstall: prisma generate` di `package.json` sebenarnya sudah menjalankan generate setelah `npm install`, override ini menambahkan `migrate deploy` supaya perubahan schema di commit berikutnya otomatis diterapkan ke Postgres prod tanpa langkah manual.)

**6. Deploy**

Klik Deploy. Build pertama akan gagal kalau tabel belum ada di database Neon — jalankan migrasi awal sekali dari mesin lokal dulu, dengan `DATABASE_URL` di `.env` **untuk sesaat** diarahkan ke branch production:

```bash
npx prisma migrate deploy   # terapkan migrasi ke Neon production
npm run db:seed              # isi 60 anggota dummy + 4 user demo + 3 contoh Misi
```

Lalu kembalikan `.env` lokal ke branch `dev`, dan trigger deploy lagi di Vercel (atau push commit kosong).

**7. Verifikasi**

Buka URL Vercel-nya, login dengan salah satu akun demo (lihat bagian "Akun Demo" di atas, password `komcad123`), pastikan Overview memuat peta & data. Kalau login gagal dengan error terkait host, cek `NEXTAUTH_URL` sudah diisi domain Vercel yang benar dan sudah redeploy.

**Status: live di https://komcad-ai-dashboard.vercel.app**

### Alur Staging → Production

Domain publik **tidak** ter-update otomatis tiap ada commit — perubahan lewat branch `staging` dulu, direview di URL Preview, baru domain publik ter-update setelah `staging` di-merge ke `main`.

**Setup (sekali saja):**
1. Branch git `staging` dibuat dari `main`, di-push ke GitHub. **`main` tetap jadi Production Branch di Vercel** (Project Settings → Git) — jangan diubah.
2. Branch Neon ketiga: **`staging`**, di-branch dari `production` (bukan dari `main`) — Neon menyalin datanya instan lewat copy-on-write, jadi langsung terisi tanpa perlu `migrate deploy`/`db:seed` ulang.
   - **Kenapa dipisah dari branch Neon `main` (dev)**, bukan sekalian dipakai bareng: dev lokal pakai `prisma db push` (tidak tercatat di riwayat migrasi Prisma), sedangkan build Preview Vercel pakai `prisma migrate deploy` (strict terhadap riwayat migrasi). Kalau satu branch database dipakai keduanya, `db push` yang dijalankan saat iterasi cepat di lokal bisa bikin state-nya beda dari yang dicatat riwayat migrasi, dan `migrate deploy` berikutnya di staging bisa gagal karena mengira kolom/tabel itu belum pernah diterapkan padahal sudah ada dari `db push`.
3. Vercel → Environment Variables → tambah `DATABASE_URL` (connection string branch Neon `staging`), `AUTH_SECRET`, `ENCRYPTION_KEY` (generate baru, jangan pakai ulang nilai Production/dev), `NEXTAUTH_URL` (domain Preview branch — lihat poin 5), `OPENAI_API_KEY` — **centang cuma scope "Preview"**, uncheck "Production".
4. Build Command **tidak perlu di-override lagi terpisah** — override yang di-set untuk Production sebelumnya sudah project-wide, otomatis berlaku juga untuk build Preview. `prisma migrate deploy` di situ akan menerapkan migrasi ke `DATABASE_URL` manapun yang ter-resolve untuk deployment itu (branch Neon `staging`, sesuai env var di atas) — bukan ke `production`.
5. Setelah push pertama ke `staging`, Vercel memberi domain Preview yang stabil per-branch, formatnya `<project>-git-staging-<username>.vercel.app` (lihat di tab Deployments, deployment dengan Source `staging`). Kalau tidak muncul deployment sama sekali setelah push, kemungkinan webhook GitHub→Vercel kelewat sekali — push commit kosong (`git commit --allow-empty -m "..."`) untuk re-trigger. Copy domain itu, isi ulang `NEXTAUTH_URL` (masih scope Preview), redeploy.
6. **Deployment Protection (SSO) Vercel otomatis aktif di Preview** — bagus, memang harusnya begitu (staging bukan buat publik). Konsekuensinya: URL Preview cuma bisa dibuka kalau sedang login ke akun Vercel yang sama; agent/tooling otomatis (curl, Playwright headless) akan kena redirect ke `vercel.com/sso-api` dan tidak bisa verifikasi mandiri seperti untuk Production.

**Alur kerja sehari-hari setelah setup:**
```
push ke branch "staging"  →  Preview build otomatis (migrasi ke Neon "staging")  →  review di URL Preview
       ↓ sudah oke
merge "staging" → "main", push  →  Production build otomatis (migrasi ke Neon "production")  →  domain publik ter-update
```

### Rilis Produksi Sungguhan (belum dilakukan — jangan diasumsikan sendiri)

Ini skenario berbeda dari demo publik di atas: data personel TNI/Komcad **asli**, bukan dummy. Yang masih perlu diputuskan sebelum ini terjadi (lihat `TODO.md` bagian Backlog):

- Target hosting final — tetap Vercel, atau on-prem Kemenhan/TNI? (relevan karena sensitivitas keamanan nasional, bukan cuma teknis)
- Provider notifikasi SMS/push produksi (saat ini notifikasi cuma tersimpan sebagai record in-app, channel "Aplikasi", dengan jalur fallback "SMS (Simulasi)" — lihat NFR-07 di `notifikasi-delivery.ts`)
- Kebijakan retensi data pasca-nonaktif keanggotaan
- Review ulang formula Readiness Score & bobot AI Mobilization — masih berstatus asumsi (FRD §11), belum divalidasi
- Rotasi `ENCRYPTION_KEY`: kalau key ini berubah, seluruh NIK yang sudah terenkripsi dengan key lama tidak bisa didekripsi lagi — butuh proses re-encrypt terjadwal (decrypt-dengan-key-lama → encrypt-dengan-key-baru) sebelum key lama dibuang, bukan sekadar ganti env var
- Seed data dummy **tidak boleh** dijalankan di database ini — perlu proses onboarding data anggota sungguhan yang terpisah dan diverifikasi
