"use client";

import { useState, useTransition } from "react";
import { Drawer } from "@/components/ui/drawer";
import { MisiDetailDrawerContent } from "@/components/misi/misi-detail-drawer-content";
import { getMisiDetailAction } from "@/lib/overview-actions";
import type { Role } from "@/lib/constants";
import type { MisiListItem, RiwayatMobilisasiItem } from "@/lib/misi-data";

/** Baris membuka drawer detail Misi DI HALAMAN INI, bukan dengan berpindah ke /misi.
 *
 * Versi pertama (temuan QA-04) memakai ulang drawer di /misi lewat router.push("?openId="),
 * yang berarti kliknya benar-benar berpindah halaman: latar di belakang drawer berubah jadi
 * tabel Manajemen Misi, dan menutup drawer meninggalkan pengguna di sana. Sekarang drawernya
 * dirender di sini, jadi latarnya tetap Riwayat Mobilisasi dan menutupnya tidak ke mana-mana.
 *
 * Detail lengkap Misi diambil saat baris diklik (pola sama seperti drawer peta Overview),
 * bukan ikut dimuat bersama tabel: tabel ini cuma butuh ringkasan tiap baris.
 *
 * Client component mengikuti pola PelatihanTable/SertifikasiTable — page.tsx tetap server
 * component yang query lalu mengoper rows ke sini. */
export function RiwayatTable({ rows, role }: { rows: RiwayatMobilisasiItem[]; role: Role | undefined }) {
  const [dipilih, setDipilih] = useState<RiwayatMobilisasiItem | null>(null);
  const [detail, setDetail] = useState<MisiListItem | null>(null);
  const [gagalMuat, setGagalMuat] = useState(false);
  const [, startDetailTransition] = useTransition();

  function bukaDetail(row: RiwayatMobilisasiItem) {
    setDipilih(row);
    setDetail(null);
    setGagalMuat(false);
    startDetailTransition(async () => {
      try {
        const data = await getMisiDetailAction(row.id);
        if (data) setDetail(data);
        else setGagalMuat(true);
      } catch {
        setGagalMuat(true);
      }
    });
  }

  return (
    <>
      <table className="hud-table-responsive w-full border-collapse text-left">
      <thead>
        <tr className="hud-head">
          {["ID MISI", "JENIS", "LOKASI", "TANGGAL SELESAI", "PERSONEL", "CATATAN", "EVALUASI"].map((h) => (
            <th
              key={h}
              className="border-b border-border px-3 py-[10px] text-[9px] font-extrabold tracking-[0.16em] text-ink-3"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={7} className="px-3 py-4 text-[11px] text-ink-3">
              Belum ada Misi yang selesai.
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <tr
            key={r.id}
            onClick={() => bukaDetail(r)}
            // Baris tabel tidak bisa difokus keyboard sendiri; tabIndex + handler Enter/Space
            // membuatnya setara tombol, bukan cuma target mouse (NFR-10 aksesibilitas).
            tabIndex={0}
            role="button"
            aria-label={`Buka detail ${r.kodeMisi}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                bukaDetail(r);
              }
            }}
            className="cursor-pointer border-b border-border-soft last:border-b-0 hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
          >
            <td data-label="ID Misi" className="px-3 py-[10px] font-mono text-[12px]">{r.kodeMisi}</td>
            <td data-label="Jenis" className="px-3 py-[10px] text-[12px]">{r.jenisKejadian}</td>
            <td data-label="Lokasi" className="px-3 py-[10px] text-[12px] text-ink-2">{r.lokasi}</td>
            <td data-label="Tanggal Selesai" className="px-3 py-[10px] text-[12px]">
              {r.selesaiAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) ?? "—"}
            </td>
            <td data-label="Personel" className="px-3 py-[10px] text-[12px]">{r.personel}</td>
            {/* Angka saja, tanpa warna, karena "ada catatan" bukan status baik/buruk — cuma
                penanda supaya Misi yang sudah dibahas Analis tidak perlu dibuka satu per satu. */}
            <td data-label="Catatan" className="px-3 py-[10px] text-[12px]">
              {r.catatan > 0 ? r.catatan : <span className="text-ink-3">—</span>}
            </td>
            <td
              data-label="Evaluasi"
              className="px-3 py-[10px] text-[12px] text-ink-2 xl:max-w-[280px] xl:truncate"
              title={r.hasilEvaluasi ?? undefined}
            >
              {r.hasilEvaluasi ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
      </table>

      <Drawer
        open={dipilih !== null}
        onOpenChange={(o) => !o && setDipilih(null)}
        title={dipilih ? `${dipilih.kodeMisi} · ${dipilih.jenisKejadian}` : "Detail Misi"}
      >
        {gagalMuat ? (
          <div className="py-8 text-center text-[12px] text-ink-2">
            Detail Misi gagal dimuat. Tutup lalu buka lagi.
          </div>
        ) : detail ? (
          <MisiDetailDrawerContent misi={detail} role={role} />
        ) : (
          <div className="py-8 text-center text-[12px] text-ink-2">Memuat detail Misi...</div>
        )}
      </Drawer>
    </>
  );
}
