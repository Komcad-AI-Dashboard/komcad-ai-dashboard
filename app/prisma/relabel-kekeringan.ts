// Fase 18 susulan ketiga: MISI-2026-015/016/017 dibuat dengan jenisKejadian "Lainnya" (satu-satunya
// nilai yang tersedia saat itu untuk kekeringan), tapi labelnya bikin bingung di panel Misi
// Terbaru (temuan user, screenshot "topnya masih 'Lainnya'"). jenisKejadian di schema.prisma
// adalah String biasa (bukan enum), jadi aman diisi "Kekeringan" langsung tanpa migrasi.
//
// seedMisiBencana() di misi-bencana.ts cuma skip kode yang sudah ada — tidak pernah update baris
// existing, jadi perubahan `jenis` di MISI_BENCANA butuh script terpisah ini untuk database yang
// sudah terisi.
//
// Jalankan: TARGET_DATABASE_URL="postgresql://..." npx tsx prisma/relabel-kekeringan.ts
// Aman diulang: idempotent, updateMany cuma menyentuh baris yang kodenya cocok.

import { bukaTargetDb } from "./target-db";

const KODE_KEKERINGAN = ["MISI-2026-015", "MISI-2026-016", "MISI-2026-017"];

const prisma = bukaTargetDb();

async function main() {
  const sebelum = await prisma.misi.findMany({
    where: { kodeMisi: { in: KODE_KEKERINGAN } },
    select: { kodeMisi: true, jenisKejadian: true },
  });
  for (const m of sebelum) {
    console.log(`  ${m.kodeMisi}: "${m.jenisKejadian}" -> "Kekeringan"`);
  }

  const hasil = await prisma.misi.updateMany({
    where: { kodeMisi: { in: KODE_KEKERINGAN } },
    data: { jenisKejadian: "Kekeringan" },
  });
  console.log(`Selesai: ${hasil.count} Misi di-relabel jadi "Kekeringan".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
