import { MapPin } from "lucide-react";
import type { getAktivitasPelatihanTerbaru } from "@/lib/overview-data";

type Aktivitas = Awaited<ReturnType<typeof getAktivitasPelatihanTerbaru>>[number];

export function TrainingPanel({
  items,
  onSelect,
}: {
  items: Aktivitas[];
  onSelect: (item: Aktivitas) => void;
}) {
  return (
    <div className="absolute right-[14px] top-[56px] z-[500] flex max-h-[calc(100%-80px)] w-[250px] flex-col overflow-hidden rounded-[8px] border border-border bg-black/90 backdrop-blur-sm">
      <div className="flex items-center gap-[10px] border-b border-border px-[13px] py-[11px]">
        <span className="text-amber">◆</span>
        <span className="text-[10.5px] font-extrabold tracking-widest">AKTIVITAS PELATIHAN TERBARU</span>
      </div>
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
      <div className="border-t border-border px-[13px] py-[8px] text-[9.5px] text-ink-3">
        Diperbarui otomatis dari modul Pelatihan
      </div>
    </div>
  );
}
