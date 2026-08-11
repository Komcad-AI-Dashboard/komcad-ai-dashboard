// Wrapper retry buat `prisma migrate deploy` di build Vercel.
//
// Build Vercel SELALU jalan di region iad1 (US) — tidak bisa diikutkan ke `regions` di
// vercel.json (itu cuma ngatur region function saat runtime, bukan build). Neon branch kita di
// ap-southeast-1 (Singapore) juga auto-suspend kalau nganggur, jadi build yang kebetulan datang
// pas branch lagi cold-start bisa kena P1002 (gagal dapetin postgres advisory lock dalam 10 detik)
// — kombinasi latensi lintas benua + waktu compute Neon bangun kadang lebih dari 10 detik.
//
// Solusinya bukan "pindah region build" (tidak bisa di plan ini) atau "hilangkan cold-start"
// (autosuspend Neon free tier tidak bisa dimatikan tanpa upgrade plan), tapi retry — percobaan
// pertama sekalian jadi "ping" yang membangunkan compute-nya, percobaan berikutnya biasanya lolos
// karena compute-nya sudah tidak cold lagi.
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 4;
const DELAYS_MS = [0, 8000, 15000, 20000]; // delay SEBELUM masing-masing percobaan

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
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
