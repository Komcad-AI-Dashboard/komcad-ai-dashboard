import { prisma } from "@/lib/prisma";

/** Singleton — dibuat otomatis dengan nilai default kalau belum ada baris sama sekali. */
export async function getPengaturanSistem() {
  return prisma.pengaturanSistem.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export type PengaturanSistem = Awaited<ReturnType<typeof getPengaturanSistem>>;
