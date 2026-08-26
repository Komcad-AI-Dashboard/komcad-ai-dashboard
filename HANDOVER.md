# HANDOVER — Pindah Mesin Development

Checklist untuk memindahkan development SIAGA ke laptop/mesin baru, termasuk untuk sesi AI agent baru.

Dokumen ini **hanya** memuat hal yang tidak ikut terbawa `git clone`. Semua yang lain sudah ada dan jangan diduplikasi di sini:

| Butuh tahu | Baca |
|---|---|
| Arsitektur, konvensi istilah, palet warna, RBAC | [`CLAUDE.md`](CLAUDE.md) |
| Status pekerjaan terakhir — **baca ini kedua, setelah CLAUDE.md** | [`PROGRESS.md`](PROGRESS.md) |
| Sisa pekerjaan & backlog yang perlu keputusan user | [`TODO.md`](TODO.md) |
| Setup, perintah, deployment, alur staging→production | [`app/README.md`](app/README.md) |

---

## 1. Yang tidak ikut `git clone`

Empat hal ini harus disiapkan manual — tanpa ini repo hasil clone tidak bisa dijalankan:

1. **`app/.env`** — gitignored. Lihat bagian 3.
2. **Akses akun** — GitHub, Vercel, Neon, OpenAI. Lihat bagian 2.
3. **Toolchain** — Node & npm. Lihat bagian 2.
4. **Memori sesi AI agent** — riwayat percakapan Claude Code tidak ikut pindah. Karena itu `PROGRESS.md` harus selalu mutakhir; itulah yang dibaca sesi baru untuk tahu "sekarang sampai mana".

## 2. Prasyarat mesin baru

| Perlu | Versi yang dipakai sekarang | Catatan |
|---|---|---|
| Node.js | v24.19.0 | Di mesin lama diinstal portable tanpa hak admin — tidak wajib, instal biasa juga boleh |
| npm | 11.17.0 | Versi 11 memblokir postinstall script secara default; lihat bagian 4 |
| Git | bebas | — |

Akun yang harus bisa diakses dari mesin baru:

- **GitHub** — repo ada di organization `Komcad-AI-Dashboard` (bukan lagi akun pribadi; dipindah supaya app "GitHub for Atlassian" bisa menyambungkan Jira). Pastikan akun kamu anggota organization itu.
- **Vercel** — project `komcad-ai-dashboard`, untuk melihat Deployments dan Environment Variables.
- **Neon** — project database, untuk mengambil connection string tiap branch.
- **OpenAI** — API key untuk AI Mobilization & AI Chat.

## 3. Menyiapkan `app/.env`

Isinya lima variabel (nama & cara generate ada di [`app/.env.example`](app/.env.example)):

```
DATABASE_URL  AUTH_SECRET  NEXTAUTH_URL  OPENAI_API_KEY  ENCRYPTION_KEY
```

Dua cara mengisinya, pilih salah satu:

**A. Salin dari mesin lama** — paling cepat. Pindahkan `app/.env` lewat kanal yang aman (bukan chat/email biasa). Untuk dev lokal, `NEXTAUTH_URL` tetap `http://localhost:3000`.

**B. Tarik dari Vercel** — kalau mesin lama sudah tidak bisa diakses:

```bash
npx vercel login
npx vercel link          # pilih project komcad-ai-dashboard
npx vercel env pull app/.env
```

Setelah itu **wajib disesuaikan untuk lokal**:
- `NEXTAUTH_URL` → `http://localhost:3000` (nilai dari Vercel adalah domain deployment)
- `DATABASE_URL` → connection string branch Neon **`main`**, bukan `production` (lihat bagian 5)

> ⚠️ `ENCRYPTION_KEY` **tidak boleh diganti** kalau database yang dipakai sudah berisi data. NIK disimpan terenkripsi AES-256-GCM dengan kunci ini (NFR-04) — kunci baru membuat NIK lama tidak bisa didekripsi lagi. Generate baru hanya untuk database yang benar-benar kosong.

## 4. Menjalankan pertama kali

```bash
cd app
npm install          # kalau postinstall script diblokir, lihat catatan di bawah
npm run db:push      # sinkronkan schema ke branch Neon dev (main)
npm run db:seed      # HANYA untuk database kosong — lihat peringatan di bawah
npm run dev          # http://localhost:3000
```

Login dengan akun demo (daftar lengkap di `app/README.md`), password `komcad123`.

**Kalau `npm install` mengeluh soal postinstall script diblokir:** npm 11 menggatekan itu lewat field `allowScripts` di `package.json` (sudah terisi di repo). Kalau versinya bergeser, jalankan `npm approve-scripts <paket>@<versi>` lalu `npm install` lagi. Ini penting karena `prisma generate` jalan lewat postinstall — tanpa itu Prisma Client tidak ter-generate.

> ⚠️ `npm run db:seed` **hanya untuk database kosong.** Seed tidak menghapus apa pun, jadi menjalankannya ke database terisi akan gagal menabrak constraint unik anggota/user. Untuk database yang sudah terisi, pakai skrip perawatan data (bagian 6).

**Kalau `prisma generate` gagal dengan `EPERM` di Windows:** hentikan dulu `npm run dev` yang sedang jalan — dev server mengunci file query engine.

## 5. Peta database Neon (sumber kebingungan yang pernah terjadi)

Ada **tiga** branch Neon, dan penamaannya menyesatkan: branch bernama `main` **bukan** produksi.

| Branch Neon | Endpoint | Dipakai oleh |
|---|---|---|
| `main` | `ep-wild-heart-az1ycfan` | **Dev lokal** (`app/.env` di mesin dev) |
| `staging` | `ep-floral-glitter-azgdjxyi` | Preview deployment Vercel (branch git `staging`) |
| `production` | `ep-wispy-queen-az5al3or` | **Produksi** — `komcad-ai-dashboard.vercel.app` |

Ketiganya berisi data yang berbeda dan **tidak** tersinkron otomatis. Kalau ragu sebuah deployment memakai yang mana, jangan menebak — jumlah anggota bisa dipakai sebagai sidik jari (`main` 110, `production` 111), atau cek langsung di Vercel → Settings → Environment Variables.

> ⚠️ `prisma db push --force-reset` **menghapus semua data** di database yang ditunjuk `DATABASE_URL` saat itu. Pastikan `.env` menunjuk branch `main` sebelum menjalankannya. Jangan pernah dipakai ke `staging`/`production`.

## 6. Skrip perawatan data

Untuk mengubah data di database yang **sudah terisi** (tidak bisa pakai `db:seed`):

```bash
npm run db:misi-bencana      # tambah Misi bencana; aman diulang, kode yang sudah ada dilewati
npm run db:hapus-misi-lama   # hapus Misi demo lama; daftar kodenya eksplisit di skripnya
```

Keduanya bisa disasarkan ke database lain lewat `TARGET_DATABASE_URL` — **bukan** dengan menimpa `DATABASE_URL`, karena Prisma memuat `.env` otomatis sehingga gampang tertukar antara lokal dan deployment:

```bash
TARGET_DATABASE_URL="postgresql://..." npm run db:misi-bencana
```

Skripnya selalu mencetak host tujuan sebelum bertindak. **Baca baris itu dan pastikan benar** sebelum membiarkannya lanjut, terutama untuk skrip yang menghapus.

## 7. Alur push (jangan dilanggar)

Perubahan di dalam `app/` **tidak boleh** langsung ke `main`:

```
push ke "staging"  →  Preview build otomatis  →  user review di URL Preview
                   →  user bilang "push ke prod"  →  merge ke "main", push  →  domain publik ter-update
```

- Merge ke `main` hanya setelah user **eksplisit** menyetujui. Jangan diasumsikan.
- Perubahan dokumentasi murni (`.md` di root, di luar `app/`) boleh langsung ke `main` — tidak masuk build Vercel (Root Directory = `app`).
- URL Preview staging diproteksi Vercel SSO: hanya bisa dibuka dari browser yang sudah login akun Vercel. `curl`/Playwright headless akan kena redirect ke `vercel.com/sso-api` dan tidak bisa verifikasi mandiri. Produksi tidak diproteksi, jadi tetap bisa diverifikasi otomatis.

## 8. Verifikasi mesin baru sudah siap

Anggap selesai kalau semua ini lolos dari folder `app/`:

- [ ] `npx tsc --noEmit` bersih
- [ ] `npm run lint` bersih
- [ ] `npm run build` sukses
- [ ] `npm run dev` → login `admin@komcad.mil.id` / `komcad123` → Overview memuat peta beserta marker & panel terisi
- [ ] `/m` bisa dibuka dengan `anggota@komcad.mil.id` / `komcad123`
- [ ] `git remote -v` menunjuk `Komcad-AI-Dashboard/komcad-ai-dashboard`

## 9. Utang keamanan yang belum dibereskan

Kredensial Neon (`neondb_owner`) untuk ketiga branch — termasuk produksi — memakai password yang sama dan sempat dibagikan lewat percakapan chat. **Rotasi password-nya di dashboard Neon**, lalu perbarui `DATABASE_URL` di Vercel (scope Production dan Preview) serta `app/.env` lokal. Setelah rotasi, tabel endpoint di bagian 5 tetap berlaku — yang berubah hanya password, bukan hostname.
