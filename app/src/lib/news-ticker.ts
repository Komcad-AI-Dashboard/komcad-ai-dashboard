// Running text "berita terkini relevan Komcad" di AppShell. Sumber: RSS publik media nasional
// (gratis, tanpa API key) — bukan data dummy. Di-cache 15 menit (unstable_cache) karena ini
// konten eksternal yang wajar basi beberapa menit, bukan data yang perlu fresh tiap request.

import Parser from "rss-parser";
import { unstable_cache } from "next/cache";

const FEEDS = [
  { url: "https://www.antaranews.com/rss/terkini.xml", sumber: "Antara" },
  { url: "https://www.antaranews.com/rss/top-news.xml", sumber: "Antara" },
  { url: "https://www.antaranews.com/rss/hukum.xml", sumber: "Antara" },
  { url: "https://www.antaranews.com/rss/metro.xml", sumber: "Antara" },
  { url: "https://www.cnnindonesia.com/nasional/rss", sumber: "CNN Indonesia" },
];

export type KategoriBerita = "militer" | "bencana" | "keamanan";

/** Kata kunci KUAT: institusi pertahanan/keamanan Indonesia. Judul yang mengandung ini pasti
 * relevan berapa pun konteks geografisnya (mis. "TNI AL latihan bersama Malaysia" tetap relevan),
 * jadi kelompok ini SENGAJA melewati saringan luar negeri di bawah. */
const KATA_MILITER = [
  "komcad",
  "komponen cadangan",
  "kemhan",
  "kementerian pertahanan",
  "menteri pertahanan",
  "tni",
  "angkatan darat",
  "angkatan laut",
  "angkatan udara",
  "marinir",
  "kopassus",
  "kostrad",
  "koarmada",
  "kodam",
  "korem",
  "koramil",
  "kodim",
  "panglima",
  "prajurit",
  "alutsista",
  "bela negara",
  "wajib militer",
  "latihan gabungan",
];

/** Kata kunci KONTEKSTUAL: kejadian yang relevan buat mobilisasi Komcad, TAPI cuma kalau
 * kejadiannya di Indonesia. "Gempa Kolombia" tidak ada urusannya dengan kesiapsiagaan Komcad —
 * inilah kenapa kelompok ini wajib lolos saringan luar negeri. */
const KATA_BENCANA = [
  "banjir",
  "longsor",
  "kekeringan",
  "kebakaran hutan",
  "karhutla",
  "kabut asap",
  "bencana",
  "gempa",
  "tsunami",
  "erupsi",
  "gunung meletus",
  "letusan",
  "puting beliung",
  "angin kencang",
  "evakuasi",
  "pengungsi",
  "tanggap darurat",
  "bnpb",
  "basarnas",
  "sar",
];

const KATA_KEAMANAN = [
  "begal",
  "perampokan",
  "penjarahan",
  "kriminalitas",
  "kerusuhan",
  "konflik sosial",
  "terorisme",
  "teroris",
  "densus",
  "kamtibmas",
];

/** Nama negara/wilayah luar negeri yang lazim muncul di berita bencana/kriminal internasional.
 * Dipakai untuk MEMBUANG berita yang cocok kata kunci kontekstual tapi kejadiannya di luar
 * Indonesia (keluhan user: "berita gempa di Kolombia, apa hubungannya sama Komcad"). */
const LUAR_NEGERI = [
  "kolombia", "amerika", "washington", "new york", "california",
  "israel", "palestina", "gaza", "tepi barat", "lebanon", "iran", "irak", "suriah", "yaman",
  "ukraina", "rusia", "moskow", "kyiv", "kiev",
  "china", "tiongkok", "beijing", "shanghai", "hong kong", "taiwan",
  "jepang", "tokyo", "korea", "seoul", "pyongyang",
  "india", "pakistan", "bangladesh", "nepal", "sri lanka", "afghanistan", "myanmar",
  "filipina", "manila", "thailand", "bangkok", "vietnam", "kamboja", "laos",
  "malaysia", "kuala lumpur", "singapura", "brunei", "timor leste", "papua nugini",
  "australia", "sydney", "melbourne", "selandia baru",
  "turki", "arab saudi", "mekah", "madinah", "qatar", "uni emirat", "dubai", "kuwait", "yordania",
  "mesir", "sudan", "nigeria", "kenya", "etiopia", "somalia", "kongo", "afrika selatan", "maroko",
  "inggris", "london", "prancis", "perancis", "paris", "jerman", "berlin", "italia", "roma",
  "spanyol", "madrid", "belanda", "portugal", "yunani", "swiss", "austria", "swedia", "norwegia",
  "denmark", "finlandia", "polandia", "ceko", "hungaria", "rumania", "bulgaria", "serbia",
  "kroasia", "bosnia", "meksiko", "brasil", "brazil", "argentina", "chile", "peru", "ekuador",
  "venezuela", "bolivia", "haiti", "kuba", "jamaika", "kanada", "pbb", "nato",
];

/** Cocokkan per KATA UTUH, bukan substring — "tni" tidak boleh ikut kena di tengah kata lain,
 * dan "sar" harus benar-benar kata "SAR" (versi lama diakali pakai spasi di belakang: "sar "). */
function buatRegex(daftar: string[]): RegExp {
  const escaped = daftar.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
}

const RE_MILITER = buatRegex(KATA_MILITER);
const RE_BENCANA = buatRegex(KATA_BENCANA);
const RE_KEAMANAN = buatRegex(KATA_KEAMANAN);
const RE_LUAR_NEGERI = buatRegex(LUAR_NEGERI);

export type NewsHeadline = {
  title: string;
  link: string;
  sumber: string;
  kategori: KategoriBerita;
  /** Sudah diformat di server (zona Asia/Jakarta eksplisit) supaya render-nya deterministik —
   * kalau diformat di client, hasil SSR dan hasil hydration bisa beda zona waktu. */
  waktu: string | null;
};

type RawItem = {
  title: string;
  link: string;
  sumber: string;
  pubDate: string | undefined;
};

function formatWaktu(pubDate: string | undefined): string | null {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  const jam = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${jam} WIB`;
}

/** null = tidak relevan (harus dibuang). */
function klasifikasi(judul: string): KategoriBerita | null {
  if (RE_MILITER.test(judul)) return "militer";
  // Kata kunci kontekstual: relevan HANYA kalau kejadiannya bukan di luar negeri.
  if (RE_LUAR_NEGERI.test(judul)) return null;
  if (RE_BENCANA.test(judul)) return "bencana";
  if (RE_KEAMANAN.test(judul)) return "keamanan";
  return null;
}

async function fetchAllFeeds(): Promise<NewsHeadline[]> {
  const parser = new Parser({ timeout: 8000 });

  const results = await Promise.allSettled(
    FEEDS.map(async (feed): Promise<RawItem[]> => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).map((item) => ({
        title: (item.title ?? "").trim(),
        link: item.link ?? "",
        sumber: feed.sumber,
        pubDate: item.pubDate,
      }));
    })
  );

  const semua = results
    .filter((r): r is PromiseFulfilledResult<RawItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((item) => item.title && item.link);

  // Urut terbaru dulu SEBELUM dedupe & potong, supaya yang tampil memang headline paling baru.
  semua.sort((a, b) => {
    const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tb - ta;
  });

  const relevan: NewsHeadline[] = [];
  const sudahAda = new Set<string>();
  for (const item of semua) {
    if (sudahAda.has(item.link)) continue;
    const kategori = klasifikasi(item.title);
    if (!kategori) continue;
    sudahAda.add(item.link);
    relevan.push({
      title: item.title,
      link: item.link,
      sumber: item.sumber,
      kategori,
      waktu: formatWaktu(item.pubDate),
    });
  }

  return relevan.slice(0, 20);
}

export const getNewsTicker = unstable_cache(fetchAllFeeds, ["news-ticker"], {
  revalidate: 900, // 15 menit
});
