"use client";

import { useMemo, useState } from "react";
import { Badge, statusMisiColor, urgensiColor } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Drawer } from "@/components/ui/drawer";
import { STATUS_MISI } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import type { MisiListItem, MisiKpi } from "@/lib/misi-data";
import { formatEta } from "@/lib/geo";
import { MisiDetailDrawerContent } from "./misi-detail-drawer-content";

const FILTERS = ["Semua", "Kritis", "Tinggi", "Selesai"] as const;

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface p-3">
      <div className="text-[10px] font-extrabold tracking-wide text-ink-2">{label}</div>
      <div className="mt-1 text-[22px] font-extrabold">{value}</div>
      {sub && <div className="mt-[2px] text-[10.5px] text-ink-3">{sub}</div>}
    </div>
  );
}

export function MisiView({
  misiList,
  kpi,
  role,
}: {
  misiList: MisiListItem[];
  kpi: MisiKpi;
  role: Role | undefined;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return misiList.filter((m) => {
      const matchFilter =
        filter === "Semua"
          ? true
          : filter === "Selesai"
            ? m.status === STATUS_MISI.SELESAI
            : m.urgensi === filter;
      const matchQuery =
        !q ||
        m.kodeMisi.toLowerCase().includes(q) ||
        m.lokasi.toLowerCase().includes(q) ||
        m.jenisKejadian.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [misiList, query, filter]);

  const selected = selectedId ? (misiList.find((m) => m.id === selectedId) ?? null) : null;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 grid grid-cols-4 gap-3">
        <KpiCard label="MISI AKTIF" value={String(kpi.misiAktif)} sub={`${kpi.kritisAktif} kritis`} />
        <KpiCard label="SELESAI BULAN INI" value={String(kpi.selesaiBulanIni)} />
        <KpiCard
          label="RATA² WAKTU BERKUMPUL"
          value={kpi.rataWaktuBerkumpulMenit > 0 ? formatEta(kpi.rataWaktuBerkumpulMenit) : "—"}
        />
        <KpiCard label="PERSONEL TERMOBILISASI" value={String(kpi.personelTermobilisasi)} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari Misi (ID, lokasi, jenis kejadian)..."
          className="max-w-[320px] flex-1"
        />
        <div className="flex gap-[6px]">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-border bg-surface">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-elevated">
              {["ID MISI", "JENIS KEJADIAN", "LOKASI", "URGENSI", "STATUS", "PERSONEL"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-[10px] text-[10px] font-extrabold tracking-wide text-ink-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-[11px] text-ink-3">
                  Tidak ada Misi yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="cursor-pointer border-b border-border-soft last:border-b-0 hover:bg-surface-hover"
              >
                <td className="px-3 py-[10px] font-mono text-[12px]">{m.kodeMisi}</td>
                <td className="px-3 py-[10px] text-[12px]">{m.jenisKejadian}</td>
                <td className="px-3 py-[10px] text-[12px] text-ink-2">{m.lokasi}</td>
                <td className="px-3 py-[10px]">
                  <Badge color={urgensiColor(m.urgensi)}>{m.urgensi}</Badge>
                </td>
                <td className="px-3 py-[10px]">
                  <Badge color={statusMisiColor(m.status)}>{m.status}</Badge>
                </td>
                <td className="px-3 py-[10px] text-[12px]">{m.penugasan.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer
        open={selected !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected ? `${selected.kodeMisi} · ${selected.jenisKejadian}` : "Detail Misi"}
      >
        {selected && <MisiDetailDrawerContent misi={selected} role={role} />}
      </Drawer>
    </div>
  );
}
