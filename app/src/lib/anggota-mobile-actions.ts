"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { STATUS_KEHADIRAN, STATUS_SIAGA } from "@/lib/constants";
import { requireSelfAnggotaId } from "@/lib/anggota-mobile-data";

type ActionState = { error: string | null };

const profilSelfSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  golonganDarah: z.string().optional(),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"]),
  pendidikan: z.string().optional(),
  pekerjaanSipil: z.string().optional(),
  alamatDomisili: z.string().optional(),
  telepon: z.string().optional(),
  email: z.email("Format email tidak valid").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  kontakDarurat: z.string().optional(),
});

/** FR-37: field bebas langsung diterapkan; NIK (data sensitif) TIDAK langsung ditulis ke Anggota —
 * dicatat sebagai PermintaanUbahData Menunggu, baru berlaku setelah Admin/Operator menyetujui. */
export async function updateProfilSelfAction(input: unknown): Promise<ActionState & { nikMenunggu: boolean }> {
  const self = await requireSelfAnggotaId();
  if ("error" in self) return { error: self.error, nikMenunggu: false };

  const parsed = profilSelfSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid", nikMenunggu: false };
  }
  const data = parsed.data;

  const anggota = await prisma.anggota.findUnique({ where: { id: self.anggotaId } });
  if (!anggota) return { error: "Data Anggota tidak ditemukan.", nikMenunggu: false };

  let nikMenunggu = false;
  if (data.nik !== anggota.nik) {
    const nikDipakai = await prisma.anggota.findUnique({ where: { nik: data.nik } });
    if (nikDipakai) return { error: "NIK sudah terdaftar untuk anggota lain.", nikMenunggu: false };

    const existingRequest = await prisma.permintaanUbahData.findFirst({
      where: { anggotaId: self.anggotaId, field: "nik", status: "Menunggu" },
    });
    if (existingRequest) {
      await prisma.permintaanUbahData.update({
        where: { id: existingRequest.id },
        data: { nilaiBaru: data.nik },
      });
    } else {
      await prisma.permintaanUbahData.create({
        data: { anggotaId: self.anggotaId, field: "nik", nilaiLama: anggota.nik, nilaiBaru: data.nik },
      });
    }
    nikMenunggu = true;
  }

  await prisma.anggota.update({
    where: { id: self.anggotaId },
    data: {
      telepon: data.telepon || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      linkedin: data.linkedin || null,
      kontakDarurat: data.kontakDarurat || null,
      profilDemografi: {
        upsert: {
          create: {
            jenisKelamin: data.jenisKelamin,
            golonganDarah: data.golonganDarah || null,
            pendidikan: data.pendidikan || null,
            pekerjaanSipil: data.pekerjaanSipil || null,
            alamatDomisili: data.alamatDomisili || null,
          },
          update: {
            jenisKelamin: data.jenisKelamin,
            golonganDarah: data.golonganDarah || null,
            pendidikan: data.pendidikan || null,
            pekerjaanSipil: data.pekerjaanSipil || null,
            alamatDomisili: data.alamatDomisili || null,
          },
        },
      },
    },
  });

  await writeAuditLog({
    userId: self.userId,
    aksi: "UPDATE_PROFIL_SELF",
    entitas: "Anggota",
    entitasId: self.anggotaId,
    metadata: { nikMenunggu },
  });

  revalidatePath("/m/profil");
  return { error: null, nikMenunggu };
}

export async function updateStatusSiagaSelfAction(status: string): Promise<ActionState> {
  const self = await requireSelfAnggotaId();
  if ("error" in self) return { error: self.error };

  if (!Object.values(STATUS_SIAGA).includes(status as (typeof STATUS_SIAGA)[keyof typeof STATUS_SIAGA])) {
    return { error: "Status tidak valid." };
  }

  await prisma.anggota.update({ where: { id: self.anggotaId }, data: { statusSiaga: status } });

  await writeAuditLog({
    userId: self.userId,
    aksi: "UPDATE_STATUS_SIAGA_SELF",
    entitas: "Anggota",
    entitasId: self.anggotaId,
    metadata: { status },
  });

  // FR-39: tersinkron ke peta Overview Command Center (refresh-on-navigate, sama seperti FR-07).
  revalidatePath("/m");
  revalidatePath("/overview");
  return { error: null };
}

const lokasiSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

/** Perbarui titik lokasi dari GPS perangkat (Geolocation API di client) — dipakai marker peta
 * Overview Command Center (FR-03). */
export async function updateLokasiSelfAction(input: unknown): Promise<ActionState> {
  const self = await requireSelfAnggotaId();
  if ("error" in self) return { error: self.error };

  const parsed = lokasiSchema.safeParse(input);
  if (!parsed.success) return { error: "Koordinat tidak valid." };

  const anggota = await prisma.anggota.findUnique({
    where: { id: self.anggotaId },
    select: { profilDemografi: { select: { provinsi: true, kabupatenKota: true } } },
  });

  await prisma.lokasi.create({
    data: {
      anggotaId: self.anggotaId,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      provinsi: anggota?.profilDemografi?.provinsi ?? "Tidak diketahui",
      kabupatenKota: anggota?.profilDemografi?.kabupatenKota ?? null,
    },
  });

  revalidatePath("/m/profil");
  revalidatePath("/overview");
  return { error: null };
}

const respondSchema = z.enum(["Konfirmasi", "Tolak"]);

/** FR-40: respons Anggota atas notifikasi mobilisasi — juga memperbarui Penugasan.statusKehadiran
 * supaya langsung terlihat Operator di drawer Manajemen Misi (Fase 6), bukan cuma di sisi Anggota. */
export async function respondNotifikasiAction(notifikasiId: string, responsTipe: unknown): Promise<ActionState> {
  const self = await requireSelfAnggotaId();
  if ("error" in self) return { error: self.error };

  const parsedTipe = respondSchema.safeParse(responsTipe);
  if (!parsedTipe.success) return { error: "Jenis respons tidak valid." };

  const notif = await prisma.notifikasi.findUnique({ where: { id: notifikasiId } });
  if (!notif) return { error: "Notifikasi tidak ditemukan." };
  if (notif.anggotaId !== self.anggotaId) return { error: "Notifikasi ini bukan milik Anda." };
  if (notif.status === "Direspons") return { error: "Notifikasi ini sudah direspons sebelumnya." };

  await prisma.notifikasi.update({
    where: { id: notifikasiId },
    data: { status: "Direspons", responsTipe: parsedTipe.data, respondedAt: new Date() },
  });

  if (notif.misiId) {
    const penugasan = await prisma.penugasan.findUnique({
      where: { misiId_anggotaId: { misiId: notif.misiId, anggotaId: self.anggotaId } },
    });
    if (penugasan) {
      await prisma.penugasan.update({
        where: { id: penugasan.id },
        data: {
          statusKehadiran: parsedTipe.data === "Konfirmasi" ? STATUS_KEHADIRAN.DIKONFIRMASI : STATUS_KEHADIRAN.DITOLAK,
        },
      });
    }
  }

  await writeAuditLog({
    userId: self.userId,
    aksi: "RESPOND_NOTIFIKASI",
    entitas: "Notifikasi",
    entitasId: notifikasiId,
    metadata: { responsTipe: parsedTipe.data, misiId: notif.misiId },
  });

  revalidatePath("/m/notifikasi");
  revalidatePath("/m");
  revalidatePath("/misi");
  return { error: null };
}
