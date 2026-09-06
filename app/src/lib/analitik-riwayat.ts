// Perbandingan lintas waktu untuk Modul Analitik (temuan QA-11). Server-only.
//
// Dua sumber yang sifatnya BERBEDA, dan bedanya penting untuk tidak dikaburkan:
//
//   - Sertifikasi kedaluwarsa DIHITUNG dari Sertifikasi.tanggalBerlaku. Berapa yang sudah lewat
//     masa berlakunya pada suatu tanggal adalah aritmetika biasa atas baris yang memang ada, jadi
//     angkanya akurat, bukan buatan.
//
//   - Readiness Score dibaca dari ReadinessScoreHistory. Titik yang lebih tua di sana dibuat oleh
//     prisma/riwayat-readiness.ts, yaitu rekonstruksi memakai formula asli pada tanggal itu —
//     dua pertiganya benar-benar terekonstruksi, sepertiganya (komponen penugasan) pendekatan.
//     Rinciannya ada di kepala berkas skrip itu. Titik-titik baru mulai sekarang ditulis nyata
//     oleh recalculateReadinessScore().

import { prisma } from "@/lib/prisma";
import { STATUS_SERTIFIKASI } from "@/lib/constants";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";

/** Awal bulan ke-n sebelum bulan berjalan. n=0 berarti awal bulan ini. */
function awalBulan(n: number, sekarang: Date): Date {
  return new Date(sekarang.getFullYear(), sekarang.getMonth() - n, 1);
}

const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export type TitikTren = { label: string; readiness: number | null; sertifikasiKedaluwarsa: number };

/** Rata-rata Readiness nasional & jumlah sertifikasi kedaluwarsa per bulan, terlama lebih dulu. */
export async function getTrenKesiapsiagaan(jumlahBulan = 6): Promise<TitikTren[]> {
  const sekarang = new Date();
  const [riwayat, sertifikasi] = await Promise.all([
    prisma.readinessScoreHistory.findMany({
      select: { anggotaId: true, skor: true, dihitungPada: true },
      orderBy: { dihitungPada: "asc" },
    }),
    prisma.sertifikasi.findMany({ select: { tanggalBerlaku: true } }),
  ]);

  const titik: TitikTren[] = [];
  for (let n = jumlahBulan - 1; n >= 0; n--) {
    const mulai = awalBulan(n, sekarang);
    // Batas atas: akhir bulan itu, kecuali bulan berjalan yang batasnya waktu sekarang.
    const batas = n === 0 ? sekarang : awalBulan(n - 1, sekarang);

    // Satu nilai per anggota: baris TERAKHIR miliknya dalam rentang bulan itu. Dipakai baris
    // terakhir, bukan rata-rata seluruh baris, supaya anggota yang skornya dihitung ulang
    // berkali-kali dalam sebulan tidak jadi lebih berbobot daripada yang sekali.
    const terakhirPerAnggota = new Map<string, number>();
    for (const r of riwayat) {
      if (r.dihitungPada >= mulai && r.dihitungPada < batas) terakhirPerAnggota.set(r.anggotaId, r.skor);
    }
    const nilai = [...terakhirPerAnggota.values()];

    titik.push({
      label: NAMA_BULAN[mulai.getMonth()],
      readiness: nilai.length > 0 ? Math.round((nilai.reduce((s, v) => s + v, 0) / nilai.length) * 10) / 10 : null,
      sertifikasiKedaluwarsa: sertifikasi.filter(
        (s) => computeSertifikasiStatus(s.tanggalBerlaku, batas) === STATUS_SERTIFIKASI.KEDALUWARSA
      ).length,
    });
  }
  return titik;
}

export type Selisih = { nilai: number; naikItuBaik: boolean } | null;

/** Selisih terhadap bulan lalu. null kalau bulan lalu tidak punya data sama sekali — lebih jujur
 * daripada menampilkan 0, yang terbaca sebagai "tidak berubah" padahal artinya "tidak diketahui". */
export function hitungSelisih(sekarang: number, bulanLalu: number | null, naikItuBaik: boolean): Selisih {
  if (bulanLalu === null) return null;
  return { nilai: Math.round((sekarang - bulanLalu) * 10) / 10, naikItuBaik };
}

/** Readiness rata-rata per provinsi pada akhir bulan lalu, untuk selisih per wilayah. */
export async function getReadinessPerWilayahBulanLalu(): Promise<Map<string, number>> {
  const sekarang = new Date();
  const mulai = awalBulan(1, sekarang);
  const batas = awalBulan(0, sekarang);

  const riwayat = await prisma.readinessScoreHistory.findMany({
    where: { dihitungPada: { gte: mulai, lt: batas } },
    select: { anggotaId: true, skor: true, dihitungPada: true },
    orderBy: { dihitungPada: "asc" },
  });
  if (riwayat.length === 0) return new Map();

  const terakhirPerAnggota = new Map<string, number>();
  for (const r of riwayat) terakhirPerAnggota.set(r.anggotaId, r.skor);

  const anggota = await prisma.anggota.findMany({
    where: { id: { in: [...terakhirPerAnggota.keys()] } },
    select: { id: true, profilDemografi: { select: { provinsi: true } } },
  });

  const perProvinsi = new Map<string, { total: number; jumlah: number }>();
  for (const a of anggota) {
    const provinsi = a.profilDemografi?.provinsi;
    if (!provinsi) continue;
    const e = perProvinsi.get(provinsi) ?? { total: 0, jumlah: 0 };
    e.total += terakhirPerAnggota.get(a.id)!;
    e.jumlah += 1;
    perProvinsi.set(provinsi, e);
  }
  return new Map([...perProvinsi].map(([p, { total, jumlah }]) => [p, Math.round(total / jumlah)]));
}
