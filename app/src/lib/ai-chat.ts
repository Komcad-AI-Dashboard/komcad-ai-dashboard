// AI Chat Assistant (FR-29 s.d. FR-32): jawaban dirangkai OpenAI TAPI hanya dari snapshot data
// nyata (ChatContext) — model tidak pernah diberi kebebasan mengarang angka. Kalau OpenAI gagal,
// fallback keyword-matching tetap menjawab dari snapshot yang sama (bukan pesan error kosong).
import OpenAI from "openai";
import type { ChatContext } from "@/lib/ai-chat-data";

export type ChatTable = { headers: string[]; rows: string[][] } | null;
export type ChatAnswer = { jawaban: string; tabel: ChatTable; cocok: boolean; sumber: "openai" | "fallback" };

const FALLBACK_MESSAGE =
  "Saya belum menemukan data spesifik untuk pertanyaan itu. Coba tanyakan hal seperti: jumlah anggota, sebaran pendidikan, Readiness nasional, Misi aktif, atau sertifikasi kedaluwarsa — atau buka menu Analitik Kesiapsiagaan untuk eksplorasi lebih lanjut.";

/** Diekspor juga untuk dipakai page.tsx membangun contoh percakapan awal (FR-29) dari data nyata
 * tanpa perlu memanggil OpenAI di setiap kali halaman dibuka. */
export function fallbackAnswer(question: string, ctx: ChatContext): ChatAnswer {
  const q = question.toLowerCase();

  if (q.includes("belum") && q.includes("pelatihan")) {
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: `Berdasarkan data platform, ${ctx.belumPelatihan3Bulan} dari ${ctx.totalAnggotaAktif} anggota aktif (${Math.round((ctx.belumPelatihan3Bulan / Math.max(1, ctx.totalAnggotaAktif)) * 100)}%) belum mengikuti pelatihan dalam 3 bulan terakhir.`,
      tabel: null,
    };
  }
  if (q.includes("sebaran") && q.includes("pendidikan")) {
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: "Sebaran anggota berdasarkan tingkat pendidikan (data nasional):",
      tabel: { headers: ["Pendidikan", "Jumlah"], rows: ctx.pendidikan.map((p) => [p.pendidikan, String(p.jumlah)]) },
    };
  }
  if (q.includes("jumlah anggota") || q.includes("total anggota") || q.includes("berapa anggota")) {
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: `Total anggota Komcad terdaftar saat ini: ${ctx.totalAnggota} orang.`,
      tabel: { headers: ["Status Siaga", "Jumlah"], rows: ctx.statusSiaga.map((s) => [s.status, String(s.jumlah)]) },
    };
  }
  if (q.includes("readiness") || q.includes("kesiapan")) {
    const tertinggi = ctx.readinessPerWilayah[0];
    const terendah = ctx.readinessPerWilayah[ctx.readinessPerWilayah.length - 1];
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: `Rata-rata Readiness Score nasional saat ini: ${ctx.readinessNasional}.${tertinggi ? ` Wilayah tertinggi: ${tertinggi.provinsi} (${tertinggi.score}).` : ""}${terendah && terendah !== tertinggi ? ` Wilayah yang perlu perhatian: ${terendah.provinsi} (${terendah.score}).` : ""}`,
      tabel: null,
    };
  }
  if (q.includes("misi") && (q.includes("aktif") || q.includes("berapa") || q.includes("sekarang"))) {
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: `Saat ini ada ${ctx.misiAktif.length} Misi aktif.`,
      tabel:
        ctx.misiAktif.length > 0
          ? { headers: ["ID", "Lokasi", "Status"], rows: ctx.misiAktif.map((m) => [m.kodeMisi, m.lokasi, m.status]) }
          : null,
    };
  }
  if (q.includes("sertifikasi") && (q.includes("kedaluwarsa") || q.includes("habis"))) {
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: `Ada ${ctx.sertifikasiKedaluwarsa} sertifikasi yang sudah kedaluwarsa saat ini. Lihat menu Kompetensi & Sertifikasi untuk detail per anggota.`,
      tabel: null,
    };
  }
  if (q.includes("gender") || q.includes("laki") || q.includes("perempuan") || q.includes("jenis kelamin")) {
    const total = ctx.gender.reduce((sum, g) => sum + g.jumlah, 0);
    return {
      sumber: "fallback",
      cocok: true,
      jawaban: "Komposisi gender anggota Komcad:",
      tabel: {
        headers: ["Jenis Kelamin", "Jumlah", "%"],
        rows: ctx.gender.map((g) => [g.jenisKelamin, String(g.jumlah), `${Math.round((g.jumlah / Math.max(1, total)) * 100)}%`]),
      },
    };
  }

  return { sumber: "fallback", cocok: false, jawaban: FALLBACK_MESSAGE, tabel: null };
}

export async function askAiChat(question: string, ctx: ChatContext): Promise<ChatAnswer> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnswer(question, ctx);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chat_answer",
          strict: true,
          schema: {
            type: "object",
            properties: {
              cocok: {
                type: "boolean",
                description:
                  "true kalau pertanyaan bisa dijawab dari data yang diberikan (anggota, Misi, Readiness, sertifikasi, pelatihan); false kalau di luar topik itu.",
              },
              jawaban: {
                type: "string",
                description: "Jawaban natural bahasa Indonesia, HANYA memakai angka dari data yang diberikan. Kosongkan (string kosong) kalau cocok=false.",
              },
              tabel: {
                type: ["object", "null"],
                properties: {
                  headers: { type: "array", items: { type: "string" } },
                  rows: { type: "array", items: { type: "array", items: { type: "string" } } },
                },
                required: ["headers", "rows"],
                additionalProperties: false,
                description: "Isi tabel HANYA kalau jawaban lebih jelas sebagai tabel (mis. sebaran/breakdown). Null kalau cukup teks.",
              },
            },
            required: ["cocok", "jawaban", "tabel"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Anda AI Komcad Assistant — asisten data untuk Operator/Analis/Admin Command Center Komponen Cadangan (Komcad). " +
            "JAWAB HANYA berdasarkan data JSON yang diberikan di pesan user — JANGAN PERNAH mengarang angka atau menyebut entitas (anggota/Misi) yang tidak ada di data itu. " +
            "Kalau pertanyaan di luar cakupan data yang diberikan (mis. soal umum tidak terkait Komcad), set cocok=false. " +
            "Gunakan tabel kalau jawabannya berupa breakdown/sebaran beberapa kategori, kalau tidak biarkan tabel null.",
        },
        {
          role: "user",
          content: JSON.stringify({ pertanyaan: question, data: ctx }),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Respons AI kosong");
    const parsed = JSON.parse(raw) as { cocok: boolean; jawaban: string; tabel: ChatTable };

    if (!parsed.cocok) {
      return { sumber: "openai", cocok: false, jawaban: FALLBACK_MESSAGE, tabel: null };
    }
    if (!parsed.jawaban) throw new Error("Jawaban AI kosong padahal cocok=true");

    return { sumber: "openai", cocok: true, jawaban: parsed.jawaban, tabel: parsed.tabel };
  } catch (err) {
    console.error("[ai-chat] OpenAI gagal, pakai fallback keyword-matching:", err);
    return fallbackAnswer(question, ctx);
  }
}
