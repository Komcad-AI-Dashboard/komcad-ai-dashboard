import { PrismaClient } from "@prisma/client";

/** NFR-08: audit trail immutable — blok update/delete ke AuditLog di level Prisma Client itu
 * sendiri (bukan cuma "kita tidak pernah menulis kode yang memanggilnya"), supaya kalaupun ada
 * kode baru yang lupa aturan ini, panggilannya gagal keras alih-alih diam-diam mengubah histori. */
function withAuditLogGuard(client: PrismaClient) {
  return client.$extends({
    query: {
      auditLog: {
        async update() {
          throw new Error("AuditLog immutable — update tidak diizinkan (NFR-08).");
        },
        async updateMany() {
          throw new Error("AuditLog immutable — update tidak diizinkan (NFR-08).");
        },
        async delete() {
          throw new Error("AuditLog immutable — delete tidak diizinkan (NFR-08).");
        },
        async deleteMany() {
          throw new Error("AuditLog immutable — delete tidak diizinkan (NFR-08).");
        },
        async upsert() {
          throw new Error("AuditLog immutable — upsert tidak diizinkan (NFR-08).");
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof withAuditLogGuard> };

export const prisma = globalForPrisma.prisma ?? withAuditLogGuard(new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
