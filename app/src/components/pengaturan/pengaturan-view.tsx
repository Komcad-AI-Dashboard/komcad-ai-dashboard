"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { PengaturanSistem } from "@/lib/pengaturan-data";
import { updatePreferensiAction, updateParameterAiAction } from "@/lib/pengaturan-actions";

function SettingsRow({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-soft py-3 last:border-b-0">
      <div>
        <div className="text-[12px] font-semibold">{title}</div>
        <div className="mt-[2px] text-[10.5px] text-ink-2">{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

export function PengaturanView({ pengaturan }: { pengaturan: PengaturanSistem }) {
  const [pref, setPref] = useState({
    notifMisiBaru: pengaturan.notifMisiBaru,
    reminderSertifikasi: pengaturan.reminderSertifikasi,
    fallbackSms: pengaturan.fallbackSms,
    petaHeatzone: pengaturan.petaHeatzone,
    petaAutoRefresh: pengaturan.petaAutoRefresh,
  });
  const [ai, setAi] = useState({
    aiRadiusKm: pengaturan.aiRadiusKm,
    aiBobotReadiness: pengaturan.aiBobotReadiness,
    aiBobotJarak: pengaturan.aiBobotJarak,
    aiBobotKompetensi: pengaturan.aiBobotKompetensi,
  });
  const [prefPending, startPrefTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();
  const [prefStatus, setPrefStatus] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  function savePref() {
    setPrefStatus(null);
    startPrefTransition(async () => {
      const res = await updatePreferensiAction(pref);
      setPrefStatus(res.error ?? "Preferensi tersimpan.");
    });
  }

  function saveAi() {
    setAiStatus(null);
    startAiTransition(async () => {
      const res = await updateParameterAiAction(ai);
      setAiStatus(res.error ?? "Parameter Model tersimpan — langsung berlaku untuk Misi berikutnya.");
    });
  }

  const totalBobot = ai.aiBobotReadiness + ai.aiBobotJarak + ai.aiBobotKompetensi;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-1 text-[12px] font-extrabold">Notifikasi</h3>
          <SettingsRow
            title="Notifikasi Misi baru"
            desc="Kirim Notifikasi ke kandidat terpilih saat Misi disetujui (Setujui & Kirim Notifikasi)"
            checked={pref.notifMisiBaru}
            onChange={(v) => setPref((p) => ({ ...p, notifMisiBaru: v }))}
          />
          <SettingsRow
            title="Reminder sertifikasi kedaluwarsa"
            desc='H-30 sebelum masa berlaku habis — saat ini terwakili lewat status "Akan Kedaluwarsa" otomatis di UI, belum ada notifikasi terpisah yang dikirim'
            checked={pref.reminderSertifikasi}
            onChange={(v) => setPref((p) => ({ ...p, reminderSertifikasi: v }))}
          />
          <SettingsRow
            title="Fallback SMS"
            desc="Kirim SMS jika notifikasi push gagal — belum ada integrasi SMS produksi, preferensi ini belum berpengaruh ke sistem"
            checked={pref.fallbackSms}
            onChange={(v) => setPref((p) => ({ ...p, fallbackSms: v }))}
          />
        </div>

        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-1 text-[12px] font-extrabold">Preferensi Peta</h3>
          <SettingsRow
            title="Tampilkan kepadatan wilayah otomatis"
            desc="Heat-zone aktif saat zoom keluar — layer ini belum diimplementasikan di peta, preferensi belum berpengaruh"
            checked={pref.petaHeatzone}
            onChange={(v) => setPref((p) => ({ ...p, petaHeatzone: v }))}
          />
          <SettingsRow
            title="Auto-refresh data peta"
            desc="Setiap 15 detik — menu Overview akan me-refresh data server secara berkala selagi halaman dibuka"
            checked={pref.petaAutoRefresh}
            onChange={(v) => setPref((p) => ({ ...p, petaAutoRefresh: v }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="solid" size="sm" onClick={savePref} disabled={prefPending}>
            {prefPending ? "Menyimpan..." : "Simpan Preferensi"}
          </Button>
          {prefStatus && <span className="text-[11.5px] text-ink-2">{prefStatus}</span>}
        </div>

        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-1 text-[12px] font-extrabold">Parameter Model AI Mobilization</h3>
          <p className="mb-3 text-[11px] text-ink-3">
            Mengatur nilai ini langsung berlaku untuk Misi berikutnya yang dibuat lewat tombol BUAT MISI — dipakai
            baik oleh formula fallback deterministik maupun sebagai panduan bobot ke OpenAI (FR-09 s.d. FR-11).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="aiRadiusKm">Radius pencarian default (km)</Label>
              <Input
                id="aiRadiusKm"
                type="number"
                min={1}
                max={1000}
                value={ai.aiRadiusKm}
                onChange={(e) => setAi((a) => ({ ...a, aiRadiusKm: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="aiBobotReadiness">Bobot Readiness Score (%)</Label>
              <Input
                id="aiBobotReadiness"
                type="number"
                min={0}
                max={100}
                value={ai.aiBobotReadiness}
                onChange={(e) => setAi((a) => ({ ...a, aiBobotReadiness: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="aiBobotJarak">Bobot jarak/ETA (%)</Label>
              <Input
                id="aiBobotJarak"
                type="number"
                min={0}
                max={100}
                value={ai.aiBobotJarak}
                onChange={(e) => setAi((a) => ({ ...a, aiBobotJarak: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="aiBobotKompetensi">Bobot kompetensi/sertifikasi (%)</Label>
              <Input
                id="aiBobotKompetensi"
                type="number"
                min={0}
                max={100}
                value={ai.aiBobotKompetensi}
                onChange={(e) => setAi((a) => ({ ...a, aiBobotKompetensi: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className={`mt-2 text-[11px] ${totalBobot === 100 ? "text-ink-3" : "text-amber"}`}>
            Total bobot saat ini: {totalBobot}% {totalBobot !== 100 && "— harus tepat 100% sebelum disimpan"}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <Button variant="solid" size="sm" onClick={saveAi} disabled={aiPending || totalBobot !== 100}>
              {aiPending ? "Menyimpan..." : "Simpan Parameter Model"}
            </Button>
            {aiStatus && <span className="text-[11.5px] text-ink-2">{aiStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
