// NFR-07: retry + fallback channel untuk pengiriman Notifikasi. Channel utama ("Aplikasi") adalah
// tulis-ke-DB langsung, jadi di dev/SQLite praktis tidak pernah gagal — tapi produksi (Postgres,
// beban konkuren) bisa kena error transient. Daripada satu Notifikasi gagal membuat SELURUH
// approveMisiAction gagal (kandidat lain jadi tidak dapat notifikasi sama sekali), tiap Notifikasi
// dikirim independen dengan retry; kalau tetap gagal setelah retry, dicatat sebagai fallback
// (channel "SMS (Simulasi)", status "Gagal Terkirim") alih-alih hilang diam-diam.

import { prisma } from "@/lib/prisma";

type NotifikasiInput = {
  anggotaId: string;
  misiId: string;
  judul: string;
  pesan: string;
};

const MAX_ATTEMPTS = 2;

async function createWithRetry(input: NotifikasiInput) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.notifikasi.create({
        data: { ...input, channel: "Aplikasi", status: "Terkirim", deliveryAttempts: attempt },
      });
    } catch (e) {
      lastError = e;
    }
  }
  try {
    return await prisma.notifikasi.create({
      data: {
        ...input,
        channel: "SMS (Simulasi)",
        status: "Gagal Terkirim - Fallback",
        deliveryAttempts: MAX_ATTEMPTS + 1,
      },
    });
  } catch {
    throw lastError;
  }
}

/** Kirim satu batch Notifikasi, tiap item independen (satu gagal tidak menggagalkan yang lain).
 * Mengembalikan jumlah yang berhasil lewat channel utama ("Aplikasi") — dipakai untuk pesan
 * konfirmasi "N notifikasi terkirim" di approveMisiAction. */
export async function deliverNotifikasiBatch(items: NotifikasiInput[]): Promise<number> {
  const results = await Promise.allSettled(items.map((item) => createWithRetry(item)));
  return results.filter((r) => r.status === "fulfilled" && r.value.channel === "Aplikasi").length;
}
