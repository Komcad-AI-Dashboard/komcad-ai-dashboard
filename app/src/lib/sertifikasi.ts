import { STATUS_SERTIFIKASI } from "@/lib/constants";

const H_MINUS_30_MS = 30 * 24 * 60 * 60 * 1000;

/** FR-06: status dihitung dari tanggalBerlaku, bukan dipercaya dari kolom tersimpan —
 * supaya badge "berubah warna otomatis" beneran mengikuti waktu, bukan snapshot statis. */
export function computeSertifikasiStatus(tanggalBerlaku: Date, now: Date = new Date()): string {
  const msLeft = tanggalBerlaku.getTime() - now.getTime();
  if (msLeft < 0) return STATUS_SERTIFIKASI.KEDALUWARSA;
  if (msLeft <= H_MINUS_30_MS) return STATUS_SERTIFIKASI.AKAN_KEDALUWARSA;
  return STATUS_SERTIFIKASI.AKTIF;
}
