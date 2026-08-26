// Pemilih database tujuan untuk skrip perawatan data (tambah/hapus Misi).
//
// Kenapa tidak cukup menimpa DATABASE_URL lewat shell: Prisma memuat .env secara otomatis, jadi
// mudah tertukar antara database lokal dan database yang dipakai app terdeploy — berbahaya untuk
// skrip yang MENGHAPUS. Karena itu dipakai nama variabel terpisah (TARGET_DATABASE_URL) yang
// tidak mungkin bentrok dengan .env, dan host tujuannya selalu dicetak sebelum skrip bertindak.

import { PrismaClient } from "@prisma/client";

export function bukaTargetDb(): PrismaClient {
  const override = process.env.TARGET_DATABASE_URL;
  const url = override ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL maupun TARGET_DATABASE_URL tidak ditemukan.");
  }

  // Cetak host saja — jangan pernah cetak kredensialnya.
  const host = url.replace(/^[a-z]+:\/\/[^@]*@/, "").split(/[/?]/)[0];
  console.log(`Database tujuan: ${host}${override ? "  (dari TARGET_DATABASE_URL)" : "  (dari .env)"}`);

  return new PrismaClient({ datasources: { db: { url } } });
}
