"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type GlobalSearchResult = {
  id: string;
  type: "anggota" | "misi";
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearchAction(query: string): Promise<GlobalSearchResult[]> {
  const session = await auth();
  if (!session?.user) return [];

  const q = query.trim();
  if (q.length < 2) return [];

  const [anggota, misi] = await Promise.all([
    prisma.anggota.findMany({
      where: {
        OR: [
          { nama: { contains: q, mode: "insensitive" } },
          { kodeAnggota: { contains: q, mode: "insensitive" } },
          { unitAsal: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, nama: true, kodeAnggota: true, unitAsal: true },
      take: 6,
    }),
    prisma.misi.findMany({
      where: {
        OR: [
          { kodeMisi: { contains: q, mode: "insensitive" } },
          { jenisKejadian: { contains: q, mode: "insensitive" } },
          { lokasi: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, kodeMisi: true, jenisKejadian: true, lokasi: true },
      take: 6,
    }),
  ]);

  return [
    ...anggota.map((a) => ({
      id: a.id,
      type: "anggota" as const,
      title: a.nama,
      subtitle: `${a.kodeAnggota} · ${a.unitAsal}`,
      href: `/anggota?openId=${a.id}`,
    })),
    ...misi.map((m) => ({
      id: m.id,
      type: "misi" as const,
      title: m.kodeMisi,
      subtitle: `${m.jenisKejadian} · ${m.lokasi}`,
      href: `/misi?openId=${m.id}`,
    })),
  ];
}
