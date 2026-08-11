"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES } from "@/lib/constants";
import { decryptSensitive, encryptSensitive, hashSensitive } from "@/lib/crypto";

type ActionState = { error: string | null };

async function requireCrudPermission() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.OPERATOR) {
    return { session: null, error: "Hanya Super Admin/Operator yang dapat memproses permintaan perubahan data." };
  }
  return { session, error: null };
}

/** FR-37: Admin/Operator menyetujui perubahan NIK yang diajukan Anggota lewat Sisi Anggota — baru
 * di titik inilah Anggota.nik benar-benar berubah. */
export async function approvePermintaanNikAction(permintaanId: string): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  const permintaan = await prisma.permintaanUbahData.findUnique({ where: { id: permintaanId } });
  if (!permintaan) return { error: "Permintaan tidak ditemukan." };
  if (permintaan.status !== "Menunggu") return { error: "Permintaan ini sudah diproses sebelumnya." };

  const nikBaruPlain = decryptSensitive(permintaan.nilaiBaru);
  const nikBaruHash = hashSensitive(nikBaruPlain);
  const nikDipakai = await prisma.anggota.findUnique({ where: { nikHash: nikBaruHash } });
  if (nikDipakai && nikDipakai.id !== permintaan.anggotaId) {
    return { error: "NIK baru sudah terdaftar untuk anggota lain — tidak dapat disetujui." };
  }

  await Promise.all([
    prisma.$transaction([
      prisma.anggota.update({
        where: { id: permintaan.anggotaId },
        data: { nik: encryptSensitive(nikBaruPlain), nikHash: nikBaruHash },
      }),
      prisma.permintaanUbahData.update({
        where: { id: permintaanId },
        data: { status: "Disetujui", diprosesOlehId: session!.user.id, diprosesPada: new Date() },
      }),
    ]),
    writeAuditLog({
      userId: session!.user.id,
      aksi: "APPROVE_PERMINTAAN_NIK",
      entitas: "Anggota",
      entitasId: permintaan.anggotaId,
      // NIK tidak ditulis plaintext ke metadata audit log (NFR-04/NFR-05) — cukup catat bahwa NIK berubah.
      metadata: { fieldBerubah: "nik" },
    }),
  ]);

  revalidatePath("/anggota");
  return { error: null };
}

export async function rejectPermintaanNikAction(permintaanId: string, alasan: string): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  const permintaan = await prisma.permintaanUbahData.findUnique({ where: { id: permintaanId } });
  if (!permintaan) return { error: "Permintaan tidak ditemukan." };
  if (permintaan.status !== "Menunggu") return { error: "Permintaan ini sudah diproses sebelumnya." };

  await Promise.all([
    prisma.permintaanUbahData.update({
      where: { id: permintaanId },
      data: {
        status: "Ditolak",
        alasanTolak: alasan.trim() || null,
        diprosesOlehId: session!.user.id,
        diprosesPada: new Date(),
      },
    }),
    writeAuditLog({
      userId: session!.user.id,
      aksi: "REJECT_PERMINTAAN_NIK",
      entitas: "Anggota",
      entitasId: permintaan.anggotaId,
      metadata: { alasan },
    }),
  ]);

  revalidatePath("/anggota");
  return { error: null };
}
