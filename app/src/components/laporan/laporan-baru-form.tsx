"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Label, Select, Input } from "@/components/ui/input";

type Tipe = "wilayah" | "misi" | "periode";

export function LaporanBaruForm({
  provinsiOptions,
  misiOptions,
}: {
  provinsiOptions: string[];
  misiOptions: { id: string; label: string }[];
}) {
  const [tipe, setTipe] = useState<Tipe>("wilayah");
  const [provinsi, setProvinsi] = useState(provinsiOptions[0] ?? "");
  const [misiId, setMisiId] = useState(misiOptions[0]?.id ?? "");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Navigasi penuh browser (bukan router.push) SENGAJA dipakai di sini: target adalah Route
  // Handler yang mengembalikan file (Content-Disposition: attachment), bukan halaman RSC — cuma
  // navigasi native yang memicu dialog unduh file.
  function handleSusun() {
    setError(null);
    if (tipe === "wilayah") {
      if (!provinsi) return setError("Pilih provinsi terlebih dahulu.");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/api/laporan/custom?tipe=wilayah&provinsi=${encodeURIComponent(provinsi)}`;
    } else if (tipe === "misi") {
      if (!misiId) return setError("Pilih Misi terlebih dahulu.");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/api/laporan/custom?tipe=misi&misiId=${encodeURIComponent(misiId)}`;
    } else {
      if (!dari || !sampai) return setError("Isi rentang tanggal Dari dan Sampai.");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/api/laporan/custom?tipe=periode&dari=${dari}&sampai=${sampai}`;
    }
  }

  return (
    <div className="rounded-[8px] border border-border bg-surface p-[14px]">
      <h3 className="mb-3 text-[12px] font-extrabold">Buat Laporan Baru</h3>
      <div className="mb-3 flex gap-[6px]">
        <Chip active={tipe === "wilayah"} onClick={() => setTipe("wilayah")}>
          Per Wilayah
        </Chip>
        <Chip active={tipe === "misi"} onClick={() => setTipe("misi")}>
          Per Misi
        </Chip>
        <Chip active={tipe === "periode"} onClick={() => setTipe("periode")}>
          Per Periode
        </Chip>
      </div>

      {tipe === "wilayah" && (
        <div className="max-w-[320px]">
          <Label htmlFor="provinsi">Provinsi</Label>
          <Select id="provinsi" value={provinsi} onChange={(e) => setProvinsi(e.target.value)}>
            {provinsiOptions.length === 0 && <option value="">Belum ada data provinsi</option>}
            {provinsiOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      )}

      {tipe === "misi" && (
        <div className="max-w-[420px]">
          <Label htmlFor="misi">Misi</Label>
          <Select id="misi" value={misiId} onChange={(e) => setMisiId(e.target.value)}>
            {misiOptions.length === 0 && <option value="">Belum ada Misi</option>}
            {misiOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {tipe === "periode" && (
        <div className="flex max-w-[420px] gap-3">
          <div className="flex-1">
            <Label htmlFor="dari">Dari</Label>
            <Input id="dari" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label htmlFor="sampai">Sampai</Label>
            <Input id="sampai" type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </div>
        </div>
      )}

      {error && <div className="mt-2 text-[11.5px] text-[#F5A9A5]">{error}</div>}

      <Button type="button" variant="outline" size="sm" onClick={handleSusun} className="mt-3">
        ＋ Susun Laporan
      </Button>
    </div>
  );
}
