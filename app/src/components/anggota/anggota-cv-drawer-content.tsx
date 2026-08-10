"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Mail, AtSign, Link2 } from "lucide-react";
import { Badge, statusSiagaColor, statusSertifikasiColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_SIAGA, type Role, ROLES } from "@/lib/constants";
import { calcUsia, type AnggotaFull } from "@/lib/anggota-data";
import { updateStatusSiagaAction, deactivateAnggotaAction } from "@/lib/anggota-actions";
import { approvePermintaanNikAction, rejectPermintaanNikAction } from "@/lib/permintaan-actions";
import { AvatarPlaceholder } from "./avatar-placeholder";

function PermintaanNikRow({ permintaan }: { permintaan: AnggotaFull["permintaanUbahData"][number] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approvePermintaanNikAction(permintaan.id);
      if (res.error) setError(res.error);
      else setDone(true);
    });
  }
  function handleReject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectPermintaanNikAction(permintaan.id, "Ditolak dari drawer profil anggota.");
      if (res.error) setError(res.error);
      else setDone(true);
    });
  }

  if (done) return <div className="text-[11.5px] text-ink-2">Permintaan telah diproses.</div>;

  return (
    <div className="mb-2 rounded-[6px] border border-border bg-elevated p-2 last:mb-0">
      <div className="text-[11.5px]">
        Ubah <b>NIK</b>: <span className="font-mono">{permintaan.nilaiLama}</span> →{" "}
        <span className="font-mono text-amber">{permintaan.nilaiBaru}</span>
      </div>
      {error && <p className="mt-1 text-[10.5px] text-[#F5A9A5]">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button variant="solid" size="sm" onClick={handleApprove} disabled={pending} className="flex-1">
          Setujui
        </Button>
        <Button variant="danger" size="sm" onClick={handleReject} disabled={pending} className="flex-1">
          Tolak
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="mb-[3px] text-[10px] font-extrabold tracking-wide text-ink-2">{label}</div>
      <div className="text-[13px] font-semibold">{value ?? "—"}</div>
    </div>
  );
}

export function AnggotaCvDrawerContent({
  anggota,
  role,
  onEdit,
  onDeactivated,
}: {
  anggota: AnggotaFull;
  role: Role | undefined;
  onEdit: () => void;
  onDeactivated: () => void;
}) {
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.OPERATOR;
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const usia = calcUsia(anggota.profilDemografi?.tanggalLahir);
  const lokasi = anggota.lokasiHistori[0];
  const kompetensiTags = Array.from(new Set(anggota.sertifikasi.map((s) => s.jenisSertifikasi)));

  function handleStatusChange(status: string) {
    setActionError(null);
    startTransition(async () => {
      const res = await updateStatusSiagaAction(anggota.id, status);
      if (res.error) setActionError(res.error);
    });
  }

  function handleDeactivate() {
    if (!confirm(`Nonaktifkan keanggotaan ${anggota.nama}?`)) return;
    setActionError(null);
    startTransition(async () => {
      const res = await deactivateAnggotaAction(anggota.id);
      if (res.error) setActionError(res.error);
      else onDeactivated();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-[14px] border-b border-border pb-4">
        <AvatarPlaceholder />
        <div>
          <div className="text-[16px] font-extrabold">{anggota.nama}</div>
          <div className="mt-[2px] font-mono text-[11px] text-ink-2">
            {anggota.kodeAnggota} · {anggota.unitAsal}
          </div>
          <div className="mt-[6px] flex items-center gap-2">
            <Badge color={statusSiagaColor(anggota.statusSiaga)}>{anggota.statusSiaga}</Badge>
            <Badge color="green">Readiness {anggota.readinessScore}</Badge>
            {anggota.statusKeanggotaan === "Nonaktif" && <Badge color="gray">Nonaktif</Badge>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {anggota.whatsapp && (
          <a
            href={`https://wa.me/${anggota.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[6px] rounded-[6px] border border-border bg-elevated px-[11px] py-[7px] text-[11px] font-bold hover:border-accent-bright hover:text-accent-bright"
          >
            <MessageCircle className="size-3.5" strokeWidth={1.5} />
            WhatsApp
          </a>
        )}
        {anggota.email && (
          <a
            href={`mailto:${anggota.email}`}
            className="flex items-center gap-[6px] rounded-[6px] border border-border bg-elevated px-[11px] py-[7px] text-[11px] font-bold hover:border-cyan hover:text-cyan"
          >
            <Mail className="size-3.5" strokeWidth={1.5} />
            Email
          </a>
        )}
        {anggota.instagram && (
          <span className="flex items-center gap-[6px] rounded-[6px] border border-border bg-elevated px-[11px] py-[7px] text-[11px] font-bold text-ink-2">
            <AtSign className="size-3.5" strokeWidth={1.5} />
            {anggota.instagram}
          </span>
        )}
        {anggota.linkedin && (
          <span className="flex items-center gap-[6px] rounded-[6px] border border-border bg-elevated px-[11px] py-[7px] text-[11px] font-bold text-ink-2">
            <Link2 className="size-3.5" strokeWidth={1.5} />
            LinkedIn
          </span>
        )}
      </div>

      {canManage && (
        <div className="rounded-[8px] border border-border bg-surface p-3">
          <div className="mb-2 text-[10px] font-extrabold tracking-wide text-ink-2">
            UBAH STATUS KESIAPAN
          </div>
          <div className="flex gap-2">
            {Object.values(STATUS_SIAGA).map((status) => (
              <button
                key={status}
                disabled={pending}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  "flex-1 rounded-[6px] border px-2 py-[7px] text-[11px] font-bold disabled:opacity-50",
                  anggota.statusSiaga === status
                    ? "border-accent-bright bg-accent-bright/15 text-accent-bright"
                    : "border-border bg-elevated text-ink-2 hover:text-ink"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="default" size="sm" onClick={onEdit} className="flex-1">
              Edit Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeactivate}
              disabled={pending || anggota.statusKeanggotaan === "Nonaktif"}
              className="flex-1"
            >
              Nonaktifkan
            </Button>
          </div>
          {actionError && <p className="mt-2 text-[11px] text-[#F5A9A5]">{actionError}</p>}
        </div>
      )}

      {canManage && anggota.permintaanUbahData.length > 0 && (
        <div className="rounded-[8px] border border-amber/40 bg-amber/10 p-3">
          <div className="mb-2 text-[10px] font-extrabold tracking-wide text-amber">
            PERMINTAAN PERUBAHAN DATA (FR-37)
          </div>
          {anggota.permintaanUbahData.map((p) => (
            <PermintaanNikRow key={p.id} permintaan={p} />
          ))}
        </div>
      )}

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-[10px] text-[12px] font-extrabold">Kompetensi & Spesialisasi</h3>
        <div className="flex flex-wrap gap-[6px]">
          {kompetensiTags.length === 0 && <span className="text-[11px] text-ink-3">Belum ada data.</span>}
          {kompetensiTags.map((k) => (
            <span
              key={k}
              className="rounded-full border border-accent-bright/30 bg-accent-bright/10 px-[10px] py-[4px] text-[10.5px] font-bold text-accent-bright"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-3 text-[12px] font-extrabold">Data Pribadi</h3>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Field label="USIA" value={usia != null ? `${usia} tahun` : null} />
          <Field label="JENIS KELAMIN" value={anggota.profilDemografi?.jenisKelamin} />
          <Field label="GOLONGAN DARAH" value={anggota.profilDemografi?.golonganDarah} />
          <Field
            label="BERGABUNG SEJAK"
            value={anggota.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
          />
          <Field label="PENDIDIKAN" value={anggota.profilDemografi?.pendidikan} />
          <Field label="PEKERJAAN SIPIL" value={anggota.profilDemografi?.pekerjaanSipil} />
        </div>
        <div className="flex flex-col gap-3">
          <Field label="NIK" value={<span className="font-mono">{anggota.nik}</span>} />
          <Field label="ALAMAT DOMISILI" value={anggota.profilDemografi?.alamatDomisili} />
          {lokasi && (
            <Field
              label="KOORDINAT TERKINI"
              value={
                <span className="font-mono">
                  {lokasi.latitude.toFixed(4)}, {lokasi.longitude.toFixed(4)}
                </span>
              }
            />
          )}
          <Field label="TELEPON" value={anggota.telepon} />
          <Field label="KONTAK DARURAT" value={anggota.kontakDarurat} />
        </div>
      </div>

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-2 text-[12px] font-extrabold">Sertifikasi</h3>
        {anggota.sertifikasi.length === 0 && (
          <div className="text-[11px] text-ink-3">Belum ada data sertifikasi.</div>
        )}
        {anggota.sertifikasi.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 border-b border-border-soft py-2 last:border-b-0"
          >
            <div>
              <div className="text-[12px] font-semibold">{s.jenisSertifikasi}</div>
              <div className="text-[10.5px] text-ink-2">
                Berlaku s.d. {s.tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <Badge color={statusSertifikasiColor(s.status)}>{s.status}</Badge>
          </div>
        ))}
      </div>

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-2 text-[12px] font-extrabold">Riwayat Pelatihan</h3>
        {anggota.pelatihan.length === 0 && (
          <div className="text-[11px] text-ink-3">Belum ada riwayat pelatihan.</div>
        )}
        {anggota.pelatihan.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 border-b border-border-soft py-2 last:border-b-0"
          >
            <div>
              <div className="text-[12px] font-semibold">{p.namaPelatihan}</div>
              <div className="text-[10.5px] text-ink-2">
                {p.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <Badge color={p.statusKelulusan === "Lulus" ? "green" : "amber"}>{p.statusKelulusan}</Badge>
          </div>
        ))}
      </div>

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-2 text-[12px] font-extrabold">Riwayat Penugasan Terakhir</h3>
        {anggota.penugasan.length === 0 && (
          <div className="text-[11px] text-ink-3">Belum ada riwayat penugasan.</div>
        )}
        {anggota.penugasan.map((p) => (
          <div key={p.id} className="border-b border-border-soft py-2 last:border-b-0">
            <div className="text-[12px] font-semibold">
              {p.misi.kodeMisi} · {p.misi.jenisKejadian}
            </div>
            <div className="text-[10.5px] text-ink-2">
              {p.misi.status}
              {p.misi.hasilEvaluasi ? ` · evaluasi: ${p.misi.hasilEvaluasi}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
