// Lokasi Kodam/Kodim — layer peta tambahan (Fase 18, permintaan partner: "lokasi Kodim/Kodam di
// maps, sekarang masih terlalu sedikit"). Sama seperti POS_KOMANDO (lib/pos-komando.ts): array
// statis, BUKAN entitas Prisma (FRD tidak mendefinisikan atribut/CRUD untuk data ini). Titik dasar
// tiap unit = kota/kabupaten HQ (dari riset web, sumber Wikipedia/situs resmi satuan — lihat nomor
// Kodim yang tertulis di `nama`), TAPI digeser ~0.06-0.09° (beberapa km) dari koordinat kota
// provinsi seed (prisma/data-pools.ts PROVINSI) — dan dari sesama unit di kota yang sama — supaya
// tidak numpuk pixel dengan cluster marker anggota maupun satu sama lain (Leaflet markerPane
// SELALU di atas overlayPane anggota, lihat catatan lengkap di pos-komando.ts baris 11-19).
//
// PENTING: representatif, bukan lengkap — Indonesia punya 15 Kodam & ratusan Kodim. Daftar ini
// cuma mencakup 1 Kodam + (kalau ketemu sumber meyakinkan) 1 Kodim per provinsi di seed data (12
// provinsi). Data referensi demo, BUKAN sumber resmi TNI — perlu divalidasi ulang sebelum dipakai
// di luar konteks demo.

export type UnitTeritorial = {
  nama: string;
  lat: number;
  lng: number;
};

// Titik kota HQ tiap Kodam/Kodim (sebelum offset) — provinsi yang sama pakai koordinat kota yang
// sama persis dengan prisma/data-pools.ts PROVINSI, karena itu memang kota yang sama.
const KOTA = {
  jakarta: { lat: -6.2615, lng: 106.781 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  semarang: { lat: -6.9932, lng: 110.4203 },
  surabaya: { lat: -7.2575, lng: 112.7521 },
  medan: { lat: 3.5952, lng: 98.6722 },
  makassar: { lat: -5.1477, lng: 119.4327 },
  denpasar: { lat: -8.65, lng: 115.2167 },
  balikpapan: { lat: -1.2379, lng: 116.8529 },
  palembang: { lat: -2.9909, lng: 104.7566 },
  mataram: { lat: -8.5833, lng: 116.1167 },
  pontianak: { lat: -0.0263, lng: 109.3425 },
  manado: { lat: 1.4748, lng: 124.8421 },
} as const;

// Kodam digeser ke arah baratdaya-nya, Kodim ke arah timurlaut — jauh dari titik kota persis (jadi
// tidak numpuk anggota) dan dari satu sama lain (jadi keduanya bisa diklik terpisah).
const KODAM_OFFSET = { lat: -0.08, lng: -0.07 };
const KODIM_OFFSET = { lat: 0.08, lng: 0.07 };

export const KODAM: UnitTeritorial[] = [
  { nama: "Kodam Jaya/Jayakarta", lat: KOTA.jakarta.lat + KODAM_OFFSET.lat, lng: KOTA.jakarta.lng + KODAM_OFFSET.lng },
  { nama: "Kodam III/Siliwangi", lat: KOTA.bandung.lat + KODAM_OFFSET.lat, lng: KOTA.bandung.lng + KODAM_OFFSET.lng },
  { nama: "Kodam IV/Diponegoro", lat: KOTA.semarang.lat + KODAM_OFFSET.lat, lng: KOTA.semarang.lng + KODAM_OFFSET.lng },
  { nama: "Kodam V/Brawijaya", lat: KOTA.surabaya.lat + KODAM_OFFSET.lat, lng: KOTA.surabaya.lng + KODAM_OFFSET.lng },
  { nama: "Kodam I/Bukit Barisan", lat: KOTA.medan.lat + KODAM_OFFSET.lat, lng: KOTA.medan.lng + KODAM_OFFSET.lng },
  { nama: "Kodam XIV/Hasanuddin", lat: KOTA.makassar.lat + KODAM_OFFSET.lat, lng: KOTA.makassar.lng + KODAM_OFFSET.lng },
  // Bali & NTB sama-sama di bawah Kodam IX/Udayana — HQ-nya cuma dicatat sekali, di Denpasar.
  { nama: "Kodam IX/Udayana", lat: KOTA.denpasar.lat + KODAM_OFFSET.lat, lng: KOTA.denpasar.lng + KODAM_OFFSET.lng },
  { nama: "Kodam VI/Mulawarman", lat: KOTA.balikpapan.lat + KODAM_OFFSET.lat, lng: KOTA.balikpapan.lng + KODAM_OFFSET.lng },
  { nama: "Kodam II/Sriwijaya", lat: KOTA.palembang.lat + KODAM_OFFSET.lat, lng: KOTA.palembang.lng + KODAM_OFFSET.lng },
  { nama: "Kodam XII/Tanjungpura", lat: KOTA.pontianak.lat + KODAM_OFFSET.lat, lng: KOTA.pontianak.lng + KODAM_OFFSET.lng },
  { nama: "Kodam XIII/Merdeka", lat: KOTA.manado.lat + KODAM_OFFSET.lat, lng: KOTA.manado.lng + KODAM_OFFSET.lng },
];

// Kodim per provinsi seed (nomor+nama diverifikasi web search, Agustus 2026). Sulawesi Utara
// sengaja tidak punya entri Kodim — tidak ditemukan sumber yang cukup meyakinkan untuk nomor
// satuannya, jadi provinsi itu cuma diwakili Kodam XIII di atas (lebih baik dilewati daripada
// mengarang nomor Kodim).
export const KODIM: UnitTeritorial[] = [
  { nama: "Kodim 0504/Jakarta Selatan", lat: KOTA.jakarta.lat + KODIM_OFFSET.lat, lng: KOTA.jakarta.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0618/BS (Kota Bandung)", lat: KOTA.bandung.lat + KODIM_OFFSET.lat, lng: KOTA.bandung.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0733/BS (Kota Semarang)", lat: KOTA.semarang.lat + KODIM_OFFSET.lat, lng: KOTA.semarang.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0830/Surabaya", lat: KOTA.surabaya.lat + KODIM_OFFSET.lat, lng: KOTA.surabaya.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0201/BS (Kota Medan)", lat: KOTA.medan.lat + KODIM_OFFSET.lat, lng: KOTA.medan.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 1408/Makassar", lat: KOTA.makassar.lat + KODIM_OFFSET.lat, lng: KOTA.makassar.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 1611/Badung", lat: KOTA.denpasar.lat + KODIM_OFFSET.lat, lng: KOTA.denpasar.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0905/Balikpapan", lat: KOTA.balikpapan.lat + KODIM_OFFSET.lat, lng: KOTA.balikpapan.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 0418/Palembang", lat: KOTA.palembang.lat + KODIM_OFFSET.lat, lng: KOTA.palembang.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 1606/Lombok Barat (Mataram)", lat: KOTA.mataram.lat + KODIM_OFFSET.lat, lng: KOTA.mataram.lng + KODIM_OFFSET.lng },
  { nama: "Kodim 1207/Pontianak", lat: KOTA.pontianak.lat + KODIM_OFFSET.lat, lng: KOTA.pontianak.lng + KODIM_OFFSET.lng },
];
