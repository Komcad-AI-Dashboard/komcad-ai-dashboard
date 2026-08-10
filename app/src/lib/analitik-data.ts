// Data-fetching untuk Modul Analitik & Laporan (FR-26 s.d. FR-28). Server-only.

import { prisma } from "@/lib/prisma";
import { STATUS_MISI, STATUS_SERTIFIKASI } from "@/lib/constants";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";

export async function getAnalitikKpi() {
  const now = new Date();
  const trigaPuluhHariLalu = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [readinessAgg, misiSelesai30Hari, sertifikasiSemua, aiLogs] = await Promise.all([
    prisma.anggota.aggregate({ _avg: { readinessScore: true } }),
    prisma.misi.count({ where: { status: STATUS_MISI.SELESAI, selesaiAt: { gte: trigaPuluhHariLalu } } }),
    prisma.sertifikasi.findMany({ select: { tanggalBerlaku: true } }),
    prisma.auditLog.findMany({ where: { aksi: "AI_MOBILIZATION_GENERATE" }, select: { metadata: true } }),
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

  return {
    readinessNasional: Math.round((readinessAgg._avg.readinessScore ?? 0) * 10) / 10,
    misiSelesai30Hari,
    sertifikasiKedaluwarsa,
    aiUptimePersen, // null = belum ada data (belum pernah generate AI Mobilization sama sekali)
    totalGenerateAi: totalGenerate,
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

  return [...byProvinsi.entries()]
    .map(([provinsi, { total, count }]) => ({
      provinsi,
      score: Math.round(total / count),
      jumlahAnggota: count,
    }))
    .sort((a, b) => b.score - a.score);
}

export type ReadinessWilayah = Awaited<ReturnType<typeof getReadinessPerWilayah>>[number];
