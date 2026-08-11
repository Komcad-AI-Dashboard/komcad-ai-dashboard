// Wrapper retry buat `prisma migrate deploy` di build Vercel.
//
// Build Vercel SELALU jalan di region iad1 (US) — tidak bisa diikutkan ke `regions` di
// vercel.json (itu cuma ngatur region function saat runtime, bukan build). Neon branch kita di
// ap-southeast-1 (Singapore), dan `pg_advisory_lock()` yang dipakai `prisma migrate deploy` untuk
// kunci migrasi kadang gagal didapat dalam 10 detik (P1002) — diuji langsung, ini kejadian baik di
// koneksi pooled MAUPUN direct (jadi bukan soal pooler), dan baik dari build Vercel MAUPUN dari
// mesin lokal (jadi bukan soal jarak/latensi doang) — kemungkinan besar ini quirk lock Neon sendiri
// yang kadang lambat/gagal terlepas dari cold-start.
//
// Fix utamanya: HINDARI butuh lock itu sama sekali kalau memang tidak ada migrasi baru yang perlu
// diterapkan (`prisma migrate status`, TIDAK butuh advisory lock, jauh lebih stabil) — yang mana
// itu situasi paling umum (banyak deploy cuma ubah kode/data, bukan schema). `migrate deploy`
// (yang butuh lock) baru benar-benar dipanggil kalau memang ada migrasi pending, dengan retry
// sebagai jaring pengaman kalau lock-nya tetap flaky saat itu dibutuhkan.
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 5;
const DELAYS_MS = [0, 10000, 20000, 30000, 30000]; // delay SEBELUM masing-masing percobaan

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUpToDate() {
  try {
    const out = execSync("npx prisma migrate status", { encoding: "utf8" });
    return out.includes("Database schema is up to date!");
  } catch (err) {
    // migrate status keluar non-zero kalau ada migrasi pending ATAU kalau gagal konek — kalau
    // gagal konek totally, `err.stdout` biasanya tetap ada isinya (Prisma cetak error ke stdout).
    const out = (err.stdout || "") + (err.stderr || "");
    console.log(out);
    return false;
  }
}

async function main() {
  console.log("[migrate-deploy-retry] Cek status migrasi (tanpa advisory lock)...");
  if (isUpToDate()) {
    console.log("[migrate-deploy-retry] Tidak ada migrasi pending — skip prisma migrate deploy sepenuhnya.");
    return;
  }

  console.log("[migrate-deploy-retry] Ada migrasi pending, jalankan prisma migrate deploy...");
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (DELAYS_MS[attempt - 1] > 0) {
      console.log(`[migrate-deploy-retry] Menunggu ${DELAYS_MS[attempt - 1] / 1000}s sebelum percobaan ${attempt}/${MAX_ATTEMPTS}...`);
      await sleep(DELAYS_MS[attempt - 1]);
    }
    console.log(`[migrate-deploy-retry] Percobaan ${attempt}/${MAX_ATTEMPTS}: prisma migrate deploy`);
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("[migrate-deploy-retry] Berhasil.");
      return;
    } catch {
      const isLast = attempt === MAX_ATTEMPTS;
      console.error(`[migrate-deploy-retry] Percobaan ${attempt} gagal.${isLast ? "" : " Coba lagi..."}`);
      if (isLast) {
        console.error("[migrate-deploy-retry] Semua percobaan gagal. Build dihentikan.");
        process.exit(1);
      }
    }
  }
}

main();
