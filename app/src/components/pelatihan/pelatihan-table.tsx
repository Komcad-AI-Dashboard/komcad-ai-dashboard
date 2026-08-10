"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { getAllPelatihan } from "@/lib/anggota-data";

type Row = Awaited<ReturnType<typeof getAllPelatihan>>[number];

export function PelatihanTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.anggotaLabel.toLowerCase().includes(q) || r.namaPelatihan.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama pelatihan..."
        className="mb-4 max-w-[360px]"
      />
      <div className="overflow-hidden rounded-[8px] border border-border bg-surface">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-elevated">
              {["ANGGOTA", "NAMA PELATIHAN", "TANGGAL", "STATUS KELULUSAN"].map((h) => (
                <th key={h} className="border-b border-border px-3 py-[10px] text-[10px] font-extrabold tracking-wide text-ink-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-[11px] text-ink-3">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border-soft last:border-b-0 hover:bg-surface-hover">
                <td className="px-3 py-[10px] text-[12px]">{r.anggotaLabel}</td>
                <td className="px-3 py-[10px] text-[12px]">{r.namaPelatihan}</td>
                <td className="px-3 py-[10px] text-[12px] text-ink-2">
                  {r.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-3 py-[10px]">
                  <Badge color={r.statusKelulusan === "Lulus" ? "green" : "amber"}>{r.statusKelulusan}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
