// Data-fetching untuk Modul Manajemen Misi & AI Mobilization (FR-08 s.d. FR-16). Server-only.

import { prisma } from "@/lib/prisma";
import { STATUS_MISI, STATUS_MISI_AKTIF, STATUS_SIAGA } from "@/lib/constants";
import { haversineKm, estimateEtaMenit } from "@/lib/geo";

export async function getMisiList() {
  const misi = await prisma.misi.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { penugasan: true } } },
  });
  return misi.map((m) => ({
    id: m.id,
    kodeMisi: m.kodeMisi,
    jenisKejadian: m.jenisKejadian,
    lokasi: m.lokasi,
    urgensi: m.urgensi,
    status: m.status,
    personel: m._count.penugasan,
    createdAt: m.createdAt,
  }));
}

/** Daftar Misi lengkap dengan Penugasan+Anggota untuk drawer detail (FR-14). Dataset kecil di MVP
 * ini (puluhan Misi) jadi dimuat sekaligus — sama seperti getAnggotaFullList, perlu server-side
 * pagination kalau volume Misi sudah besar (NFR-02). */
export async function getMisiListFull() {
  const misi = await prisma.misi.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      penugasan: {
        include: { anggota: true },
        orderBy: { skorRekomendasi: "desc" },
      },
    },
  });
  return misi.map((m) => ({
    ...m,
    penugasan: m.penugasan.map((p) => ({ ...p, alasan: JSON.parse(p.alasan) as string[] })),
  }));
}

export type MisiListItem = Awaited<ReturnType<typeof getMisiListFull>>[number];

export async function getMisiDetail(id: string) {
  const misi = await prisma.misi.findUnique({
    where: { id },
    include: {
      penugasan: {
        include: { anggota: true },
        orderBy: { skorRekomendasi: "desc" },
      },
    },
  });
  if (!misi) return null;
  return {
    ...misi,
    penugasan: misi.penugasan.map((p) => ({
      ...p,
      alasan: JSON.parse(p.alasan) as string[],
    })),
  };
}

export type MisiDetail = NonNullable<Awaited<ReturnType<typeof getMisiDetail>>>;

/** Misi Draft yang rekomendasinya sudah digenerate AI tapi belum di-approve Operator (FR-12). */
export async function getMisiMenungguApproval() {
  const misi = await prisma.misi.findMany({
    where: { status: STATUS_MISI.DRAFT },
    orderBy: { createdAt: "desc" },
    include: {
      penugasan: {
        include: { anggota: true },
        orderBy: { skorRekomendasi: "desc" },
      },
    },
  });
  return misi.map((m) => ({
    ...m,
    penugasan: m.penugasan.map((p) => ({ ...p, alasan: JSON.parse(p.alasan) as string[] })),
  }));
}

export type MisiMenunggu = Awaited<ReturnType<typeof getMisiMenungguApproval>>[number];

export async function getMisiKpi() {
  const now = new Date();
  const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);

  const [misiAktif, kritisAktif, selesaiBulanIni, penugasanAktif] = await Promise.all([
    prisma.misi.count({ where: { status: { in: STATUS_MISI_AKTIF } } }),
    prisma.misi.count({
      where: { status: { in: STATUS_MISI_AKTIF }, urgensi: "Kritis" },
    }),
    prisma.misi.count({ where: { status: STATUS_MISI.SELESAI, selesaiAt: { gte: awalBulan } } }),
    prisma.penugasan.findMany({
      where: { misi: { status: { in: [STATUS_MISI.DIMOBILISASI, STATUS_MISI.SELESAI] } } },
      select: { etaMenit: true, misiId: true },
    }),
  ]);

  const maxEtaPerMisi = new Map<string, number>();
  for (const p of penugasanAktif) {
    if (p.etaMenit === null) continue;
    const current = maxEtaPerMisi.get(p.misiId) ?? 0;
    if (p.etaMenit > current) maxEtaPerMisi.set(p.misiId, p.etaMenit);
  }
  const etaValues = [...maxEtaPerMisi.values()];
  const rataWaktuBerkumpulMenit =
    etaValues.length > 0 ? Math.round(etaValues.reduce((a, b) => a + b, 0) / etaValues.length) : 0;

  return {
    misiAktif,
    kritisAktif,
    selesaiBulanIni,
    personelTermobilisasi: penugasanAktif.length,
    rataWaktuBerkumpulMenit,
  };
}

export type MisiKpi = Awaited<ReturnType<typeof getMisiKpi>>;

/** FR-28: tabel historis Misi Selesai, terurut dari yang paling baru selesai. */
export async function getRiwayatMobilisasi() {
  const misi = await prisma.misi.findMany({
    where: { status: STATUS_MISI.SELESAI },
    orderBy: { selesaiAt: "desc" },
    include: { _count: { select: { penugasan: true } } },
  });
  return misi.map((m) => ({
    id: m.id,
    kodeMisi: m.kodeMisi,
    jenisKejadian: m.jenisKejadian,
    lokasi: m.lokasi,
    selesaiAt: m.selesaiAt,
    personel: m._count.penugasan,
    hasilEvaluasi: m.hasilEvaluasi,
  }));
}

export type RiwayatMobilisasiItem = Awaited<ReturnType<typeof getRiwayatMobilisasi>>[number];

export type KandidatPool = {
  anggotaId: string;
  kodeAnggota: string;
  nama: string;
  unitAsal: string;
  readinessScore: number;
  kompetensi: string[];
  jarakKm: number;
  etaMenit: number;
  hariSejakPenugasanTerakhir: number | null;
};

/** Kandidat calon personel untuk sebuah Misi baru: anggota Aktif/Siaga terdekat dari lokasi Misi,
 * diurutkan jarak lalu diambil pool teratas untuk diserahkan ke AI Mobilization (FR-09, FR-10).
 * `radiusKm` (dari Pengaturan → Parameter Model, FR-11) diterapkan sebagai filter jarak kalau
 * diisi — tapi kalau hasilnya kosong (radius terlalu ketat/anggota jauh semua, lumrah untuk seed
 * data yang tersebar antar-provinsi), fallback ke `poolSize` kandidat terdekat apa adanya supaya
 * Operator tetap dapat rekomendasi, bukan layar kosong. */
export async function getKandidatPool(
  misiLat: number,
  misiLng: number,
  poolSize = 15,
  radiusKm?: number
): Promise<KandidatPool[]> {
  const anggota = await prisma.anggota.findMany({
    where: {
      statusKeanggotaan: "Aktif",
      statusSiaga: { in: [STATUS_SIAGA.AKTIF, STATUS_SIAGA.SIAGA] },
    },
    include: {
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1 },
      sertifikasi: { take: 3 },
      penugasan: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const now = Date.now();

  const semua = anggota
    .filter((a) => a.lokasiHistori.length > 0)
    .map((a) => {
      const lokasi = a.lokasiHistori[0];
      const jarakKm = haversineKm(misiLat, misiLng, lokasi.latitude, lokasi.longitude);
      const lastPenugasan = a.penugasan[0];
      return {
        anggotaId: a.id,
        kodeAnggota: a.kodeAnggota,
        nama: a.nama,
        unitAsal: a.unitAsal,
        readinessScore: a.readinessScore,
        kompetensi: a.sertifikasi.map((s) => s.jenisSertifikasi),
        jarakKm: Math.round(jarakKm * 10) / 10,
        etaMenit: estimateEtaMenit(jarakKm),
        hariSejakPenugasanTerakhir: lastPenugasan
          ? Math.round((now - lastPenugasan.createdAt.getTime()) / (24 * 60 * 60 * 1000))
          : null,
      };
    })
    .sort((a, b) => a.jarakKm - b.jarakKm);

  if (radiusKm) {
    const dalamRadius = semua.filter((a) => a.jarakKm <= radiusKm);
    if (dalamRadius.length > 0) return dalamRadius.slice(0, poolSize);
  }
  return semua.slice(0, poolSize);
}
