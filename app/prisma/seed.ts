// Seed data dummy. Fase 3 penuh (50-100 anggota) belum dikerjakan — ini starter set
// secukupnya untuk mencoba login per role & melihat data di UI saat modul-modul berikutnya
// dibangun. SEMUA data di bawah ini FIKTIF, bukan data personel TNI/Komcad sungguhan.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeSertifikasiStatus } from "../src/lib/sertifikasi";
import { encryptSensitive, hashSensitive } from "../src/lib/crypto";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "komcad123";

const PROVINSI = [
  { nama: "DKI Jakarta", kab: "Jakarta Selatan", lat: -6.2615, lng: 106.781 },
  { nama: "Jawa Barat", kab: "Bandung", lat: -6.9175, lng: 107.6191 },
  { nama: "Jawa Tengah", kab: "Semarang", lat: -6.9932, lng: 110.4203 },
  { nama: "Jawa Timur", kab: "Surabaya", lat: -7.2575, lng: 112.7521 },
  { nama: "Sumatera Utara", kab: "Medan", lat: 3.5952, lng: 98.6722 },
  { nama: "Sulawesi Selatan", kab: "Makassar", lat: -5.1477, lng: 119.4327 },
  { nama: "Bali", kab: "Denpasar", lat: -8.65, lng: 115.2167 },
  { nama: "Kalimantan Timur", kab: "Balikpapan", lat: -1.2379, lng: 116.8529 },
];

const NAMA_DEPAN = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lukman", "Maya", "Nur", "Oscar", "Putri",
  "Rian", "Siti", "Taufik", "Umi",
];
const NAMA_BELAKANG = [
  "Pratama", "Santoso", "Wijaya", "Kusuma", "Setiawan", "Rahayu", "Saputra",
  "Hidayat", "Permata", "Gunawan", "Utami", "Firmansyah", "Lestari",
  "Nugroho", "Ramadhan", "Wibowo", "Anggraini", "Suryanto", "Handayani", "Pranoto",
];
const UNIT = ["Komcad Yon Zeni 1", "Komcad Yon Kav 2", "Komcad Yon Arhanud 3", "Komcad Batalyon Infanteri 5"];
const KOMPETENSI = ["Medis Lapangan", "Komunikasi Radio", "SAR & Evakuasi", "Logistik", "Teknik Bangunan", "Navigasi Darat"];
const PEKERJAAN_SIPIL = ["Wiraswasta", "Guru", "Perawat", "Teknisi", "Kontraktor", "PNS Non-TNI", "Karyawan Swasta"];
const NAMA_KONTAK_DARURAT = ["Istri", "Suami", "Ayah", "Ibu", "Kakak"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function nikDummy(i: number) {
  return `31${String(7100000000000 + i).slice(0, 14)}`.padEnd(16, "0").slice(0, 16);
}

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

  const anggotaList = [];
  for (let i = 0; i < 20; i++) {
    const prov = pick(PROVINSI, i);
    const nama = `${pick(NAMA_DEPAN, i)} ${pick(NAMA_BELAKANG, i + 3)}`;
    const statusSiaga = i % 5 === 0 ? "Tidak Tersedia" : i % 3 === 0 ? "Siaga" : "Aktif";
    const readiness = 55 + ((i * 7) % 45);
    const nikPlain = nikDummy(i);

    const anggota = await prisma.anggota.create({
      data: {
        kodeAnggota: `ANG-${String(i + 1).padStart(5, "0")}`,
        nik: encryptSensitive(nikPlain),
        nikHash: hashSensitive(nikPlain),
        nama,
        unitAsal: pick(UNIT, i),
        statusSiaga,
        readinessScore: readiness,
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
            latitude: prov.lat + (i % 5) * 0.01,
            longitude: prov.lng + (i % 5) * 0.01,
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
      jumlahPeserta: 5,
      peserta: {
        create: anggotaList.slice(0, 5).map((a) => ({ anggotaId: a.id })),
      },
    },
  });
  await prisma.aktivitasPelatihan.create({
    data: {
      namaPelatihan: pelatihan2.nama,
      lokasi: pelatihan2.lokasi,
      tanggal: pelatihan2.tanggal,
      jumlahPeserta: 4,
      peserta: {
        create: anggotaList.slice(5, 9).map((a) => ({ anggotaId: a.id })),
      },
    },
  });

  // Riwayat Pelatihan personal (FR-06 menu Riwayat Pelatihan) — tercatat untuk peserta di atas
  console.log("Seeding riwayat pelatihan personal...");
  for (const a of anggotaList.slice(0, 5)) {
    await prisma.pelatihan.create({
      data: {
        anggotaId: a.id,
        namaPelatihan: pelatihan1.nama,
        tanggal: pelatihan1.tanggal,
        statusKelulusan: "Lulus",
      },
    });
  }
  for (const a of anggotaList.slice(5, 9)) {
    await prisma.pelatihan.create({
      data: {
        anggotaId: a.id,
        namaPelatihan: pelatihan2.nama,
        tanggal: pelatihan2.tanggal,
        statusKelulusan: "Lulus",
      },
    });
  }
  // satu contoh belum lulus, untuk variasi tampilan status
  await prisma.pelatihan.create({
    data: {
      anggotaId: anggotaList[9].id,
      namaPelatihan: "Refreshment Evakuasi Vertikal",
      tanggal: new Date(2026, 8, 20),
      statusKelulusan: "Sedang Berjalan",
    },
  });

  console.log("Seeding contoh Misi...");
  await prisma.misi.create({
    data: {
      kodeMisi: "MISI-2026-001",
      pemberiPerintah: "Kolonel Inf. Bambang Setiawan",
      jenisKejadian: "Banjir",
      urgensi: "Tinggi",
      lokasi: "Kabupaten Bandung, Jawa Barat",
      latitude: -7.0,
      longitude: 107.6,
      deskripsiMisi: "Banjir bandang merendam 3 kecamatan, dibutuhkan tim SAR & evakuasi warga.",
      status: "Selesai",
      kebutuhanPersonel: 5,
      dimobilisasiAt: new Date(2026, 5, 10),
      selesaiAt: new Date(2026, 5, 14),
      hasilEvaluasi: "Evakuasi berhasil, seluruh personel kembali dengan aman.",
      penugasan: {
        create: anggotaList.slice(1, 4).map((a, idx) => ({
          anggotaId: a.id,
          skorRekomendasi: 82 - idx * 4,
          alasan: JSON.stringify(["Jarak terdekat", "Sertifikasi SAR aktif", "Readiness Score tinggi"]),
          etaMenit: 45 + idx * 15,
          statusKehadiran: "Selesai",
        })),
      },
    },
  });

  await prisma.misi.create({
    data: {
      kodeMisi: "MISI-2026-002",
      pemberiPerintah: "Letkol Inf. Dian Purnama",
      jenisKejadian: "Kebakaran Hutan",
      urgensi: "Kritis",
      lokasi: "Kabupaten Berau, Kalimantan Timur",
      latitude: -1.3,
      longitude: 117.0,
      deskripsiMisi: "Kebakaran hutan meluas mendekati permukiman, perlu personel tambahan segera.",
      status: "Dimobilisasi",
      kebutuhanPersonel: 6,
      dimobilisasiAt: new Date(),
      penugasan: {
        create: anggotaList.slice(9, 12).map((a, idx) => ({
          anggotaId: a.id,
          skorRekomendasi: 88 - idx * 5,
          alasan: JSON.stringify(["Sertifikasi aktif", "Readiness Score tinggi", "ETA tercepat"]),
          etaMenit: 30 + idx * 10,
          statusKehadiran: "Menunggu Respons",
        })),
      },
    },
  });

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
