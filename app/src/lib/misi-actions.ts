"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import {
  ROLES,
  STATUS_KEHADIRAN,
  STATUS_MISI,
  URGENSI_MISI,
  JENIS_KEJADIAN_OPTIONS,
  JENIS_KEJADIAN_KOMPETENSI,
} from "@/lib/constants";
import { getKandidatPool } from "@/lib/misi-data";
import { generateAiMobilizationRecommendation, type AiRecommendation } from "@/lib/ai-mobilization";
import { getPengaturanSistem } from "@/lib/pengaturan-data";
import { deliverNotifikasiBatch } from "@/lib/notifikasi-delivery";
import { recalculateReadinessScore } from "@/lib/readiness";
import { geocodeAlamat, type GeocodeResult } from "@/lib/geocoding";

async function requireOperatorPermission() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.OPERATOR) {
    return { session: null, error: "Hanya Super Admin/Operator yang dapat mengelola Misi." };
  }
  return { session, error: null };
}

/** Nomor urut dihitung dari kode TERTINGGI yang sudah ada, bukan dari count() — count() salah
 * kalau ada gap (mis. Misi lama dihapus lewat prisma/hapus-misi-lama.ts, atau nomor tidak
 * kontinu seperti di prisma/misi-bencana.ts), karena bisa menghasilkan kode yang sudah dipakai
 * dan menabrak constraint unik `kodeMisi` (ditemukan nyata saat verifikasi Fase 18). */
async function nextKodeMisi(): Promise<string> {
  const tahun = new Date().getFullYear();
  const prefix = `MISI-${tahun}-`;
  const existing = await prisma.misi.findMany({
    where: { kodeMisi: { startsWith: prefix } },
    select: { kodeMisi: true },
  });
  const maxN = existing.reduce((max, m) => {
    const n = Number(m.kodeMisi.slice(prefix.length));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${prefix}${String(maxN + 1).padStart(3, "0")}`;
}

/** Lokasi bisa dari dropdown Lokasi Referensi (`lib/wilayah.ts`) atau hasil pencarian alamat
 * (Nominatim, `lib/geocoding.ts`) — keduanya diseragamkan client-side jadi {label, lat, lng} yang
 * sama sebelum submit, jadi action ini tidak perlu tahu asalnya. Batas lat/lng divalidasi ulang di
 * sini (defense-in-depth) sama seperti batas di `geocodeAlamat`, karena nilai ini datang dari client.*/
// Form-nya sengaja tidak menandai field ini wajib (boleh kosong, jatuh ke default) — tapi FormData
// selalu kirim string kosong "" untuk input yang dikosongkan (bukan undefined), dan `.default()`
// Zod cuma jalan untuk undefined. Tanpa preprocess ini, submit dengan field dikosongkan gagal
// validasi ("string harus >=1 karakter") alih-alih jatuh ke default seperti niatnya.
const optionalTextWithDefault = (fallback: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).default(fallback)
  );

const buatMisiSchema = z.object({
  pemberiPerintah: optionalTextWithDefault("Operator Komcad"),
  jenisKejadian: z.enum(JENIS_KEJADIAN_OPTIONS),
  urgensi: z.enum([URGENSI_MISI.KRITIS, URGENSI_MISI.TINGGI, URGENSI_MISI.SEDANG]),
  lokasiLabel: z.string().min(1),
  lokasiLat: z.coerce.number().min(-11.5).max(7),
  lokasiLng: z.coerce.number().min(93.5).max(141.5),
  deskripsiMisi: optionalTextWithDefault("(deskripsi belum diisi)"),
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
  const lokasi = { label: data.lokasiLabel, lat: data.lokasiLat, lng: data.lokasiLng };

  // nextKodeMisi() tidak bergantung ke pengaturan/kandidat/rekomendasi AI — mulai jalan sekarang,
  // paralel sama rangkaian panggilan AI di bawah (yang jauh lebih lama), bukan menunggu di akhir.
  const kodeMisiPromise = nextKodeMisi();

  const pengaturan = await getPengaturanSistem();
  const kandidatPool = await getKandidatPool(lokasi.lat, lokasi.lng, 15, pengaturan.aiRadiusKm);
  const rekomendasi = await generateAiMobilizationRecommendation({
    pemberiPerintah: data.pemberiPerintah,
    jenisKejadian: data.jenisKejadian,
    urgensi: data.urgensi,
    lokasi: lokasi.label,
    deskripsiMisi: data.deskripsiMisi,
    kandidatPool,
    bobot: {
      readiness: pengaturan.aiBobotReadiness,
      jarak: pengaturan.aiBobotJarak,
      kompetensi: pengaturan.aiBobotKompetensi,
    },
    kompetensiDibutuhkan: JENIS_KEJADIAN_KOMPETENSI[data.jenisKejadian] ?? [],
  });

  const poolById = new Map(kandidatPool.map((k) => [k.anggotaId, k]));
  const kodeMisi = await kodeMisiPromise;

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

export type ApproveMisiResult = { error: string | null; jumlahDinotifikasi: number };

/** FR-12/FR-13: approval eksplisit Operator memindahkan Misi Draft -> Dimobilisasi + kirim Notifikasi. */
export async function approveMisiAction(misiId: string): Promise<ApproveMisiResult> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error, jumlahDinotifikasi: 0 };

  const misi = await prisma.misi.findUnique({ where: { id: misiId }, include: { penugasan: true } });
  if (!misi) return { error: "Misi tidak ditemukan.", jumlahDinotifikasi: 0 };
  if (misi.status !== STATUS_MISI.DRAFT) return { error: "Misi ini sudah diproses sebelumnya.", jumlahDinotifikasi: 0 };

  const pengaturan = await getPengaturanSistem();

  // Update status Misi & pengiriman Notifikasi independen satu sama lain (lihat catatan di bawah
  // soal kenapa Notifikasi sengaja di luar transaksi status Misi), jadi bisa jalan berbarengan.
  const [, jumlahDinotifikasi] = await Promise.all([
    prisma.misi.update({
      where: { id: misiId },
      data: { status: STATUS_MISI.DIMOBILISASI, dimobilisasiAt: new Date() },
    }),
    // FR-13 / preferensi "Notifikasi Misi baru" (menu Pengaturan) — kalau dimatikan Admin, Misi tetap
    // dimobilisasi tapi Notifikasi tidak dibuat. Dikirim di luar transaksi status Misi (NFR-07: retry +
    // fallback per-notifikasi lewat deliverNotifikasiBatch) supaya satu kandidat gagal tidak membatalkan
    // perubahan status Misi yang sudah pasti terjadi.
    pengaturan.notifMisiBaru
      ? deliverNotifikasiBatch(
          misi.penugasan.map((p) => ({
            anggotaId: p.anggotaId,
            misiId: misi.id,
            judul: `Mobilisasi ${misi.kodeMisi}`,
            pesan: `Anda direkomendasikan untuk Misi ${misi.jenisKejadian} di ${misi.lokasi}. Segera konfirmasi kehadiran. ETA perkiraan ${p.etaMenit ?? "-"} menit.`,
          }))
        )
      : Promise.resolve(0),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    aksi: "APPROVE_MISI",
    entitas: "Misi",
    entitasId: misiId,
    metadata: { kodeMisi: misi.kodeMisi, jumlahDinotifikasi },
  });

  revalidatePath("/misi");
  revalidatePath("/ai-mobilization");
  revalidatePath("/overview");
  return { error: null, jumlahDinotifikasi };
}

/** FR-16: penutupan Misi + evaluasi -> otomatis masuk Riwayat Mobilisasi (Misi berstatus Selesai). */
export async function closeMisiAction(misiId: string, hasilEvaluasi: string): Promise<ActionState> {
  const { session, error } = await requireOperatorPermission();
  if (error) return { error };

  const misi = await prisma.misi.findUnique({ where: { id: misiId }, include: { penugasan: { select: { anggotaId: true } } } });
  if (!misi) return { error: "Misi tidak ditemukan." };
  if (misi.status !== STATUS_MISI.DIMOBILISASI) return { error: "Misi ini belum dimobilisasi." };

  const evaluasi = hasilEvaluasi.trim() || "Tidak ada catatan evaluasi.";

  // writeAuditLog tidak butuh hasil transaksi (metadata-nya sudah lengkap dari `misi` yang di-fetch
  // di atas), jadi jalan berbarengan dengan transaksi, bukan menunggunya kelar dulu.
  await Promise.all([
    prisma.$transaction([
      prisma.misi.update({
        where: { id: misiId },
        data: { status: STATUS_MISI.SELESAI, selesaiAt: new Date(), hasilEvaluasi: evaluasi },
      }),
      prisma.penugasan.updateMany({
        where: { misiId, statusKehadiran: { notIn: [STATUS_KEHADIRAN.DITOLAK] } },
        data: { statusKehadiran: STATUS_KEHADIRAN.SELESAI },
      }),
    ]),
    writeAuditLog({
      userId: session!.user.id,
      aksi: "CLOSE_MISI",
      entitas: "Misi",
      entitasId: misiId,
      metadata: { kodeMisi: misi.kodeMisi, hasilEvaluasi: evaluasi },
    }),
  ]);

  // Readiness Score anggota terlibat berubah karena riwayat kehadiran mereka baru saja bertambah —
  // ini WAJIB setelah transaksi di atas kelar (recalculateReadinessScore baca ulang statusKehadiran
  // dari DB, jadi butuh update penugasan sudah commit).
  const anggotaIdUnik = [...new Set(misi.penugasan.map((p) => p.anggotaId))];
  await Promise.all(anggotaIdUnik.map((id) => recalculateReadinessScore(id)));

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

  const penugasan = await prisma.penugasan.update({
    where: { id: penugasanId },
    data: { statusKehadiran: status },
  });
  // recalculateReadinessScore butuh update di atas sudah commit (baca ulang statusKehadiran dari
  // DB), tapi writeAuditLog tidak bergantung ke keduanya — jalan berbarengan.
  await Promise.all([
    recalculateReadinessScore(penugasan.anggotaId),
    writeAuditLog({
      userId: session!.user.id,
      aksi: "UPDATE_KEHADIRAN",
      entitas: "Penugasan",
      entitasId: penugasanId,
      metadata: { status },
    }),
  ]);

  revalidatePath("/misi");
  return { error: null };
}

/** Cari koordinat dari alamat/nama lokasi bebas teks (Nominatim) untuk field Lokasi di form Buat
 * Misi — alternatif dari dropdown Lokasi Referensi. Dipanggil per klik tombol "Cari Lokasi", bukan
 * per-keystroke. */
export async function geocodeLokasiAction(query: string): Promise<{ result: GeocodeResult | null; error: string | null }> {
  const { error } = await requireOperatorPermission();
  if (error) return { result: null, error };
  return geocodeAlamat(query);
}
