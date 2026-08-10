"use client";

import { useState, useTransition } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { JENIS_KEJADIAN_OPTIONS, URGENSI_MISI } from "@/lib/constants";
import { LOKASI_REFERENSI } from "@/lib/wilayah";
import { generateMisiAction, approveMisiAction, type GenerateMisiResult } from "@/lib/misi-actions";

type Step = "form" | "loading" | "result" | "done";

const initialForm = {
  pemberiPerintah: "",
  jenisKejadian: JENIS_KEJADIAN_OPTIONS[0] as string,
  urgensi: URGENSI_MISI.KRITIS as string,
  lokasiKey: LOKASI_REFERENSI[0].key as string,
  deskripsiMisi: "",
  kebutuhanPersonel: 5,
};

export function BuatMisiModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<Extract<GenerateMisiResult, { error: null }> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jumlahDinotifikasi, setJumlahDinotifikasi] = useState(0);
  const [pending, startTransition] = useTransition();

  function reset() {
    setStep("form");
    setForm(initialForm);
    setResult(null);
    setErrorMsg(null);
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setStep("loading");
    startTransition(async () => {
      const res = await generateMisiAction(form);
      if (res.error !== null) {
        setErrorMsg(res.error);
        setStep("form");
        return;
      }
      setResult(res);
      setStep("result");
      setErrorMsg(null);
    });
  }

  function handleApprove() {
    if (!result) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await approveMisiAction(result.misiId);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      setJumlahDinotifikasi(res.jumlahDinotifikasi);
      setStep("done");
    });
  }

  const lokasiLabel = LOKASI_REFERENSI.find((l) => l.key === form.lokasiKey)?.label ?? "";

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={
        step === "form"
          ? "Buat Misi Baru"
          : step === "loading"
            ? "AI Mobilization Menganalisis"
            : step === "result"
              ? "Rekomendasi AI Mobilization Siap"
              : "Misi Berhasil Dibuat"
      }
      description={step === "form" ? "AI Mobilization akan menyusun rekomendasi personel setelah formulir disubmit." : undefined}
      className="max-w-[620px]"
    >
      {step === "form" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="pemberiPerintah">Pemberi Perintah</Label>
            <Input
              id="pemberiPerintah"
              placeholder="mis. Kolonel Arif Nugroho — Danrem 062/Tarumanagara"
              value={form.pemberiPerintah}
              onChange={(e) => setForm((f) => ({ ...f, pemberiPerintah: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="jenisKejadian">Jenis Kejadian</Label>
              <Select
                id="jenisKejadian"
                value={form.jenisKejadian}
                onChange={(e) => setForm((f) => ({ ...f, jenisKejadian: e.target.value as typeof f.jenisKejadian }))}
              >
                {JENIS_KEJADIAN_OPTIONS.map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="urgensi">Urgensi</Label>
              <Select
                id="urgensi"
                value={form.urgensi}
                onChange={(e) => setForm((f) => ({ ...f, urgensi: e.target.value }))}
              >
                {Object.values(URGENSI_MISI).map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lokasiKey">Lokasi</Label>
              <Select
                id="lokasiKey"
                value={form.lokasiKey}
                onChange={(e) => setForm((f) => ({ ...f, lokasiKey: e.target.value }))}
              >
                {LOKASI_REFERENSI.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="kebutuhanPersonel">Kebutuhan Personel</Label>
              <Input
                id="kebutuhanPersonel"
                type="number"
                min={1}
                max={50}
                value={form.kebutuhanPersonel}
                onChange={(e) => setForm((f) => ({ ...f, kebutuhanPersonel: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="deskripsiMisi">Deskripsi Misi</Label>
            <Textarea
              id="deskripsiMisi"
              placeholder="Jelaskan situasi, kebutuhan personel, dan target operasi..."
              value={form.deskripsiMisi}
              onChange={(e) => setForm((f) => ({ ...f, deskripsiMisi: e.target.value }))}
            />
          </div>

          {errorMsg && (
            <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
              {errorMsg}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
              Batal
            </Button>
            <Button type="submit" variant="outline" disabled={pending}>
              <Sparkles className="size-3.5" strokeWidth={1.5} />
              Generate Rekomendasi AI
            </Button>
          </div>
        </form>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="size-10 animate-spin rounded-full border-2 border-accent-bright border-t-transparent" />
          <p className="max-w-[380px] text-[13px] text-ink-2">
            AI Mobilization sedang menganalisis Big Data anggota berdasarkan lokasi ({lokasiLabel}), kompetensi, dan
            Readiness Score...
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div className="flex flex-col gap-4">
          <div className="text-[11.5px] font-mono text-ink-2">
            {result.kodeMisi} · {form.jenisKejadian} — {lokasiLabel} · Urgensi {form.urgensi}
          </div>
          <div className="rounded-[8px] border border-accent-bright/30 bg-accent-bright/5 p-3 text-[12.5px] leading-relaxed">
            <b className="text-accent-bright">◈ Ringkasan AI</b>
            {result.sumber === "fallback" && (
              <span className="ml-2 rounded-full border border-amber/40 bg-amber/10 px-2 py-[1px] text-[10px] font-bold text-amber">
                mode fallback
              </span>
            )}
            <div className="mt-1">{result.ringkasanAI}</div>
          </div>

          <div className="flex flex-col gap-2">
            {result.kandidat.length === 0 && (
              <div className="text-[12px] text-ink-3">Tidak ada kandidat yang cocok ditemukan.</div>
            )}
            {result.kandidat.map((k) => (
              <div key={k.anggotaId} className="rounded-[8px] border border-border bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12.5px] font-bold">
                    {k.kodeAnggota} · {k.nama}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-3">ETA {k.etaMenit} mnt</span>
                    <span className="rounded-full bg-accent-bright/15 px-2 py-[2px] font-mono text-[11px] font-bold text-accent-bright">
                      {k.skor}
                    </span>
                  </div>
                </div>
                <ul className="mt-1 list-disc pl-4 text-[11px] text-ink-2">
                  {k.alasan.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
              Tutup
            </Button>
            <Button type="button" variant="outline" onClick={handleApprove} disabled={pending}>
              {pending ? "Memproses..." : "Setujui & Kirim Notifikasi ✓"}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="size-9 text-accent-bright" strokeWidth={1.5} />
          <p className="text-[13px]">
            <b>{result.kodeMisi} berhasil dibuat.</b>
            <br />
            {jumlahDinotifikasi > 0
              ? `Notifikasi mobilisasi telah dikirim ke ${jumlahDinotifikasi} kandidat terpilih.`
              : "Notifikasi Misi baru sedang dinonaktifkan di menu Pengaturan — tidak ada notifikasi terkirim."}
          </p>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Selesai
          </Button>
        </div>
      )}
    </Modal>
  );
}
