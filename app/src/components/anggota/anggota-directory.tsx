"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, statusSiagaColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ROLES, STATUS_SIAGA, type Role } from "@/lib/constants";
import type { AnggotaFull } from "@/lib/anggota-data";
import { AnggotaCvDrawerContent } from "./anggota-cv-drawer-content";
import { AnggotaFormModal } from "./anggota-form-modal";

const FILTERS = ["Semua", STATUS_SIAGA.AKTIF, STATUS_SIAGA.SIAGA, STATUS_SIAGA.TIDAK_TERSEDIA] as const;

export function AnggotaDirectory({
  anggotaList,
  role,
}: {
  anggotaList: AnggotaFull[];
  role: Role | undefined;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<AnggotaFull | null>(null);

  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.OPERATOR;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return anggotaList.filter((a) => {
      const matchFilter = filter === "Semua" ? true : a.statusSiaga === filter;
      const matchQuery =
        !q ||
        a.nama.toLowerCase().includes(q) ||
        a.kodeAnggota.toLowerCase().includes(q) ||
        a.nik.includes(q) ||
        a.unitAsal.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [anggotaList, query, filter]);

  const selected = selectedId ? anggotaList.find((a) => a.id === selectedId) ?? null : null;

  function openCreate() {
    setFormTarget(null);
    setFormOpen(true);
  }
  function openEdit(a: AnggotaFull) {
    setFormTarget(a);
    setFormOpen(true);
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari NIK, nama, atau unit..."
          className="max-w-[320px] flex-1"
        />
        <div className="flex gap-[6px]">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "Semua" ? "Semua" : f}
            </Chip>
          ))}
        </div>
        {canManage && (
          <Button variant="solid" size="sm" onClick={openCreate} className="ml-auto">
            <Plus className="size-3.5" strokeWidth={2} />
            Tambah Anggota
          </Button>
        )}
      </div>

      <div className="hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="hud-head">
              {["ID", "NAMA", "UNIT ASAL", "KOMPETENSI", "READINESS", "STATUS"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-[10px] text-[9px] font-extrabold tracking-[0.16em] text-ink-3"
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
                  Tidak ada anggota yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className="cursor-pointer border-b border-border-soft last:border-b-0 hover:bg-surface-hover"
              >
                <td className="px-3 py-[10px] font-mono text-[12px]">{a.kodeAnggota}</td>
                <td className="px-3 py-[10px] text-[12px]">{a.nama}</td>
                <td className="px-3 py-[10px] text-[12px]">{a.unitAsal}</td>
                <td className="px-3 py-[10px] text-[12px] text-ink-2">
                  {a.sertifikasi.map((s) => s.jenisSertifikasi).join(", ") || "—"}
                </td>
                <td className="px-3 py-[10px]">
                  <span className="mr-[6px] inline-block h-[6px] w-[70px] overflow-hidden rounded-[3px] bg-elevated align-middle">
                    <span
                      className="block h-full bg-accent-bright"
                      style={{ width: `${a.readinessScore}%` }}
                    />
                  </span>
                  <span className={cn("text-[12px]")}>{a.readinessScore}</span>
                </td>
                <td className="px-3 py-[10px]">
                  <Badge color={statusSiagaColor(a.statusSiaga)}>{a.statusSiaga}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={selected !== null} onOpenChange={(o) => !o && setSelectedId(null)} title={selected?.nama ?? "Detail"}>
        {selected && (
          <AnggotaCvDrawerContent
            anggota={selected}
            role={role}
            onEdit={() => openEdit(selected)}
            onDeactivated={() => setSelectedId(null)}
          />
        )}
      </Drawer>

      {/* key wajib ganti antara create/edit-per-anggota: tanpa ini useActionState di dalam
          AnggotaFormModal bisa membawa action ter-bind ke anggota lama (submit "Tambah" bisa
          nyasar jadi update anggota yang sebelumnya diedit). Sudah dites & terbukti reproducible. */}
      <AnggotaFormModal
        key={formTarget ? `edit-${formTarget.id}` : "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        anggota={formTarget}
        onSaved={() => setFormOpen(false)}
      />
    </div>
  );
}
