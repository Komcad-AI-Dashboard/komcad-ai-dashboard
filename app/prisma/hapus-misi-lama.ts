// Menghapus Misi demo lama yang bukan mengacu kejadian nyata, supaya dashboard hanya berisi Misi
// bencana Agustus 2026. Penugasan & Notifikasi ikut terhapus otomatis (onDelete: Cascade di
// schema.prisma), jadi tidak ada baris yatim.
//
// Jalankan (contoh menyasar database selain .env):
//   TARGET_DATABASE_URL="postgresql://..." npm run db:hapus-misi-lama
//
// Aman diulang: kode yang sudah tidak ada dilewati.

import { bukaTargetDb } from "./target-db";

/** Sengaja daftar eksplisit, BUKAN pola/rentang — supaya tidak mungkin ikut menghapus Misi lain. */
const KODE_DIHAPUS = [
  "MISI-2026-001", // Banjir Kabupaten Bandung — data seed lama, bukan kejadian terkini
  "MISI-2026-002", // Kebakaran Hutan Kabupaten Berau — data seed lama
  "MISI-2026-003", // Longsor Jakarta Selatan — artefak uji coba
  "MISI-2026-004", // Banjir Jakarta Selatan — artefak uji coba
  "MISI-2026-023", // Banjir Kepulauan Riau — di-drop atas permintaan user (Fase 18 susulan)
  "MISI-2026-032", // Kekeringan Lamongan (jenisKejadian "Lainnya") — di-drop atas permintaan user, tetap nongol di top 5 panel Misi Terbaru
];

const prisma = bukaTargetDb();

async function main() {
  const target = await prisma.misi.findMany({
    where: { kodeMisi: { in: KODE_DIHAPUS } },
    select: { kodeMisi: true, jenisKejadian: true, lokasi: true, _count: { select: { penugasan: true } } },
  });

  if (target.length === 0) {
    console.log("Tidak ada Misi yang cocok — tidak ada yang dihapus.");
    return;
  }

  for (const m of target) {
    console.log(`  hapus ${m.kodeMisi} — ${m.jenisKejadian}, ${m.lokasi} (${m._count.penugasan} penugasan ikut terhapus)`);
  }

  const hasil = await prisma.misi.deleteMany({ where: { kodeMisi: { in: KODE_DIHAPUS } } });
  const sisa = await prisma.misi.count();
  console.log(`Selesai: ${hasil.count} Misi dihapus. Sisa ${sisa} Misi di database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
