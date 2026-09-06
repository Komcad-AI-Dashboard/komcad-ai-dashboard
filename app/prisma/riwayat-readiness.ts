// Riwayat Readiness Score bulanan untuk perbandingan lintas waktu (temuan QA-11).
//
// SEMUA ISI DATABASE INI FIKTIF — sama seperti seluruh seed. Tapi angka di sini bukan dikarang
// acak: tiap titik dihitung ULANG memakai formula Readiness yang asli (computeReadinessScore di
// src/lib/readiness.ts), dievaluasi pada tanggal bulan itu. Yang berubah cuma tanggal acuannya.
//
// Dua dari tiga komponen formula benar-benar terekonstruksi dari data yang memang ada:
//   - Kompetensi (bobot 40%) — sertifikasi mana yang MASIH berlaku pada tanggal itu, dihitung
//     dari Sertifikasi.tanggalBerlaku. Ini aritmetika biasa, bukan tebakan.
//   - Pelatihan (bobot 30%)  — jarak waktu ke kelulusan terakhir PADA tanggal itu, dari
//     Pelatihan.tanggal, dan pelatihan yang tanggalnya belum lewat ikut dikecualikan.
//
// Satu komponen TIDAK bisa direkonstruksi dan dibawa apa adanya dari keadaan hari ini:
//   - Penugasan (bobot 30%) — Penugasan.statusKehadiran tidak menyimpan kapan statusnya berubah,
//     jadi tidak ada cara jujur mengetahui status seorang anggota tiga bulan lalu. Penugasan yang
//     dibuat SETELAH tanggal acuan tetap dikecualikan, tapi status yang dipakai adalah status
//     terkini. Jadi sepertiga dari tiap titik riwayat adalah pendekatan, dan itu disebutkan
//     terang-terangan di sini supaya tidak ada yang mengira grafiknya hasil pengukuran.
//
// Efek yang terlihat: sertifikasi kedaluwarsa bertambah dari bulan ke bulan, jadi Readiness
// cenderung MENURUN mendekati hari ini. Itu bukan bug, itu memang yang dikatakan datanya.
//
// Aman diulang: pasangan anggota + bulan yang sudah punya baris dilewati, bukan ditulis ganda.
//
// Jalankan: npm run db:riwayat-readiness
// Menyasar database lain: TARGET_DATABASE_URL="postgresql://..." npm run db:riwayat-readiness
import { computeReadinessBreakdown } from "../src/lib/readiness";
import { bukaTargetDb } from "./target-db";

/** Berapa bulan ke belakang yang dibuatkan titik riwayat, termasuk bulan berjalan. */
const BULAN_KE_BELAKANG = 6;

const prisma = bukaTargetDb();

/** Akhir bulan ke-n sebelum sekarang. Bulan berjalan memakai waktu sekarang, bukan akhir bulan
 * yang belum terjadi — supaya titik terakhir sama persis dengan Anggota.readinessScore yang
 * ditampilkan dashboard, dan selisih terbarunya tidak bertentangan dengan angka besarnya. */
function titikBulan(n: number, sekarang: Date): Date {
  if (n === 0) return sekarang;
  return new Date(sekarang.getFullYear(), sekarang.getMonth() - n + 1, 0, 23, 59, 59);
}

async function main() {
  const sekarang = new Date();
  const anggota = await prisma.anggota.findMany({
    select: {
      id: true,
      kodeAnggota: true,
      readinessScore: true,
      sertifikasi: { select: { tanggalBerlaku: true } },
      pelatihan: { select: { tanggal: true, statusKelulusan: true } },
      penugasan: { select: { statusKehadiran: true, createdAt: true } },
    },
  });
  console.log(`${anggota.length} anggota, ${BULAN_KE_BELAKANG} titik bulan ke belakang.`);

  const sudahAda = new Set(
    (await prisma.readinessScoreHistory.findMany({ select: { anggotaId: true, dihitungPada: true } })).map(
      (r) => `${r.anggotaId}|${r.dihitungPada.toISOString().slice(0, 7)}`
    )
  );

  const baris: { anggotaId: string; skor: number; komponen: string; dihitungPada: Date }[] = [];
  for (const a of anggota) {
    for (let n = BULAN_KE_BELAKANG - 1; n >= 0; n--) {
      const pada = titikBulan(n, sekarang);
      if (sudahAda.has(`${a.id}|${pada.toISOString().slice(0, 7)}`)) continue;

      const { skor, komponen } = computeReadinessBreakdown(
        {
          sertifikasi: a.sertifikasi,
          // Pelatihan yang tanggalnya belum tiba pada titik ini belum boleh ikut menaikkan skor.
          pelatihan: a.pelatihan.filter((p) => p.tanggal <= pada),
          // Penugasan yang belum dibuat pada titik ini juga dikecualikan. Statusnya sendiri tetap
          // status hari ini — lihat catatan pendekatan di kepala berkas.
          penugasan: a.penugasan.filter((p) => p.createdAt <= pada),
        },
        pada
      );
      baris.push({ anggotaId: a.id, skor, komponen: JSON.stringify(komponen), dihitungPada: pada });
    }
  }

  if (baris.length === 0) {
    console.log("Semua titik sudah ada — tidak ada baris riwayat baru.");
  } else {
    await prisma.readinessScoreHistory.createMany({ data: baris });
    console.log(`Ditulis ${baris.length} baris riwayat.`);
  }

  // Titik terkini tiap anggota HARUS sama dengan Anggota.readinessScore, kalau tidak selisih
  // "vs bulan lalu" di dashboard akan berdebat dengan angka besar di sebelahnya.
  //
  // Ternyata banyak yang tidak sama, dan penyebabnya bukan perhitungan di sini: readinessScore
  // tersimpan sudah BASI. Ia cuma dihitung ulang lewat recalculateReadinessScore(), yang dipanggil
  // saat status kehadiran berubah — sementara skrip penambah Misi membuat Penugasan baru secara
  // massal tanpa pernah memanggilnya. Jadi dashboard menampilkan skor yang tidak lagi cocok dengan
  // datanya sendiri. Disegarkan di sini.
  const dihitungUlang = new Map(
    anggota.map((a) => [
      a.id,
      computeReadinessBreakdown(
        {
          sertifikasi: a.sertifikasi,
          pelatihan: a.pelatihan.filter((p) => p.tanggal <= sekarang),
          penugasan: a.penugasan.filter((p) => p.createdAt <= sekarang),
        },
        sekarang
      ).skor,
    ])
  );
  const basi = anggota.filter((a) => dihitungUlang.get(a.id) !== a.readinessScore);
  console.log(`readinessScore tersimpan yang sudah basi: ${basi.length} anggota.`);
  for (const a of basi.slice(0, 5)) {
    console.log(`  ${a.kodeAnggota}: tersimpan=${a.readinessScore} -> seharusnya ${dihitungUlang.get(a.id)}`);
  }
  for (const a of basi) {
    await prisma.anggota.update({
      where: { id: a.id },
      data: { readinessScore: dihitungUlang.get(a.id)!, readinessUpdatedAt: sekarang },
    });
  }
  if (basi.length > 0) console.log(`Disegarkan ${basi.length} readinessScore.`);

  const total = await prisma.readinessScoreHistory.count();
  console.log(`Total baris ReadinessScoreHistory sekarang: ${total}.`);
}

main().finally(() => prisma.$disconnect());
