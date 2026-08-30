// Perbaikan sekali-jalan: koreksi koordinat Lokasi anggota Indonesia Timur yang sudah terlanjur
// dibuat prisma/tambah-anggota-timur.ts SEBELUM koordinat Ternate & besaran jitter diperbaiki
// (ANG-00165 muncul di laut, ditemukan user — lihat komentar di data-pools.ts & tambah-anggota-
// timur.ts). Menghitung ulang lat/lng persis dengan formula yang sudah diperbaiki, untuk anggota
// yang provinsinya ada di PROVINSI_TIMUR, lalu update baris Lokasi TERBARU mereka saja (tidak
// membuat baris riwayat baru, tidak menyentuh anggota/provinsi lain).
//
// Jalankan: npx tsx prisma/fix-lokasi-timur.ts (dengan TARGET_DATABASE_URL kalau bukan ke .env)

import { bukaTargetDb } from "./target-db";
import { PROVINSI_TIMUR } from "./data-pools";

const prisma = bukaTargetDb();

async function main() {
  const provNama = PROVINSI_TIMUR.map((p) => p.nama);
  const anggota = await prisma.anggota.findMany({
    where: { profilDemografi: { provinsi: { in: provNama } } },
    select: {
      id: true,
      kodeAnggota: true,
      profilDemografi: { select: { provinsi: true } },
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1, select: { id: true } },
    },
  });

  if (anggota.length === 0) {
    console.log("Tidak ada anggota Indonesia Timur ditemukan di database ini — tidak ada yang diperbaiki.");
    return;
  }

  let diperbaiki = 0;
  for (const a of anggota) {
    const prov = PROVINSI_TIMUR.find((p) => p.nama === a.profilDemografi?.provinsi);
    const lokasiId = a.lokasiHistori[0]?.id;
    if (!prov || !lokasiId) continue;

    const i = Number(a.kodeAnggota.replace("ANG-", "")) - 1;
    const latBaru = prov.lat + (i % 5) * 0.0008;
    const lngBaru = prov.lng + (i % 5) * 0.0008;

    await prisma.lokasi.update({
      where: { id: lokasiId },
      data: { latitude: latBaru, longitude: lngBaru },
    });
    console.log(`${a.kodeAnggota} (${prov.nama}): -> ${latBaru.toFixed(4)}, ${lngBaru.toFixed(4)}`);
    diperbaiki++;
  }

  console.log(`Selesai: ${diperbaiki} lokasi diperbaiki.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
