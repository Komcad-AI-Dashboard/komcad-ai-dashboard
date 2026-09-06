-- AlterTable
ALTER TABLE "Anggota" ADD COLUMN     "kontakDaruratHubungan" TEXT,
ADD COLUMN     "kontakDaruratTelepon" TEXT;

-- Backfill (temuan QA-09): pisah "Istri · 081200000000" jadi dua kolom.
--
-- Pemisahnya spasi + MIDDLE DOT (U+00B7) + spasi, dikonfirmasi lewat kode karakter di data
-- sungguhan (0020 00b7 0020), bukan ditebak dari tampilan. Jangan diganti titik biasa.
--
-- WAJIB idempoten: scripts/migrate-deploy-retry.mjs bisa mengulang `prisma migrate deploy`
-- sampai lima kali kalau advisory lock Neon gagal, jadi pernyataan ini harus aman dijalankan
-- lebih dari sekali. Bentuk ini aman karena sumbernya selalu kolom "kontakDarurat" yang tidak
-- ikut diubah, jadi hasilnya sama berapa kali pun dijalankan.
--
-- Baris yang tidak memuat pemisah (mis. NULL, atau diisi bebas oleh anggota) sengaja dilewati:
-- lebih baik dua kolom barunya kosong dan bisa diisi ulang anggota, daripada menebak potongannya
-- salah. Kolom lama TIDAK dihapus, jadi nilai aslinya tetap ada kalau ada yang perlu ditinjau.
UPDATE "Anggota" SET
  "kontakDaruratHubungan" = split_part("kontakDarurat", ' · ', 1),
  "kontakDaruratTelepon"  = split_part("kontakDarurat", ' · ', 2)
WHERE "kontakDarurat" LIKE '% · %';
