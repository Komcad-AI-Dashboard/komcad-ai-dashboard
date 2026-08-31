import { after } from "next/server";
import { OverviewView } from "@/components/overview/overview-view";
import { POS_KOMANDO } from "@/lib/pos-komando";
import { KODAM, KODIM } from "@/lib/komando-teritorial";
import {
  getMapAnggota,
  getMapMisi,
  getAktivitasPelatihanTerbaru,
  getStatistikAnggota,
  getMisiTerbaruFeed,
  getAiMobilizationSummary,
} from "@/lib/overview-data";
import { getPengaturanSistem } from "@/lib/pengaturan-data";
import { getCakupanOptions } from "@/lib/cakupan-data";
import { parseCakupan } from "@/lib/cakupan";
import { ensureReminderSertifikasi } from "@/lib/reminder-sertifikasi";
import { auth } from "@/lib/auth";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ cakupan?: string }>;
}) {
  // Cek H-30 sertifikasi seluruh anggota tiap kali Overview dibuka — lihat lib/reminder-sertifikasi.ts.
  // after() supaya cek ini (bisa banyak query notifikasi) tidak menunda render halaman.
  after(() => ensureReminderSertifikasi());

  // Cakupan dibaca dari URL lalu diteruskan ke SEMUA sumber data sekaligus. Itu inti desainnya:
  // penyaringan terjadi sekali di server, jadi tidak mungkin ada panel yang ketinggalan dan
  // menampilkan angka nasional di sebelah panel yang sudah tersaring.
  const { cakupan: cakupanParam } = await searchParams;
  const cakupanOptions = await getCakupanOptions();
  const provinsi = parseCakupan(cakupanParam, cakupanOptions.map((o) => o.value));

  const [session, anggota, misi, aktivitasPelatihan, stats, feed, aiSummary, pengaturan] = await Promise.all([
    auth(),
    getMapAnggota(provinsi),
    getMapMisi(provinsi),
    getAktivitasPelatihanTerbaru(),
    getStatistikAnggota(provinsi),
    getMisiTerbaruFeed(provinsi),
    getAiMobilizationSummary(provinsi),
    getPengaturanSistem(),
  ]);

  return (
    <OverviewView
      // Remount saat cakupan berubah. OverviewView menyalin props-nya ke useState (dibutuhkan
      // polling auto-refresh 5 detik), dan useState TIDAK mengambil nilai baru saat props berubah
      // lewat navigasi lunak — tanpa key ini panel Statistik & Misi masih memajang angka nasional
      // setelah provinsi dipilih, dan baru benar setelah halaman di-reload penuh.
      key={provinsi ?? "nasional"}
      anggota={anggota}
      misi={misi}
      posKomando={POS_KOMANDO}
      kodam={KODAM}
      kodim={KODIM}
      aktivitasPelatihan={aktivitasPelatihan}
      stats={stats}
      feed={feed}
      aiSummary={aiSummary}
      autoRefresh={pengaturan.petaAutoRefresh}
      heatzoneDefault={pengaturan.petaHeatzone}
      role={session?.user?.role}
      cakupan={provinsi}
      // Aktivitas Pelatihan TIDAK ikut tersaring: kolom lokasinya berisi nama pusdiklat
      // ("Pusdiklat Komcad Surabaya"), bukan alamat berprovinsi, jadi tidak ada yang bisa
      // dicocokkan. Panelnya diberi penanda NASIONAL saat cakupan aktif — lebih jujur daripada
      // menyaringnya dengan tebakan atau membiarkannya tampak ikut tersaring.
      pelatihanNasional={provinsi !== null}
    />
  );
}
