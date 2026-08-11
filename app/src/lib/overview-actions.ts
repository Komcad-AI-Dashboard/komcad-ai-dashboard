"use server";

// Fetch on-demand untuk drawer detail penuh dari peta Overview (klik marker anggota / zona Misi) —
// dipanggil dari client component, bukan dimuat sekaligus di awal (Overview cuma butuh field
// ringkas untuk marker peta, detail lengkap baru diambil kalau memang diklik).

import { auth } from "@/lib/auth";
import { getAnggotaDetail, type AnggotaFull } from "@/lib/anggota-data";
import { getMisiDetail, type MisiListItem } from "@/lib/misi-data";
import {
  getMapAnggota,
  getMapMisi,
  getAktivitasPelatihanTerbaru,
  getStatistikAnggota,
  getMisiTerbaruFeed,
  getAiMobilizationSummary,
} from "@/lib/overview-data";

async function requireCommandCenterSession() {
  const session = await auth();
  if (!session || session.user.role === "ANGGOTA") return null;
  return session;
}

/** Dipanggil oleh polling auto-refresh peta Overview (tiap 5 detik, lihat overview-view.tsx) —
 * ambil ULANG cuma data peta/panel Overview, bukan lewat router.refresh() yang akan me-render
 * ulang seluruh route termasuk layout (topbar KPI + auth) yang tidak perlu ikut di-refresh
 * sesering itu. */
export async function getOverviewLiveDataAction() {
  const session = await requireCommandCenterSession();
  if (!session) return null;

  const [anggota, misi, aktivitasPelatihan, stats, feed, aiSummary] = await Promise.all([
    getMapAnggota(),
    getMapMisi(),
    getAktivitasPelatihanTerbaru(),
    getStatistikAnggota(),
    getMisiTerbaruFeed(),
    getAiMobilizationSummary(),
  ]);

  return { anggota, misi, aktivitasPelatihan, stats, feed, aiSummary };
}

export async function getAnggotaCvAction(id: string): Promise<AnggotaFull | null> {
  const session = await requireCommandCenterSession();
  if (!session) return null;
  return getAnggotaDetail(id);
}

export async function getMisiDetailForOverviewAction(id: string): Promise<MisiListItem | null> {
  const session = await requireCommandCenterSession();
  if (!session) return null;
  return getMisiDetail(id);
}
