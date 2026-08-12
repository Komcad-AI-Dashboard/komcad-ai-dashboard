import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/** Pola standar Neon untuk driver serverless di runtime Node (Vercel) — Node belum tentu punya
 * `WebSocket` global tergantung versi, jadi diisi eksplisit. BELUM diverifikasi untuk build
 * Cloudflare Workers (fase migrasi terpisah): Workers punya `WebSocket` native, dan paket `ws` ini
 * murni Node — kalau nanti ikut ter-bundle ke Worker dan bermasalah, gate baris ini di belakang
 * `typeof WebSocket === "undefined"` atau pakai override khusus dari OpenNext/Neon untuk Workers. */
neonConfig.webSocketConstructor = ws;

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

/** Driver adapter Neon (HTTP/WebSocket) menggantikan koneksi TCP langsung Prisma — dipilih supaya
 * satu implementasi ini jalan sama persis di runtime Node (Vercel) MAUPUN Cloudflare Workers
 * nanti (Workers tidak bisa buka socket TCP mentah ke Postgres, tapi bisa lewat driver ini),
 * tanpa perlu dua versi client per platform. */
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? withAuditLogGuard(new PrismaClient({ adapter }));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
