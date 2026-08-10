"use client";

import { cn } from "@/lib/utils";
import type { LayerVisibility } from "./situation-map";

const LAYER_ITEMS: { key: keyof LayerVisibility; label: string; color: string }[] = [
  { key: "anggota", label: "Anggota Siap", color: "#3CF29A" },
  { key: "siaga", label: "Anggota Siaga", color: "#E0A83E" },
  { key: "misi", label: "Zona Misi", color: "#E14C45" },
  { key: "pos", label: "Pos Komando", color: "#B08D4F" },
];

export function LayersPanel({
  layers,
  onToggle,
}: {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}) {
  return (
    <div className="absolute left-[14px] top-[14px] z-[500] w-[250px] rounded-[8px] border border-border bg-black/88 backdrop-blur-sm">
      <div className="flex items-center gap-[10px] border-b border-border px-[13px] py-[11px]">
        <div className="size-4 rounded-full border-2 border-accent-bright" />
        <span className="text-[10.5px] font-extrabold tracking-widest">LAYERS</span>
      </div>
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
                on && "border-accent-bright bg-accent-bright text-[#00170C]"
              )}
            >
              {on && "✓"}
            </span>
            <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="flex-1 tracking-wide">{item.label}</span>
          </button>
        );
      })}
      <div className="border-t border-border px-[13px] py-[8px] text-[9.5px] text-ink-3">
        Data: Komcad Big Data Platform
      </div>
    </div>
  );
}
