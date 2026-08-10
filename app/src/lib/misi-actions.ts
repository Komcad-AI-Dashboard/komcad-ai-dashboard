"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { ROLES, STATUS_KEHADIRAN, STATUS_MISI, URGENSI_MISI, JENIS_KEJADIAN_OPTIONS } from "@/lib/constants";
import { findLokasi } from "@/lib/wilayah";
import { getKandidatPool } from "@/lib/misi-data";
import { generateAiMobilizationRecommendation, type AiRecommendation } from "@/lib/ai-mobilization";

async function requireOperatorPermission() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.OPERATOR) {
    return { session: null, error: "Hanya Super Admin/Operator yang dapat mengelola Misi." };
  }
  return { session, error: null };
}

async function nextKodeMisi(): Promise<string> {
  const tahun = new Date().getFullYear();
  const prefix = `MISI-${tahun}-`;
  const count = await prisma.misi.count({ where: { kodeMisi: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

const buatMisiSchema = z.object({
  pemberiPerintah: z.string().min(1).default("Operator Komcad"),
  jenisKejadian: z.enum(JENIS_KEJADIAN_OPTIONS),
  urgensi: z.enum([URGENSI_MISI.KRITIS, URGENSI_MISI.TINGGI, URGENSI_MISI.SEDANG]),
  lokasiKey: z.string().min(1),
  deskripsiMisi: z.string().min(1).default("(deskripsi belum diisi)"),
  kebutuhanPersonel: z.coerce.number().int().min(1).max(50).default(5),
});

export type GenerateMisiResult =
  | { error: string }
  | {
      error: null;
      misiId: string;
      kodeMisi: string;
      ringkasanAI: string;
      sumber: AiRecommendation["sumber"];
      kandidat: {
        anggotaId: string;
        nama: string;
        kodeAnggota: string;
        skor: number;
        alasan: string[];
        etaMenit: number;
      }[];
    };

/** FR-08/FR-09/FR-10/FR-11: buat Misi (status Draft) + generate rekomendasi AI grounded ke DB. */
export async function generateMisiAction(input: unknown): Promise<GenerateMisiResult> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error };

  const parsed = buatMisiSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  const data = parsed.data;

  const lokasi = findLokasi(data.lokasiKey);
  if (!lokasi) return { error: "Lokasi tidak dikenali." };

  const kandidatPool = await getKandidatPool(lokasi.lat, lokasi.lng);
  const rekomendasi = await generateAiMobilizationRecommendation({
    pemberiPerintah: data.pemberiPerintah,
    jenisKejadian: data.jenisKejadian,
    urgensi: data.urgensi,
    lokasi: lokasi.label,
    deskripsiMisi: data.deskripsiMisi,
    kandidatPool,
  });

  const poolById = new Map(kandidatPool.map((k) => [k.anggotaId, k]));
  const kodeMisi = await nextKodeMisi();

  const misi = await prisma.misi.create({
    data: {
      kodeMisi,
      pemberiPerintah: data.pemberiPerintah,
      jenisKejadian: data.jenisKejadian,
      urgensi: data.urgensi,
      lokasi: lokasi.label,
      latitude: lokasi.lat,
      longitude: lokasi.lng,
      deskripsiMisi: data.deskripsiMisi,
      status: STATUS_MISI.DRAFT,
      kebutuhanPersonel: data.kebutuhanPersonel,
      ringkasanAI: rekomendasi.ringkasanAI,
      penugasan: {
        create: rekomendasi.kandidat.map((k) => ({
          anggotaId: k.anggotaId,
          skorRekomendasi: k.skor,
          alasan: JSON.stringify(k.alasan),
          etaMenit: poolById.get(k.anggotaId)?.etaMenit ?? null,
          statusKehadiran: STATUS_KEHADIRAN.MENUNGGU_RESPONS,
        })),
      },
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "AI_MOBILIZATION_GENERATE",
    entitas: "Misi",
    entitasId: misi.id,
    metadata: { kodeMisi, sumber: rekomendasi.sumber, jumlahKandidat: rekomendasi.kandidat.length },
  });

  revalidatePath("/misi");
  revalidatePath("/ai-mobilization");
  revalidatePath("/overview");

  return {
    error: null,
    misiId: misi.id,
    kodeMisi,
    ringkasanAI: rekomendasi.ringkasanAI,
    sumber: rekomendasi.sumber,
    kandidat: rekomendasi.kandidat.map((k) => ({
      anggotaId: k.anggotaId,
      nama: poolById.get(k.anggotaId)?.nama ?? "—",
      kodeAnggota: poolById.get(k.anggotaId)?.kodeAnggota ?? "—",
      skor: k.skor,
      alasan: k.alasan,
      etaMenit: poolById.get(k.anggotaId)?.etaMenit ?? 0,
    })),
  };
}

type ActionState = { error: string | null };

/** FR-12/FR-13: approval eksplisit Operator memindahkan Misi Draft -> Dimobilisasi + kirim Notifikasi. */
export async function approveMisiAction(misiId: string): Promise<ActionState> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error };

  const misi = await prisma.misi.findUnique({ where: { id: misiId }, include: { penugasan: true } });
  if (!misi) return { error: "Misi tidak ditemukan." };
  if (misi.status !== STATUS_MISI.DRAFT) return { error: "Misi ini sudah diproses sebelumnya." };

  await prisma.$transaction([
    prisma.misi.update({
      where: { id: misiId },
      data: { status: STATUS_MISI.DIMOBILISASI, dimobilisasiAt: new Date() },
    }),
    prisma.notifikasi.createMany({
      data: misi.penugasan.map((p) => ({
        anggotaId: p.anggotaId,
        misiId: misi.id,
        judul: `Mobilisasi ${misi.kodeMisi}`,
        pesan: `Anda direkomendasikan untuk Misi ${misi.jenisKejadian} di ${misi.lokasi}. Segera konfirmasi kehadiran. ETA perkiraan ${p.etaMenit ?? "-"} menit.`,
        channel: "Aplikasi",
        status: "Terkirim",
      })),
    }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "APPROVE_MISI",
    entitas: "Misi",
    entitasId: misiId,
    metadata: { kodeMisi: misi.kodeMisi, jumlahDinotifikasi: misi.penugasan.length },
  });

  revalidatePath("/misi");
  revalidatePath("/ai-mobilization");
  revalidatePath("/overview");
  return { error: null };
}

/** FR-16: penutupan Misi + evaluasi -> otomatis masuk Riwayat Mobilisasi (Misi berstatus Selesai). */
export async function closeMisiAction(misiId: string, hasilEvaluasi: string): Promise<ActionState> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error };

  const misi = await prisma.misi.findUnique({ where: { id: misiId } });
  if (!misi) return { error: "Misi tidak ditemukan." };
  if (misi.status !== STATUS_MISI.DIMOBILISASI) return { error: "Misi ini belum dimobilisasi." };

  const evaluasi = hasilEvaluasi.trim() || "Tidak ada catatan evaluasi.";

  await prisma.$transaction([
    prisma.misi.update({
      where: { id: misiId },
      data: { status: STATUS_MISI.SELESAI, selesaiAt: new Date(), hasilEvaluasi: evaluasi },
    }),
    prisma.penugasan.updateMany({
      where: { misiId, statusKehadiran: { notIn: [STATUS_KEHADIRAN.DITOLAK] } },
      data: { statusKehadiran: STATUS_KEHADIRAN.SELESAI },
    }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "CLOSE_MISI",
    entitas: "Misi",
    entitasId: misiId,
    metadata: { kodeMisi: misi.kodeMisi, hasilEvaluasi: evaluasi },
  });

  revalidatePath("/misi");
  revalidatePath("/riwayat");
  revalidatePath("/overview");
  revalidatePath("/analitik");
  return { error: null };
}

/** FR-15: pemantauan & update manual status kehadiran personel dalam sebuah Misi. */
export async function updateKehadiranAction(penugasanId: string, status: string): Promise<ActionState> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error };

  if (!Object.values(STATUS_KEHADIRAN).includes(status as (typeof STATUS_KEHADIRAN)[keyof typeof STATUS_KEHADIRAN])) {
    return { error: "Status kehadiran tidak valid." };
  }

  await prisma.penugasan.update({
    where: { id: penugasanId },
    data: { statusKehadiran: status },
  });

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "UPDATE_KEHADIRAN",
    entitas: "Penugasan",
    entitasId: penugasanId,
    metadata: { status },
  });

  revalidatePath("/misi");
  return { error: null };
}
