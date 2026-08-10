// Referensi lokasi untuk form Buat Misi — alternatif tanpa dependensi jaringan dari pencarian
// alamat bebas teks (lib/geocoding.ts, Nominatim). Dipakai kalau geocoding gagal/lokasi tidak
// spesifik, atau Operator memang mau koordinat pasti yang cocok dengan sebaran provinsi seed.
export const LOKASI_REFERENSI = [
  { key: "jakarta-selatan", label: "Jakarta Selatan, DKI Jakarta", lat: -6.2615, lng: 106.781 },
  { key: "bandung", label: "Bandung, Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { key: "semarang", label: "Semarang, Jawa Tengah", lat: -6.9932, lng: 110.4203 },
  { key: "surabaya", label: "Surabaya, Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { key: "medan", label: "Medan, Sumatera Utara", lat: 3.5952, lng: 98.6722 },
  { key: "makassar", label: "Makassar, Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
  { key: "denpasar", label: "Denpasar, Bali", lat: -8.65, lng: 115.2167 },
  { key: "balikpapan", label: "Balikpapan, Kalimantan Timur", lat: -1.2379, lng: 116.8529 },
] as const;

export function findLokasi(key: string) {
  return LOKASI_REFERENSI.find((l) => l.key === key);
}
