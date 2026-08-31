// Data-fetching untuk Modul AI Chat Assistant (FR-29 s.d. FR-32). Server-only.
// Semua jawaban chat WAJIB dijawab dari snapshot ini (grounded), tidak pernah dikarang OpenAI.

import { prisma } from "@/lib/prisma";
import { STATUS_MISI_AKTIF, STATUS_SERTIFIKASI, STATUS_SIAGA } from "@/lib/constants";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { getReadinessPerWilayah } from "@/lib/analitik-data";

export async function getChatContext() {
  const now = new Date();
  const tigaBulanLalu = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [
    totalAnggota,
    byStatusSiaga,
    byGender,
    byPendidikan,
    readinessAgg,
    readinessWilayah,
    misiAktif,
    sertifikasiSemua,
    anggotaIdsLatihBaruBaru,
    totalAnggotaStatusSiagaAktif,
  ] = await Promise.all([
    prisma.anggota.count(),
    prisma.anggota.groupBy({ by: ["statusSiaga"], _count: true }),
    prisma.profilDemografi.groupBy({ by: ["jenisKelamin"], _count: true }),
    prisma.profilDemografi.groupBy({ by: ["pendidikan"], _count: true, where: { pendidikan: { not: null } } }),
    prisma.anggota.aggregate({ _avg: { readinessScore: true } }),
    getReadinessPerWilayah(),
    prisma.misi.findMany({
      where: { status: { in: STATUS_MISI_AKTIF } },
      select: { kodeMisi: true, jenisKejadian: true, lokasi: true, status: true, urgensi: true },
    }),
    prisma.sertifikasi.findMany({ select: { tanggalBerlaku: true } }),
    prisma.pelatihan.findMany({
      where: { tanggal: { gte: tigaBulanLalu } },
      select: { anggotaId: true },
      distinct: ["anggotaId"],
    }),
    // "Aktif" di sini WAJIB berdasarkan statusSiaga (Aktif/Siaga/Tidak Tersedia) — sama seperti
    // KPI "Aktif" di Overview & Direktori Anggota. Sebelumnya salah pakai statusKeanggotaan
    // (Aktif/Nonaktif, hampir semua anggota bernilai Aktif di sana), jadi AI Chat pernah menjawab
    // "110 anggota aktif" padahal seharusnya ~59 — dua field "aktif" yang beda arti ketuker.
    prisma.anggota.count({ where: { statusSiaga: STATUS_SIAGA.AKTIF } }),
  ]);

  const sertifikasiKedaluwarsa = sertifikasiSemua.filter(
    (s) => computeSertifikasiStatus(s.tanggalBerlaku, now) === STATUS_SERTIFIKASI.KEDALUWARSA
  ).length;

  const belumPelatihan3Bulan = Math.max(0, totalAnggotaStatusSiagaAktif - anggotaIdsLatihBaruBaru.length);

  return {
    totalAnggota,
    statusSiaga: byStatusSiaga.map((s) => ({ status: s.statusSiaga, jumlah: s._count })),
    gender: byGender.map((g) => ({ jenisKelamin: g.jenisKelamin, jumlah: g._count })),
    pendidikan: byPendidikan.map((p) => ({ pendidikan: p.pendidikan as string, jumlah: p._count })),
    readinessNasional: Math.round((readinessAgg._avg.readinessScore ?? 0) * 10) / 10,
    readinessPerWilayah: readinessWilayah,
    misiAktif,
    sertifikasiKedaluwarsa,
    belumPelatihan3Bulan,
    totalAnggotaStatusSiagaAktif,
    waktuSnapshot: now.toISOString(),
  };
}

export type ChatContext = Awaited<ReturnType<typeof getChatContext>>;
