// Seed data dummy — TODO Fase 3: isi 50-100 anggota, sertifikasi, Misi contoh, aktivitas
// pelatihan, sesuai FRD §9 dan `FRD/09-data-dummy.md` (kalau file itu ada) atau derive dari
// komcad-dashboard.html. Placeholder ini sengaja kosong sampai Fase 3 dikerjakan.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed placeholder — belum ada data dummy. Lihat TODO.md Fase 3.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
