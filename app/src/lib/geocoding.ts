// Geocoding alamat bebas teks untuk field Lokasi di Buat Misi (menggantikan sebagian batasan
// dropdown 8 kota referensi dari Fase 6). Pakai Nominatim (OpenStreetMap) — API publik gratis,
// satu ekosistem dengan tile peta yang sudah dipakai di Overview (FRD §10.5), tidak perlu API key.
// Kebijakan penggunaan Nominatim (https://operations.osmfoundation.org/policies/nominatim/) minta
// User-Agent yang jelas & maksimal ~1 request/detik — dipanggil dari SATU tombol "Cari Lokasi" per
// submit (bukan live-search per-keystroke), jadi wajar di bawah batas itu. Dropdown Lokasi Referensi
// (`lib/wilayah.ts`) tetap ada sebagai alternatif tanpa dependensi jaringan.

const INDONESIA_BOUNDS = { south: -11.5, north: 7, west: 93.5, east: 141.5 };

export type GeocodeResult = { label: string; lat: number; lng: number };

export async function geocodeAlamat(query: string): Promise<{ result: GeocodeResult | null; error: string | null }> {
  const q = query.trim();
  if (!q) return { result: null, error: "Isi alamat atau nama lokasi dulu." };

  let res: Response;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "id");

    res = await fetch(url, {
      headers: { "User-Agent": "AI-Komcad-CommandCenter/1.0 (internal, non-produksi)" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { result: null, error: "Gagal menghubungi layanan pencarian lokasi. Coba lagi atau pilih dari Lokasi Referensi." };
  }

  if (!res.ok) return { result: null, error: "Layanan pencarian lokasi sedang tidak tersedia. Coba lagi nanti." };

  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (data.length === 0) {
    return { result: null, error: "Lokasi tidak ditemukan. Coba nama kota/kabupaten yang lebih spesifik." };
  }

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (lat < INDONESIA_BOUNDS.south || lat > INDONESIA_BOUNDS.north || lng < INDONESIA_BOUNDS.west || lng > INDONESIA_BOUNDS.east) {
    return { result: null, error: "Lokasi di luar wilayah Indonesia — tidak didukung untuk kalkulasi jarak/ETA." };
  }

  return { result: { label: data[0].display_name, lat, lng }, error: null };
}
