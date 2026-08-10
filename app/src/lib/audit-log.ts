import { prisma } from "@/lib/prisma";

/** NFR-08: audit trail immutable untuk approval Misi, perubahan data anggota, keputusan AI. */
export async function writeAuditLog(params: {
  userId: string | null;
  aksi: string;
  entitas: string;
  entitasId?: string;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      aksi: params.aksi,
      entitas: params.entitas,
      entitasId: params.entitasId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
