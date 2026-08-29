// Pool data dummy dipakai bareng oleh prisma/seed.ts (110 anggota pertama) dan
// prisma/tambah-anggota.ts (anggota tambahan ke database yang sudah terisi) — satu sumber
// kebenaran supaya kedua skrip tidak diam-diam divergen. SEMUA data FIKTIF, bukan data personel
// TNI/Komcad sungguhan.

import { KOMPETENSI_OPTIONS } from "../src/lib/constants";

export const PROVINSI = [
  { nama: "DKI Jakarta", kab: "Jakarta Selatan", lat: -6.2615, lng: 106.781 },
  { nama: "Jawa Barat", kab: "Bandung", lat: -6.9175, lng: 107.6191 },
  { nama: "Jawa Tengah", kab: "Semarang", lat: -6.9932, lng: 110.4203 },
  { nama: "Jawa Timur", kab: "Surabaya", lat: -7.2575, lng: 112.7521 },
  { nama: "Sumatera Utara", kab: "Medan", lat: 3.5952, lng: 98.6722 },
  { nama: "Sulawesi Selatan", kab: "Makassar", lat: -5.1477, lng: 119.4327 },
  { nama: "Bali", kab: "Denpasar", lat: -8.65, lng: 115.2167 },
  { nama: "Kalimantan Timur", kab: "Balikpapan", lat: -1.2379, lng: 116.8529 },
  { nama: "Sumatera Selatan", kab: "Palembang", lat: -2.9909, lng: 104.7566 },
  { nama: "Nusa Tenggara Barat", kab: "Mataram", lat: -8.5833, lng: 116.1167 },
  { nama: "Kalimantan Barat", kab: "Pontianak", lat: -0.0263, lng: 109.3425 },
  { nama: "Sulawesi Utara", kab: "Manado", lat: 1.4748, lng: 124.8421 },
];

export const NAMA_DEPAN = [
  "Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hendra",
  "Indah", "Joko", "Kartika", "Lukman", "Maya", "Nur", "Oscar", "Putri",
  "Rian", "Siti", "Taufik", "Umi",
];
export const NAMA_BELAKANG = [
  "Pratama", "Santoso", "Wijaya", "Kusuma", "Setiawan", "Rahayu", "Saputra",
  "Hidayat", "Permata", "Gunawan", "Utami", "Firmansyah", "Lestari",
  "Nugroho", "Ramadhan", "Wibowo", "Anggraini", "Suryanto", "Handayani", "Pranoto",
];
export const UNIT = ["Komcad Yon Zeni 1", "Komcad Yon Kav 2", "Komcad Yon Arhanud 3", "Komcad Batalyon Infanteri 5"];
export const KOMPETENSI: string[] = [...KOMPETENSI_OPTIONS];
export const PEKERJAAN_SIPIL = ["Wiraswasta", "Guru", "Perawat", "Teknisi", "Kontraktor", "PNS Non-TNI", "Karyawan Swasta"];
export const NAMA_KONTAK_DARURAT = ["Istri", "Suami", "Ayah", "Ibu", "Kakak"];

export function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function nikDummy(i: number) {
  return `31${String(7100000000000 + i).slice(0, 14)}`.padEnd(16, "0").slice(0, 16);
}
