"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES, STATUS_SIAGA } from "@/lib/constants";
import { encryptSensitive, hashSensitive } from "@/lib/crypto";

const anggotaFormSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  nama: z.string().min(1, "Nama wajib diisi"),
  unitAsal: z.string().min(1, "Unit asal wajib diisi"),
  telepon: z.string().optional(),
  email: z.email("Format email tidak valid").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"]),
  provinsi: z.string().optional(),
});

type ActionState = { error: string | null };

async function requireCrudPermission() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.OPERATOR) {
    return { session: null, error: "Hanya Super Admin/Operator yang dapat mengubah data anggota." };
  }
  return { session, error: null };
}

export async function createAnggotaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  const parsed = anggotaFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const data = parsed.data;
  const nikHash = hashSensitive(data.nik);

  const existing = await prisma.anggota.findUnique({ where: { nikHash } });
  if (existing) return { error: "NIK sudah terdaftar untuk anggota lain." };

  const lastKode = await prisma.anggota.findFirst({
    orderBy: { kodeAnggota: "desc" },
    select: { kodeAnggota: true },
  });
  const nextNumber = lastKode ? parseInt(lastKode.kodeAnggota.split("-")[1], 10) + 1 : 1;
  const kodeAnggota = `ANG-${String(nextNumber).padStart(5, "0")}`;

  const anggota = await prisma.anggota.create({
    data: {
      kodeAnggota,
      nik: encryptSensitive(data.nik),
      nikHash,
      nama: data.nama,
      unitAsal: data.unitAsal,
      telepon: data.telepon || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      profilDemografi: {
        create: {
          jenisKelamin: data.jenisKelamin,
          provinsi: data.provinsi || null,
        },
      },
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "CREATE_ANGGOTA",
    entitas: "Anggota",
    entitasId: anggota.id,
    metadata: { kodeAnggota, nama: data.nama },
  });

  revalidatePath("/anggota");
  return { error: null };
}

export async function updateAnggotaAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  const parsed = anggotaFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const data = parsed.data;
  const nikHash = hashSensitive(data.nik);

  const existing = await prisma.anggota.findUnique({ where: { nikHash } });
  if (existing && existing.id !== id) return { error: "NIK sudah terdaftar untuk anggota lain." };

  await prisma.anggota.update({
    where: { id },
    data: {
      nik: encryptSensitive(data.nik),
      nikHash,
      nama: data.nama,
      unitAsal: data.unitAsal,
      telepon: data.telepon || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      profilDemografi: {
        upsert: {
          create: { jenisKelamin: data.jenisKelamin, provinsi: data.provinsi || null },
          update: { jenisKelamin: data.jenisKelamin, provinsi: data.provinsi || null },
        },
      },
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "UPDATE_ANGGOTA",
    entitas: "Anggota",
    entitasId: id,
    metadata: { nama: data.nama },
  });

  revalidatePath("/anggota");
  return { error: null };
}

export async function deactivateAnggotaAction(id: string): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  await prisma.anggota.update({
    where: { id },
    data: { statusKeanggotaan: "Nonaktif", statusSiaga: STATUS_SIAGA.TIDAK_TERSEDIA },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "DEACTIVATE_ANGGOTA",
    entitas: "Anggota",
    entitasId: id,
  });

  revalidatePath("/anggota");
  revalidatePath("/overview");
  return { error: null };
}

export async function updateStatusSiagaAction(id: string, status: string): Promise<ActionState> {
  const { session, error } = await requireCrudPermission();
  if (error) return { error };

  if (!Object.values(STATUS_SIAGA).includes(status as (typeof STATUS_SIAGA)[keyof typeof STATUS_SIAGA])) {
    return { error: "Status tidak valid." };
  }

  await Promise.all([
    prisma.anggota.update({ where: { id }, data: { statusSiaga: status } }),
    writeAuditLog({
      userId: session!.user.id,
      aksi: "UPDATE_STATUS_SIAGA",
      entitas: "Anggota",
      entitasId: id,
      metadata: { status },
    }),
  ]);

  // FR-07: perubahan status harus tercermin di peta Overview (marker warna berubah).
  revalidatePath("/anggota");
  revalidatePath("/overview");
  return { error: null };
}
