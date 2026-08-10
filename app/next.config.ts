import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit membaca file .afm (metrik font) dari node_modules-nya sendiri via fs relatif ke
  // __dirname saat runtime — kalau di-bundle Turbopack/webpack, __dirname jadi path virtual dan
  // file itu tidak ketemu (ENOENT). serverExternalPackages membuat Next require() paket ini
  // langsung dari node_modules asli, bukan di-bundle.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
