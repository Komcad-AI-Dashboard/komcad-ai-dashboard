// Menambahkan Misi bencana (prisma/misi-bencana.ts) ke database yang SUDAH terisi, tanpa
// menyentuh anggota/user/pelatihan — beda dari `npm run db:seed` yang mengasumsikan database
// kosong dan akan menabrak constraint unik kalau dijalankan ulang.
//
// Jalankan: npm run db:misi-bencana
// Aman diulang: Misi yang kodenya sudah ada dilewati.

import { PrismaClient } from "@prisma/client";
import { seedMisiBencana, MISI_BENCANA } from "./misi-bencana";

const prisma = new PrismaClient();

async function main() {
  const anggota = await prisma.anggota.findMany({
    orderBy: { kodeAnggota: "asc" },
    select: { id: true },
  });

  if (anggota.length === 0) {
    throw new Error("Belum ada anggota di database — jalankan `npm run db:seed` lebih dulu.");
  }

  const perluIndeks = Math.max(...MISI_BENCANA.map((m) => m.slice[1]));
  if (anggota.length < perluIndeks) {
    console.warn(
      `Peringatan: hanya ada ${anggota.length} anggota, sebagian Misi butuh sampai indeks ${perluIndeks}. ` +
        "Misi tetap dibuat, tapi jumlah personel yang ditugaskan akan lebih sedikit dari rencana."
    );
  }

  const dibuat = await seedMisiBencana(
    prisma,
    anggota.map((a) => a.id)
  );
  const dilewati = MISI_BENCANA.length - dibuat;
  console.log(`Selesai: ${dibuat} Misi dibuat, ${dilewati} dilewati (kode sudah ada).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
