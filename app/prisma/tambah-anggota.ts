// Menambahkan anggota dummy baru ke database yang SUDAH terisi, tanpa menyentuh anggota/user/misi
// yang sudah ada — beda dari `npm run db:seed` yang mengasumsikan database kosong dan akan
// menabrak constraint unik (kodeAnggota, nikHash) kalau dijalankan ulang.
//
// Jalankan: npm run db:tambah-anggota
// Jumlah anggota baru dikontrol JUMLAH_BARU di bawah. Index lanjutan dihitung dari kodeAnggota
// tertinggi yang sudah ada di database tujuan (bukan hardcode 110), supaya aman dijalankan lagi
// kalau suatu saat mau nambah lagi.

import { computeSertifikasiStatus } from "../src/lib/sertifikasi";
import { encryptSensitive, hashSensitive } from "../src/lib/crypto";
import { computeReadinessScore } from "../src/lib/readiness";
import { bukaTargetDb } from "./target-db";
import {
  PROVINSI,
  NAMA_DEPAN,
  NAMA_BELAKANG,
  UNIT,
  KOMPETENSI,
  PEKERJAAN_SIPIL,
  NAMA_KONTAK_DARURAT,
  pick,
  nikDummy,
} from "./data-pools";

const prisma = bukaTargetDb();

const JUMLAH_BARU = 50;

async function main() {
  const existing = await prisma.anggota.findMany({ select: { kodeAnggota: true } });
  const mulaiDari = existing.reduce((max, a) => {
    const n = Number(a.kodeAnggota.replace("ANG-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  console.log(`Anggota tertinggi saat ini: ANG-${String(mulaiDari).padStart(5, "0")}. Menambah ${JUMLAH_BARU} anggota baru.`);

  const anggotaBaruIds: string[] = [];
  for (let offset = 0; offset < JUMLAH_BARU; offset++) {
    const i = mulaiDari + offset; // lanjutan index global, dipakai konsisten dengan pola seed.ts
    const prov = pick(PROVINSI, i);
    const nama = `${pick(NAMA_DEPAN, i)} ${NAMA_BELAKANG[Math.floor(i / NAMA_DEPAN.length) % NAMA_BELAKANG.length]}`;
    const statusSiaga = i % 5 === 0 ? "Tidak Tersedia" : i % 3 === 0 ? "Siaga" : "Aktif";
    const nikPlain = nikDummy(i);

    const anggota = await prisma.anggota.create({
      data: {
        kodeAnggota: `ANG-${String(i + 1).padStart(5, "0")}`,
        nik: encryptSensitive(nikPlain),
        nikHash: hashSensitive(nikPlain),
        nama,
        unitAsal: pick(UNIT, i),
        statusSiaga,
        readinessScore: 50, // placeholder — dihitung ulang sungguhan di bawah
        readinessUpdatedAt: new Date(),
        telepon: `08${(1000000000 + i).toString().slice(0, 10)}`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@komcad-demo.id`,
        whatsapp: `62${(8100000000 + i).toString()}`,
        instagram: `@${nama.toLowerCase().replace(/\s+/g, ".")}`,
        linkedin: nama.toLowerCase().replace(/\s+/g, "-"),
        kontakDarurat: `${pick(NAMA_KONTAK_DARURAT, i)} · 08${(1200000000 + i).toString().slice(0, 10)}`,
        profilDemografi: {
          create: {
            tanggalLahir: new Date(1985 + (i % 20), i % 12, 5 + (i % 20)),
            jenisKelamin: i % 4 === 0 ? "Perempuan" : "Laki-laki",
            pendidikan: pick(["SMA/SMK", "D3", "S1", "S2"], i),
            pekerjaanSipil: pick(PEKERJAAN_SIPIL, i),
            golonganDarah: pick(["A", "B", "AB", "O"], i),
            provinsi: prov.nama,
            kabupatenKota: prov.kab,
            alamatDomisili: `Jl. Komcad No. ${i + 1}, ${prov.kab}`,
          },
        },
        lokasiHistori: {
          create: {
            // Jitter maks ~1.3km — pola sama seperti seed.ts, sudah diverifikasi tetap darat.
            latitude: prov.lat + (i % 5) * 0.003,
            longitude: prov.lng + (i % 5) * 0.003,
            provinsi: prov.nama,
            kabupatenKota: prov.kab,
          },
        },
        sertifikasi: {
          create: (() => {
            const berlaku1 = new Date(2026, (i + 6) % 12, 1);
            const berlaku2 = new Date(2027, (i + 2) % 12, 1);
            return [
              {
                jenisSertifikasi: pick(KOMPETENSI, i),
                tanggalTerbit: new Date(2024, i % 12, 1),
                tanggalBerlaku: berlaku1,
                status: computeSertifikasiStatus(berlaku1),
              },
              {
                jenisSertifikasi: pick(KOMPETENSI, i + 2),
                tanggalTerbit: new Date(2025, (i + 3) % 12, 1),
                tanggalBerlaku: berlaku2,
                status: computeSertifikasiStatus(berlaku2),
              },
            ];
          })(),
        },
      },
    });
    anggotaBaruIds.push(anggota.id);
  }

  console.log(`Dibuat ${anggotaBaruIds.length} anggota baru. Menghitung Readiness Score...`);

  // Recompute readiness score HANYA untuk anggota baru — tidak menyentuh anggota lama.
  const anggotaBaru = await prisma.anggota.findMany({
    where: { id: { in: anggotaBaruIds } },
    select: {
      id: true,
      sertifikasi: { select: { tanggalBerlaku: true } },
      pelatihan: { select: { tanggal: true, statusKelulusan: true } },
      penugasan: { select: { statusKehadiran: true } },
    },
  });
  for (const a of anggotaBaru) {
    const skor = computeReadinessScore(a);
    await prisma.anggota.update({ where: { id: a.id }, data: { readinessScore: skor } });
  }

  console.log("Selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
