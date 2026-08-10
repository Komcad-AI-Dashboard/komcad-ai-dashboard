"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES } from "@/lib/constants";

type ActionState = { error: string | null };

async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== ROLES.SUPER_ADMIN) {
    return { session: null, error: "Hanya Super Admin yang dapat mengubah Pengaturan." };
  }
  return { session, error: null };
}

const preferensiSchema = z.object({
  notifMisiBaru: z.boolean(),
  reminderSertifikasi: z.boolean(),
  fallbackSms: z.boolean(),
  petaHeatzone: z.boolean(),
  petaAutoRefresh: z.boolean(),
});

export async function updatePreferensiAction(input: unknown): Promise<ActionState> {
  const { session, error } = await requireSuperAdmin();
  if (error) return { error };

  const parsed = preferensiSchema.safeParse(input);
  if (!parsed.success) return { error: "Data preferensi tidak valid." };

  await prisma.pengaturanSistem.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data,
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "UPDATE_PENGATURAN_PREFERENSI",
    entitas: "PengaturanSistem",
    entitasId: "default",
    metadata: parsed.data,
  });

  revalidatePath("/pengaturan");
  revalidatePath("/overview");
  return { error: null };
}

const parameterAiSchema = z
  .object({
    aiRadiusKm: z.coerce.number().int().min(1).max(1000),
    aiBobotReadiness: z.coerce.number().int().min(0).max(100),
    aiBobotJarak: z.coerce.number().int().min(0).max(100),
    aiBobotKompetensi: z.coerce.number().int().min(0).max(100),
  })
  .refine((d) => d.aiBobotReadiness + d.aiBobotJarak + d.aiBobotKompetensi === 100, {
    message: "Total ketiga bobot (Readiness + Jarak + Kompetensi) harus tepat 100%.",
  });

export async function updateParameterAiAction(input: unknown): Promise<ActionState> {
  const { session, error } = await requireSuperAdmin();
  if (error) return { error };

  const parsed = parameterAiSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data parameter tidak valid." };

  await prisma.pengaturanSistem.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data,
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "UPDATE_PARAMETER_AI_MOBILIZATION",
    entitas: "PengaturanSistem",
    entitasId: "default",
    metadata: parsed.data,
  });

  revalidatePath("/pengaturan");
  revalidatePath("/ai-mobilization");
  return { error: null };
}
