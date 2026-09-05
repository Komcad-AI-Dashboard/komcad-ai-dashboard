"use server";

// Catatan Analis atas Misi yang sudah Selesai (temuan QA-12).
//
// Ini SATU-SATUNYA jalur di aplikasi ini yang membiarkan role ANALIS menulis ke database. Sampai
// sebelumnya Analis cuma bisa membaca, ditambah mengunduh laporan lewat route handler
// (app/api/laporan/*). Karena itu batas hak aksesnya ditulis eksplisit di sini, bukan diserahkan
// ke UI yang menyembunyikan tombol — menyembunyikan tombol bukan kontrol akses.
//
// Tetap patuh FRD §4 ("Analis, tanpa hak ubah Misi aktif"): catatan hanya bisa ditambahkan pada
// Misi berstatus Selesai, dan tidak pernah mengubah satu pun field Misi.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES, STATUS_MISI } from "@/lib/constants";

export type CatatanAnalisItem = {
  id: string;
  isi: string;
  createdAt: Date;
  penulisNama: string;
  penulisRole: string;
  /** Apakah sesi yang sedang berjalan boleh menghapus baris ini. Dihitung di server supaya
   *  tombolnya tidak bergantung pada tebakan client soal siapa penulisnya. */
  bisaHapus: boolean;
};

/** Kebalikan dari requireOperatorPermission di misi-actions.ts: di sini justru Operator yang
 *  TIDAK berhak. Operator sudah punya jalurnya sendiri, yaitu Hasil Evaluasi yang ditulis sekali
 *  saat menutup Misi (FR-16). Catatan Analis adalah lapisan analisis setelah itu. */
async function requireAnalisPermission() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ANALIS) {
    return { session: null, error: "Hanya Analis/Evaluator dan Super Admin yang dapat menulis catatan." };
  }
  return { session, error: null };
}

/** Membaca catatan terbuka untuk semua role Command Center, termasuk Operator: catatan analis
 *  justru berguna kalau Operator ikut membacanya. Yang dibatasi menulisnya, bukan melihatnya. */
async function requireCommandCenterSession() {
  const session = await auth();
  if (!session || session.user.role === ROLES.ANGGOTA) return null;
  return session;
}

type ActionState = { error: string | null };

const isiSchema = z
  .string()
  .trim()
  .min(1, "Catatan tidak boleh kosong.")
  .max(2000, "Catatan maksimal 2000 karakter.");

export async function getCatatanAnalisAction(misiId: string): Promise<CatatanAnalisItem[]> {
  const session = await requireCommandCenterSession();
  if (!session) return [];

  const list = await prisma.catatanAnalis.findMany({
    where: { misiId },
    orderBy: { createdAt: "desc" },
    include: { penulis: { select: { id: true, name: true, role: true } } },
  });

  const userId = session.user.id;
  const isSuperAdmin = session.user.role === ROLES.SUPER_ADMIN;

  return list.map((c) => ({
    id: c.id,
    isi: c.isi,
    createdAt: c.createdAt,
    penulisNama: c.penulis.name,
    penulisRole: c.penulis.role,
    bisaHapus: isSuperAdmin || c.penulis.id === userId,
  }));
}

export async function tambahCatatanAction(misiId: string, isi: unknown): Promise<ActionState> {
  const { session, error } = await requireAnalisPermission();
  if (error) return { error };

  const parsed = isiSchema.safeParse(isi);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Catatan tidak valid." };

  // Statusnya dicek di server, bukan cuma disembunyikan di UI. Ini yang menjaga aturan FRD §4:
  // Analis tidak boleh menyentuh Misi yang masih berjalan, lewat jalur mana pun.
  const misi = await prisma.misi.findUnique({ where: { id: misiId }, select: { kodeMisi: true, status: true } });
  if (!misi) return { error: "Misi tidak ditemukan." };
  if (misi.status !== STATUS_MISI.SELESAI) {
    return { error: "Catatan analis hanya bisa ditambahkan pada Misi yang sudah Selesai." };
  }

  const catatan = await prisma.catatanAnalis.create({
    data: { misiId, penulisId: session!.user.id, isi: parsed.data },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "CREATE_CATATAN_ANALIS",
    entitas: "CatatanAnalis",
    entitasId: catatan.id,
    metadata: { kodeMisi: misi.kodeMisi, panjang: parsed.data.length },
  });

  revalidatePath("/misi");
  revalidatePath("/riwayat");
  return { error: null };
}

export async function hapusCatatanAction(catatanId: string): Promise<ActionState> {
  const { session, error } = await requireAnalisPermission();
  if (error) return { error };

  const catatan = await prisma.catatanAnalis.findUnique({
    where: { id: catatanId },
    select: { penulisId: true, misi: { select: { kodeMisi: true } } },
  });
  if (!catatan) return { error: "Catatan tidak ditemukan." };

  // Analis hanya boleh menghapus catatannya sendiri. Super Admin boleh menghapus milik siapa pun
  // supaya salah tulis tetap ada jalan perbaikannya tanpa menyentuh database langsung.
  const isSuperAdmin = session!.user.role === ROLES.SUPER_ADMIN;
  if (!isSuperAdmin && catatan.penulisId !== session!.user.id) {
    return { error: "Anda hanya dapat menghapus catatan yang Anda tulis sendiri." };
  }

  await prisma.catatanAnalis.delete({ where: { id: catatanId } });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "DELETE_CATATAN_ANALIS",
    entitas: "CatatanAnalis",
    entitasId: catatanId,
    metadata: { kodeMisi: catatan.misi.kodeMisi, penulisId: catatan.penulisId },
  });

  revalidatePath("/misi");
  revalidatePath("/riwayat");
  return { error: null };
}
