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
import { ensureReminderSertifikasi } from "@/lib/reminder-sertifikasi";
import { auth } from "@/lib/auth";

export default async function OverviewPage() {
  // Cek H-30 sertifikasi seluruh anggota tiap kali Overview dibuka — lihat lib/reminder-sertifikasi.ts.
  // after() supaya cek ini (bisa banyak query notifikasi) tidak menunda render halaman.
  after(() => ensureReminderSertifikasi());

  const [session, anggota, misi, aktivitasPelatihan, stats, feed, aiSummary, pengaturan] = await Promise.all([
    auth(),
    getMapAnggota(),
    getMapMisi(),
    getAktivitasPelatihanTerbaru(),
    getStatistikAnggota(),
    getMisiTerbaruFeed(),
    getAiMobilizationSummary(),
    getPengaturanSistem(),
  ]);

  return (
    <OverviewView
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
    />
  );
}
