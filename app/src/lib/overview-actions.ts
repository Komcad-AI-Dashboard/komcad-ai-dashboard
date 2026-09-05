"use server";

// Fetch on-demand untuk drawer detail penuh dari peta Overview (klik marker anggota / zona Misi) —
// dipanggil dari client component, bukan dimuat sekaligus di awal (Overview cuma butuh field
// ringkas untuk marker peta, detail lengkap baru diambil kalau memang diklik).

import { auth } from "@/lib/auth";
import { getAnggotaDetail, type AnggotaFull } from "@/lib/anggota-data";
import { getMisiDetail, type MisiListItem } from "@/lib/misi-data";
import {
  getAiMobilizationSummary,
  getAktivitasPelatihanTerbaru,
  getMapAnggota,
  getMapMisi,
  getMisiTerbaruFeed,
  getStatistikAnggota,
  getTopbarKpi,
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
export async function getOverviewLiveDataAction(cakupan?: string | null) {
  const session = await requireCommandCenterSession();
  if (!session) return null;

  // Cakupan WAJIB ikut dioper. Tanpa ini polling 5 detik menimpa data yang sudah tersaring dengan
  // data nasional — dashboard akan diam-diam balik ke Nasional beberapa detik setelah operator
  // memilih provinsi, tanpa ada yang berubah di URL maupun di pill-nya.
  const provinsi = cakupan || null;
  const [anggota, misi, aktivitasPelatihan, stats, feed, aiSummary] = await Promise.all([
    getMapAnggota(provinsi),
    getMapMisi(provinsi),
    getAktivitasPelatihanTerbaru(),
    getStatistikAnggota(provinsi),
    getMisiTerbaruFeed(provinsi),
    getAiMobilizationSummary(provinsi),
  ]);

  return { anggota, misi, aktivitasPelatihan, stats, feed, aiSummary };
}

export async function getAnggotaCvAction(id: string): Promise<AnggotaFull | null> {
  const session = await requireCommandCenterSession();
  if (!session) return null;
  return getAnggotaDetail(id);
}

export async function getMisiDetailAction(id: string): Promise<MisiListItem | null> {
  const session = await requireCommandCenterSession();
  if (!session) return null;
  return getMisiDetail(id);
}

/** KPI topbar untuk sebuah cakupan. Ada karena Layout di App Router TIDAK menerima searchParams
 * dan tidak ikut render ulang saat query berubah — jadi angka READINESS & MISI AKTIF di topbar
 * tidak bisa disaring dari server seperti panel-panel Overview. Tanpa ini, pill-nya akan
 * menampilkan "Jawa Timur" sementara angka di sebelahnya tetap nasional: lebih menyesatkan
 * daripada readout statis yang digantikan. */
export async function getScopedTopbarKpiAction(cakupan: string | null) {
  const session = await requireCommandCenterSession();
  if (!session) return null;
  return getTopbarKpi(cakupan || null);
}
