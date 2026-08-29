"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LayerVisibility } from "./situation-map";

const LAYER_ITEMS: { key: keyof LayerVisibility; label: string; color: string }[] = [
  { key: "anggota", label: "Anggota Siap", color: "#3CF29A" },
  { key: "siaga", label: "Anggota Siaga", color: "#E0A83E" },
  { key: "misi", label: "Zona Misi", color: "#E14C45" },
  { key: "pos", label: "Pos Komando", color: "#B08D4F" },
  { key: "kodam", label: "Kodam", color: "#1F6B4A" },
  { key: "kodim", label: "Kodim", color: "#1F6B4A" },
  { key: "heatzone", label: "Kepadatan Wilayah", color: "#E0A83E" },
];

export function LayersPanel({
  layers,
  onToggle,
  className,
  defaultCollapsed = false,
}: {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
  /** Posisi & lebar sengaja diserahkan ke pemanggil: di desktop panel ini melayang di atas peta,
   * di HP ia jadi kartu biasa di bawah peta (melayang di layar 390px cuma saling tumpang tindih). */
  className?: string;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={cn(
        "hud-brk rounded-[10px] border border-border bg-black/[0.86] shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-[10px]",
        className
      )}
    >
      <div className="hud-label flex items-center gap-[10px] border-b border-border-soft px-[13px] py-[11px]">
        <div className="size-4 rounded-full border-2 border-accent-bright shadow-[0_0_10px_rgba(60,242,154,0.45)]" />
        <span className="text-[9.5px] font-black tracking-[0.2em] text-ink-2">LAYERS</span>
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Perluas panel Layers" : "Kecilkan panel Layers"}
          aria-label={collapsed ? "Perluas panel Layers" : "Kecilkan panel Layers"}
          className="ml-auto flex size-[22px] shrink-0 items-center justify-center rounded-[5px] text-ink-3 hover:bg-surface-hover hover:text-ink"
        >
          {collapsed ? <ChevronDown className="size-4" strokeWidth={2} /> : <ChevronUp className="size-4" strokeWidth={2} />}
        </button>
      </div>
      {!collapsed && (
        <>
          {LAYER_ITEMS.map((item) => {
            const on = layers[item.key];
            return (
              <button
                key={item.key}
                onClick={() => onToggle(item.key)}
                className="flex w-full items-center gap-[9px] px-[13px] py-[7px] text-left text-[11.5px] hover:bg-surface-hover"
              >
                <span
                  className={cn(
                    "flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border border-border text-[9px] font-black",
                    on &&
                      "border-accent-bright bg-accent-bright text-[#00170C] shadow-[0_0_10px_rgba(34,197,119,0.5)]"
                  )}
                >
                  {on && "✓"}
                </span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="flex-1 tracking-wide">{item.label}</span>
              </button>
            );
          })}
          <div className="border-t border-border-soft px-[13px] py-[8px] text-[9.5px] text-ink-3">
            Data: Big Data Komponen Cadangan
          </div>
        </>
      )}
    </div>
  );
}
