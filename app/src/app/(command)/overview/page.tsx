import { OverviewView } from "@/components/overview/overview-view";
import { POS_KOMANDO } from "@/lib/pos-komando";
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
  await ensureReminderSertifikasi();

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
