"use client";

import { MapPin } from "lucide-react";
import type { getAktivitasPelatihanTerbaru } from "@/lib/overview-data";

type Aktivitas = Awaited<ReturnType<typeof getAktivitasPelatihanTerbaru>>[number];

/**
 * Isi panel Aktivitas Pelatihan. Kerangkanya sengaja tidak ikut di sini — panel ini sekarang
 * menempati baris panel bawah (BottomPanelShell), sementara posisi melayang di atas peta dipakai
 * "Misi Terbaru". Lihat FloatingPanel kalau perlu dipindah balik.
 */
export function TrainingPanelContent({
  items,
  onSelect,
}: {
  items: Aktivitas[];
  onSelect: (item: Aktivitas) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && (
          <div className="p-[13px] text-[11px] text-ink-3">Belum ada aktivitas pelatihan.</div>
        )}
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="block w-full border-b border-border-soft px-[13px] py-[9px] text-left last:border-b-0 hover:bg-surface-hover"
          >
            <div className="mb-[3px] text-[11.5px] font-bold">{t.nama}</div>
            <div className="flex items-center justify-between text-[10px] text-ink-2">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" strokeWidth={1.5} />
                {t.lokasi}
              </span>
              <span className="font-mono text-ink-3">
                {t.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="mt-[3px] text-[9.5px] font-bold text-amber">{t.peserta} peserta</div>
          </button>
        ))}
      </div>
      <div className="shrink-0 border-t border-border px-[13px] py-[8px] text-[9.5px] text-ink-3">
        Diperbarui otomatis dari modul Pelatihan
      </div>
    </>
  );
}
