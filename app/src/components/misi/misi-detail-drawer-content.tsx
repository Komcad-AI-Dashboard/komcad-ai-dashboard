"use client";

import { useState, useTransition } from "react";
import { Badge, statusKehadiranColor, statusMisiColor, urgensiColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ROLES, STATUS_KEHADIRAN, STATUS_MISI, type Role } from "@/lib/constants";
import type { MisiListItem } from "@/lib/misi-data";
import { approveMisiAction, closeMisiAction, updateKehadiranAction } from "@/lib/misi-actions";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="mb-[3px] text-[10px] font-extrabold tracking-wide text-ink-2">{label}</div>
      <div className="text-[13px] font-semibold">{value ?? "—"}</div>
    </div>
  );
}

export function MisiDetailDrawerContent({ misi, role }: { misi: MisiListItem; role: Role | undefined }) {
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.OPERATOR;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasilEvaluasi, setHasilEvaluasi] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveMisiAction(misi.id);
      if (res.error) setError(res.error);
    });
  }

  function handleClose() {
    setError(null);
    startTransition(async () => {
      const res = await closeMisiAction(misi.id, hasilEvaluasi);
      if (res.error) setError(res.error);
      else setShowCloseForm(false);
    });
  }

  function handleKehadiran(penugasanId: string, status: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateKehadiranAction(penugasanId, status);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID MISI" value={<span className="font-mono">{misi.kodeMisi}</span>} />
        <Field label="STATUS" value={<Badge color={statusMisiColor(misi.status)}>{misi.status}</Badge>} />
        <Field label="JENIS KEJADIAN" value={misi.jenisKejadian} />
        <Field label="URGENSI" value={<Badge color={urgensiColor(misi.urgensi)}>{misi.urgensi}</Badge>} />
      </div>
      <Field label="PEMBERI PERINTAH" value={misi.pemberiPerintah} />
      <Field label="LOKASI" value={misi.lokasi} />
      <Field label="DESKRIPSI MISI" value={misi.deskripsiMisi} />

      {error && (
        <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
          {error}
        </div>
      )}

      {canManage && misi.status === STATUS_MISI.DRAFT && (
        <Button variant="outline" size="sm" onClick={handleApprove} disabled={pending}>
          {pending ? "Memproses..." : "Setujui & Kirim Notifikasi ✓"}
        </Button>
      )}

      {canManage && misi.status === STATUS_MISI.DIMOBILISASI && !showCloseForm && (
        <Button variant="default" size="sm" onClick={() => setShowCloseForm(true)}>
          Tutup Misi & Evaluasi
        </Button>
      )}

      {canManage && showCloseForm && (
        <div className="rounded-[8px] border border-border bg-surface p-3">
          <div className="mb-2 text-[10px] font-extrabold tracking-wide text-ink-2">HASIL EVALUASI</div>
          <Textarea
            value={hasilEvaluasi}
            onChange={(e) => setHasilEvaluasi(e.target.value)}
            placeholder="Catatan evaluasi Misi (opsional)..."
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCloseForm(false)}>
              Batal
            </Button>
            <Button variant="solid" size="sm" onClick={handleClose} disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan & Tutup Misi"}
            </Button>
          </div>
        </div>
      )}

      {misi.status === STATUS_MISI.SELESAI && misi.hasilEvaluasi && (
        <div className="rounded-[8px] border border-border bg-surface p-3">
          <div className="mb-1 text-[10px] font-extrabold tracking-wide text-ink-2">HASIL EVALUASI</div>
          <div className="text-[12.5px]">{misi.hasilEvaluasi}</div>
        </div>
      )}

      {misi.ringkasanAI && (
        <div className="rounded-[8px] border border-accent-bright/30 bg-accent-bright/5 p-3 text-[12px] leading-relaxed">
          <b className="text-accent-bright">◈ Ringkasan AI</b>
          <div className="mt-1">{misi.ringkasanAI}</div>
        </div>
      )}

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-2 text-[12px] font-extrabold">
          Rekomendasi AI &amp; Pemantauan Kehadiran ({misi.penugasan.length})
        </h3>
        {misi.penugasan.length === 0 && (
          <div className="text-[11px] text-ink-3">Belum ada personel yang direkomendasikan.</div>
        )}
        <div className="flex flex-col gap-2">
          {misi.penugasan.map((p) => (
            <div key={p.id} className="rounded-[8px] border border-border bg-elevated p-3">
              <div className="flex items-center justify-between">
                <div className="text-[12.5px] font-bold">
                  {p.anggota.kodeAnggota} · {p.anggota.nama}
                </div>
                <div className="flex items-center gap-2">
                  {p.etaMenit !== null && (
                    <span className="font-mono text-[11px] text-ink-3">ETA {p.etaMenit} mnt</span>
                  )}
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
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge color={statusKehadiranColor(p.statusKehadiran)}>{p.statusKehadiran}</Badge>
                {canManage && misi.status === STATUS_MISI.DIMOBILISASI && (
                  <select
                    value={p.statusKehadiran}
                    onChange={(e) => handleKehadiran(p.id, e.target.value)}
                    disabled={pending}
                    className="rounded-[6px] border border-border bg-base px-2 py-1 text-[11px]"
                  >
                    {Object.values(STATUS_KEHADIRAN).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
