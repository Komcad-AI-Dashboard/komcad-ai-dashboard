"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_KEHADIRAN, STATUS_MISI } from "@/lib/constants";
import { Badge, statusKehadiranColor, statusSertifikasiColor, type BadgeColor } from "@/components/ui/badge";
import type { SelfProfil } from "@/lib/anggota-mobile-data";

type Tab = "pelatihan" | "penugasan" | "sertifikasi";
const TABS: { key: Tab; label: string }[] = [
  { key: "pelatihan", label: "Pelatihan" },
  { key: "penugasan", label: "Penugasan" },
  { key: "sertifikasi", label: "Sertifikasi" },
];

// Pelatihan tidak punya konstanta status sendiri seperti Sertifikasi/Kehadiran (schema.prisma
// menyimpannya sebagai String bebas dengan default "Lulus"), jadi pemetaannya lokal di sini.
function statusKelulusanColor(status: string): BadgeColor {
  if (status === "Lulus") return "green";
  if (status === "Sedang Berjalan") return "amber";
  return "gray";
}

const HEADING = "text-[10px] font-extrabold uppercase tracking-wide text-ink-3";
const KOSONG = "text-[11.5px] text-ink-3";

function KartuPenugasan({ p }: { p: SelfProfil["penugasan"][number] }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-3">
      <div className="mb-1 text-[12px] font-bold">
        {p.misi.kodeMisi} · {p.misi.jenisKejadian}
      </div>
      <div className="flex items-center justify-between gap-2 text-[10.5px] text-ink-2">
        <span>{p.misi.status}</span>
        {/* Status kehadiran Anggota ini sendiri, selalu ditampilkan. Sebelumnya ia disembunyikan
            begitu Misi-nya punya hasil evaluasi, jadi Anggota yang menolak penugasan tetap terbaca
            seperti ikut turun. Evaluasi Misi punya barisnya sendiri di bawah. */}
        <Badge color={statusKehadiranColor(p.statusKehadiran)}>{p.statusKehadiran}</Badge>
      </div>
      {p.misi.hasilEvaluasi && (
        <div className="mt-[6px] border-t border-border-soft pt-[6px] text-[10.5px] leading-relaxed text-ink-2">
          <span className="text-ink-3">Evaluasi misi: </span>
          {p.misi.hasilEvaluasi}
        </div>
      )}
    </div>
  );
}

export function RiwayatView({ profil }: { profil: SelfProfil }) {
  const [tab, setTab] = useState<Tab>("pelatihan");

  // Misi berstatus Draft: Penugasan-nya baru kandidat rekomendasi AI. Operator belum menyetujui,
  // dan Notifikasi baru dikirim saat Misi dimobilisasi (approveMisiAction di lib/misi-actions.ts)
  // — sementara merespons butuh id Notifikasi. Jadi baris Draft memperlihatkan permintaan respons
  // yang tidak pernah dikirim dan tidak bisa dijawab, sekaligus membocorkan daftar kandidat
  // sebelum Operator memutuskan. Tidak ditampilkan sama sekali (temuan QA-10).
  const penugasanTampil = profil.penugasan.filter((p) => p.misi.status !== STATUS_MISI.DRAFT);
  // Dipisah berdasar statusKehadiran, bukan status Misi: tab ini catatan milik Anggota, dan
  // "belum ada partisipasi" persis berarti belum direspons. Kalau dipisah berdasar status Misi,
  // penugasan yang sudah dikonfirmasi ikut terlempar ke daftar menunggu.
  const menunggu = penugasanTampil.filter((p) => p.statusKehadiran === STATUS_KEHADIRAN.MENUNGGU_RESPONS);
  const sudahDijalani = penugasanTampil.filter((p) => p.statusKehadiran !== STATUS_KEHADIRAN.MENUNGGU_RESPONS);

  return (
    <div className="flex flex-col gap-[14px] xl:gap-6">
      <div>
        <div className="text-[15px] font-extrabold">Riwayat Saya</div>
        <div className="text-[11px] text-ink-2">Pelatihan & penugasan yang pernah diikuti</div>
      </div>

      <div className="flex gap-[6px] rounded-[10px] border border-border bg-elevated p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-[7px] py-[11px] text-center text-[11.5px] font-bold",
              tab === t.key ? "bg-accent-bright text-[#00170C]" : "text-ink-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col gap-[10px]", tab === "pelatihan" ? "xl:grid xl:grid-cols-2" : "hidden")}>
        {profil.pelatihan.length === 0 && <div className={KOSONG}>Belum ada riwayat pelatihan.</div>}
        {profil.pelatihan.map((p) => (
          <div key={p.id} className="rounded-[10px] border border-border bg-surface p-3">
            <div className="mb-1 text-[12px] font-bold">{p.namaPelatihan}</div>
            <div className="flex items-center justify-between gap-2 text-[10.5px] text-ink-2">
              <span>{p.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</span>
              <Badge color={statusKelulusanColor(p.statusKelulusan)}>{p.statusKelulusan}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Beda dari dua tab lain: isinya dibagi dua bagian, jadi grid 2 kolom desktop dipasang di
          tiap daftar, bukan di panel-nya. */}
      <div className={cn("flex flex-col gap-[14px]", tab === "penugasan" ? "" : "hidden")}>
        {penugasanTampil.length === 0 && <div className={KOSONG}>Belum ada riwayat penugasan.</div>}

        {menunggu.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <div>
              <div className={HEADING}>Menunggu Respons</div>
              <div className="mt-[2px] text-[10.5px] text-ink-2">
                Konfirmasi atau tolak lewat{" "}
                <Link href="/m/notifikasi" className="font-bold text-accent-bright underline underline-offset-2">
                  Notifikasi
                </Link>
                .
              </div>
            </div>
            <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2">
              {menunggu.map((p) => (
                <KartuPenugasan key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}

        {sudahDijalani.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <div className={HEADING}>Riwayat</div>
            <div className="flex flex-col gap-[10px] xl:grid xl:grid-cols-2">
              {sudahDijalani.map((p) => (
                <KartuPenugasan key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={cn("flex flex-col gap-[10px]", tab === "sertifikasi" ? "xl:grid xl:grid-cols-2" : "hidden")}>
        {profil.sertifikasi.length === 0 && <div className={KOSONG}>Belum ada data sertifikasi.</div>}
        {profil.sertifikasi.map((s) => (
          <div key={s.id} className="rounded-[10px] border border-border bg-surface p-3">
            <div className="mb-1 text-[12px] font-bold">{s.jenisSertifikasi}</div>
            <div className="flex items-center justify-between gap-2 text-[10.5px] text-ink-2">
              <span>Berlaku s.d. {s.tanggalBerlaku.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</span>
              <Badge color={statusSertifikasiColor(s.status)}>{s.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
