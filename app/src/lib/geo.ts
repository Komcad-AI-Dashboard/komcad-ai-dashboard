// Util geospasial untuk AI Mobilization (FR-11). Asumsi kecepatan rata-rata gabungan darat/logistik
// 40 km/jam — placeholder wajar untuk MVP, bukan hasil kalkulasi rute jalan sungguhan (butuh
// routing API kalau mau presisi produksi).
const ASUMSI_KECEPATAN_KMH = 40;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateEtaMenit(jarakKm: number): number {
  const menit = (jarakKm / ASUMSI_KECEPATAN_KMH) * 60 + 10; // +10 menit waktu siap-siap
  return Math.max(10, Math.round(menit / 5) * 5);
}

export function formatEta(menit: number): string {
  if (menit < 60) return `${menit} mnt`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa === 0 ? `${jam}j` : `${jam}j ${sisa}m`;
}
