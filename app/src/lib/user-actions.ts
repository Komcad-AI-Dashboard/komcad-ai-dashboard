"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES } from "@/lib/constants";

type ActionState = { error: string | null };

async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== ROLES.SUPER_ADMIN) {
    return { session: null, error: "Hanya Super Admin yang dapat mengelola Pengguna & Role." };
  }
  return { session, error: null };
}

const COMMAND_ROLE_VALUES = [ROLES.SUPER_ADMIN, ROLES.OPERATOR, ROLES.ANALIS] as const;

const createUserSchema = z.object({
  email: z.email("Format email tidak valid"),
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(COMMAND_ROLE_VALUES),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export async function createUserAction(input: unknown): Promise<ActionState> {
  const { session, error } = await requireSuperAdmin();
  if (error) return { error };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email sudah terdaftar." };

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, name: data.name, role: data.role, passwordHash },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "CREATE_USER",
    entitas: "User",
    entitasId: user.id,
    metadata: { email: data.email, role: data.role },
  });

  revalidatePath("/pengguna");
  return { error: null };
}

const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(COMMAND_ROLE_VALUES),
});

export async function updateUserAction(userId: string, input: unknown): Promise<ActionState> {
  const { session, error } = await requireSuperAdmin();
  if (error) return { error };

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  if (userId === session!.user.id && parsed.data.role !== ROLES.SUPER_ADMIN) {
    return { error: "Tidak dapat mengubah role akun Anda sendiri keluar dari Super Admin." };
  }

  await prisma.user.update({ where: { id: userId }, data: parsed.data });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "UPDATE_USER",
    entitas: "User",
    entitasId: userId,
    metadata: parsed.data,
  });

  revalidatePath("/pengguna");
  return { error: null };
}

export async function toggleUserStatusAction(userId: string): Promise<ActionState> {
  const { session, error } = await requireSuperAdmin();
  if (error) return { error };

  if (userId === session!.user.id) {
    return { error: "Tidak dapat menonaktifkan akun Anda sendiri." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Pengguna tidak ditemukan." };

  const nextStatus = target.status === "Aktif" ? "Nonaktif" : "Aktif";
  await prisma.user.update({ where: { id: userId }, data: { status: nextStatus } });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: nextStatus === "Nonaktif" ? "DEACTIVATE_USER" : "ACTIVATE_USER",
    entitas: "User",
    entitasId: userId,
    metadata: { status: nextStatus },
  });

  revalidatePath("/pengguna");
  return { error: null };
}
