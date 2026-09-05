"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge, statusKehadiranColor, statusMisiColor, urgensiColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ROLES, ROLE_LABELS, STATUS_KEHADIRAN, STATUS_MISI, type Role } from "@/lib/constants";
import type { MisiListItem } from "@/lib/misi-data";
import { approveMisiAction, closeMisiAction, updateKehadiranAction } from "@/lib/misi-actions";
import {
  getCatatanAnalisAction,
  hapusCatatanAction,
  tambahCatatanAction,
  type CatatanAnalisItem,
} from "@/lib/catatan-analis-actions";

/** Waktu catatan dipatok ke WIB. Tanpa timeZone eksplisit, jam yang tampil mengikuti zona mesin
 *  yang me-render (Vercel jalan di UTC) dan bisa meleset tujuh jam — perbaikan yang sama seperti
 *  yang dilakukan di 56e1ae6 untuk seluruh format tanggal id-ID. */
function formatWaktuCatatan(waktu: Date) {
  return waktu.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

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
  // Sengaja BUKAN canManage. Yang berhak menulis catatan justru Analis, dan Operator tidak —
  // Operator sudah punya jalurnya sendiri lewat Hasil Evaluasi saat menutup Misi. Ini cuma cermin
  // UI-nya; penegakannya ada di requireAnalisPermission() (lib/catatan-analis-actions.ts).
  const bisaTulisCatatan = role === ROLES.SUPER_ADMIN || role === ROLES.ANALIS;
  const misiSelesai = misi.status === STATUS_MISI.SELESAI;

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasilEvaluasi, setHasilEvaluasi] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);

  // Catatan diambil saat drawer dibuka, bukan ikut dimuat bersama daftar Misi. misi-view.tsx
  // memuat SELURUH Misi sekaligus untuk tabelnya, jadi menempelkan catatan di sana berarti
  // mengirim catatan semua Misi ke browser demi satu drawer yang mungkin tidak pernah dibuka.
  const [catatan, setCatatan] = useState<CatatanAnalisItem[] | null>(null);
  const [catatanError, setCatatanError] = useState<string | null>(null);
  const [isiCatatan, setIsiCatatan] = useState("");
  const [showCatatanForm, setShowCatatanForm] = useState(false);
  const [catatanPending, startCatatanTransition] = useTransition();

  const muatCatatan = useCallback(async () => {
    // try/catch, bukan promise yang dibiarkan menggantung: kalau fetch-nya gagal tanpa ini,
    // daftarnya selamanya menampilkan "Memuat catatan..." tanpa memberi tahu apa pun.
    try {
      setCatatan(await getCatatanAnalisAction(misi.id));
    } catch {
      setCatatan([]);
      setCatatanError("Gagal memuat catatan analis. Tutup drawer lalu buka lagi.");
    }
  }, [misi.id]);

  // Pola sama seperti pemuatan detail drawer di overview-view.tsx: setState-nya terjadi di dalam
  // callback transition, bukan langsung di badan effect.
  useEffect(() => {
    if (!misiSelesai) return;
    startCatatanTransition(muatCatatan);
  }, [misiSelesai, muatCatatan]);

  function handleTambahCatatan() {
    setCatatanError(null);
    startCatatanTransition(async () => {
      const res = await tambahCatatanAction(misi.id, isiCatatan);
      if (res.error) {
        setCatatanError(res.error);
        return;
      }
      setIsiCatatan("");
      setShowCatatanForm(false);
      await muatCatatan();
    });
  }

  function handleHapusCatatan(catatanId: string) {
    setCatatanError(null);
    startCatatanTransition(async () => {
      const res = await hapusCatatanAction(catatanId);
      if (res.error) {
        setCatatanError(res.error);
        return;
      }
      await muatCatatan();
    });
  }

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

      {misiSelesai && (
        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-2 text-[12px] font-extrabold">
            Catatan Analis{catatan ? ` (${catatan.length})` : ""}
          </h3>

          {catatanError && (
            <div className="mb-2 rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
              {catatanError}
            </div>
          )}

          {catatan === null && <div className="text-[11px] text-ink-3">Memuat catatan...</div>}
          {catatan?.length === 0 && (
            <div className="text-[11px] text-ink-3">Belum ada catatan analis untuk Misi ini.</div>
          )}

          {catatan && catatan.length > 0 && (
            <div className="flex flex-col gap-2">
              {catatan.map((c) => (
                <div key={c.id} className="rounded-[8px] border border-border bg-elevated p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[10.5px] text-ink-2">
                      <span className="font-bold text-ink">{c.penulisNama}</span>
                      {" · "}
                      {ROLE_LABELS[c.penulisRole as Role] ?? c.penulisRole}
                      {" · "}
                      <span className="font-mono">{formatWaktuCatatan(c.createdAt)}</span>
                    </div>
                    {c.bisaHapus && (
                      <button
                        type="button"
                        onClick={() => handleHapusCatatan(c.id)}
                        disabled={catatanPending}
                        className="shrink-0 text-[10.5px] font-bold text-ink-3 hover:text-red disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {/* whitespace-pre-line: analis menulis paragraf, dan tanpa ini semua baris
                      barunya rata jadi satu blok yang jauh lebih sulit dibaca. */}
                  <div className="mt-[6px] whitespace-pre-line text-[12.5px] leading-relaxed">{c.isi}</div>
                </div>
              ))}
            </div>
          )}

          {bisaTulisCatatan && !showCatatanForm && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setShowCatatanForm(true)}
              disabled={catatanPending}
            >
              Tambah Catatan
            </Button>
          )}

          {bisaTulisCatatan && showCatatanForm && (
            <div className="mt-2">
              <Textarea
                value={isiCatatan}
                onChange={(e) => setIsiCatatan(e.target.value)}
                placeholder="Temuan, insight, atau tindak lanjut dari Misi ini..."
                maxLength={2000}
                aria-label="Isi catatan analis"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-ink-3">{isiCatatan.length}/2000</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCatatanForm(false);
                      setCatatanError(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={handleTambahCatatan}
                    disabled={catatanPending || isiCatatan.trim().length === 0}
                  >
                    {catatanPending ? "Menyimpan..." : "Simpan Catatan"}
                  </Button>
                </div>
              </div>
            </div>
          )}
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
