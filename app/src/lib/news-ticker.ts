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

// Substring match case-insensitive terhadap judul — cukup buat berita bahasa Indonesia tanpa
// perlu stemming/NLP, ini running text ringan bukan mesin pencari.
const KEYWORDS = [
  "komcad",
  "komponen cadangan",
  "kemhan",
  "kementerian pertahanan",
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
  "prajurit",
  "banjir",
  "longsor",
  "kekeringan",
  "kebakaran hutan",
  "karhutla",
  "bencana",
  "gempa",
  "tsunami",
  "erupsi",
  "evakuasi",
  "sar ",
  "begal",
  "perampokan",
  "penjarahan",
  "kriminalitas",
];

export type NewsHeadline = {
  title: string;
  link: string;
  sumber: string;
  pubDate: string | null;
};

async function fetchAllFeeds(): Promise<NewsHeadline[]> {
  const parser = new Parser({ timeout: 8000 });

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).map((item) => ({
        title: (item.title ?? "").trim(),
        link: item.link ?? "",
        sumber: feed.sumber,
        pubDate: item.pubDate ?? null,
      }));
    })
  );

  const semua = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<NewsHeadline[]>).value)
    .filter((item) => item.title && item.link);

  const relevan = semua.filter((item) => {
    const judul = item.title.toLowerCase();
    return KEYWORDS.some((k) => judul.includes(k));
  });

  // Kalau kebetulan tidak ada berita yang cocok keyword saat ini (jarang, tapi mungkin), tetap
  // tampilkan berita nasional terkini apa adanya — running text kosong terlihat seperti rusak,
  // dan ini tetap berita sungguhan (bukan dummy), cuma belum tentu terkait Komcad.
  const dipakai = relevan.length > 0 ? relevan : semua;

  const unik = Array.from(new Map(dipakai.map((item) => [item.link, item])).values());

  unik.sort((a, b) => {
    const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tb - ta;
  });

  return unik.slice(0, 25);
}

export const getNewsTicker = unstable_cache(fetchAllFeeds, ["news-ticker"], {
  revalidate: 900, // 15 menit
});
