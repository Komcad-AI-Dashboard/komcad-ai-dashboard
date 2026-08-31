// Pengelompokan lokasi bebas-teks ke wilayah besar, dipakai tab panel Misi Terbaru.
//
// Berkas TERPISAH dari overview-data.ts dan sengaja TANPA impor Prisma: komponen client
// (feed-panel-content.tsx) meng-import WILAYAH_TABS sebagai NILAI, dan value-import dari berkas
// yang memuat query Prisma akan menyeret PrismaClient ke bundle browser. Gejalanya bukan error
// build — tsc dan next build sama-sama lolos — melainkan runtime error di konsol browser
// ("PrismaClient is unable to run in this browser environment"). Aturannya ada di app/README.md;
// pemisahan ini yang menegakkannya.

// Urutan penting: dicek dari atas ke bawah, yang pertama cocok menang. "Nusa Tenggara" ditaruh
// sebelum Jawa karena beberapa kabupatennya (mis. "Manggarai, Nusa Tenggara Timur") tidak memuat
// kata provinsi yang lain, tapi kabupaten seperti "Sumbawa" jangan sampai tertangkap "jawa".
const WILAYAH_KEYWORDS: Record<string, string[]> = {
  "Nusa Tenggara": [
    "nusa tenggara", "ntt", "ntb", "flores", "kupang", "manggarai", "ngada", "nagekeo",
    "ende", "sikka", "sumba", "lombok", "mataram", "bima", "sumbawa", "alor", "timor",
  ],
  Jawa: ["jawa", "jakarta", "bandung", "semarang", "surabaya", "yogyakarta", "banten", "malang", "probolinggo"],
  Sumatera: ["sumatera", "medan", "palembang", "lampung", "aceh", "riau", "jambi", "nias", "padang", "bengkulu"],
  Kalimantan: ["kalimantan", "balikpapan", "pontianak", "banjarmasin", "samarinda", "ketapang", "palangka", "banjarbaru", "berau"],
  Sulawesi: ["sulawesi", "makassar", "manado", "kendari", "palu", "gorontalo", "minahasa"],
  // Ditambahkan menyusul Fase 18 (provinsi Indonesia Timur). Tanpa ini "Kota Ambon, Maluku",
  // "Ternate, Maluku Utara", dan "Jayapura, Papua" semuanya jatuh ke "Lainnya" — dan panel Misi
  // Terbaru tidak punya tab "Lainnya", jadi Misi di ketiga provinsi itu tidak bisa dijangkau
  // sama sekali dari sana. "Maluku" sengaja menampung Maluku Utara juga: pengelompokan di sini
  // setingkat wilayah, bukan provinsi.
  Maluku: ["maluku", "ambon", "ternate", "tidore", "halmahera", "seram", "tual"],
  Papua: ["papua", "jayapura", "sorong", "merauke", "manokwari", "timika", "nabire", "biak"],
};

/** Tab wilayah di panel Misi Terbaru diturunkan dari kunci di atas, bukan ditulis ulang manual.
 * Daftar tab sempat ketinggalan waktu provinsi baru ditambahkan; sekarang menambah wilayah di
 * WILAYAH_KEYWORDS otomatis memunculkan tabnya. */
export const WILAYAH_TABS = ["SEMUA", ...Object.keys(WILAYAH_KEYWORDS).map((w) => w.toUpperCase())];

export function wilayahFromLokasi(lokasi: string): string {
  const lower = lokasi.toLowerCase();
  for (const [wilayah, keywords] of Object.entries(WILAYAH_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return wilayah;
  }
  return "Lainnya";
}

