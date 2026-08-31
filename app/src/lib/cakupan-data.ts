// Daftar pilihan Cakupan — server-only, dipisah dari lib/cakupan.ts supaya helper murni di sana
// tetap bisa diimpor komponen client tanpa menyeret Prisma ke bundle browser (lihat aturan di
// app/README.md soal client component yang value-import file berisi query Prisma).

import { prisma } from "@/lib/prisma";
import type { CakupanOption } from "@/lib/cakupan";

/** Provinsi yang benar-benar punya anggota, terbanyak dulu. Menawarkan provinsi tanpa anggota
 * cuma menghasilkan dashboard kosong yang terlihat seperti kerusakan. */
export async function getCakupanOptions(): Promise<CakupanOption[]> {
  const groups = await prisma.profilDemografi.groupBy({
    by: ["provinsi"],
    _count: true,
    where: { provinsi: { not: null } },
  });
  return groups
    .map((g) => ({ value: g.provinsi as string, label: g.provinsi as string, jumlahAnggota: g._count }))
    .sort((a, b) => b.jumlahAnggota - a.jumlahAnggota || a.label.localeCompare(b.label));
}
