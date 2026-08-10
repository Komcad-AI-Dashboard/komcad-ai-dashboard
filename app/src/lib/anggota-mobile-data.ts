// Data-fetching untuk Sisi Anggota / Mobile Web (FR-37 s.d. FR-40). Server-only.
// Setiap fungsi di sini WAJIB dipanggil dengan anggotaId dari sesi login (session.user.anggotaId),
// TIDAK PERNAH dari input/parameter yang bisa dikontrol client — itulah data isolation FR-38.

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { STATUS_SERTIFIKASI } from "@/lib/constants";
import { decryptSensitive } from "@/lib/crypto";

/** Ambil anggotaId dari sesi login, cuma untuk role ANGGOTA. Server Action/data-fetcher Sisi
 * Anggota manapun WAJIB lewat sini dulu — jangan pernah percaya anggotaId dari client. */
export async function requireSelfAnggotaId(): Promise<{ anggotaId: string; userId: string } | { error: string }> {
  const session = await auth();
  if (session?.user?.role !== ROLES.ANGGOTA) {
    return { error: "Halaman ini khusus Anggota Komcad." };
  }
  if (!session.user.anggotaId) {
    return { error: "Akun Anda belum ditautkan ke data Anggota. Hubungi Admin." };
  }
  return { anggotaId: session.user.anggotaId, userId: session.user.id };
}

export async function getSelfProfil(anggotaId: string) {
  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    include: {
      profilDemografi: true,
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1 },
      sertifikasi: { orderBy: { tanggalBerlaku: "desc" } },
      pelatihan: { orderBy: { tanggal: "desc" } },
      penugasan: { orderBy: { createdAt: "desc" }, include: { misi: true } },
      permintaanUbahData: { where: { status: "Menunggu" }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!anggota) return null;
  return {
    ...anggota,
    nik: decryptSensitive(anggota.nik),
    permintaanUbahData: anggota.permintaanUbahData.map((p) =>
      p.field === "nik"
        ? { ...p, nilaiLama: decryptSensitive(p.nilaiLama), nilaiBaru: decryptSensitive(p.nilaiBaru) }
        : p
    ),
    sertifikasi: anggota.sertifikasi.map((s) => ({ ...s, status: computeSertifikasiStatus(s.tanggalBerlaku) })),
  };
}

export type SelfProfil = NonNullable<Awaited<ReturnType<typeof getSelfProfil>>>;

export async function getSelfQuickStats(anggotaId: string) {
  const [sertifikasi, pelatihanCount, penugasanTerakhir, penugasanCount] = await Promise.all([
    prisma.sertifikasi.findMany({ where: { anggotaId }, select: { tanggalBerlaku: true } }),
    prisma.pelatihan.count({ where: { anggotaId } }),
    prisma.penugasan.findFirst({ where: { anggotaId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.penugasan.count({ where: { anggotaId } }),
  ]);

  const sertifikasiAktif = sertifikasi.filter(
    (s) => computeSertifikasiStatus(s.tanggalBerlaku) === STATUS_SERTIFIKASI.AKTIF
  ).length;

  const hariSejakTugasTerakhir = penugasanTerakhir
    ? Math.round((Date.now() - penugasanTerakhir.createdAt.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return { sertifikasiAktif, pelatihanCount, penugasanCount, hariSejakTugasTerakhir };
}

export async function getSelfNotifikasi(anggotaId: string) {
  const list = await prisma.notifikasi.findMany({
    where: { anggotaId },
    orderBy: { createdAt: "desc" },
    include: { misi: { select: { kodeMisi: true, jenisKejadian: true, lokasi: true } } },
  });
  return list;
}

export type SelfNotifikasiItem = Awaited<ReturnType<typeof getSelfNotifikasi>>[number];

export async function getSelfUnreadNotifikasiCount(anggotaId: string) {
  return prisma.notifikasi.count({ where: { anggotaId, status: "Terkirim" } });
}
