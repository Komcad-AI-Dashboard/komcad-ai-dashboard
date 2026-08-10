"use server";

// Fetch on-demand untuk drawer detail penuh dari peta Overview (klik marker anggota / zona Misi) —
// dipanggil dari client component, bukan dimuat sekaligus di awal (Overview cuma butuh field
// ringkas untuk marker peta, detail lengkap baru diambil kalau memang diklik).

import { auth } from "@/lib/auth";
import { getAnggotaDetail, type AnggotaFull } from "@/lib/anggota-data";
import { getMisiDetail, type MisiListItem } from "@/lib/misi-data";

async function requireCommandCenterSession() {
  const session = await auth();
  if (!session || session.user.role === "ANGGOTA") return null;
  return session;
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
