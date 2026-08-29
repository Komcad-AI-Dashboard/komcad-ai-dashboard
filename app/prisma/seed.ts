// Seed data dummy — 110 anggota tersebar 12 provinsi (skala target FRD §3, 50-100 anggota).
// SEMUA data di bawah ini FIKTIF, bukan data personel TNI/Komcad sungguhan.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeSertifikasiStatus } from "../src/lib/sertifikasi";
import { encryptSensitive, hashSensitive } from "../src/lib/crypto";
import { computeReadinessScore } from "../src/lib/readiness";
import { seedMisiBencana } from "./misi-bencana";
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

const prisma = new PrismaClient();

const DEMO_PASSWORD = "komcad123";

async function main() {
  console.log("Seeding users demo per role...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@komcad.mil.id" },
    update: {},
    create: {
      email: "admin@komcad.mil.id",
      name: "Ratna Wijayanti",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operator@komcad.mil.id" },
    update: {},
    create: {
      email: "operator@komcad.mil.id",
      name: "Kapten Yusuf Anwar",
      role: "OPERATOR",
      passwordHash,
    },
  });

  const analis = await prisma.user.upsert({
    where: { email: "analis@komcad.mil.id" },
    update: {},
    create: {
      email: "analis@komcad.mil.id",
      name: "Dr. Sari Handayani",
      role: "ANALIS",
      passwordHash,
    },
  });

  console.log(`Admin: ${admin.email}, Operator: ${operator.email}, Analis: ${analis.email}`);

  console.log("Seeding anggota dummy...");

  const JUMLAH_ANGGOTA = 110;
  const anggotaList = [];
  for (let i = 0; i < JUMLAH_ANGGOTA; i++) {
    const prov = pick(PROVINSI, i);
    // Nama belakang increment per blok NAMA_DEPAN.length, biar pasangan (depan, belakang) gak
    // berulang sampai NAMA_DEPAN.length * NAMA_BELAKANG.length anggota (bukan cuma NAMA_DEPAN.length).
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
        readinessScore: 50, // placeholder — dihitung ulang sungguhan di akhir seed via computeReadinessScore()
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
            // Jitter kecil biar marker gak numpuk persis di satu titik per kota — sebelumnya
            // sampai 0.04° (~5-6km diagonal), yang buat beberapa anggota kota pesisir/dekat selat
            // sempit (dikonfirmasi: Surabaya, ANG-00100) ke-plot di air. Dikecilin ke maks 0.012°
            // (~1.3km), diverifikasi ulang via reverse-geocode tetap darat di kota paling rawan.
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
    anggotaList.push(anggota);
  }

  console.log(`Dibuat ${anggotaList.length} anggota dummy.`);

  // Akun demo Anggota Komcad, ditautkan ke salah satu anggota di atas
  const anggotaDemo = anggotaList[0];
  const anggotaUser = await prisma.user.upsert({
    where: { email: "anggota@komcad.mil.id" },
    update: {},
    create: {
      email: "anggota@komcad.mil.id",
      name: anggotaDemo.nama,
      role: "ANGGOTA",
      passwordHash,
      anggotaId: anggotaDemo.id,
    },
  });
  console.log(`Anggota demo login: ${anggotaUser.email} -> ${anggotaDemo.nama}`);

  console.log("Seeding aktivitas pelatihan...");
  const pelatihan1 = { nama: "Pelatihan Dasar SAR & Evakuasi Bencana", lokasi: "Pusdiklat Komcad Bandung", tanggal: new Date(2026, 6, 15) };
  const pelatihan2 = { nama: "Pelatihan Komunikasi Radio Lapangan", lokasi: "Pusdiklat Komcad Surabaya", tanggal: new Date(2026, 7, 1) };

  await prisma.aktivitasPelatihan.create({
    data: {
      namaPelatihan: pelatihan1.nama,
      lokasi: pelatihan1.lokasi,
      tanggal: pelatihan1.tanggal,
      jumlahPeserta: 8,
      peserta: {
        create: anggotaList.slice(0, 8).map((a) => ({ anggotaId: a.id })),
      },
    },
  });
  await prisma.aktivitasPelatihan.create({
    data: {
      namaPelatihan: pelatihan2.nama,
      lokasi: pelatihan2.lokasi,
      tanggal: pelatihan2.tanggal,
      jumlahPeserta: 6,
      peserta: {
        create: anggotaList.slice(8, 14).map((a) => ({ anggotaId: a.id })),
      },
    },
  });

  // Riwayat Pelatihan personal (FR-06 menu Riwayat Pelatihan) — tercatat untuk peserta di atas
  console.log("Seeding riwayat pelatihan personal...");
  for (const a of anggotaList.slice(0, 8)) {
    await prisma.pelatihan.create({
      data: {
        anggotaId: a.id,
        namaPelatihan: pelatihan1.nama,
        tanggal: pelatihan1.tanggal,
        statusKelulusan: "Lulus",
      },
    });
  }
  for (const a of anggotaList.slice(8, 14)) {
    await prisma.pelatihan.create({
      data: {
        anggotaId: a.id,
        namaPelatihan: pelatihan2.nama,
        tanggal: pelatihan2.tanggal,
        statusKelulusan: "Lulus",
      },
    });
  }
  // beberapa contoh belum lulus, untuk variasi tampilan status
  for (const a of anggotaList.slice(14, 17)) {
    await prisma.pelatihan.create({
      data: {
        anggotaId: a.id,
        namaPelatihan: "Refreshment Evakuasi Vertikal",
        tanggal: new Date(2026, 8, 20),
        statusKelulusan: "Sedang Berjalan",
      },
    });
  }

  // Misi bencana nyata Agustus 2026 (gempa Flores NTT, karhutla, kekeringan, cuaca ekstrem).
  // Datanya di prisma/misi-bencana.ts supaya bisa juga dijalankan sendiri ke database yang
  // sudah terisi lewat prisma/tambah-misi-bencana.ts, tanpa menyentuh anggota/user.
  const jumlahMisiBencana = await seedMisiBencana(
    prisma,
    anggotaList.map((a) => a.id)
  );
  console.log(`Dibuat ${jumlahMisiBencana} Misi bencana.`);

  // Readiness Score dihitung sungguhan (bukan angka acak) dari sertifikasi/pelatihan/penugasan
  // yang baru saja di-seed — lihat src/lib/readiness.ts untuk formula & catatan asumsinya.
  console.log("Menghitung Readiness Score...");
  const semuaAnggota = await prisma.anggota.findMany({
    select: {
      id: true,
      sertifikasi: { select: { tanggalBerlaku: true } },
      pelatihan: { select: { tanggal: true, statusKelulusan: true } },
      penugasan: { select: { statusKehadiran: true } },
    },
  });
  for (const a of semuaAnggota) {
    const skor = computeReadinessScore(a);
    await prisma.anggota.update({ where: { id: a.id }, data: { readinessScore: skor } });
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
