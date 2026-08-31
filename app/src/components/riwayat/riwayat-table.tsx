"use client";

import { useRouter } from "next/navigation";
import type { RiwayatMobilisasiItem } from "@/lib/misi-data";

/** Baris membuka drawer detail Misi lewat ?openId= — jalur yang sama dipakai modal pencarian
 * global (lib/search-actions.ts), jadi tidak ada drawer kedua yang dibangun. Drawer itu sudah
 * merender hasilEvaluasi utuh untuk Misi berstatus Selesai, yang persis teks yang terpotong
 * di kolom Evaluasi. Truncate-nya sengaja dipertahankan: sekarang cuma ringkasan, bukan
 * satu-satunya jalan membaca teksnya.
 *
 * Client component mengikuti pola PelatihanTable/SertifikasiTable — page.tsx tetap server
 * component yang query lalu mengoper rows ke sini. */
export function RiwayatTable({ rows }: { rows: RiwayatMobilisasiItem[] }) {
  const router = useRouter();

  return (
    <table className="hud-table-responsive w-full border-collapse text-left">
      <thead>
        <tr className="hud-head">
          {["ID MISI", "JENIS", "LOKASI", "TANGGAL SELESAI", "PERSONEL", "EVALUASI"].map((h) => (
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
            <td colSpan={6} className="px-3 py-4 text-[11px] text-ink-3">
              Belum ada Misi yang selesai.
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <tr
            key={r.id}
            onClick={() => router.push(`/misi?openId=${r.id}`)}
            // Baris tabel tidak bisa difokus keyboard sendiri; tabIndex + handler Enter/Space
            // membuatnya setara tombol, bukan cuma target mouse (NFR-10 aksesibilitas).
            tabIndex={0}
            role="link"
            aria-label={`Buka detail ${r.kodeMisi}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/misi?openId=${r.id}`);
              }
            }}
            className="cursor-pointer border-b border-border-soft last:border-b-0 hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
          >
            <td data-label="ID Misi" className="px-3 py-[10px] font-mono text-[12px]">{r.kodeMisi}</td>
            <td data-label="Jenis" className="px-3 py-[10px] text-[12px]">{r.jenisKejadian}</td>
            <td data-label="Lokasi" className="px-3 py-[10px] text-[12px] text-ink-2">{r.lokasi}</td>
            <td data-label="Tanggal Selesai" className="px-3 py-[10px] text-[12px]">
              {r.selesaiAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) ?? "—"}
            </td>
            <td data-label="Personel" className="px-3 py-[10px] text-[12px]">{r.personel}</td>
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
  );
}
