// Penilaian kinerja personel per Penugasan, supaya skor rekomendasi AI bisa diadu dengan hasil
// nyatanya di lapangan (temuan QA-13).
//
// DATA DEMO, DIBUAT SKRIP INI — sama seperti seluruh isi seed. Yang dibandingkan dengannya, yaitu
// skorRekomendasi, adalah angka yang memang dikeluarkan sistem. Jadi separuh perbandingan nyata,
// separuh lagi dibuat di sini, dan itu disebutkan juga di halaman Analitik.
//
// Kenapa perlu dibuat sama sekali: Penugasan.hasilEvaluasi ada di skema sejak awal tapi tidak
// pernah ditulis satu baris pun oleh kode mana pun, dan Misi berstatus Selesai cuma ada tiga —
// ketiganya dengan komposisi yang sama persis. Tidak ada yang bisa dianalisis dari situ.
//
// Penilaiannya SENGAJA tidak sempurna berkorelasi dengan skor AI. Grafik yang korelasinya rapi
// sempurna tidak mengajarkan apa pun ke Analis; yang menarik justru pengecualiannya — orang berskor
// tinggi yang ternyata biasa saja, dan sebaliknya. Polanya deterministik (diturunkan dari indeks
// baris, bukan Math.random) supaya dijalankan ulang hasilnya sama.
//
// Aman diulang: Misi yang sudah punya hasil evaluasi dan Penugasan yang sudah punya penilaian
// dilewati, bukan ditimpa.
//
// Jalankan: npm run db:evaluasi-penugasan
// Menyasar database lain: TARGET_DATABASE_URL="postgresql://..." npm run db:evaluasi-penugasan
import { PENILAIAN_KINERJA } from "../src/lib/constants";
import { bukaTargetDb } from "./target-db";

/** BERAPA TOTAL Misi berstatus Selesai yang dituju, bukan berapa yang ditutup tiap kali jalan.
 *
 * Sempat ditulis sebagai "tutup 6 Misi" dan itu TIDAK idempoten: jalan kedua menutup 6 Misi
 * berikutnya, jadi tiap pengulangan memakan Misi yang masih berjalan (terbukti saat verifikasi:
 * Selesai 3 -> 9 -> 15). Dipatok ke jumlah total supaya pengulangan tidak melakukan apa-apa. */
const TARGET_MISI_SELESAI = 9;

const prisma = bukaTargetDb();

/** Lama Misi berjalan sebelum ditutup, dalam hari, per tingkat urgensi. Kritis ditangani lebih
 * cepat karena sumber daya dikerahkan lebih banyak. */
const DURASI_HARI: Record<string, number> = { Kritis: 4, Tinggi: 6, Sedang: 9 };

const EVALUASI: string[] = [
  "Seluruh personel tiba sesuai ETA, distribusi logistik lancar, tidak ada korban tambahan selama operasi.",
  "Operasi berjalan sesuai rencana meski dua personel terlambat karena akses jalan terputus.",
  "Koordinasi dengan BPBD setempat berjalan baik, evakuasi warga terdampak tuntas lebih cepat dari perkiraan.",
  "Penanganan selesai, namun rotasi personel perlu diperbaiki: tim inti bertugas tanpa jeda selama tiga hari.",
  "Sasaran operasi tercapai. Kebutuhan alat berat sempat tidak terpenuhi di dua hari pertama.",
  "Pemulihan akses selesai dan warga kembali ke permukiman. Pelaporan harian sempat terlambat.",
];

/** Penilaian diturunkan dari skor AI, lalu digeser untuk sebagian baris supaya korelasinya tidak
 * sempurna. Yang digeser dipilih dari sisa bagi indeks — deterministik, bukan acak. */
function nilaiUntuk(skor: number, indeks: number): string {
  const dasar = skor >= 88 ? 0 : skor >= 80 ? 1 : skor >= 70 ? 2 : 3;
  // Satu dari lima dinilai lebih rendah dari yang skornya janjikan, satu dari tujuh lebih tinggi.
  const geser = indeks % 5 === 0 ? 1 : indeks % 7 === 0 ? -1 : 0;
  const akhir = Math.max(0, Math.min(PENILAIAN_KINERJA.length - 1, dasar + geser));
  return PENILAIAN_KINERJA[akhir];
}

async function main() {
  // --- 1. Tutup sebagian Misi yang masih berjalan ---
  const sudahSelesai = await prisma.misi.count({ where: { status: "Selesai" } });
  const kurang = Math.max(0, TARGET_MISI_SELESAI - sudahSelesai);
  const kandidat =
    kurang === 0
      ? []
      : await prisma.misi.findMany({
          where: { status: "Dimobilisasi", hasilEvaluasi: null },
          select: { id: true, kodeMisi: true, urgensi: true, dimobilisasiAt: true },
          orderBy: { dimobilisasiAt: "asc" },
          take: kurang,
        });
  console.log(`Misi Selesai sekarang ${sudahSelesai}, target ${TARGET_MISI_SELESAI} — akan ditutup: ${kandidat.length}`);
  for (const [i, m] of kandidat.entries()) {
    const mulai = m.dimobilisasiAt ?? new Date();
    const durasi = DURASI_HARI[m.urgensi] ?? 7;
    const selesaiAt = new Date(mulai.getTime() + durasi * 24 * 60 * 60 * 1000);
    await prisma.misi.update({
      where: { id: m.id },
      data: {
        status: "Selesai",
        selesaiAt: selesaiAt > new Date() ? new Date() : selesaiAt,
        hasilEvaluasi: EVALUASI[i % EVALUASI.length],
      },
    });
    // Penugasan ikut ditandai Selesai, meniru yang dilakukan closeMisiAction: yang menolak tetap
    // Ditolak, sisanya jadi Selesai.
    await prisma.penugasan.updateMany({
      where: { misiId: m.id, statusKehadiran: { notIn: ["Ditolak"] } },
      data: { statusKehadiran: "Selesai" },
    });
    console.log(`  ${m.kodeMisi} (${m.urgensi}) ditutup setelah ${durasi} hari`);
  }

  // --- 2. Nilai kinerja tiap personel di Misi yang sudah Selesai ---
  const penugasan = await prisma.penugasan.findMany({
    where: { misi: { status: "Selesai" }, hasilEvaluasi: null, statusKehadiran: { not: "Ditolak" } },
    select: { id: true, skorRekomendasi: true },
    orderBy: [{ misiId: "asc" }, { skorRekomendasi: "desc" }],
  });
  console.log(`Penugasan yang akan dinilai: ${penugasan.length}`);
  let ditulis = 0;
  for (const [i, p] of penugasan.entries()) {
    await prisma.penugasan.update({ where: { id: p.id }, data: { hasilEvaluasi: nilaiUntuk(p.skorRekomendasi, i) } });
    ditulis++;
  }
  console.log(`Ditulis ${ditulis} penilaian kinerja.`);

  // --- 3. Ringkasan, untuk dibaca langsung dari output skrip ---
  const semua = await prisma.penugasan.findMany({
    where: { misi: { status: "Selesai" }, hasilEvaluasi: { not: null } },
    select: { skorRekomendasi: true, hasilEvaluasi: true },
  });
  const band = (s: number) => (s >= 90 ? "90-100" : s >= 80 ? "80-89" : s >= 70 ? "70-79" : "<70");
  const perBand = new Map<string, string[]>();
  for (const p of semua) {
    const b = band(p.skorRekomendasi);
    perBand.set(b, [...(perBand.get(b) ?? []), p.hasilEvaluasi!]);
  }
  const nilaiAngka: Record<string, number> = { "Sangat Baik": 4, Baik: 3, Cukup: 2, Kurang: 1 };
  console.log("\nband skor AI -> penilaian kinerja:");
  for (const b of ["90-100", "80-89", "70-79", "<70"]) {
    const v = perBand.get(b);
    if (!v) continue;
    const rata = v.reduce((s, x) => s + nilaiAngka[x], 0) / v.length;
    const hitung = new Map<string, number>();
    for (const x of v) hitung.set(x, (hitung.get(x) ?? 0) + 1);
    console.log(`  ${b.padEnd(7)} n=${String(v.length).padStart(3)} rata=${rata.toFixed(2)}/4  ${[...hitung].map(([k, n]) => `${k}=${n}`).join(" ")}`);
  }
  const misiSelesai = await prisma.misi.count({ where: { status: "Selesai" } });
  const misiAktif = await prisma.misi.count({ where: { status: "Dimobilisasi" } });
  console.log(`\nMisi Selesai=${misiSelesai}  Dimobilisasi=${misiAktif}`);
}

main().finally(() => prisma.$disconnect());
