// Misi bencana yang mengacu kejadian NYATA Agustus 2026: gempa M7,7 Flores NTT (15 Agustus),
// karhutla puncak kemarau di Kalimantan/Sulawesi/Jawa, kekeringan di Jawa, dan cuaca ekstrem di
// Sumatera. Angka dampak mengikuti rilis BNPB/BPBD akhir Agustus 2026. Personel yang ditugaskan
// tetap FIKTIF seperti seluruh isi seed.
//
// Dipisah dari seed.ts supaya bisa dijalankan sendiri ke database yang SUDAH terisi tanpa
// menyentuh anggota/user — lihat prisma/tambah-misi-bencana.ts. Aman diulang: Misi yang kodenya
// sudah ada dilewati, bukan dibuat ganda.

import type { PrismaClient } from "@prisma/client";

type MisiBencana = {
  kode: string;
  komandan: string;
  jenis: string;
  urgensi: string;
  lokasi: string;
  lat: number;
  lng: number;
  personel: number;
  /** Rentang indeks anggota yang ditugaskan, [awal, akhir). */
  slice: [number, number];
  /** Berapa hari lalu Misi dimobilisasi; null = masih Draft, belum dimobilisasi. */
  hari: number | null;
  status: "Draft" | "Dimobilisasi" | "Selesai";
  deskripsi: string;
  selesaiHari?: number;
  evaluasi?: string;
};

export const MISI_BENCANA: MisiBencana[] = [
  // — Gempa M7,7 Flores, Nusa Tenggara Timur (15 Agustus 2026) —
  {
    // Kode 003/004 sudah terpakai Misi uji coba lama di database, jadi dua Misi gempa terbesar
    // ini memakai 020/021. Kode hanya penanda, tidak harus urut dengan tanggal kejadian.
    kode: "MISI-2026-020", komandan: "Kolonel Inf. Yohanes Tukan", jenis: "Gempa Bumi", urgensi: "Kritis",
    lokasi: "Kabupaten Manggarai Timur, Nusa Tenggara Timur", lat: -8.617, lng: 120.683,
    personel: 8, slice: [4, 10], hari: 11, status: "Dimobilisasi",
    deskripsi: "Gempa M7,7 merusak 5.962 rumah, terbanyak se-NTT. Dibutuhkan tim SAR, evakuasi korban tertimbun, dan pendirian tenda hunian darurat.",
  },
  {
    kode: "MISI-2026-021", komandan: "Kolonel Inf. Yohanes Tukan", jenis: "Gempa Bumi", urgensi: "Kritis",
    lokasi: "Kabupaten Manggarai, Nusa Tenggara Timur", lat: -8.612, lng: 120.478,
    personel: 8, slice: [10, 16], hari: 11, status: "Dimobilisasi",
    deskripsi: "Korban jiwa terbanyak (38 jiwa) dari rangkaian gempa NTT. 3.146 rumah rusak, fasilitas kesehatan lumpuh sebagian.",
  },
  {
    kode: "MISI-2026-005", komandan: "Letkol Inf. Marselinus Dhone", jenis: "Gempa Bumi", urgensi: "Tinggi",
    lokasi: "Kabupaten Nagekeo, Nusa Tenggara Timur", lat: -8.45, lng: 121.36,
    personel: 6, slice: [16, 21], hari: 10, status: "Dimobilisasi",
    deskripsi: "13 jiwa meninggal, akses jalan kabupaten terputus longsoran susulan. Prioritas pembukaan jalur logistik.",
  },
  {
    kode: "MISI-2026-006", komandan: "Letkol Inf. Marselinus Dhone", jenis: "Gempa Bumi", urgensi: "Tinggi",
    lokasi: "Kabupaten Ngada, Nusa Tenggara Timur", lat: -8.79, lng: 120.98,
    personel: 5, slice: [21, 25], hari: 9, status: "Dimobilisasi",
    deskripsi: "5 jiwa meninggal, pengungsi terkonsentrasi di Bajawa. Dukungan dapur umum dan distribusi air bersih.",
  },
  {
    kode: "MISI-2026-007", komandan: "Mayor Inf. Petrus Wangge", jenis: "Gempa Bumi", urgensi: "Sedang",
    lokasi: "Kabupaten Sikka, Nusa Tenggara Timur", lat: -8.62, lng: 122.21,
    personel: 4, slice: [25, 29], hari: null, status: "Draft",
    deskripsi: "6 jiwa meninggal. Asesmen kerusakan sekolah dan tempat ibadah sebagai dasar tahap rehabilitasi.",
  },
  {
    kode: "MISI-2026-008", komandan: "Mayor Inf. Petrus Wangge", jenis: "Gempa Bumi", urgensi: "Sedang",
    lokasi: "Kabupaten Ende, Nusa Tenggara Timur", lat: -8.84, lng: 121.66,
    personel: 4, slice: [29, 33], hari: null, status: "Draft",
    deskripsi: "3 jiwa meninggal. Pendataan 1.915 fasilitas publik terdampak lintas kabupaten dimulai dari Ende.",
  },
  {
    kode: "MISI-2026-009", komandan: "Letkol Inf. Gregorius Jehaut", jenis: "Gempa Bumi", urgensi: "Sedang",
    lokasi: "Kabupaten Manggarai Barat, Nusa Tenggara Timur", lat: -8.49, lng: 119.88,
    personel: 5, slice: [33, 37], hari: 11, status: "Selesai", selesaiHari: 3,
    evaluasi: "Evakuasi warga terdampak tuntas, jalur udara dan laut Labuan Bajo kembali berfungsi sebagai simpul logistik.",
    deskripsi: "1 jiwa meninggal, 3.050 rumah rusak. Pemulihan akses bandara dan pelabuhan sebagai simpul logistik bantuan NTT.",
  },

  // — Karhutla puncak kemarau —
  {
    kode: "MISI-2026-010", komandan: "Kolonel Inf. Sudirman Hakim", jenis: "Kebakaran Hutan", urgensi: "Kritis",
    lokasi: "Kabupaten Ketapang, Kalimantan Barat", lat: -1.85, lng: 109.98,
    personel: 10, slice: [37, 44], hari: 6, status: "Dimobilisasi",
    deskripsi: "Wilayah karhutla terluas se-Kalbar: 12.443 ha dari total 38.310 ha provinsi. Dukungan pemadaman darat dan pembuatan sekat bakar.",
  },
  {
    kode: "MISI-2026-011", komandan: "Letkol Inf. Rahmat Sanjaya", jenis: "Kebakaran Hutan", urgensi: "Kritis",
    lokasi: "Kota Palangka Raya, Kalimantan Tengah", lat: -2.21, lng: 113.92,
    personel: 9, slice: [44, 50], hari: 5, status: "Dimobilisasi",
    deskripsi: "7.634 ha terbakar, 2.479 titik panas. Status darurat karhutla dan kekeringan, kualitas udara memburuk, penerbangan terganggu.",
  },
  {
    kode: "MISI-2026-012", komandan: "Letkol Inf. Rahmat Sanjaya", jenis: "Kebakaran Hutan", urgensi: "Tinggi",
    lokasi: "Kota Banjarbaru, Kalimantan Selatan", lat: -3.44, lng: 114.83,
    personel: 7, slice: [50, 55], hari: 4, status: "Dimobilisasi",
    deskripsi: "6.905 ha lahan terbakar, wilayah terdampak terluas se-Kalsel. Pendinginan lahan gambut dan patroli pencegahan.",
  },
  {
    kode: "MISI-2026-013", komandan: "Mayor Inf. Ventje Rondonuwu", jenis: "Kebakaran Hutan", urgensi: "Tinggi",
    lokasi: "Gunung Soputan, Minahasa Tenggara, Sulawesi Utara", lat: 1.11, lng: 124.73,
    personel: 6, slice: [55, 60], hari: null, status: "Draft",
    deskripsi: "300 ha kawasan lereng Gunung Soputan terbakar. Rencana pemadaman jalur kaki karena akses kendaraan terbatas.",
  },
  {
    kode: "MISI-2026-014", komandan: "Mayor Inf. Bagus Priyanto", jenis: "Kebakaran Hutan", urgensi: "Sedang",
    lokasi: "Kawasan Gunung Bromo, Probolinggo, Jawa Timur", lat: -7.94, lng: 112.95,
    personel: 4, slice: [60, 64], hari: 8, status: "Selesai", selesaiHari: 5,
    evaluasi: "Api padam dalam 3 hari tanpa korban, kawasan wisata dibuka kembali.",
    deskripsi: "Kebakaran 10 ha di kawasan savana Bromo, berpotensi meluas ke area wisata saat angin kencang.",
  },

  // — Kekeringan & krisis air bersih —
  {
    kode: "MISI-2026-015", komandan: "Letkol Inf. Bagus Priyanto", jenis: "Lainnya", urgensi: "Tinggi",
    lokasi: "Kabupaten Malang, Jawa Timur", lat: -8.13, lng: 112.57,
    personel: 6, slice: [64, 69], hari: 18, status: "Dimobilisasi",
    deskripsi: "Kekeringan: 363.800 liter air bersih tersalurkan sejak 8 Agustus. Pengawalan distribusi harian ke desa terdampak.",
  },
  {
    kode: "MISI-2026-016", komandan: "Mayor Inf. Sigit Nugroho", jenis: "Lainnya", urgensi: "Sedang",
    lokasi: "Kabupaten Gunungkidul, Daerah Istimewa Yogyakarta", lat: -7.97, lng: 110.6,
    personel: 5, slice: [69, 73], hari: 14, status: "Dimobilisasi",
    deskripsi: "Krisis air bersih di wilayah karst, sumur warga mengering. Dukungan tangki air dan pendataan kepala keluarga terdampak.",
  },
  {
    kode: "MISI-2026-017", komandan: "Mayor Inf. Sigit Nugroho", jenis: "Lainnya", urgensi: "Sedang",
    lokasi: "Kabupaten Grobogan, Jawa Tengah", lat: -7.09, lng: 110.91,
    personel: 4, slice: [73, 77], hari: null, status: "Draft",
    deskripsi: "Jawa Tengah provinsi terbanyak terdampak kekeringan (35 kabupaten/kota). Grobogan disiapkan sebagai titik distribusi berikutnya.",
  },

  // — Cuaca ekstrem Sumatera —
  {
    kode: "MISI-2026-018", komandan: "Letkol Inf. Parlindungan Siregar", jenis: "Angin Puting Beliung", urgensi: "Tinggi",
    lokasi: "Kabupaten Nias Barat, Sumatera Utara", lat: 1.02, lng: 97.55,
    personel: 5, slice: [77, 81], hari: 22, status: "Selesai", selesaiHari: 17,
    evaluasi: "Pembersihan material dan perbaikan atap rumah warga selesai, satu korban jiwa dievakuasi.",
    deskripsi: "Angin kencang merusak puluhan rumah, satu warga meninggal tertimpa pohon kelapa. Pembersihan material dan perbaikan darurat.",
  },
  {
    kode: "MISI-2026-019", komandan: "Letkol Inf. Parlindungan Siregar", jenis: "Banjir", urgensi: "Tinggi",
    lokasi: "Kabupaten Agam, Sumatera Barat", lat: -0.31, lng: 100.03,
    personel: 7, slice: [81, 86], hari: 20, status: "Dimobilisasi",
    deskripsi: "Banjir dan cuaca ekstrem merendam permukiman di kaki Gunung Marapi. Evakuasi warga dan pengamanan jalur logistik.",
  },

  // — Fase 18: kejadian tambahan (permintaan partner, "misi sesuai bencana terbaru") —
  {
    kode: "MISI-2026-022", komandan: "Mayor Inf. Andi Baso Rahman", jenis: "Kebakaran Hutan", urgensi: "Sedang",
    lokasi: "Kecamatan Pitu Riawa, Kabupaten Sidenreng Rappang, Sulawesi Selatan", lat: -3.85, lng: 119.85,
    personel: 5, slice: [86, 91], hari: 20, status: "Dimobilisasi",
    deskripsi: "Karhutla di Kecamatan Pitu Riawa sejak 9 Agustus 2026 (sumber BNPB). Dukungan pemadaman darat dan pendinginan lahan gambut.",
  },
  // MISI-2026-023 (Banjir Kepulauan Riau) di-drop atas permintaan user — lihat
  // prisma/hapus-misi-lama.ts. Kode sengaja tidak dipakai ulang untuk Misi lain.

  // — Fase 18 susulan kedua: puncak kemarau/El Nino akhir Agustus 2026 (sumber BNPB/media resmi,
  // 27-31 Agustus 2026). Ditambahkan supaya panel Misi Terbaru (diurutkan updatedAt terbaru) tidak
  // didominasi Misi uji coba banjir Lampung (023-027, dibuat manual saat QA fitur Buat Misi,
  // salah satunya sengaja jadi bukti dokumentasi QA — lihat docs/qc_qa/komentar-untuk-slide.md,
  // jadi TIDAK dihapus) — bukan mengganti data itu, cuma menambah kejadian nyata yang lebih baru
  // supaya representasinya proporsional dengan kondisi kemarau yang sedang berlangsung.
  {
    kode: "MISI-2026-028", komandan: "Kolonel Inf. Bambang Setiaji", jenis: "Kebakaran Hutan", urgensi: "Tinggi",
    lokasi: "Provinsi Riau", lat: -0.5071, lng: 101.4478,
    personel: 6, slice: [95, 101], hari: 2, status: "Dimobilisasi",
    deskripsi: "265 titik panas terdeteksi 29 Agustus 2026 (sumber BNPB), turun jadi 62 titik + 12 titik api per 31 Agustus, jarak pandang turun ke 5 km. Status siaga darurat karhutla provinsi.",
  },
  {
    kode: "MISI-2026-029", komandan: "Kolonel Inf. Rahmat Hidayatullah", jenis: "Kebakaran Hutan", urgensi: "Kritis",
    lokasi: "Sumatera Selatan", lat: -2.9909, lng: 104.7566,
    personel: 7, slice: [101, 108], hari: 1, status: "Dimobilisasi",
    deskripsi: "Titik panas naik 209 mencapai 1.013 (31 Agustus 2026, sumber BNPB), 11 titik api aktif, jarak pandang di bawah 5 km. Status siaga darurat karhutla provinsi.",
  },
  {
    kode: "MISI-2026-030", komandan: "Letkol Inf. Fajar Ramadhan", jenis: "Kebakaran Hutan", urgensi: "Sedang",
    lokasi: "Provinsi Jambi", lat: -1.6101, lng: 103.6131,
    personel: 4, slice: [108, 112], hari: 1, status: "Dimobilisasi",
    deskripsi: "49 titik panas (turun 86 dari periode sebelumnya), 4 titik api aktif, jarak pandang 7 km (31 Agustus 2026, sumber BNPB).",
  },
  {
    kode: "MISI-2026-031", komandan: "Kolonel Inf. Yusuf Kartanegara", jenis: "Kebakaran Hutan", urgensi: "Kritis",
    lokasi: "Kalimantan Tengah", lat: -2.21, lng: 113.92,
    personel: 8, slice: [112, 120], hari: 1, status: "Dimobilisasi",
    deskripsi: "Eskalasi lanjutan dari MISI-2026-011: titik panas melonjak tembus 5.391 per 31 Agustus 2026 (sumber BNPB), jauh meningkat dari kondisi awal bulan.",
  },
  // MISI-2026-032 (Kekeringan Lamongan, jenisKejadian "Lainnya") di-drop atas permintaan user —
  // tetap nongol di top 5 panel Misi Terbaru dan labelnya "Lainnya" kurang jelas dibanding
  // "Kebakaran Hutan" yang lebih langsung menandakan narasi El Nino. Lihat hapus-misi-lama.ts.
];

const hariLalu = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/** Buat Misi bencana yang belum ada. Mengembalikan jumlah yang benar-benar dibuat. */
export async function seedMisiBencana(
  prisma: PrismaClient,
  anggotaIds: string[]
): Promise<number> {
  const sudahAda = new Set(
    (
      await prisma.misi.findMany({
        where: { kodeMisi: { in: MISI_BENCANA.map((m) => m.kode) } },
        select: { kodeMisi: true },
      })
    ).map((m) => m.kodeMisi)
  );

  let dibuat = 0;
  for (const m of MISI_BENCANA) {
    if (sudahAda.has(m.kode)) continue;
    const selesai = m.status === "Selesai";
    const kehadiran = selesai ? "Selesai" : m.status === "Dimobilisasi" ? "Dikonfirmasi" : "Menunggu Respons";

    await prisma.misi.create({
      data: {
        kodeMisi: m.kode,
        pemberiPerintah: m.komandan,
        jenisKejadian: m.jenis,
        urgensi: m.urgensi,
        lokasi: m.lokasi,
        latitude: m.lat,
        longitude: m.lng,
        deskripsiMisi: m.deskripsi,
        status: m.status,
        kebutuhanPersonel: m.personel,
        dimobilisasiAt: m.hari === null ? null : hariLalu(m.hari),
        selesaiAt: selesai && m.selesaiHari != null ? hariLalu(m.selesaiHari) : null,
        hasilEvaluasi: selesai ? (m.evaluasi ?? null) : null,
        penugasan: {
          create: anggotaIds.slice(m.slice[0], m.slice[1]).map((anggotaId, idx) => ({
            anggotaId,
            skorRekomendasi: 92 - idx * 4,
            alasan: JSON.stringify([
              "Jarak terdekat ke lokasi",
              "Sertifikasi relevan aktif",
              "Readiness Score tinggi",
            ]),
            etaMenit: 25 + idx * 12,
            // Satu penugasan sengaja dibiarkan belum direspons di Misi yang masih berjalan, supaya
            // alur konfirmasi kehadiran di Sisi Anggota selalu punya data untuk diuji.
            statusKehadiran: !selesai && idx === 0 ? "Menunggu Respons" : kehadiran,
          })),
        },
      },
    });
    dibuat++;
  }
  return dibuat;
}
