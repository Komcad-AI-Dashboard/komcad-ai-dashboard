"use client";

import { useState, useTransition } from "react";
import { Badge, urgensiColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES, type Role } from "@/lib/constants";
import type { MisiMenunggu } from "@/lib/misi-data";
import { approveMisiAction } from "@/lib/misi-actions";

const PARAMETER_MODEL = [
  { label: "Radius pencarian default", sub: "Jarak maksimum kandidat dari lokasi Misi", value: "25 km" },
  { label: "Bobot Readiness Score", sub: "Kontribusi skor kesiapan pada ranking kandidat", value: "40%" },
  { label: "Bobot jarak/ETA", sub: "Kontribusi estimasi waktu tempuh", value: "35%" },
  { label: "Bobot kompetensi/sertifikasi", sub: "Kecocokan kebutuhan Misi dengan sertifikasi anggota", value: "25%" },
];

function MisiCard({ misi, canManage }: { misi: MisiMenunggu; canManage: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveMisiAction(misi.id);
      if (res.error) setError(res.error);
      else setApproved(true);
    });
  }

  return (
    <div className="rounded-[8px] border border-border bg-surface p-[14px]">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-extrabold">
          ◈ Rekomendasi Aktif — {misi.kodeMisi} ({misi.jenisKejadian}, {misi.lokasi})
        </h3>
        <Badge color={urgensiColor(misi.urgensi)}>{misi.urgensi}</Badge>
      </div>
      {misi.ringkasanAI && <p className="mb-3 text-[12px] leading-relaxed text-ink-2">{misi.ringkasanAI}</p>}

      <div className="flex flex-col gap-2">
        {misi.penugasan.map((p) => (
          <div key={p.id} className="rounded-[8px] border border-border bg-elevated p-3">
            <div className="flex items-center justify-between">
              <div className="text-[12.5px] font-bold">
                {p.anggota.kodeAnggota} · {p.anggota.nama}
              </div>
              <div className="flex items-center gap-2">
                {p.etaMenit !== null && <span className="font-mono text-[11px] text-ink-3">ETA {p.etaMenit} mnt</span>}
                <span className="rounded-full bg-accent-bright/15 px-2 py-[2px] font-mono text-[11px] font-bold text-accent-bright">
                  {p.skorRekomendasi}
                </span>
              </div>
            </div>
            <ul className="mt-1 list-disc pl-4 text-[11px] text-ink-2">
              {p.alasan.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-2 rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
          {error}
        </div>
      )}

      {canManage && !approved && (
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleApprove} disabled={pending}>
            {pending ? "Memproses..." : "Setujui & Kirim Notifikasi ✓"}
          </Button>
        </div>
      )}
      {approved && <div className="mt-3 text-right text-[11.5px] font-bold text-accent-bright">Disetujui ✓</div>}
    </div>
  );
}

export function AiMobilizationView({ misiMenunggu, role }: { misiMenunggu: MisiMenunggu[]; role: Role | undefined }) {
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.OPERATOR;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {misiMenunggu.length === 0 && (
          <div className="rounded-[8px] border border-border bg-surface p-6 text-center text-[12.5px] text-ink-3">
            Tidak ada rekomendasi Misi yang menunggu persetujuan. Buat Misi baru lewat tombol BUAT MISI di topbar.
          </div>
        )}
        {misiMenunggu.map((misi) => (
          <MisiCard key={misi.id} misi={misi} canManage={canManage} />
        ))}

        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-2 text-[12px] font-extrabold">Parameter Model AI Mobilization</h3>
          <p className="mb-3 text-[11px] text-ink-3">
            Nilai referensi yang dipakai mesin rekomendasi saat ini. Panel pengaturan untuk mengubah bobot ini
            langsung dari UI belum tersedia (menyusul di modul Pengaturan) — sementara diubah lewat kode.
          </p>
          {PARAMETER_MODEL.map((p) => (
            <div key={p.label} className="flex items-center justify-between border-b border-border-soft py-2 last:border-b-0">
              <div>
                <div className="text-[12px] font-semibold">{p.label}</div>
                <div className="text-[10.5px] text-ink-2">{p.sub}</div>
              </div>
              <div className="font-mono text-[13px] font-bold">{p.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
