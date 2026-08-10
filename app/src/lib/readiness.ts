// Readiness Score (FR-04). Formula di bawah ini ASUMSI — didokumentasikan sesuai pola FRD §11,
// belum divalidasi user (sama seperti bobot AI Mobilization sebelum Fase 10 dibuat configurable).
// Menggantikan nilai acak dari seed dengan angka yang benar-benar dihitung dari data anggota.

import { prisma } from "@/lib/prisma";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { STATUS_SERTIFIKASI, STATUS_KEHADIRAN } from "@/lib/constants";

type ReadinessInput = {
  sertifikasi: { tanggalBerlaku: Date }[];
  pelatihan: { tanggal: Date; statusKelulusan: string }[];
  penugasan: { statusKehadiran: string }[];
};

const BOBOT_KEHADIRAN: Record<string, number> = {
  [STATUS_KEHADIRAN.SELESAI]: 100,
  [STATUS_KEHADIRAN.HADIR]: 100,
  [STATUS_KEHADIRAN.DIKONFIRMASI]: 80,
  [STATUS_KEHADIRAN.MENUNGGU_RESPONS]: 60,
  [STATUS_KEHADIRAN.DITOLAK]: 20,
};

/** Kompetensi 40% (proporsi sertifikasi Aktif) + Pelatihan 30% (recency kelulusan terakhir) +
 * Penugasan 30% (keandalan riwayat kehadiran). Netral (bukan 0) untuk anggota tanpa rekam jejak
 * di salah satu komponen, supaya anggota baru tidak otomatis dapat skor terendah. */
export function computeReadinessScore(input: ReadinessInput, now: Date = new Date()): number {
  const skorKompetensi =
    input.sertifikasi.length === 0
      ? 50
      : (input.sertifikasi.filter((s) => computeSertifikasiStatus(s.tanggalBerlaku, now) === STATUS_SERTIFIKASI.AKTIF)
          .length /
          input.sertifikasi.length) *
        100;

  const lulus = input.pelatihan.filter((p) => p.statusKelulusan === "Lulus");
  let skorPelatihan = 0;
  if (lulus.length > 0) {
    const terbaru = lulus.reduce((a, b) => (a.tanggal > b.tanggal ? a : b));
    const bulanSejak = (now.getTime() - terbaru.tanggal.getTime()) / (30 * 24 * 60 * 60 * 1000);
    skorPelatihan = bulanSejak <= 6 ? 100 : bulanSejak <= 12 ? 75 : bulanSejak <= 24 ? 50 : 25;
  }

  let skorPenugasan = 60;
  if (input.penugasan.length > 0) {
    const total = input.penugasan.reduce((sum, p) => sum + (BOBOT_KEHADIRAN[p.statusKehadiran] ?? 50), 0);
    skorPenugasan = total / input.penugasan.length;
  }

  const total = 0.4 * skorKompetensi + 0.3 * skorPelatihan + 0.3 * skorPenugasan;
  return Math.max(0, Math.min(100, Math.round(total)));
}

/** Hitung ulang & simpan Readiness Score satu anggota dari data terkini di DB — dipanggil setelah
 * mutasi yang memengaruhi komponen formula (status kehadiran penugasan berubah). */
export async function recalculateReadinessScore(anggotaId: string): Promise<void> {
  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: {
      sertifikasi: { select: { tanggalBerlaku: true } },
      pelatihan: { select: { tanggal: true, statusKelulusan: true } },
      penugasan: { select: { statusKehadiran: true } },
    },
  });
  if (!anggota) return;
  const skor = computeReadinessScore(anggota);
  await prisma.anggota.update({
    where: { id: anggotaId },
    data: { readinessScore: skor, readinessUpdatedAt: new Date() },
  });
}
