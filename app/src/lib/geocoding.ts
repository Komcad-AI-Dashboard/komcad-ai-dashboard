// Pencarian lokasi untuk field Lokasi Misi di Buat Misi (menggantikan sebagian batasan dropdown
// 8 kota referensi dari Fase 6). Dua sumber, keduanya OpenStreetMap — satu ekosistem dengan tile
// peta di Overview (FRD §10.5), tanpa API key.
//
// SARAN KETIK (utama) — Photon (Komoot). Dibuat memang untuk type-ahead, jadi boleh dipanggil
// per ketikan (setelah debounce). Photon mengembalikan koordinat sekaligus, jadi memilih saran
// TIDAK perlu request kedua.
//
// PENCARIAN SEKALI JALAN (cadangan) — Nominatim. Kebijakan penggunaannya
// (https://operations.osmfoundation.org/policies/nominatim/) minta User-Agent yang jelas,
// maksimal ~1 request/detik, dan MELARANG autocomplete di instance publik. Karena itu ia tidak
// dipakai untuk saran ketik, cuma untuk tombol "Cari Lokasi" dan sebagai jatuh-tempo kalau
// Photon mati — dua-duanya satu request per query, bukan per ketikan.
//
// Dropdown Lokasi Referensi (`lib/wilayah.ts`) tetap ada sebagai jalur tanpa jaringan sama sekali.

const INDONESIA_BOUNDS = { south: -11.5, north: 7, west: 93.5, east: 141.5 };

const USER_AGENT = "SIAGA-CommandCenter/1.0 (internal, non-produksi)";

export type GeocodeResult = { key: string; label: string; lat: number; lng: number };

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type?: string;
    osm_id?: number;
    name?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
  };
};

/** Nama tempat sering mengulang wilayah induknya — kueri "Manggarai Barat" mengembalikan `name`
 * DAN `county` yang sama persis, yang kalau digabung apa adanya jadi "Manggarai Barat, Manggarai
 * Barat, Nusa Tenggara Timur". Jadi dide-duplikasi dulu, bukan sekadar join. */
function buildLabel(p: PhotonFeature["properties"]) {
  const parts = [p.name, p.district, p.city, p.county, p.state].filter(Boolean) as string[];
  return [...new Set(parts)].join(", ");
}

function inIndonesia(lat: number, lng: number) {
  return (
    lat >= INDONESIA_BOUNDS.south &&
    lat <= INDONESIA_BOUNDS.north &&
    lng >= INDONESIA_BOUNDS.west &&
    lng <= INDONESIA_BOUNDS.east
  );
}

/** Saran lokasi untuk type-ahead. Kalau Photon gagal, otomatis jatuh ke Nominatim untuk kueri
 * itu saja — pemanggilnya tidak perlu tahu sumbernya yang mana. */
export async function suggestAlamat(
  query: string
): Promise<{ results: GeocodeResult[]; error: string | null }> {
  const q = query.trim();
  if (!q) return { results: [], error: null };

  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "6");
    // Photon memakai urutan minLon,minLat,maxLon,maxLat — beda dari urutan field kita.
    // Membatasi di sisi server lebih baik daripada menyaring setelah operator terlanjur memilih.
    url.searchParams.set(
      "bbox",
      `${INDONESIA_BOUNDS.west},${INDONESIA_BOUNDS.south},${INDONESIA_BOUNDS.east},${INDONESIA_BOUNDS.north}`
    );
    // TANPA parameter `lang`. Dengan lang=en Photon menjawab "South Kalimantan" & "Mount Bromo";
    // tanpa itu ia menjawab "Kalimantan Selatan" & "Gunung Bromo" — yang benar untuk UI ini.

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`photon ${res.status}`);

    const data = (await res.json()) as { features?: PhotonFeature[] };
    const results = (data.features ?? [])
      .map((f) => {
        // GeoJSON: [lng, lat] — kebalikan dari urutan GeocodeResult. Gampang tertukar, dan
        // hasilnya tetap terlihat masuk akal di daftar, jadi tidak akan ketahuan dari UI saja.
        const [lng, lat] = f.geometry.coordinates;
        return {
          key: `${f.properties.osm_type ?? "x"}${f.properties.osm_id ?? lat + "," + lng}`,
          label: buildLabel(f.properties),
          lat,
          lng,
        };
      })
      .filter((r) => r.label && inIndonesia(r.lat, r.lng));

    // Satu nama bisa muncul beberapa kali dengan osm_id beda — ruas jalan yang sama dipecah jadi
    // beberapa way, misalnya. Kunci React-nya memang unik, tapi di layar operator melihat dua
    // baris yang tulisannya identik dan tidak ada cara membedakannya. Ambil yang pertama saja.
    const unik = [...new Map(results.map((r) => [r.label, r])).values()];

    return { results: unik, error: null };
  } catch {
    // Photon mati/timeout — pakai Nominatim sekali untuk kueri ini. Masih patuh kebijakannya
    // karena cuma jalan saat Photon gagal, satu request per kueri (sudah ter-debounce), bukan
    // per ketikan.
    return geocodeAlamat(q);
  }
}

/** Pencarian sekali jalan lewat Nominatim — dipakai tombol "Cari Lokasi" dan jalur cadangan
 * suggestAlamat(). Mengembalikan beberapa kandidat, bukan satu.
 *
 * Dulu limit=1 dan hasil teratas dipakai diam-diam. Itu bug nyata: "Teluk Betung" punya empat
 * kandidat di Indonesia dan yang paling dikenal (Bandar Lampung) ada di urutan KEEMPAT, ~1.150 km
 * dari yang terpilih. Koordinatnya bukan hiasan — getKandidatPool() menyaring kandidat personel
 * berdasar jarak dari titik itu, dan kalau radius tidak menemukan siapa pun, radiusnya justru
 * diabaikan alih-alih error. Jadi salah lokasi merambat diam-diam sampai ke rekomendasi personel.
 * Sekarang kandidatnya disodorkan ke operator untuk dipilih. */
export async function geocodeAlamat(
  query: string
): Promise<{ results: GeocodeResult[]; error: string | null }> {
  const q = query.trim();
  if (!q) return { results: [], error: "Isi alamat atau nama lokasi dulu." };

  let res: Response;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "id");

    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { results: [], error: "Gagal menghubungi layanan pencarian lokasi. Coba lagi atau pilih dari Lokasi Referensi." };
  }

  if (!res.ok) return { results: [], error: "Layanan pencarian lokasi sedang tidak tersedia. Coba lagi nanti." };

  const data = (await res.json()) as { lat: string; lon: string; display_name: string; osm_id?: number }[];

  const results = data
    .map((d, i) => ({
      key: `nominatim-${d.osm_id ?? i}`,
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }))
    // Penjaga kedua: countrycodes=id sudah menyaring di sisi server, ini menahan koordinat aneh
    // yang tetap lolos — di luar bounds berarti kalkulasi jarak/ETA tidak bisa dipercaya.
    .filter((r) => inIndonesia(r.lat, r.lng));

  if (results.length === 0) {
    return { results: [], error: "Lokasi tidak ditemukan. Coba nama kota/kabupaten yang lebih spesifik." };
  }

  return { results, error: null };
}
