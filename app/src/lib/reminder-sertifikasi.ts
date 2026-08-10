// Reminder sertifikasi H-30 (menu Pengaturan → "Reminder sertifikasi kedaluwarsa"). Tidak ada
// scheduler/cron persisten di lingkungan ini — engine ini dipanggil ON-DEMAND tiap kali halaman
// yang relevan dibuka (Beranda Sisi Anggota untuk sertifikasi diri sendiri, Overview Command
// Center untuk seluruh anggota sekaligus), bukan background job. Idempotent per siklus kedaluwarsa:
// judul Notifikasi menyertakan tanggal berlaku, jadi satu sertifikasi cuma diingatkan sekali per
// masa berlaku — begitu diperbarui (tanggalBerlaku baru), siklus reminder berikutnya jalan lagi.

import { prisma } from "@/lib/prisma";
import { computeSertifikasiStatus } from "@/lib/sertifikasi";
import { STATUS_SERTIFIKASI } from "@/lib/constants";
import { getPengaturanSistem } from "@/lib/pengaturan-data";

function judulReminder(jenisSertifikasi: string, tanggalBerlaku: Date): string {
  const tgl = tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  return `Sertifikasi Akan Kedaluwarsa: ${jenisSertifikasi} (s.d. ${tgl})`;
}

/** anggotaId kosong = cek semua anggota (dipanggil dari Overview Command Center). Kembalikan
 * jumlah Notifikasi baru yang dibuat. */
export async function ensureReminderSertifikasi(anggotaId?: string): Promise<number> {
  const pengaturan = await getPengaturanSistem();
  if (!pengaturan.reminderSertifikasi) return 0;

  const now = new Date();
  const semua = await prisma.sertifikasi.findMany({
    where: anggotaId ? { anggotaId } : undefined,
    select: { anggotaId: true, jenisSertifikasi: true, tanggalBerlaku: true },
  });
  const akanKedaluwarsa = semua.filter(
    (s) => computeSertifikasiStatus(s.tanggalBerlaku, now) === STATUS_SERTIFIKASI.AKAN_KEDALUWARSA
  );
  if (akanKedaluwarsa.length === 0) return 0;

  let dibuat = 0;
  for (const s of akanKedaluwarsa) {
    const judul = judulReminder(s.jenisSertifikasi, s.tanggalBerlaku);
    const sudahAda = await prisma.notifikasi.findFirst({ where: { anggotaId: s.anggotaId, judul } });
    if (sudahAda) continue;
    await prisma.notifikasi.create({
      data: {
        anggotaId: s.anggotaId,
        judul,
        pesan: `Sertifikasi ${s.jenisSertifikasi} Anda akan kedaluwarsa pada ${s.tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}. Segera ajukan perpanjangan.`,
        channel: "Aplikasi",
        status: "Terkirim",
      },
    });
    dibuat++;
  }
  return dibuat;
}
