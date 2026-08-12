"use client";

import { useState, useTransition } from "react";
import { STATUS_SIAGA } from "@/lib/constants";
import { updateStatusSiagaSelfAction } from "@/lib/anggota-mobile-actions";
import { AvatarPlaceholder } from "@/components/anggota/avatar-placeholder";
import type { SelfProfil, SelfNotifikasiItem } from "@/lib/anggota-mobile-data";
import { NotifCard } from "./notif-card";

const STATUS_OPTIONS = [STATUS_SIAGA.AKTIF, STATUS_SIAGA.SIAGA, STATUS_SIAGA.TIDAK_TERSEDIA];

const STATUS_STYLE: Record<string, { border: string; text: string; bg: string }> = {
  [STATUS_SIAGA.AKTIF]: { border: "border-accent-bright", text: "text-accent-bright", bg: "bg-accent-bright/15" },
  [STATUS_SIAGA.SIAGA]: { border: "border-amber", text: "text-amber", bg: "bg-amber/15" },
  [STATUS_SIAGA.TIDAK_TERSEDIA]: { border: "border-red", text: "text-[#F5A9A5]", bg: "bg-red/15" },
};

function ReadinessRing({ score }: { score: number }) {
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative size-[76px] shrink-0">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#171C20" strokeWidth="8" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#3CF29A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[18px] font-extrabold leading-none text-accent-bright">{score}</div>
        <div className="mt-[2px] text-[7.5px] tracking-wide text-ink-3">SKOR</div>
      </div>
    </div>
  );
}

function readinessBlurb(score: number): string {
  if (score >= 85) return "Kesiapan Anda Sangat Baik";
  if (score >= 70) return "Kesiapan Anda Baik";
  if (score >= 50) return "Kesiapan Anda Cukup";
  return "Kesiapan Anda Perlu Ditingkatkan";
}

export function BerandaView({
  profil,
  stats,
  notifikasiTerbaru,
}: {
  profil: SelfProfil;
  stats: { sertifikasiAktif: number; pelatihanCount: number; penugasanCount: number; hariSejakTugasTerakhir: number | null };
  notifikasiTerbaru: SelfNotifikasiItem[];
}) {
  const [status, setStatus] = useState(profil.statusSiaga);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChangeStatus(next: string) {
    setError(null);
    setStatus(next);
    startTransition(async () => {
      const res = await updateStatusSiagaSelfAction(next);
      if (res.error) {
        setError(res.error);
        setStatus(profil.statusSiaga);
      }
    });
  }

  const style = STATUS_STYLE[status] ?? STATUS_STYLE[STATUS_SIAGA.AKTIF];

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] border border-border bg-elevated">
          <AvatarPlaceholder />
        </div>
        <div>
          <div className="text-[11px] text-ink-2">Selamat datang,</div>
          <div className="text-[16px] font-extrabold">{profil.nama}</div>
        </div>
        <div className="ml-auto flex items-center gap-[5px] font-mono text-[10px] font-bold text-accent-bright">
          <span className="size-1.5 animate-pulse rounded-full bg-current shadow-[0_0_6px_currentColor]" />
          LIVE
        </div>
      </div>

      <div className="rounded-[14px] border border-accent-bright/25 bg-gradient-to-br from-accent-bright/10 to-transparent p-[18px]">
        <div className="text-[10px] font-extrabold tracking-wide text-ink-2">STATUS KESIAPAN SAYA</div>
        <div className={`mt-[6px] flex items-center gap-2 text-[18px] font-extrabold ${style.text}`}>
          <span className="size-[10px] rounded-full bg-current" style={{ boxShadow: "0 0 10px currentColor" }} />
          {status}
        </div>
        <div className="mt-[14px] grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((s) => {
            const active = s === status;
            const optStyle = STATUS_STYLE[s];
            return (
              <button
                key={s}
                disabled={pending}
                onClick={() => handleChangeStatus(s)}
                className={`rounded-[8px] border px-1 py-[13px] text-center text-[11px] font-bold disabled:opacity-50 ${
                  active ? `${optStyle.border} ${optStyle.text} ${optStyle.bg}` : "border-border bg-elevated text-ink-2"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-[11px] text-[#F5A9A5]">{error}</p>}
      </div>

      <div className="rounded-[12px] border border-border bg-surface p-4">
        <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-wide text-ink-2">Readiness Score Saya</h3>
        <div className="flex items-center gap-4">
          <ReadinessRing score={profil.readinessScore} />
          <div>
            <div className="mb-1 text-[12px] font-bold">{readinessBlurb(profil.readinessScore)}</div>
            <div className="text-[10.5px] leading-relaxed text-ink-2">
              Ditentukan dari kompetensi, sertifikasi aktif, riwayat pelatihan, dan jeda penugasan terakhir Anda.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
        <div className="rounded-[10px] border border-border bg-surface p-3">
          <div className="mb-[6px] text-[16px]">🏅</div>
          <div className="font-mono text-[17px] font-extrabold">{stats.sertifikasiAktif}</div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Sertifikasi Aktif</div>
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-3">
          <div className="mb-[6px] text-[16px]">📚</div>
          <div className="font-mono text-[17px] font-extrabold">{stats.pelatihanCount}</div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Pelatihan Diikuti</div>
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-3">
          <div className="mb-[6px] text-[16px]">🎖️</div>
          <div className="font-mono text-[17px] font-extrabold">{stats.penugasanCount}</div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Riwayat Penugasan</div>
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-3">
          <div className="mb-[6px] text-[16px]">📅</div>
          <div className="font-mono text-[17px] font-extrabold">{stats.hariSejakTugasTerakhir ?? "—"}</div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Hari Sejak Tugas Terakhir</div>
        </div>
      </div>

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Notifikasi Terbaru</div>
      {notifikasiTerbaru.length === 0 && (
        <div className="text-[11.5px] text-ink-3">Belum ada notifikasi.</div>
      )}
      {notifikasiTerbaru.map((n) => (
        <NotifCard key={n.id} notif={n} />
      ))}
    </>
  );
}
