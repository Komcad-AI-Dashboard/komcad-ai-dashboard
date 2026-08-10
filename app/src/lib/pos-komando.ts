// Pos Komando — lokasi strategis tetap, bukan entitas Prisma karena FRD tidak mendefinisikan
// atribut/CRUD untuk data ini (hanya disebut sebagai lapisan peta di §10.5/§10.6). Asumsi
// (FRD §11): daftar ini placeholder, perlu divalidasi/di-manage Admin di rilis produksi.

export type PosKomando = {
  nama: string;
  lat: number;
  lng: number;
};

// Offset sengaja dijauhkan (~1-1.5°) dari koordinat provinsi seed (prisma/seed.ts PROVINSI) —
// sebelumnya beberapa titik ini pixel-identik dengan kota provinsi (mis. Bandung, Medan, Makassar),
// yang membuat marker Pos Komando (pane Leaflet lebih tinggi dari marker anggota) menutupi &
// memblokir klik marker anggota di kota-kota itu, bahkan di zoom nasional (whole-Indonesia) yang
// jadi default Overview. Tetap di region yang sama, cuma digeser cukup jauh secara piksel.
export const POS_KOMANDO: PosKomando[] = [
  { nama: "Pos Komando Nasional", lat: -5.6, lng: 108.3 },
  { nama: "Pos Komando Regional Jawa", lat: -8.1, lng: 109.4 },
  { nama: "Pos Komando Regional Sumatera", lat: 2.2, lng: 100.1 },
  { nama: "Pos Komando Regional Sulawesi-Kalimantan", lat: -3.6, lng: 121.0 },
];
