"use client";

import { useId, useState, useTransition } from "react";
import { Phone, Mail, MessageCircle, AtSign, Link2, MapPin, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { calcUsia } from "@/lib/usia";
import { updateProfilSelfAction, updateLokasiSelfAction } from "@/lib/anggota-mobile-actions";
import { AvatarPlaceholder } from "@/components/anggota/avatar-placeholder";
import type { SelfProfil } from "@/lib/anggota-mobile-data";

/** `terkunci` = nilainya datang dari sumber lain dan tidak bisa diketik di sini (temuan QA-08).
 *
 * Penandanya sengaja TIGA lapis dan tidak satu pun mengandalkan warna atau kecerahan saja: ikon
 * gembok, permukaan yang beda (bg-base, bukan bg-elevated), dan `catatan` yang menyebut alasannya.
 * Sebelumnya cuma `disabled:opacity-60` — di latar gelap selisihnya tipis dan di layar dengan
 * brightness rendah field terkunci dan field biasa terbaca sama saja.
 *
 * Dipakai `readOnly`, BUKAN `disabled`: `disabled` mengeluarkan field dari urutan tab sehingga
 * pengguna keyboard & screen reader tidak pernah sampai ke nilainya. Aman karena nilai field
 * terkunci memang tidak pernah ikut dikirim — lihat objek `form` di bawah, tidak ada `nama`,
 * `usia`, maupun `unitAsal` di sana, dan updateProfilSelfAction juga tidak menulis ketiganya. */
function Field({
  label,
  terkunci,
  catatan,
  aksi,
  ...props
}: {
  label: string;
  terkunci?: boolean;
  catatan?: string;
  /** Kontrol yang mengubah nilai lewat jalur lain, mis. tombol GPS di Titik Lokasi Terkini. */
  aksi?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <div className="mb-[14px]">
      <label
        htmlFor={id}
        className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          readOnly={terkunci || props.readOnly}
          aria-readonly={terkunci || undefined}
          className={cn(
            "w-full rounded-[8px] border px-3 py-[11px] text-[13px] placeholder:text-ink-3 focus:outline-none disabled:opacity-60",
            terkunci
              ? "cursor-default border-border-soft bg-base pr-9 text-ink-2 focus:border-border"
              : "border-border bg-elevated text-ink focus:border-accent-bright"
          )}
        />
        {terkunci && (
          <Lock
            aria-hidden
            strokeWidth={1.5}
            className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3"
          />
        )}
      </div>
      {catatan && <div className="mt-1 text-[9.5px] text-ink-3">{catatan}</div>}
      {aksi}
    </div>
  );
}

export function ProfilView({ profil }: { profil: SelfProfil }) {
  const usia = calcUsia(profil.profilDemografi?.tanggalLahir);
  const lokasiTerkini = profil.lokasiHistori[0];
  const nikMenungguAwal = profil.permintaanUbahData.some((p) => p.field === "nik");
  // Empat kontrol di bawah ini digambar manual (bukan lewat <Field>) karena bentuknya select/
  // textarea atau punya hint sendiri. Label-nya sempat tidak menunjuk ke input mana pun, jadi
  // tidak terbaca screen reader dan klik label tidak memfokuskan field-nya.
  const uid = useId();

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
      setStatus(res.nikMenunggu ? "Profil disimpan. Perubahan NIK menunggu persetujuan Admin." : "Profil berhasil disimpan.");
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
          else setStatus("Lokasi berhasil diperbarui.");
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
      <Field label="Nama Lengkap" value={profil.nama} terkunci catatan="Diatur oleh satuan." />
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label htmlFor={`${uid}-nik`} className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">NIK</label>
          <input
            id={`${uid}-nik`}
            value={form.nik}
            onChange={(e) => set("nik", e.target.value)}
            maxLength={16}
            className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
          />
          {nikMenunggu && <div className="mt-1 text-[9.5px] text-amber">Menunggu persetujuan Admin</div>}
        </div>
        <div>
          <label htmlFor={`${uid}-goldar`} className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Golongan Darah</label>
          <select
            id={`${uid}-goldar`}
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
          <label htmlFor={`${uid}-jk`} className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Jenis Kelamin</label>
          <select
            id={`${uid}-jk`}
            value={form.jenisKelamin}
            onChange={(e) => set("jenisKelamin", e.target.value)}
            className="w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
          >
            <option>Laki-laki</option>
            <option>Perempuan</option>
          </select>
        </div>
        <Field
          label="Usia"
          value={usia !== null ? `${usia} tahun` : "—"}
          terkunci
          catatan="Dihitung dari tanggal lahir."
        />
      </div>
      <Field label="Pendidikan Terakhir" value={form.pendidikan} onChange={(e) => set("pendidikan", e.target.value)} />
      <Field label="Pekerjaan Sipil" value={form.pekerjaanSipil} onChange={(e) => set("pekerjaanSipil", e.target.value)} />
      <Field label="Unit / Satuan Asal" value={profil.unitAsal} terkunci catatan="Diatur oleh satuan." />

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Alamat & Lokasi</div>
      <div className="mb-[14px]">
        <label htmlFor={`${uid}-alamat`} className="mb-[6px] block text-[10px] font-extrabold uppercase tracking-wide text-ink-2">Alamat Domisili</label>
        <textarea
          id={`${uid}-alamat`}
          value={form.alamatDomisili}
          onChange={(e) => set("alamatDomisili", e.target.value)}
          className="min-h-[70px] w-full rounded-[8px] border border-border bg-elevated px-3 py-[11px] text-[13px] focus:border-accent-bright focus:outline-none"
        />
      </div>
      <Field
        label="Titik Lokasi Terkini"
        value={lokasiTerkini ? `${lokasiTerkini.latitude.toFixed(4)}, ${lokasiTerkini.longitude.toFixed(4)}` : "Belum ada data"}
        terkunci
        catatan="Tidak bisa diketik manual."
        aksi={
          <button
            type="button"
            onClick={handleUpdateLokasi}
            disabled={lokasiPending}
            className="mt-[6px] flex items-center gap-[6px] text-[10.5px] font-bold text-accent-bright disabled:opacity-50"
          >
            <MapPin className="size-3.5" strokeWidth={1.5} />
            {lokasiPending ? "Mengambil lokasi..." : "Perbarui lokasi dari GPS perangkat"}
          </button>
        }
      />

      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-3">Kontak & Sosial Media</div>
      {/* Grid 2 kolom cuma di desktop (xl:) — di HP tetap tumpuk 1 kolom seperti semula, tiap
          baris tetap pakai mb-[10px]-nya sendiri di situ (xl:mb-0 batalin biar gak dobel sama gap grid). */}
      <div className="xl:grid xl:grid-cols-2 xl:gap-[10px]">
        <div className="mb-[10px] flex items-center gap-2 xl:mb-0">
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
        <div className="mb-[10px] flex items-center gap-2 xl:mb-0">
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
        <div className="mb-[10px] flex items-center gap-2 xl:mb-0">
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
        <div className="mb-[10px] flex items-center gap-2 xl:mb-0">
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
        <div className="mb-[10px] flex items-center gap-2 xl:mb-0">
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

      {/* Pesan hasil simpan ikut di dalam bilah sticky, bukan di aliran normal di atasnya.
          Sebelumnya pesannya tergambar di posisi dokumen paling bawah sementara tombol Simpan
          ikut menempel di layar, jadi setelah menekan Simpan dari tengah halaman Anggota tidak
          melihat konfirmasi apa pun sampai dia menggulir ke bawah.

          Bilahnya sekarang berlatar dan melebar sampai tepi (`-mx-4`/`xl:-mx-8` menetralkan
          padding <main> di member-shell.tsx), supaya isi halaman tidak terbaca menembus tombol. */}
      <div className="sticky bottom-[var(--mnav-h)] z-10 -mx-4 flex flex-col gap-[10px] border-t border-border bg-base/95 px-4 py-3 backdrop-blur-sm xl:-mx-8 xl:bottom-0 xl:px-8">
        {error && (
          <div role="alert" className="rounded-[8px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
            {error}
          </div>
        )}
        {status && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-[8px] border border-accent-bright/30 bg-accent-bright/10 px-3 py-2 text-[11.5px] text-accent-bright"
          >
            {/* Ikon dari lucide, bukan karakter centang di dalam string: CLAUDE.md melarang emoji
                di mana pun yang dilihat pengguna, dan ikon ikut ukuran & warna teksnya. */}
            <Check aria-hidden className="mt-[1px] size-[14px] shrink-0" strokeWidth={2} />
            <span>{status}</span>
          </div>
        )}

        <div className="flex gap-[10px]">
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
      </div>
    </>
  );
}
