// Data-fetching untuk Modul Analitik & Laporan (FR-26 s.d. FR-28). Server-only.

import { prisma } from "@/lib/prisma";
import { STATUS_MISI, STATUS_SERTIFIKASI } from "@/lib/constants";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { getReadinessPerWilayahBulanLalu, getTrenKesiapsiagaan, hitungSelisih } from "@/lib/analitik-riwayat";

export async function getAnalitikKpi() {
  const now = new Date();
  const trigaPuluhHariLalu = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [readinessAgg, misiSelesai30Hari, sertifikasiSemua, aiLogs, tren] = await Promise.all([
    prisma.anggota.aggregate({ _avg: { readinessScore: true } }),
    prisma.misi.count({ where: { status: STATUS_MISI.SELESAI, selesaiAt: { gte: trigaPuluhHariLalu } } }),
    prisma.sertifikasi.findMany({ select: { tanggalBerlaku: true } }),
    prisma.auditLog.findMany({ where: { aksi: "AI_MOBILIZATION_GENERATE" }, select: { metadata: true } }),
    getTrenKesiapsiagaan(),
  ]);

  const sertifikasiKedaluwarsa = sertifikasiSemua.filter(
    (s) => computeSertifikasiStatus(s.tanggalBerlaku, now) === STATUS_SERTIFIKASI.KEDALUWARSA
  ).length;

  const sumberList = aiLogs.map((l) => {
    try {
      return (JSON.parse(l.metadata ?? "{}") as { sumber?: string }).sumber;
    } catch {
      return undefined;
    }
  });
  const totalGenerate = sumberList.length;
  const berhasilOpenAi = sumberList.filter((s) => s === "openai").length;
  const aiUptimePersen = totalGenerate > 0 ? Math.round((berhasilOpenAi / totalGenerate) * 1000) / 10 : null;

  const readinessNasional = Math.round((readinessAgg._avg.readinessScore ?? 0) * 10) / 10;

  // Titik terakhir tren adalah bulan berjalan, sebelumnya bulan lalu. Perbandingannya diambil dari
  // situ supaya angka di kartu dan garis tren tidak pernah bercerita beda.
  const bulanLalu = tren.length >= 2 ? tren[tren.length - 2] : null;

  return {
    readinessNasional,
    misiSelesai30Hari,
    sertifikasiKedaluwarsa,
    aiUptimePersen, // null = belum ada data (belum pernah generate AI Mobilization sama sekali)
    totalGenerateAi: totalGenerate,
    tren,
    // Readiness naik itu bagus. Sertifikasi kedaluwarsa naik itu justru buruk — arah "baik" harus
    // ikut dibawa, tidak bisa disimpulkan dari tanda plus/minus saja.
    selisihReadiness: hitungSelisih(readinessNasional, bulanLalu?.readiness ?? null, true),
    selisihSertifikasiKedaluwarsa: hitungSelisih(
      sertifikasiKedaluwarsa,
      bulanLalu ? bulanLalu.sertifikasiKedaluwarsa : null,
      false
    ),
  };
}

export type AnalitikKpi = Awaited<ReturnType<typeof getAnalitikKpi>>;

/** Readiness Score rata-rata per wilayah (provinsi), diurutkan tertinggi (FR-26: "bar wilayah diurutkan sesuai data"). */
export async function getReadinessPerWilayah() {
  const anggota = await prisma.anggota.findMany({
    where: { statusKeanggotaan: "Aktif" },
    select: { readinessScore: true, profilDemografi: { select: { provinsi: true } } },
  });

  const byProvinsi = new Map<string, { total: number; count: number }>();
  for (const a of anggota) {
    const provinsi = a.profilDemografi?.provinsi;
    if (!provinsi) continue;
    const entry = byProvinsi.get(provinsi) ?? { total: 0, count: 0 };
    entry.total += a.readinessScore;
    entry.count += 1;
    byProvinsi.set(provinsi, entry);
  }

  const bulanLalu = await getReadinessPerWilayahBulanLalu();

  return [...byProvinsi.entries()]
    .map(([provinsi, { total, count }]) => {
      const score = Math.round(total / count);
      return {
        provinsi,
        score,
        jumlahAnggota: count,
        selisih: hitungSelisih(score, bulanLalu.get(provinsi) ?? null, true),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export type ReadinessWilayah = Awaited<ReturnType<typeof getReadinessPerWilayah>>[number];
