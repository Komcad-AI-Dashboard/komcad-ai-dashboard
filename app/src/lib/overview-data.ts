// Data-fetching & agregasi untuk Modul Overview (FR-17 s.d. FR-25). Server-only — dipanggil
// dari Server Component `app/(command)/overview/page.tsx`.

import { prisma } from "@/lib/prisma";
import { STATUS_MISI, STATUS_MISI_AKTIF, STATUS_SIAGA } from "@/lib/constants";

export type MapAnggota = {
  id: string;
  kodeAnggota: string;
  nama: string;
  unitAsal: string;
  statusSiaga: string;
  readinessScore: number;
  lat: number;
  lng: number;
  kompetensi: string;
};

export async function getMapAnggota(): Promise<MapAnggota[]> {
  const anggota = await prisma.anggota.findMany({
    where: { statusSiaga: { in: [STATUS_SIAGA.AKTIF, STATUS_SIAGA.SIAGA] } },
    include: {
      lokasiHistori: { orderBy: { recordedAt: "desc" }, take: 1 },
      sertifikasi: { take: 2 },
    },
  });

  return anggota
    .filter((a) => a.lokasiHistori.length > 0)
    .map((a) => ({
      id: a.id,
      kodeAnggota: a.kodeAnggota,
      nama: a.nama,
      unitAsal: a.unitAsal,
      statusSiaga: a.statusSiaga,
      readinessScore: a.readinessScore,
      lat: a.lokasiHistori[0].latitude,
      lng: a.lokasiHistori[0].longitude,
      kompetensi: a.sertifikasi.map((s) => s.jenisSertifikasi).join(", ") || "—",
    }));
}

export type MapMisi = {
  id: string;
  kodeMisi: string;
  jenisKejadian: string;
  lokasi: string;
  urgensi: string;
  status: string;
  lat: number;
  lng: number;
  personel: number;
};

export async function getMapMisi(): Promise<MapMisi[]> {
  const misi = await prisma.misi.findMany({
    where: {
      status: { notIn: [STATUS_MISI.SELESAI, STATUS_MISI.DIBATALKAN] },
      latitude: { not: null },
      longitude: { not: null },
    },
    include: { _count: { select: { penugasan: true } } },
  });

  return misi.map((m) => ({
    id: m.id,
    kodeMisi: m.kodeMisi,
    jenisKejadian: m.jenisKejadian,
    lokasi: m.lokasi,
    urgensi: m.urgensi,
    status: m.status,
    lat: m.latitude!,
    lng: m.longitude!,
    personel: m._count.penugasan,
  }));
}

export async function getAktivitasPelatihanTerbaru() {
  const list = await prisma.aktivitasPelatihan.findMany({
    orderBy: { tanggal: "desc" },
    take: 10,
  });
  return list.map((t) => ({
    id: t.id,
    nama: t.namaPelatihan,
    lokasi: t.lokasi,
    tanggal: t.tanggal,
    peserta: t.jumlahPeserta,
  }));
}

export async function getStatistikAnggota() {
  const [total, aktif, byGender, provinsiGroups] = await Promise.all([
    prisma.anggota.count(),
    prisma.anggota.count({ where: { statusSiaga: STATUS_SIAGA.AKTIF } }),
    prisma.profilDemografi.groupBy({ by: ["jenisKelamin"], _count: true }),
    prisma.profilDemografi.groupBy({
      by: ["provinsi"],
      _count: true,
      where: { provinsi: { not: null } },
    }),
  ]);

  const laki = byGender.find((g) => g.jenisKelamin === "Laki-laki")?._count ?? 0;
  const perempuan = byGender.find((g) => g.jenisKelamin === "Perempuan")?._count ?? 0;

  const provinsi = provinsiGroups
    .map((p) => ({ nama: p.provinsi as string, jumlah: p._count }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  return { total, aktif, laki, perempuan, provinsi };
}

// Urutan penting: dicek dari atas ke bawah, yang pertama cocok menang. "Nusa Tenggara" ditaruh
// sebelum Jawa karena beberapa kabupatennya (mis. "Manggarai, Nusa Tenggara Timur") tidak memuat
// kata provinsi yang lain, tapi kabupaten seperti "Sumbawa" jangan sampai tertangkap "jawa".
const WILAYAH_KEYWORDS: Record<string, string[]> = {
  "Nusa Tenggara": [
    "nusa tenggara", "ntt", "ntb", "flores", "kupang", "manggarai", "ngada", "nagekeo",
    "ende", "sikka", "sumba", "lombok", "mataram", "bima", "sumbawa", "alor", "timor",
  ],
  Jawa: ["jawa", "jakarta", "bandung", "semarang", "surabaya", "yogyakarta", "banten", "malang", "probolinggo"],
  Sumatera: ["sumatera", "medan", "palembang", "lampung", "aceh", "riau", "jambi", "nias", "padang", "bengkulu"],
  Kalimantan: ["kalimantan", "balikpapan", "pontianak", "banjarmasin", "samarinda", "ketapang", "palangka", "banjarbaru", "berau"],
  Sulawesi: ["sulawesi", "makassar", "manado", "kendari", "palu", "gorontalo", "minahasa"],
};

export function wilayahFromLokasi(lokasi: string): string {
  const lower = lokasi.toLowerCase();
  for (const [wilayah, keywords] of Object.entries(WILAYAH_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return wilayah;
  }
  return "Lainnya";
}

export type FeedItem = {
  id: string;
  color: "red" | "amber" | "green";
  kodeMisi: string;
  description: string;
  time: string;
  wilayah: string;
};

// description dirakit sebagai plain text (bukan HTML string) — dirender lewat JSX di komponen,
// bukan dangerouslySetInnerHTML, supaya field bebas-teks seperti Lokasi tidak jadi celah XSS.
export async function getMisiTerbaruFeed(): Promise<FeedItem[]> {
  const misi = await prisma.misi.findMany({
    orderBy: { updatedAt: "desc" },
    // Panelnya bisa di-scroll dan disaring per wilayah — batas 8 membuat tab wilayah sering
    // kosong padahal Misi-nya ada, karena terpotong sebelum sempat disaring.
    take: 24,
    include: { _count: { select: { penugasan: true } } },
  });

  return misi.map((m) => {
    const color = m.status === STATUS_MISI.SELESAI ? "green" : m.urgensi === "Kritis" ? "red" : "amber";
    let description: string;
    if (m.status === STATUS_MISI.SELESAI) {
      description = `${m.jenisKejadian}, ${m.lokasi}. Misi resmi ditutup, evaluasi tersimpan.`;
    } else if (m.status === STATUS_MISI.DIMOBILISASI) {
      description = `${m.jenisKejadian}, ${m.lokasi}. Status: Dimobilisasi. ${m._count.penugasan} personel dikerahkan.`;
    } else {
      description = `${m.jenisKejadian}, ${m.lokasi}. AI menyusun rekomendasi ${m._count.penugasan} kandidat personel.`;
    }
    return {
      id: m.id,
      color,
      kodeMisi: m.kodeMisi,
      description,
      time: m.updatedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      wilayah: wilayahFromLokasi(m.lokasi),
    };
  });
}

export async function getAiMobilizationSummary() {
  const [misi, misiAktifCount, misiSevenDaysCount] = await Promise.all([
    prisma.misi.findFirst({
      where: { status: STATUS_MISI.DIMOBILISASI },
      orderBy: { dimobilisasiAt: "desc" },
      include: {
        penugasan: {
          include: { anggota: true },
          orderBy: { skorRekomendasi: "desc" },
        },
      },
    }),
    prisma.misi.count({ where: { status: { in: STATUS_MISI_AKTIF } } }),
    prisma.misi.count({
      where: { dimobilisasiAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    misi,
    kandidat: (misi?.penugasan ?? []).map((p) => ({
      id: p.id,
      nama: p.anggota.nama,
      score: p.skorRekomendasi,
      alasan: (JSON.parse(p.alasan) as string[]).join(" · "),
      etaMenit: p.etaMenit,
    })),
    misiAktifCount,
    misiSevenDaysCount,
  };
}

export async function getTopbarKpi() {
  const [misiAktifCount, agg] = await Promise.all([
    prisma.misi.count({ where: { status: { in: STATUS_MISI_AKTIF } } }),
    prisma.anggota.aggregate({ _avg: { readinessScore: true } }),
  ]);
  return {
    misiAktifCount,
    readinessNasional: Math.round(agg._avg.readinessScore ?? 0),
  };
}
