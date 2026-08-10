"use server";

import { auth } from "@/lib/auth";
import { getChatContext } from "@/lib/ai-chat-data";
import { askAiChat, type ChatAnswer } from "@/lib/ai-chat";

export async function askChatAction(question: string): Promise<ChatAnswer | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Sesi tidak valid, silakan masuk ulang." };

  const q = question.trim();
  if (!q) return { error: "Pertanyaan tidak boleh kosong." };
  if (q.length > 500) return { error: "Pertanyaan terlalu panjang (maksimum 500 karakter)." };

  const ctx = await getChatContext();
  return askAiChat(q, ctx);
}
