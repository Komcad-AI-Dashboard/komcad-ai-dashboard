"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SelfProfil } from "@/lib/anggota-mobile-data";

type Tab = "pelatihan" | "penugasan" | "sertifikasi";
const TABS: { key: Tab; label: string }[] = [
  { key: "pelatihan", label: "Pelatihan" },
  { key: "penugasan", label: "Penugasan" },
  { key: "sertifikasi", label: "Sertifikasi" },
];

function statusPill(text: string) {
  const positive = ["Lulus", "Aktif", "Baik", "Sangat Baik", "Selesai"].some((k) => text.includes(k));
  const warn = ["Direkomendasikan", "Akan Kedaluwarsa", "Sedang Berjalan"].some((k) => text.includes(k));
  const color = positive ? "bg-accent-bright/15 text-accent-bright" : warn ? "bg-amber/15 text-amber" : "bg-red/15 text-[#F5A9A5]";
  return <span className={`rounded-full px-[9px] py-[3px] text-[10px] font-bold ${color}`}>{text}</span>;
}

export function RiwayatView({ profil }: { profil: SelfProfil }) {
  const [tab, setTab] = useState<Tab>("pelatihan");

  return (
    <>
      <div>
        <div className="text-[15px] font-extrabold">Riwayat Saya</div>
        <div className="text-[11px] text-ink-2">Pelatihan & penugasan yang pernah diikuti</div>
      </div>

      <div className="flex gap-[6px] rounded-[10px] border border-border bg-elevated p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-[7px] py-[11px] text-center text-[11.5px] font-bold",
              tab === t.key ? "bg-accent-bright text-[#00170C]" : "text-ink-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col gap-[10px]", tab === "pelatihan" ? "xl:grid xl:grid-cols-2" : "hidden")}>
        {profil.pelatihan.length === 0 && <div className="text-[11.5px] text-ink-3">Belum ada riwayat pelatihan.</div>}
        {profil.pelatihan.map((p) => (
          <div key={p.id} className="rounded-[10px] border border-border bg-surface p-3">
            <div className="mb-1 text-[12px] font-bold">{p.namaPelatihan}</div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-2">
              <span>{p.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {statusPill(p.statusKelulusan)}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("flex flex-col gap-[10px]", tab === "penugasan" ? "xl:grid xl:grid-cols-2" : "hidden")}>
        {profil.penugasan.length === 0 && <div className="text-[11.5px] text-ink-3">Belum ada riwayat penugasan.</div>}
        {profil.penugasan.map((p) => (
          <div key={p.id} className="rounded-[10px] border border-border bg-surface p-3">
            <div className="mb-1 text-[12px] font-bold">
              {p.misi.kodeMisi} · {p.misi.jenisKejadian}
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-2">
              <span>{p.misi.status}</span>
              {statusPill(p.misi.hasilEvaluasi ? `Evaluasi: ${p.misi.hasilEvaluasi}` : p.statusKehadiran)}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("flex flex-col gap-[10px]", tab === "sertifikasi" ? "xl:grid xl:grid-cols-2" : "hidden")}>
        {profil.sertifikasi.length === 0 && <div className="text-[11.5px] text-ink-3">Belum ada data sertifikasi.</div>}
        {profil.sertifikasi.map((s) => (
          <div key={s.id} className="rounded-[10px] border border-border bg-surface p-3">
            <div className="mb-1 text-[12px] font-bold">{s.jenisSertifikasi}</div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-2">
              <span>Berlaku s.d. {s.tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {statusPill(s.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
