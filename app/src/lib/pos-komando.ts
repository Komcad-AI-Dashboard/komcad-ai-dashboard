// Pos Komando — lokasi strategis tetap, bukan entitas Prisma karena FRD tidak mendefinisikan
// atribut/CRUD untuk data ini (hanya disebut sebagai lapisan peta di §10.5/§10.6). Asumsi
// (FRD §11): daftar ini placeholder, perlu divalidasi/di-manage Admin di rilis produksi.

export type PosKomando = {
  nama: string;
  lat: number;
  lng: number;
};

export const POS_KOMANDO: PosKomando[] = [
  { nama: "Pos Komando Nasional", lat: -6.2, lng: 106.816 },
  { nama: "Pos Komando Regional Jawa", lat: -6.9175, lng: 107.6191 },
  { nama: "Pos Komando Regional Sumatera", lat: 3.5952, lng: 98.6722 },
  { nama: "Pos Komando Regional Sulawesi-Kalimantan", lat: -5.1477, lng: 119.4327 },
];
