// Data-fetching untuk Modul Manajemen Data Anggota (FR-01 s.d. FR-07). Server-only.

import { prisma } from "@/lib/prisma";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { STATUS_SIAGA } from "@/lib/constants";
import { decryptSensitive } from "@/lib/crypto";

/** NIK & PermintaanUbahData terkait NIK tersimpan terenkripsi (NFR-04) — dekripsi di titik baca
 * ini (server-only), supaya kode di atasnya tetap kerja dengan nilai plaintext seperti sebelumnya. */
function decryptPermintaan<T extends { field: string; nilaiLama: string; nilaiBaru: string }>(list: T[]): T[] {
  return list.map((p) =>
    p.field === "nik"
      ? { ...p, nilaiLama: decryptSensitive(p.nilaiLama), nilaiBaru: decryptSensitive(p.nilaiBaru) }
      : p
  );
}

/**
 * Fase 5 baru menangani ~20 anggota dummy, jadi seluruh detail dimuat sekaligus dan
 * pencarian/filter/drawer semua jalan di client (persis pola mockup). Kalau skala data
 * anggota beneran mendekati target NFR-02 (500rb), ini WAJIB diganti pencarian & drawer
 * detail server-side per-baris (tidak lagi kirim semua detail ke client sekaligus).
 */
export async function getAnggotaFullList() {
  const list = await prisma.anggota.findMany({
    orderBy: { nama: "asc" },
    include: {
      profilDemografi: true,
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1 },
      sertifikasi: { orderBy: { tanggalBerlaku: "desc" } },
      pelatihan: { orderBy: { tanggal: "desc" } },
      penugasan: { orderBy: { createdAt: "desc" }, include: { misi: true } },
      permintaanUbahData: { where: { status: "Menunggu" }, orderBy: { createdAt: "desc" } },
    },
  });

  return list.map((a) => ({
    ...a,
    nik: decryptSensitive(a.nik),
    permintaanUbahData: decryptPermintaan(a.permintaanUbahData),
    sertifikasi: a.sertifikasi.map((s) => ({
      ...s,
      status: computeSertifikasiStatus(s.tanggalBerlaku),
    })),
  }));
}

export type AnggotaFull = Awaited<ReturnType<typeof getAnggotaFullList>>[number];

export async function getKpiAnggota() {
  const [total, aktif, siaga, tidakTersedia] = await Promise.all([
    prisma.anggota.count(),
    prisma.anggota.count({ where: { statusSiaga: STATUS_SIAGA.AKTIF } }),
    prisma.anggota.count({ where: { statusSiaga: STATUS_SIAGA.SIAGA } }),
    prisma.anggota.count({ where: { statusSiaga: STATUS_SIAGA.TIDAK_TERSEDIA } }),
  ]);
  return { total, aktif, siaga, tidakTersedia };
}

export async function getAnggotaDetail(id: string) {
  const anggota = await prisma.anggota.findUnique({
    where: { id },
    include: {
      profilDemografi: true,
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1 },
      sertifikasi: { orderBy: { tanggalBerlaku: "desc" } },
      pelatihan: { orderBy: { tanggal: "desc" } },
      penugasan: {
        orderBy: { createdAt: "desc" },
        include: { misi: true },
      },
    },
  });
  if (!anggota) return null;

  return {
    ...anggota,
    nik: decryptSensitive(anggota.nik),
    sertifikasi: anggota.sertifikasi.map((s) => ({
      ...s,
      status: computeSertifikasiStatus(s.tanggalBerlaku),
    })),
  };
}

export type AnggotaDetail = NonNullable<Awaited<ReturnType<typeof getAnggotaDetail>>>;

/** FR-06: tabel status sertifikasi seluruh anggota (menu Kompetensi & Sertifikasi). */
export async function getAllSertifikasi() {
  const list = await prisma.sertifikasi.findMany({
    include: { anggota: { select: { kodeAnggota: true, nama: true } } },
    orderBy: { tanggalBerlaku: "asc" },
  });
  return list.map((s) => ({
    id: s.id,
    anggotaLabel: `${s.anggota.kodeAnggota} · ${s.anggota.nama}`,
    jenisSertifikasi: s.jenisSertifikasi,
    tanggalTerbit: s.tanggalTerbit,
    tanggalBerlaku: s.tanggalBerlaku,
    status: computeSertifikasiStatus(s.tanggalBerlaku),
  }));
}

/** Menu Riwayat Pelatihan — tabel riwayat pelatihan seluruh anggota + status kelulusan. */
export async function getAllPelatihan() {
  const list = await prisma.pelatihan.findMany({
    include: { anggota: { select: { kodeAnggota: true, nama: true } } },
    orderBy: { tanggal: "desc" },
  });
  return list.map((p) => ({
    id: p.id,
    anggotaLabel: `${p.anggota.kodeAnggota} · ${p.anggota.nama}`,
    namaPelatihan: p.namaPelatihan,
    tanggal: p.tanggal,
    statusKelulusan: p.statusKelulusan,
  }));
}

