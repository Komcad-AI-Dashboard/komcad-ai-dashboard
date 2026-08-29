import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit membaca file .afm (metrik font) dari node_modules-nya sendiri via fs relatif ke
  // __dirname saat runtime — kalau di-bundle Turbopack/webpack, __dirname jadi path virtual dan
  // file itu tidak ketemu (ENOENT). serverExternalPackages membuat Next require() paket ini
  // langsung dari node_modules asli, bukan di-bundle.
  serverExternalPackages: ["pdfkit"],
  // Dev server ini diakses lewat 127.0.0.1 (localhost sempat tidak resolve di mesin dev — lihat
  // CLAUDE.md catatan lingkungan), tapi Turbopack dev origin protection defaultnya cuma percaya
  // localhost/host LAN yang ke-deteksi otomatis — 127.0.0.1 kena blokir "Cross-origin request"
  // untuk semua asset _next/HMR, yang bikin komponen client (mis. modal Buat Misi, AI Chat) gagal
  // ke-hydrate diam-diam (403 di console, bukan error yang jelas). Dev-only, tidak berlaku di build.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
