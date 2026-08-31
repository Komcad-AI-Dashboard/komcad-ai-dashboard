// Cakupan (scope) dashboard Overview — "Nasional" atau satu provinsi (temuan QA-05).
//
// Nilainya hidup di URL (?cakupan=<provinsi>), bukan di state client. Alasannya: halaman Overview
// adalah Server Component yang mengambil tujuh sumber data sekaligus. Kalau cakupan disimpan di
// state client, tiap panel harus difilter ulang sendiri-sendiri di browser dan gampang ada yang
// ketinggalan — angka di satu panel bisa beda cakupan dengan panel sebelahnya. Lewat URL, server
// memfilter SEMUANYA sekali di sumbernya, jadi konsisten karena bentuknya, bukan karena disiplin.
// Bonus: cakupan ikut ter-bookmark dan bertahan saat halaman di-refresh.
//
// Per-Pangdam (opsi ketiga di laporan QA) sengaja TIDAK dibuat. lib/komando-teritorial.ts memuat
// 11 Kodam yang dipilih sebagai perwakilan 12 provinsi seed, bukan struktur teritorial lengkap —
// Sulawesi Utara bahkan tidak punya entri Kodim karena nomor satuannya tidak ditemukan dari sumber
// yang meyakinkan. Menyaring per Pangdam di atas data itu akan mengembalikan hasil kosong/salah
// untuk wilayah yang belum tercakup. Itu kekurangan DATA, bukan pilihan desain.

export const CAKUPAN_NASIONAL = "Nasional";

/** Provinsi diambil dari data anggota yang benar-benar ada, bukan daftar 38 provinsi Indonesia —
 * menawarkan provinsi yang tidak punya satu anggota pun cuma menghasilkan dashboard kosong. */
export type CakupanOption = { value: string; label: string; jumlahAnggota: number };

/** Membaca ?cakupan= dan mengembalikan nama provinsi, atau null kalau Nasional/tidak dikenal.
 * Null berarti "jangan filter apa pun" — dipakai langsung sebagai argumen opsional oleh fungsi
 * data di overview-data.ts. */
export function parseCakupan(raw: string | string[] | undefined, valid: string[]): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || v === CAKUPAN_NASIONAL) return null;
  // Nilai dari URL tidak dipercaya: kalau provinsinya tidak ada di data, perlakukan sebagai
  // Nasional daripada memfilter dengan string sembarangan sampai semua panel kosong.
  return valid.includes(v) ? v : null;
}

/** Cocokkan lokasi bebas-teks (Misi, kegiatan) dengan sebuah provinsi.
 *
 * Misi tidak punya kolom provinsi — cuma `lokasi` berupa teks. Untungnya format datanya konsisten
 * menyertakan nama provinsi di belakang ("Kabupaten Agam, Sumatera Barat"), jadi pencocokan
 * substring memadai. Sengaja TIDAK memakai wilayahFromLokasi(): itu memetakan ke wilayah besar
 * (Jawa, Sumatera), sedangkan cakupan di sini setingkat provinsi. */
export function lokasiCocokProvinsi(lokasi: string, provinsi: string) {
  return lokasi.toLowerCase().includes(provinsi.toLowerCase());
}
