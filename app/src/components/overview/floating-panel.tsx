"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kerangka panel yang melayang di atas peta (desktop) atau jadi kartu biasa (HP) — sebelumnya
 * menyatu di TrainingPanel. Dipisah supaya panel mana pun bisa menempati posisi melayang itu:
 * sekarang "Misi Terbaru" yang di sana, Aktivitas Pelatihan turun ke baris panel bawah.
 */
export function FloatingPanel({
  title,
  dot,
  footer,
  children,
  className,
  collapsedMaxHeight = "max-h-[min(268px,calc(100%-28px))]",
  defaultCollapsed = false,
}: {
  title: string;
  /** Warna penanda di kiri judul, mengikuti bahasa visual panel bawah (amber/merah/hijau). */
  dot: "amber" | "red" | "green";
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Melayang di desktop, jadi kartu biasa di HP — lihat catatan yang sama di LayersPanel. */
  className?: string;
  collapsedMaxHeight?: string;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const dotClass = {
    amber: "text-amber drop-shadow-[0_0_6px_rgba(224,168,62,0.8)]",
    red: "text-red drop-shadow-[0_0_6px_rgba(225,76,69,0.8)]",
    green: "text-accent-bright drop-shadow-[0_0_6px_rgba(60,242,154,0.8)]",
  }[dot];

  return (
    <div
      className={cn(
        "hud-brk flex flex-col overflow-hidden rounded-[10px] border border-border bg-black/[0.88] shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-[10px]",
        !collapsed && collapsedMaxHeight,
        className
      )}
    >
      <div className="hud-label flex shrink-0 items-center gap-[10px] border-b border-border-soft px-[13px] py-[11px]">
        <span className={dotClass}>◆</span>
        <span className="text-[9.5px] font-black tracking-[0.2em] text-ink-2">{title}</span>
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? `Perluas panel ${title}` : `Kecilkan panel ${title}`}
          aria-label={collapsed ? `Perluas panel ${title}` : `Kecilkan panel ${title}`}
          className="ml-auto flex size-[22px] shrink-0 items-center justify-center rounded-[5px] text-ink-3 hover:bg-surface-hover hover:text-ink"
        >
          {collapsed ? <ChevronDown className="size-4" strokeWidth={2} /> : <ChevronUp className="size-4" strokeWidth={2} />}
        </button>
      </div>
      {!collapsed && (
        <>
          {children}
          {footer && (
            <div className="shrink-0 border-t border-border px-[13px] py-[8px] text-[9.5px] text-ink-3">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}
