"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

  // Dibuka lewat hasil pencarian global topbar (?openId=<id>) — lihat GlobalSearchModal.
  // Diturunkan langsung dari URL (bukan disinkronkan ke state lewat effect/ref) supaya tidak
  // melanggar aturan purity render; ditutup dengan membersihkan query-nya, lihat closeDrawer().
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openIdParam = searchParams.get("openId");

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

  const effectiveSelectedId = selectedId ?? openIdParam;
  const selected = effectiveSelectedId ? anggotaList.find((a) => a.id === effectiveSelectedId) ?? null : null;

  function closeDrawer() {
    setSelectedId(null);
    if (openIdParam) router.replace(pathname);
  }

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
      <div className="mb-4 flex flex-col items-stretch gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari NIK, nama, atau unit..."
          className="w-full xl:max-w-[320px] xl:flex-1"
        />
        <div className="flex flex-wrap gap-[6px]">
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
        <table className="hud-table-responsive w-full border-collapse text-left">
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
                <td data-label="ID" className="px-3 py-[10px] font-mono text-[12px]">{a.kodeAnggota}</td>
                <td data-label="Nama" className="px-3 py-[10px] text-[12px]">{a.nama}</td>
                <td data-label="Unit Asal" className="px-3 py-[10px] text-[12px]">{a.unitAsal}</td>
                <td data-label="Kompetensi" className="px-3 py-[10px] text-[12px] text-ink-2">
                  {a.sertifikasi.map((s) => s.jenisSertifikasi).join(", ") || "—"}
                </td>
                <td data-label="Readiness" className="px-3 py-[10px]">
                  <span className="mr-[6px] inline-block h-[6px] w-[70px] overflow-hidden rounded-[3px] bg-elevated align-middle">
                    <span
                      className="block h-full bg-accent-bright"
                      style={{ width: `${a.readinessScore}%` }}
                    />
                  </span>
                  <span className={cn("text-[12px]")}>{a.readinessScore}</span>
                </td>
                <td data-label="Status" className="px-3 py-[10px]">
                  <Badge color={statusSiagaColor(a.statusSiaga)}>{a.statusSiaga}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={selected !== null} onOpenChange={(o) => !o && closeDrawer()} title={selected?.nama ?? "Detail"}>
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
