// Util murni (tanpa dependensi server/Prisma) — sengaja dipisah dari anggota-data.ts supaya
// client component (mis. anggota-cv-drawer-content.tsx, profil-view.tsx) yang butuh hitung usia
// tidak ikut menarik seluruh module data-fetching Prisma ke dalam bundle browser.
export function calcUsia(tanggalLahir: Date | null | undefined): number | null {
  if (!tanggalLahir) return null;
  const now = new Date();
  let usia = now.getFullYear() - tanggalLahir.getFullYear();
  const belumUlangTahun =
    now.getMonth() < tanggalLahir.getMonth() ||
    (now.getMonth() === tanggalLahir.getMonth() && now.getDate() < tanggalLahir.getDate());
  if (belumUlangTahun) usia -= 1;
  return usia;
}
