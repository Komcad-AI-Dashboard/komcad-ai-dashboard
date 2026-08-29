// AI Mobilization: skoring & penjelasan kandidat personel via OpenAI, grounded ke data Big Data
// Anggota sungguhan (FR-09, FR-10) — bukan model mengarang nama/personel. anggotaId dibatasi enum
// ke pool kandidat yang benar-benar dikirim, dan hasil divalidasi ulang sebelum dipakai.
import OpenAI from "openai";
import type { KandidatPool } from "@/lib/misi-data";

export type AiKandidat = { anggotaId: string; skor: number; alasan: string[] };
export type AiRecommendation = {
  ringkasanAI: string;
  kandidat: AiKandidat[];
  sumber: "openai" | "fallback";
};

function clampSkor(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function buildAlasanFallback(k: KandidatPool, kompetensiDibutuhkan: string[] = []): string[] {
  const alasan = [
    `Jarak ${k.jarakKm} km dari lokasi Misi (ETA ~${k.etaMenit} menit)`,
    `Readiness Score ${k.readinessScore}`,
    k.kompetensi.length > 0
      ? `Kompetensi relevan: ${k.kompetensi.join(", ")}`
      : "Belum ada sertifikasi tercatat",
  ];
  if (k.hariSejakPenugasanTerakhir !== null) {
    alasan.push(`Jeda ${k.hariSejakPenugasanTerakhir} hari sejak penugasan terakhir`);
  }
  const cocok = k.kompetensi.filter((kp) => kompetensiDibutuhkan.includes(kp));
  if (cocok.length > 0) {
    alasan.push(`Kompetensi sesuai kebutuhan Misi ini: ${cocok.join(", ")}`);
  }
  return alasan;
}

/** Kompetensi kandidat vs daftar kebutuhan (Fase 18, "Simulasi Bencana" — lib/constants.ts
 * JENIS_KEJADIAN_KOMPETENSI). Kosong = perilaku lama (biner: punya sertifikasi apa saja vs
 * tidak), supaya Jenis Kejadian "Lainnya" (tanpa persyaratan spesifik) tidak berubah perilaku. */
function kompetensiScoreFor(k: KandidatPool, kompetensiDibutuhkan: string[]): number {
  if (kompetensiDibutuhkan.length === 0) return k.kompetensi.length > 0 ? 80 : 40;
  const matchCount = k.kompetensi.filter((kp) => kompetensiDibutuhkan.includes(kp)).length;
  return Math.min(100, 40 + matchCount * 20);
}

export type BobotModel = { readiness: number; jarak: number; kompetensi: number };
const BOBOT_DEFAULT: BobotModel = { readiness: 40, jarak: 35, kompetensi: 25 };

/** Recency (jeda penugasan terakhir) sengaja tidak dibuat parameter Admin terpisah di Pengaturan —
 * selalu diberi porsi kecil tetap di luar 3 bobot utama (yang totalnya 100%) supaya faktor
 * "jangan terus-terusan tugaskan orang yang sama" tetap ada tanpa menambah kompleksitas UI. */
const BOBOT_RECENCY_TETAP = 10;

function skorFallback(k: KandidatPool, bobot: BobotModel, kompetensiDibutuhkan: string[]): number {
  const jarakScore = Math.max(0, 100 - k.jarakKm * 2);
  const kompetensiScore = kompetensiScoreFor(k, kompetensiDibutuhkan);
  const recencyScore =
    k.hariSejakPenugasanTerakhir === null ? 100 : Math.min(100, k.hariSejakPenugasanTerakhir / 2);
  const sisaUtama = 100 - BOBOT_RECENCY_TETAP;
  return clampSkor(
    k.readinessScore * ((bobot.readiness / 100) * (sisaUtama / 100)) +
      jarakScore * ((bobot.jarak / 100) * (sisaUtama / 100)) +
      kompetensiScore * ((bobot.kompetensi / 100) * (sisaUtama / 100)) +
      recencyScore * (BOBOT_RECENCY_TETAP / 100)
  );
}

function fallbackRecommendation(params: {
  pemberiPerintah: string;
  deskripsiMisi: string;
  kandidatPool: KandidatPool[];
  bobot: BobotModel;
  kompetensiDibutuhkan: string[];
}): AiRecommendation {
  const ranked = [...params.kandidatPool]
    .map((k) => ({ k, skor: skorFallback(k, params.bobot, params.kompetensiDibutuhkan) }))
    .sort((a, b) => b.skor - a.skor)
    .slice(0, Math.min(8, params.kandidatPool.length));

  return {
    sumber: "fallback",
    ringkasanAI: `Berdasarkan perintah dari ${params.pemberiPerintah} dan deskripsi "${params.deskripsiMisi}", sistem mengidentifikasi ${ranked.length} kandidat terbaik berdasarkan jarak, Readiness Score, dan kompetensi (mode fallback — layanan AI sedang tidak tersedia).`,
    kandidat: ranked.map(({ k, skor }) => ({
      anggotaId: k.anggotaId,
      skor,
      alasan: buildAlasanFallback(k, params.kompetensiDibutuhkan),
    })),
  };
}

export async function generateAiMobilizationRecommendation(params: {
  pemberiPerintah: string;
  jenisKejadian: string;
  urgensi: string;
  lokasi: string;
  deskripsiMisi: string;
  kandidatPool: KandidatPool[];
  bobot?: BobotModel;
  /** Kompetensi yang relevan untuk jenisKejadian ini (Fase 18, lib/constants.ts
   * JENIS_KEJADIAN_KOMPETENSI) — kosong/tidak diisi = perilaku lama (kompetensi apa saja dihargai
   * sama, tidak ada persyaratan spesifik). Dihitung oleh pemanggil (misi-actions.ts), bukan di sini,
   * supaya modul ini tetap generic terhadap sumber taksonominya. */
  kompetensiDibutuhkan?: string[];
}): Promise<AiRecommendation> {
  const { kandidatPool } = params;
  const bobot = params.bobot ?? BOBOT_DEFAULT;
  const kompetensiDibutuhkan = params.kompetensiDibutuhkan ?? [];
  if (kandidatPool.length === 0) {
    return {
      sumber: "fallback",
      ringkasanAI: `Tidak ditemukan anggota Aktif/Siaga dengan data lokasi di sekitar ${params.lokasi} untuk Misi ini.`,
      kandidat: [],
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return fallbackRecommendation({ ...params, bobot, kompetensiDibutuhkan });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const candidateIds = kandidatPool.map((k) => k.anggotaId);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mobilization_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ringkasanAI: {
                type: "string",
                description:
                  "Ringkasan 2-3 kalimat, menyebut nama Pemberi Perintah dan mengutip Deskripsi Misi persis seperti diberikan.",
              },
              kandidat: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    anggotaId: { type: "string", enum: candidateIds },
                    skor: { type: "integer" },
                    alasan: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["anggotaId", "skor", "alasan"],
                  additionalProperties: false,
                },
              },
            },
            required: ["ringkasanAI", "kandidat"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Anda adalah AI Mobilization Komcad — sistem pendukung keputusan Operator Komando untuk memobilisasi personel cadangan (Komcad) saat bencana/kedaruratan. " +
            "Anda HANYA boleh merekomendasikan personel dari daftar kandidat yang diberikan (identitas via anggotaId) — jangan pernah mengarang atau menyebut personel di luar daftar itu. " +
            "Untuk tiap kandidat, beri skor kecocokan 0-100 dan alasan berupa 3-5 poin singkat yang mengutip angka nyata dari data (jarak km, Readiness Score, kompetensi/sertifikasi, jeda penugasan terakhir) — jangan mengarang angka baru. " +
            `Bobot prioritas yang diatur Admin (total 100%, gunakan sebagai panduan urutan skor, bukan aturan matematis ketat): Readiness Score ${bobot.readiness}%, jarak/ETA ${bobot.jarak}%, kompetensi/sertifikasi ${bobot.kompetensi}%.` +
            (kompetensiDibutuhkan.length > 0
              ? ` Untuk jenis kejadian "${params.jenisKejadian}" ini, kompetensi yang paling relevan: ${kompetensiDibutuhkan.join(", ")} — prioritaskan kandidat dengan kompetensi ini kalau readiness/jarak antar-kandidat sepadan, dan sebutkan kecocokannya di alasan.`
              : ""),
        },
        {
          role: "user",
          content: JSON.stringify({
            misi: {
              pemberiPerintah: params.pemberiPerintah,
              jenisKejadian: params.jenisKejadian,
              urgensi: params.urgensi,
              lokasi: params.lokasi,
              deskripsiMisi: params.deskripsiMisi,
            },
            kandidat: kandidatPool,
          }),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Respons AI kosong");
    const parsed = JSON.parse(raw) as { ringkasanAI: string; kandidat: AiKandidat[] };

    const validIds = new Set(candidateIds);
    const poolById = new Map(kandidatPool.map((k) => [k.anggotaId, k]));
    const kandidat = parsed.kandidat
      .filter((k) => validIds.has(k.anggotaId))
      .map((k) => ({
        anggotaId: k.anggotaId,
        skor: clampSkor(k.skor),
        alasan:
          k.alasan?.length >= 1
            ? k.alasan
            : buildAlasanFallback(poolById.get(k.anggotaId)!, kompetensiDibutuhkan),
      }))
      .sort((a, b) => b.skor - a.skor);

    if (kandidat.length === 0) throw new Error("AI tidak mengembalikan kandidat valid");

    return { sumber: "openai", ringkasanAI: parsed.ringkasanAI, kandidat };
  } catch (err) {
    console.error("[ai-mobilization] OpenAI gagal, pakai fallback deterministik:", err);
    return fallbackRecommendation({ ...params, bobot, kompetensiDibutuhkan });
  }
}
