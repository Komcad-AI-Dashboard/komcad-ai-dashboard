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

export default async function OverviewPage() {
  const [anggota, misi, aktivitasPelatihan, stats, feed, aiSummary] = await Promise.all([
    getMapAnggota(),
    getMapMisi(),
    getAktivitasPelatihanTerbaru(),
    getStatistikAnggota(),
    getMisiTerbaruFeed(),
    getAiMobilizationSummary(),
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
    />
  );
}
