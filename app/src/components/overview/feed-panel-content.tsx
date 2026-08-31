"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/overview-data";

const WILAYAH_TABS = ["SEMUA", "NUSA TENGGARA", "JAWA", "SUMATERA", "KALIMANTAN", "SULAWESI"];

const DOT_CLASS: Record<FeedItem["color"], string> = {
  red: "bg-red text-red",
  amber: "bg-amber text-amber",
  green: "bg-accent-bright text-accent-bright",
};

export function FeedPanelContent({ items }: { items: FeedItem[] }) {
  const [active, setActive] = useState("SEMUA");

  const filtered =
    active === "SEMUA" ? items : items.filter((f) => f.wilayah.toUpperCase() === active);

  return (
    <>
      <div className="flex flex-wrap gap-[6px] border-b border-border-soft px-[14px] py-[7px]">
        {WILAYAH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "rounded-[4px] border border-border px-[10px] py-[4px] text-[10px] font-bold text-ink-2",
              active === tab && "border-red bg-red text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-[14px] text-[11px] text-ink-3">Tidak ada aktivitas Misi di wilayah ini.</div>
        )}
        {/* Tiap item membuka drawer detail Misi lewat ?openId= — jalur yang sama dipakai modal
            pencarian global (lib/search-actions.ts), jadi tidak ada drawer kedua yang dibangun. */}
        {filtered.map((f) => (
          <Link
            key={f.id}
            href={`/misi?openId=${f.id}`}
            className="flex gap-[10px] border-b border-border-soft px-[14px] py-[9px] hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
          >
            <span
              className={cn("mt-[5px] size-[7px] shrink-0 rounded-full shadow-[0_0_6px_currentColor]", DOT_CLASS[f.color])}
            />
            <div className="flex-1 text-[11.5px] leading-relaxed">
              <b>{f.kodeMisi}</b> — {f.description}
            </div>
            <span className="mt-[2px] shrink-0 whitespace-nowrap font-mono text-[10px] text-ink-3">
              {f.time}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
