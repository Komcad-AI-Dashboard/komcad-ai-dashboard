// Adu skor rekomendasi AI dengan hasil nyatanya di lapangan (temuan QA-13). Server-only.
//
// Sebelum ini kedua bagiannya terpisah di dua laporan berbeda: skor per personel cuma ada di XLSX
// per-Misi, hasil evaluasi cuma ada di XLSX rekap, dan tidak ada satu pun tampilan di layar yang
// menggabungkannya. Analis harus menyandingkan sendiri.
//
// HANYA Misi berstatus Selesai yang dihitung. Dua alasannya:
//   1. Itu memang pertanyaannya — "misi yang sudah jalan, hasilnya bagus atau tidak".
//   2. Menyertakan Misi yang masih berjalan akan menyesatkan. Data seed sengaja membiarkan satu
//      kandidat berskor TERTINGGI di tiap Misi berjalan tanpa respons (lihat catatan di
//      prisma/misi-bencana.ts), jadi kalau ikut dihitung, rekomendasi terbaik AI justru terlihat
//      paling buruk kinerjanya. Itu artefak penyemaian, bukan temuan.

import { prisma } from "@/lib/prisma";
import { NILAI_KINERJA, STATUS_MISI } from "@/lib/constants";

const BAND = [
  { label: "90-100", min: 90 },
  { label: "80-89", min: 80 },
  { label: "70-79", min: 70 },
  { label: "<70", min: 0 },
] as const;

export type BandEvaluasi = {
  label: string;
  jumlah: number;
  rataKinerja: number;
  persenBaik: number;
  sebaran: { nilai: string; jumlah: number }[];
};

export type MisiEvaluasi = {
  kodeMisi: string;
  jenisKejadian: string;
  personel: number;
  rataSkorAi: number;
  rataKinerja: number | null;
  durasiHari: number | null;
  hasilEvaluasi: string | null;
};

export async function getEvaluasiRekomendasiAi(): Promise<{ band: BandEvaluasi[]; misi: MisiEvaluasi[] }> {
  const misiSelesai = await prisma.misi.findMany({
    where: { status: STATUS_MISI.SELESAI },
    orderBy: { selesaiAt: "desc" },
    select: {
      kodeMisi: true,
      jenisKejadian: true,
      dimobilisasiAt: true,
      selesaiAt: true,
      hasilEvaluasi: true,
      penugasan: { select: { skorRekomendasi: true, hasilEvaluasi: true } },
    },
  });

  const semuaPenugasan = misiSelesai.flatMap((m) => m.penugasan).filter((p) => p.hasilEvaluasi !== null);

  const band = BAND.map(({ label, min }, i) => {
    const batasAtas = i === 0 ? Infinity : BAND[i - 1].min;
    const isi = semuaPenugasan.filter((p) => p.skorRekomendasi >= min && p.skorRekomendasi < batasAtas);
    const nilai = isi.map((p) => NILAI_KINERJA[p.hasilEvaluasi!] ?? 0);
    const hitung = new Map<string, number>();
    for (const p of isi) hitung.set(p.hasilEvaluasi!, (hitung.get(p.hasilEvaluasi!) ?? 0) + 1);
    return {
      label,
      jumlah: isi.length,
      rataKinerja: nilai.length > 0 ? Math.round((nilai.reduce((s, v) => s + v, 0) / nilai.length) * 100) / 100 : 0,
      // "Baik atau lebih" = nilai 3 ke atas. Angka tunggal yang gampang dibandingkan antar band,
      // melengkapi rata-rata yang bisa tertutup oleh satu-dua pencilan.
      persenBaik: isi.length > 0 ? Math.round((nilai.filter((v) => v >= 3).length / isi.length) * 100) : 0,
      sebaran: [...hitung].map(([nilai, jumlah]) => ({ nilai, jumlah })),
    };
  }).filter((b) => b.jumlah > 0);

  const misi: MisiEvaluasi[] = misiSelesai.map((m) => {
    const dinilai = m.penugasan.filter((p) => p.hasilEvaluasi !== null);
    const nilai = dinilai.map((p) => NILAI_KINERJA[p.hasilEvaluasi!] ?? 0);
    return {
      kodeMisi: m.kodeMisi,
      jenisKejadian: m.jenisKejadian,
      personel: m.penugasan.length,
      rataSkorAi:
        m.penugasan.length > 0
          ? Math.round((m.penugasan.reduce((s, p) => s + p.skorRekomendasi, 0) / m.penugasan.length) * 10) / 10
          : 0,
      rataKinerja: nilai.length > 0 ? Math.round((nilai.reduce((s, v) => s + v, 0) / nilai.length) * 100) / 100 : null,
      durasiHari:
        m.dimobilisasiAt && m.selesaiAt
          ? Math.max(1, Math.round((m.selesaiAt.getTime() - m.dimobilisasiAt.getTime()) / 86400000))
          : null,
      hasilEvaluasi: m.hasilEvaluasi,
    };
  });

  return { band, misi };
}
