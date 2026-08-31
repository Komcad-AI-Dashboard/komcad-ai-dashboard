"use client";

import { useState, useTransition } from "react";
import { respondNotifikasiAction } from "@/lib/anggota-mobile-actions";
import type { SelfNotifikasiItem } from "@/lib/anggota-mobile-data";

const TAG_STYLE: Record<string, { chip: string; border: string }> = {
  Mobilisasi: { chip: "bg-red/15 text-[#F5A9A5]", border: "#E14C45" },
  Info: { chip: "bg-cyan/15 text-cyan", border: "#3FA9C9" },
  Selesai: { chip: "bg-accent-bright/15 text-accent-bright", border: "#3CF29A" },
};

function tagFor(n: SelfNotifikasiItem): { label: string; style: string; border: string } {
  if (n.misiId && n.status !== "Direspons" && !n.judul.toLowerCase().includes("ditutup")) {
    return { label: "MOBILISASI", style: TAG_STYLE.Mobilisasi.chip, border: TAG_STYLE.Mobilisasi.border };
  }
  if (n.judul.toLowerCase().includes("ditutup") || n.judul.toLowerCase().includes("selesai")) {
    return { label: "SELESAI", style: TAG_STYLE.Selesai.chip, border: TAG_STYLE.Selesai.border };
  }
  return { label: "INFO", style: TAG_STYLE.Info.chip, border: TAG_STYLE.Info.border };
}

export function NotifCard({ notif }: { notif: SelfNotifikasiItem }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [responded, setResponded] = useState(notif.status === "Direspons");
  const [responsTipe, setResponsTipe] = useState(notif.responsTipe);

  const tag = tagFor(notif);
  const canRespond = notif.misiId !== null && !responded;

  function respond(tipe: "Konfirmasi" | "Tolak") {
    setError(null);
    startTransition(async () => {
      const res = await respondNotifikasiAction(notif.id, tipe);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResponded(true);
      setResponsTipe(tipe);
    });
  }

  return (
    <div className="rounded-[10px] border border-border border-l-[3px] bg-surface p-[13px]" style={{ borderLeftColor: tag.border }}>
      <div className="mb-[6px] flex items-center gap-2">
        <span className={`rounded-full px-2 py-[2px] text-[9px] font-extrabold tracking-wide ${tag.style}`}>{tag.label}</span>
        <span className="ml-auto font-mono text-[9.5px] text-ink-3">
          {notif.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" })}{" "}
          {notif.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}
        </span>
      </div>
      <div className="mb-1 text-[12.5px] font-bold">
        {notif.misi ? `${notif.misi.kodeMisi} — ${notif.judul}` : notif.judul}
      </div>
      <div className="mb-[10px] text-[11px] leading-relaxed text-ink-2">{notif.pesan}</div>

      {error && <p className="mb-2 text-[10.5px] text-[#F5A9A5]">{error}</p>}

      {canRespond && (
        <div className="flex gap-2">
          <button
            onClick={() => respond("Konfirmasi")}
            disabled={pending}
            className="flex-1 rounded-[7px] border-none bg-accent-bright py-[11px] text-[11px] font-bold text-[#00170C] disabled:opacity-50"
          >
            ✓ Konfirmasi
          </button>
          <button
            onClick={() => respond("Tolak")}
            disabled={pending}
            className="flex-1 rounded-[7px] border border-border bg-transparent py-[11px] text-[11px] font-bold text-ink-2 disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      )}
      {responded && (
        <div className="rounded-[7px] bg-elevated py-2 text-center text-[11px] font-bold text-accent-bright">
          {responsTipe === "Konfirmasi" ? "✓ Anda telah mengonfirmasi kesediaan" : "Anda menolak notifikasi ini"}
        </div>
      )}
    </div>
  );
}
