import { getChatContext } from "@/lib/ai-chat-data";
import { fallbackAnswer } from "@/lib/ai-chat";
import { ChatView } from "@/components/ai-chat/chat-view";

export default async function AiChatPage() {
  const ctx = await getChatContext();

  // Contoh percakapan awal (FR-29 acceptance: pre-filled) — dibangun dari data nyata via fungsi
  // formatter yang sama dipakai fallback, BUKAN panggilan OpenAI (hindari biaya/latency tiap kali
  // halaman dibuka hanya untuk menampilkan contoh).
  const contohPelatihan = fallbackAnswer("belum pelatihan 3 bulan terakhir", ctx);
  const contohPendidikan = fallbackAnswer("sebaran pendidikan", ctx);

  const introMessages = [
    {
      text: "Halo, saya AI Komcad Assistant. Anda bisa bertanya seputar data anggota, Misi, Readiness, atau pelatihan dalam bahasa natural. Contoh:",
      tabel: null,
    },
    { text: contohPelatihan.jawaban, tabel: contohPelatihan.tabel },
    { text: contohPendidikan.jawaban, tabel: contohPendidikan.tabel },
  ];

  return <ChatView introMessages={introMessages} />;
}
