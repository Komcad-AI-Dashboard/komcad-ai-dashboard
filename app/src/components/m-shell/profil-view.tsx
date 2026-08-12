"use client";

import { useState, useTransition } from "react";
import { Phone, Mail, MessageCircle, AtSign, Link2, MapPin } from "lucide-react";
import { calcUsia } from "@/lib/usia";
import { updateProfilSelfAction, updateLokasiSelfAction } from "@/lib/anggota-mobile-actions";
import { AvatarPlaceholder } from "@/components/anggota/avatar-placeholder";
import type { SelfProfil } from "@/lib/anggota-mobile-data";

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-[14px]">
      <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">{label}</label>
      <input
        {...props}
        className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] text-ink placeholder:text-ink-3 focus:border-accent-bright focus:outline-none disabled:opacity-60"
      />
    </div>
  );
}

export function ProfilView({ profil }: { profil: SelfProfil }) {
  const usia = calcUsia(profil.profilDemografi?.tanggalLahir);
  const lokasiTerkini = profil.lokasiHistori[0];
  const nikMenungguAwal = profil.permintaanUbahData.some((p) => p.field === "nik");

  const [form, setForm] = useState({
    nik: nikMenungguAwal ? profil.permintaanUbahData.find((p) => p.field === "nik")!.nilaiBaru : profil.nik,
    golonganDarah: profil.profilDemografi?.golonganDarah ?? "",
    jenisKelamin: profil.profilDemografi?.jenisKelamin ?? "Laki-laki",
    pendidikan: profil.profilDemografi?.pendidikan ?? "",
    pekerjaanSipil: profil.profilDemografi?.pekerjaanSipil ?? "",
    alamatDomisili: profil.profilDemografi?.alamatDomisili ?? "",
    telepon: profil.telepon ?? "",
    email: profil.email ?? "",
    whatsapp: profil.whatsapp ?? "",
    instagram: profil.instagram ?? "",
    linkedin: profil.linkedin ?? "",
    kontakDarurat: profil.kontakDarurat ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [lokasiPending, startLokasiTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nikMenunggu, setNikMenunggu] = useState(nikMenungguAwal);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const res = await updateProfilSelfAction(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setNikMenunggu(res.nikMenunggu);
      setStatus(res.nikMenunggu ? "Profil disimpan. Perubahan NIK menunggu persetujuan Admin." : "✓ Profil berhasil disimpan");
    });
  }

  function handleUpdateLokasi() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Perangkat/browser ini tidak mendukung GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        startLokasiTransition(async () => {
          const res = await updateLokasiSelfAction({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (res.error) setError(res.error);
          else setStatus("✓ Lokasi berhasil diperbarui");
        });
      },
      () => setError("Izin lokasi ditolak — aktifkan GPS/izin lokasi untuk memperbarui.")
    );
  }

  return (
    <>
      <div>
        <div className="text-[15px] font-extrabold">Profil Saya</div>
        <div className="text-[11px] text-ink-2">Lengkapi & perbarui data Anda</div>
      </div>

      <div className="flex items-center gap-[14px]">
        <div className="flex size-[76px] shrink-0 items-center justify-center rounded-[14px] border border-dashed border-border bg-elevated">
          <AvatarPlaceholder />
        </div>
        <div className="text-[10.5px] leading-relaxed text-ink-3">
          Unggah foto profil belum tersedia di rilis ini — foto masih memakai placeholder siluet.
        </div>
      </div>

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Data Pribadi</div>
      <Field label="Nama Lengkap" value={profil.nama} disabled />
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">NIK</label>
          <input
            value={form.nik}
            onChange={(e) => set("nik", e.target.value)}
            maxLength={16}
            className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
          />
          {nikMenunggu && <div className="mt-1 text-[9.5px] text-amber">Menunggu persetujuan Admin</div>}
        </div>
        <div>
          <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Golongan Darah</label>
          <select
            value={form.golonganDarah}
            onChange={(e) => set("golonganDarah", e.target.value)}
            className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
          >
            {["", "O", "A", "B", "AB"].map((g) => (
              <option key={g} value={g}>
                {g || "—"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Jenis Kelamin</label>
          <select
            value={form.jenisKelamin}
            onChange={(e) => set("jenisKelamin", e.target.value)}
            className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
          >
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>
        </div>
        <Field label="Usia" value={usia !== null ? `${usia} tahun` : "—"} disabled />
      </div>
      <Field label="Pendidikan Terakhir" value={form.pendidikan} onChange={(e) => set("pendidikan", e.target.value)} />
      <Field label="Pekerjaan Sipil" value={form.pekerjaanSipil} onChange={(e) => set("pekerjaanSipil", e.target.value)} />
      <Field label="Unit / Satuan Asal" value={profil.unitAsal} disabled />

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Alamat & Lokasi</div>
      <div className="mb-[14px]">
        <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Alamat Domisili</label>
        <textarea
          value={form.alamatDomisili}
          onChange={(e) => set("alamatDomisili", e.target.value)}
          className="min-h-[70px] w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <div className="mb-[14px]">
        <label className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Titik Lokasi Terkini</label>
        <input
          disabled
          value={lokasiTerkini ? `${lokasiTerkini.latitude.toFixed(4)}, ${lokasiTerkini.longitude.toFixed(4)}` : "Belum ada data"}
          className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] opacity-60"
        />
        <button
          type="button"
          onClick={handleUpdateLokasi}
          disabled={lokasiPending}
          className="mt-[6px] flex items-center gap-[6px] text-[10.5px] font-bold text-accent-bright disabled:opacity-50"
        >
          <MapPin className="size-3.5" strokeWidth={1.5} />
          {lokasiPending ? "Mengambil lokasi..." : "Perbarui lokasi dari GPS perangkat"}
        </button>
      </div>

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Kontak & Sosial Media</div>
      <div className="mb-[10px] flex items-center gap-2">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-elevated">
          <Phone className="size-4" strokeWidth={1.5} />
        </div>
        <input
          placeholder="Nomor Telepon"
          value={form.telepon}
          onChange={(e) => set("telepon", e.target.value)}
          className="flex-1 rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <div className="mb-[10px] flex items-center gap-2">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-elevated">
          <Mail className="size-4" strokeWidth={1.5} />
        </div>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="flex-1 rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <div className="mb-[10px] flex items-center gap-2">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-elevated">
          <MessageCircle className="size-4" strokeWidth={1.5} />
        </div>
        <input
          placeholder="Nomor WhatsApp"
          value={form.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)}
          className="flex-1 rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <div className="mb-[10px] flex items-center gap-2">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-elevated">
          <AtSign className="size-4" strokeWidth={1.5} />
        </div>
        <input
          placeholder="Username Instagram"
          value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)}
          className="flex-1 rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <div className="mb-[10px] flex items-center gap-2">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-border bg-elevated">
          <Link2 className="size-4" strokeWidth={1.5} />
        </div>
        <input
          placeholder="Profil LinkedIn"
          value={form.linkedin}
          onChange={(e) => set("linkedin", e.target.value)}
          className="flex-1 rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <Field
        label="Kontak Darurat"
        placeholder="Nama (Hubungan) · Nomor Telepon"
        value={form.kontakDarurat}
        onChange={(e) => set("kontakDarurat", e.target.value)}
      />

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Kompetensi & Spesialisasi</div>
      <div className="flex flex-wrap gap-[6px]">
        {profil.sertifikasi.length === 0 && (
          <span className="text-[11px] text-ink-3">Belum ada sertifikasi tercatat.</span>
        )}
        {[...new Set(profil.sertifikasi.map((s) => s.jenisSertifikasi))].map((k) => (
          <span
            key={k}
            className="rounded-full border border-accent-bright/30 bg-accent-bright/10 px-[11px] py-[5px] text-[11px] font-bold text-accent-bright"
          >
            {k}
          </span>
        ))}
      </div>
      <p className="text-[9.5px] leading-relaxed text-ink-3">
        Kompetensi diturunkan dari Sertifikasi resmi yang tercatat, belum bisa ditambahkan sendiri di sini.
      </p>

      {error && <div className="rounded-[8px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">{error}</div>}
      {status && <div className="rounded-[8px] border border-accent-bright/30 bg-accent-bright/10 px-3 py-2 text-[11.5px] text-accent-bright">{status}</div>}

      <div className="sticky bottom-[var(--mnav-h)] flex gap-[10px] pt-1">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-[10px] border border-border bg-elevated px-[18px] py-[13px] text-[13px] font-bold text-ink-2"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="flex-1 rounded-[10px] bg-accent-bright py-[13px] text-[13px] font-extrabold text-[#00170C] disabled:opacity-50"
        >
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </>
  );
}
