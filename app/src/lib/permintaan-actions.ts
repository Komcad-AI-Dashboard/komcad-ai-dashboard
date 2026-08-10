"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES } from "@/lib/constants";

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

  const nikDipakai = await prisma.anggota.findUnique({ where: { nik: permintaan.nilaiBaru } });
  if (nikDipakai && nikDipakai.id !== permintaan.anggotaId) {
    return { error: "NIK baru sudah terdaftar untuk anggota lain — tidak dapat disetujui." };
  }

  await prisma.$transaction([
    prisma.anggota.update({ where: { id: permintaan.anggotaId }, data: { nik: permintaan.nilaiBaru } }),
    prisma.permintaanUbahData.update({
      where: { id: permintaanId },
      data: { status: "Disetujui", diprosesOlehId: session!.user.id, diprosesPada: new Date() },
    }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "APPROVE_PERMINTAAN_NIK",
    entitas: "Anggota",
    entitasId: permintaan.anggotaId,
    metadata: { nilaiLama: permintaan.nilaiLama, nilaiBaru: permintaan.nilaiBaru },
  });

  revalidatePath("/anggota");
  return { error: null };
}

export async function rejectPermintaanNikAction(permintaanId: string, alasan: string): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  const permintaan = await prisma.permintaanUbahData.findUnique({ where: { id: permintaanId } });
  if (!permintaan) return { error: "Permintaan tidak ditemukan." };
  if (permintaan.status !== "Menunggu") return { error: "Permintaan ini sudah diproses sebelumnya." };

  await prisma.permintaanUbahData.update({
    where: { id: permintaanId },
    data: {
      status: "Ditolak",
      alasanTolak: alasan.trim() || null,
      diprosesOlehId: session!.user.id,
      diprosesPada: new Date(),
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "REJECT_PERMINTAAN_NIK",
    entitas: "Anggota",
    entitasId: permintaan.anggotaId,
    metadata: { alasan },
  });

  revalidatePath("/anggota");
  return { error: null };
}
