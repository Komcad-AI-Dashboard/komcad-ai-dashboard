"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askChatAction } from "@/lib/ai-chat-actions";
import type { ChatTable } from "@/lib/ai-chat";

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  tabel: ChatTable;
};

const QUICK_QUESTIONS = [
  "Berapa jumlah anggota yang belum pelatihan 3 bulan terakhir?",
  "Sebaran anggota berdasarkan pendidikan?",
  "Bagaimana Readiness nasional saat ini?",
  "Ada berapa Misi aktif sekarang?",
];

function TabelJawaban({ tabel }: { tabel: NonNullable<ChatTable> }) {
  return (
    <table className="mt-2 w-full border-collapse text-[11.5px]">
      <thead>
        <tr>
          {tabel.headers.map((h) => (
            <th key={h} className="border-b border-border px-2 py-1 text-left font-extrabold text-ink-2">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tabel.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border-b border-border-soft px-2 py-1">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const isAi = msg.role === "ai";
  return (
    <div className={`flex gap-2 ${isAi ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${isAi ? "bg-accent-bright/15 text-accent-bright" : "bg-elevated text-ink-2"}`}
      >
        {isAi ? <Sparkles className="size-3.5" strokeWidth={1.5} /> : <User className="size-3.5" strokeWidth={1.5} />}
      </div>
      <div
        className={`max-w-[70%] rounded-[10px] px-3 py-2 text-[12.5px] leading-relaxed ${
          isAi ? "bg-elevated text-ink" : "bg-accent-bright/15 text-ink"
        }`}
      >
        {msg.text}
        {msg.tabel && <TabelJawaban tabel={msg.tabel} />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-bright/15 text-accent-bright">
        <Sparkles className="size-3.5" strokeWidth={1.5} />
      </div>
      <div className="flex items-center gap-1 rounded-[10px] bg-elevated px-3 py-[10px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-[6px] animate-bounce rounded-full bg-ink-3"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export function ChatView({ introMessages }: { introMessages: { text: string; tabel: ChatTable }[] }) {
  const [messages, setMessages] = useState<Message[]>(() =>
    introMessages.map((m) => ({ id: nextId(), role: "ai" as const, text: m.text, tabel: m.tabel }))
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  function send(text: string) {
    const q = text.trim();
    if (!q || pending) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: q, tabel: null }]);
    setInput("");
    setTyping(true);
    startTransition(async () => {
      const res = await askChatAction(q);
      setTyping(false);
      if ("error" in res) {
        setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: res.error, tabel: null }]);
        return;
      }
      setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: res.jawaban, tabel: res.tabel }]);
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-5">
      <div className="flex flex-1 flex-col hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {typing && <TypingIndicator />}
        </div>

        <div className="flex flex-wrap gap-[6px] border-t border-border px-4 py-[10px]">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={pending}
              className="rounded-full border border-border bg-elevated px-3 py-1 text-[11px] font-semibold text-ink-2 hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-[10px] border-t border-border p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan data Komcad, mis. 'sebaran anggota berdasarkan pendidikan'..."
            disabled={pending}
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={pending || !input.trim()}>
            {pending ? "Mengirim..." : "Kirim"}
            <Send className="size-3.5" strokeWidth={1.5} />
          </Button>
        </form>
      </div>
    </div>
  );
}
