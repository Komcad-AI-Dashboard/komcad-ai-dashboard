"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge, statusSertifikasiColor } from "@/components/ui/badge";
import type { getAllSertifikasi } from "@/lib/anggota-data";

type Row = Awaited<ReturnType<typeof getAllSertifikasi>>[number];

export function SertifikasiTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.anggotaLabel.toLowerCase().includes(q) || r.jenisSertifikasi.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari jenis sertifikasi atau nama anggota..."
        className="mb-4 w-full xl:max-w-[360px]"
      />
      <div className="hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
        <table className="hud-table-responsive w-full border-collapse text-left">
          <thead>
            <tr className="hud-head">
              {["ANGGOTA", "JENIS SERTIFIKASI", "TANGGAL TERBIT", "MASA BERLAKU", "STATUS"].map((h) => (
                <th key={h} className="border-b border-border px-3 py-[10px] text-[9px] font-extrabold tracking-[0.16em] text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-[11px] text-ink-3">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border-soft last:border-b-0 hover:bg-surface-hover">
                <td data-label="Anggota" className="px-3 py-[10px] text-[12px]">{r.anggotaLabel}</td>
                <td data-label="Jenis Sertifikasi" className="px-3 py-[10px] text-[12px]">{r.jenisSertifikasi}</td>
                <td data-label="Tanggal Terbit" className="px-3 py-[10px] text-[12px] text-ink-2">
                  {r.tanggalTerbit.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
                </td>
                <td data-label="Masa Berlaku" className="px-3 py-[10px] text-[12px] text-ink-2">
                  {r.tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
                </td>
                <td data-label="Status" className="px-3 py-[10px]">
                  <Badge color={statusSertifikasiColor(r.status)}>{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
