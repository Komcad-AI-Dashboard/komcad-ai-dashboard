# SIAGA — Sistem Identifikasi, Analitik & Gerak Anggota

Dashboard AI untuk Komponen Cadangan (Komcad) di bawah Kemenhan/Mabes TNI. Aplikasi Next.js tunggal dengan dua sisi: **Command Center** (desktop, Super Admin/Operator/Analis) dan **Sisi Anggota** (mobile web, Anggota Komcad).

> **Nama produk = SIAGA. Nama program = Komcad.** Keduanya beda dan tidak saling menggantikan: "Komcad" tetap dipakai untuk entitas domain (Anggota Komcad, Operator Komcad, `@komcad.mil.id`, nama unit). Jangan cari-ganti buta.

> Baca [`../CLAUDE.md`](../CLAUDE.md) dulu untuk konteks arsitektur & keputusan teknis lengkap, lalu [`../PROGRESS.md`](../PROGRESS.md) untuk status pengerjaan terkini. File ini (`README.md`) fokus ke "cara menjalankan & mengembangkan", bukan riwayat keputusan.

## Prasyarat

- Node.js 20+ dan npm
- Tidak butuh Docker/Postgres untuk dev — database dev pakai SQLite file lokal (zero-setup)

## Setup Pertama Kali

```bash
npm install
cp .env.example .env
# edit .env: isi OPENAI_API_KEY (untuk AI Mobilization & AI Chat) dan ENCRYPTION_KEY
# generate ENCRYPTION_KEY dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# generate AUTH_SECRET dengan:    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npm run db:push    # sync Prisma schema -> SQLite dev.db
npm run db:seed    # isi 20 anggota dummy + 4 user demo + 3 contoh Misi
npm run dev         # http://localhost:3000
```

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
npm run db:seed       # isi ulang data dummy (idempotent lewat upsert untuk user, create untuk anggota)
npm run db:studio     # buka Prisma Studio (browser UI ke isi database)
```

**Reset penuh database dev** (kalau schema berubah dengan cara yang butuh drop kolom/tabel, atau data uji perlu dibersihkan):

```bash
npx prisma db push --force-reset
npm run db:seed
```

`--force-reset` **menghapus semua data** di `dev.db`. Kalau kamu menjalankan ini lewat AI coding agent (Claude Code dkk), agent akan/harus minta konfirmasi eksplisit dulu sebelum menjalankan — ini bukan perintah yang aman dijalankan tanpa sadar. Untuk data produksi (Postgres), **jangan pernah** pakai `--force-reset` — pakai `prisma migrate` (lihat bagian Deployment di bawah).

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
| `DATABASE_URL` | Prisma — `file:./dev.db` untuk dev, connection string Postgres untuk prod |
| `AUTH_SECRET` | Auth.js (NextAuth) — tanda tangan JWT session |
| `NEXTAUTH_URL` | Base URL aplikasi (dipakai Auth.js untuk redirect callback) |
| `OPENAI_API_KEY` | AI Mobilization (FR-09/10) & AI Chat (FR-30/31). Kalau kosong/invalid, kedua fitur otomatis jatuh ke fallback deterministik — **tidak pernah blank/error**, cuma kehilangan kualitas ranking/jawaban natural |
| `ENCRYPTION_KEY` | Enkripsi at-rest NIK (NFR-04), 32 byte hex. **Wajib diisi** — server akan throw runtime error saat menyentuh data NIK kalau kosong |

## Deployment

Lihat [`PROGRESS.md`](../PROGRESS.md) bagian "Fase 12/13" dan [`../TODO.md`](../TODO.md) bagian Backlog untuk keputusan yang masih terbuka (target hosting, provider SMS/push produksi). Ringkasan teknis migrasi:

### SQLite (dev) → PostgreSQL (prod)

1. Provisikan database Postgres, dapatkan connection string
2. Ubah `prisma/schema.prisma`: `datasource db { provider = "postgresql" ... }` (dari `"sqlite"`)
3. Set `DATABASE_URL` di environment prod ke connection string Postgres
4. Jalankan `npx prisma migrate deploy` (bukan `db push`) untuk lingkungan prod — `migrate` menghasilkan riwayat migrasi yang bisa direview, `db push` cocok untuk dev tapi tidak untuk prod
5. Schema sengaja portable (tidak pakai fitur khusus Postgres seperti native enum) supaya migrasi ini tidak butuh perubahan besar di skema — lihat `CLAUDE.md` §2

### Yang Perlu Diputuskan Sebelum Rilis (jangan diasumsikan sendiri)

- Target hosting (Vercel? on-prem Kemenhan/TNI? — relevan karena data ini sensitif keamanan nasional)
- Provider notifikasi SMS/push produksi (saat ini notifikasi cuma tersimpan sebagai record in-app, channel "Aplikasi", dengan jalur fallback "SMS (Simulasi)" — lihat NFR-07 di `notifikasi-delivery.ts`)
- Kebijakan retensi data pasca-nonaktif keanggotaan
- Rotasi `ENCRYPTION_KEY`: kalau key ini berubah, seluruh NIK yang sudah terenkripsi dengan key lama tidak bisa didekripsi lagi — butuh proses re-encrypt terjadwal (decrypt-dengan-key-lama → encrypt-dengan-key-baru) sebelum key lama dibuang, bukan sekadar ganti env var

### Checklist Sebelum Rilis Produksi

- [ ] `ENCRYPTION_KEY` & `AUTH_SECRET` di-generate baru untuk prod (jangan pakai nilai dev)
- [ ] `OPENAI_API_KEY` prod dengan kuota memadai
- [ ] `prisma migrate deploy` (bukan `db push --force-reset`) untuk setup schema prod
- [ ] Seed data dummy **tidak** dijalankan di prod — buat proses onboarding data anggota sungguhan yang terpisah
- [ ] Review ulang formula Readiness Score & bobot AI Mobilization (masih placeholder — lihat `PROGRESS.md`)
