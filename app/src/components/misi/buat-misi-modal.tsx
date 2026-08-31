"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles, CheckCircle2, Search, MapPin } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { JENIS_KEJADIAN_OPTIONS, JENIS_KEJADIAN_KOMPETENSI, URGENSI_MISI } from "@/lib/constants";
import { LOKASI_REFERENSI } from "@/lib/wilayah";
import { cn } from "@/lib/utils";
import {
  generateMisiAction,
  approveMisiAction,
  geocodeLokasiAction,
  suggestLokasiAction,
  type GenerateMisiResult,
} from "@/lib/misi-actions";
import type { GeocodeResult } from "@/lib/geocoding";

type Step = "form" | "loading" | "result" | "done";
type Lokasi = { label: string; lat: number; lng: number };

/** Lebih longgar dari GlobalSearchModal (250ms / 2 karakter) karena ini memukul layanan pihak
 * ketiga, bukan database sendiri — tiap request yang tidak jadi dipakai itu beban ke instance
 * publik Photon yang kita numpang gratis. */
const SUGGEST_DEBOUNCE_MS = 300;
const SUGGEST_MIN_CHARS = 3;

const initialForm = {
  pemberiPerintah: "",
  jenisKejadian: JENIS_KEJADIAN_OPTIONS[0] as string,
  urgensi: URGENSI_MISI.KRITIS as string,
  deskripsiMisi: "",
  kebutuhanPersonel: 5,
};

export function BuatMisiModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState(initialForm);
  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [alamatQuery, setAlamatQuery] = useState("");
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [geocodePending, startGeocodeTransition] = useTransition();
  const [saran, setSaran] = useState<GeocodeResult[]>([]);
  const [saranAktif, setSaranAktif] = useState(-1);
  const [saranPending, startSaranTransition] = useTransition();
  /** Menahan permintaan saran tepat setelah sebuah lokasi dipilih. Memilih saran mengisi input
   * dengan label lokasi, dan tanpa penahan ini perubahan itu langsung memicu pencarian baru —
   * daftarnya terbuka lagi sendiri padahal operator sudah selesai memilih. */
  const lewatiSaranBerikutnya = useRef(false);
  const [result, setResult] = useState<Extract<GenerateMisiResult, { error: null }> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jumlahDinotifikasi, setJumlahDinotifikasi] = useState(0);
  const [pending, startTransition] = useTransition();

  // Saran ketik. Pola sama dengan GlobalSearchModal: timeout + cleanup, useTransition untuk
  // status menunggu. Cleanup-nya yang bikin ini debounce sungguhan — tiap ketikan membatalkan
  // timer sebelumnya, jadi yang terkirim cuma satu request per jeda mengetik.
  useEffect(() => {
    if (lewatiSaranBerikutnya.current) {
      lewatiSaranBerikutnya.current = false;
      return;
    }
    const q = alamatQuery.trim();
    // Kueri terlalu pendek: cukup tidak mengambil apa-apa. Membersihkan state di sini melanggar
    // react-hooks/set-state-in-effect, dan tidak perlu — daftarnya sudah dijaga saat render lewat
    // saranTampil, jadi sisa hasil lama tidak mungkin ikut tampil.
    if (q.length < SUGGEST_MIN_CHARS) return;
    const timeout = setTimeout(() => {
      startSaranTransition(async () => {
        const res = await suggestLokasiAction(q);
        setSaran(res.results);
        setSaranAktif(-1);
      });
    }, SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [alamatQuery]);

  /** Daftar saran dijaga di sini, bukan dibersihkan di dalam useEffect — supaya hasil lama tidak
   * pernah tampil untuk kueri yang sudah dipendekkan lagi oleh operator. */
  const saranTampil = alamatQuery.trim().length >= SUGGEST_MIN_CHARS && saran.length > 0;

  function pilihLokasi(l: GeocodeResult) {
    lewatiSaranBerikutnya.current = true;
    setLokasi({ label: l.label, lat: l.lat, lng: l.lng });
    setAlamatQuery(l.label);
    setSaran([]);
    setSaranAktif(-1);
    setGeocodeError(null);
  }

  function reset() {
    setStep("form");
    setForm(initialForm);
    setLokasi(null);
    setAlamatQuery("");
    setGeocodeError(null);
    setSaran([]);
    setSaranAktif(-1);
    setResult(null);
    setErrorMsg(null);
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  /** Tombol "Cari Lokasi" — jalur eksplisit lewat Nominatim, disimpan sebagai jalan keluar kalau
   * saran ketik meleset atau layanannya mati. Hasilnya masuk ke daftar yang sama, bukan langsung
   * dipakai: nama tempat di Indonesia banyak yang kembar, jadi memilih tetap tugas operator. */
  function handleCariLokasi() {
    setGeocodeError(null);
    startGeocodeTransition(async () => {
      const res = await geocodeLokasiAction(alamatQuery);
      if (res.error) {
        setSaran([]);
        setGeocodeError(res.error);
        return;
      }
      setSaran(res.results);
      setSaranAktif(-1);
    });
  }

  function handleLokasiKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && saran.length > 0) {
      e.preventDefault();
      setSaranAktif((i) => (i + 1) % saran.length);
      return;
    }
    if (e.key === "ArrowUp" && saran.length > 0) {
      e.preventDefault();
      setSaranAktif((i) => (i <= 0 ? saran.length - 1 : i - 1));
      return;
    }
    if (e.key === "Escape" && saran.length > 0) {
      e.preventDefault();
      setSaran([]);
      setSaranAktif(-1);
      return;
    }
    if (e.key === "Enter") {
      // preventDefault WAJIB tetap ada: input ini di dalam <form>, jadi Enter tanpa penahan
      // akan men-submit form sebelum lokasi sempat ditentukan.
      e.preventDefault();
      if (saranAktif >= 0 && saran[saranAktif]) pilihLokasi(saran[saranAktif]);
      else handleCariLokasi();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lokasi) {
      setErrorMsg("Tentukan Lokasi Misi dulu — cari alamat atau pilih dari Lokasi Referensi.");
      return;
    }
    setErrorMsg(null);
    setStep("loading");
    startTransition(async () => {
      const res = await generateMisiAction({
        ...form,
        lokasiLabel: lokasi.label,
        lokasiLat: lokasi.lat,
        lokasiLng: lokasi.lng,
      });
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
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
              {(() => {
                const kompetensi =
                  JENIS_KEJADIAN_KOMPETENSI[form.jenisKejadian as keyof typeof JENIS_KEJADIAN_KOMPETENSI] ?? [];
                if (kompetensi.length === 0) return null;
                return (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="text-[10.5px] text-ink-3">Kompetensi dibutuhkan:</span>
                    {kompetensi.map((k) => (
                      <span
                        key={k}
                        className="rounded-full border border-cyan/30 bg-cyan/10 px-2 py-[1px] text-[10px] font-medium text-cyan"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                );
              })()}
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
          <div>
            <Label htmlFor="alamatQuery">Lokasi Misi</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="alamatQuery"
                  placeholder="mis. Kecamatan Baleendah, Kabupaten Bandung"
                  value={alamatQuery}
                  onChange={(e) => setAlamatQuery(e.target.value)}
                  onKeyDown={handleLokasiKeyDown}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={saranTampil}
                  aria-controls="saran-lokasi"
                  aria-activedescendant={saranAktif >= 0 ? `saran-lokasi-${saranAktif}` : undefined}
                />
                {saranTampil && (
                  <ul
                    id="saran-lokasi"
                    role="listbox"
                    aria-label="Saran lokasi"
                    className="absolute z-20 mt-1 max-h-[220px] w-full overflow-y-auto rounded-[8px] border border-border bg-elevated py-1 shadow-[0_12px_40px_rgba(0,0,0,0.85)]"
                  >
                    {saran.map((s, i) => (
                      <li key={s.key} id={`saran-lokasi-${i}`} role="option" aria-selected={i === saranAktif}>
                        <button
                          type="button"
                          // onMouseDown, bukan onClick: blur input mendahului click dan bisa
                          // menutup daftar sebelum pilihannya terdaftar.
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pilihLokasi(s);
                          }}
                          onMouseEnter={() => setSaranAktif(i)}
                          className={cn(
                            "flex w-full items-start gap-[7px] px-[10px] py-[7px] text-left text-[11.5px] text-ink-2",
                            i === saranAktif && "bg-surface-hover text-ink"
                          )}
                        >
                          <MapPin className="mt-[2px] size-3 shrink-0 text-ink-3" strokeWidth={1.5} />
                          <span>{s.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCariLokasi}
                disabled={geocodePending}
                className="shrink-0 whitespace-nowrap"
              >
                <Search className="size-3.5" strokeWidth={1.5} />
                {geocodePending ? "Mencari..." : "Cari Lokasi"}
              </Button>
            </div>
            {saranPending && <p className="mt-1 px-1 text-[10.5px] text-ink-3">Mencari lokasi...</p>}
            {geocodeError && <p className="mt-1 text-[11px] text-[#F5A9A5]">{geocodeError}</p>}
            {/* Readout berlabel, BUKAN kartu berbingkai. Versi lama memakai gaya yang sama dengan
                panel ringkasan AI di bawah (border + bg accent) — di sana artinya "permukaan
                konfirmasi", tapi di sini, tepat di bawah tombol Cari Lokasi, bentuk itu terbaca
                sebagai hasil pencarian yang harus dipilih, lalu tidak merespons klik (temuan
                QA-02). Lokasinya memang sudah ter-set; yang menyesatkan cuma gayanya.
                Pola yang diikuti sama dengan pill "Nasional" di Fase 17: kalau elemen bukan
                tombol, ia harus terlihat bukan tombol dan menyebut dirinya apa. */}
            {lokasi && (
              <div className="mt-2 flex items-start gap-[8px] px-1 text-[11.5px]">
                <span className="mt-[2px] shrink-0 text-[9px] font-black tracking-[0.16em] text-ink-3">
                  TERPILIH
                </span>
                <MapPin className="mt-[1px] size-3.5 shrink-0 text-accent-bright" strokeWidth={1.5} />
                <span className="text-ink-2">
                  {lokasi.label}
                  <span className="ml-2 whitespace-nowrap font-mono text-[10.5px] text-ink-3">
                    {lokasi.lat.toFixed(4)}, {lokasi.lng.toFixed(4)}
                  </span>
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10.5px] text-ink-3">atau pilih dari Lokasi Referensi:</span>
              <Select
                className="max-w-[220px]"
                value=""
                onChange={(e) => {
                  const l = LOKASI_REFERENSI.find((r) => r.key === e.target.value);
                  if (l) {
                    lewatiSaranBerikutnya.current = true;
                    setLokasi({ label: l.label, lat: l.lat, lng: l.lng });
                    setAlamatQuery("");
                    setSaran([]);
                    setSaranAktif(-1);
                    setGeocodeError(null);
                  }
                }}
              >
                <option value="" disabled>
                  Pilih kota referensi...
                </option>
                {LOKASI_REFERENSI.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
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
            <Button type="submit" variant="outline" disabled={pending || !lokasi}>
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
            AI Mobilization sedang menganalisis Big Data anggota berdasarkan lokasi ({lokasi?.label}), kompetensi, dan
            Readiness Score...
          </p>
        </div>
      )}

      {step === "result" && result && (
        <div className="flex flex-col gap-4">
          <div className="text-[11.5px] font-mono text-ink-2">
            {result.kodeMisi} · {form.jenisKejadian} — {lokasi?.label} · Urgensi {form.urgensi}
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
