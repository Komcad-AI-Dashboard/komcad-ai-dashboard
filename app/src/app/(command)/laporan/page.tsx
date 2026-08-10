import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getLaporanFilterOptions } from "@/lib/laporan";
import { LaporanBaruForm } from "@/components/laporan/laporan-baru-form";

const LAPORAN_TERSEDIA = [
  {
    judul: "Laporan Kesiapsiagaan Nasional",
    deskripsi: "Ringkasan KPI nasional + Readiness Score per wilayah, dihitung langsung dari data terkini.",
    format: "PDF",
    href: "/api/laporan/kesiapsiagaan",
  },
  {
    judul: "Rekap Mobilisasi",
    deskripsi: "Seluruh Misi (Draft/Dimobilisasi/Selesai/Dibatalkan) dengan jumlah personel & evaluasi.",
    format: "XLSX",
    href: "/api/laporan/rekap-mobilisasi",
  },
  {
    judul: "Evaluasi AI Mobilization",
    deskripsi: "Misi yang sudah selesai, beserta rata-rata skor rekomendasi AI per Misi dan hasil evaluasi.",
    format: "PDF",
    href: "/api/laporan/evaluasi-ai",
  },
];

export default async function LaporanPage() {
  const session = await auth();
  const canDownload = session?.user?.role === ROLES.SUPER_ADMIN || session?.user?.role === ROLES.ANALIS;
  const filterOptions = canDownload ? await getLaporanFilterOptions() : { provinsi: [], misi: [] };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {!canDownload && (
          <div className="rounded-[8px] border border-amber/40 bg-amber/10 px-3 py-2 text-[11.5px] text-amber">
            Unduh laporan tersedia untuk Analis/Evaluator dan Super Admin (FR-27).
          </div>
        )}

        <div className="rounded-[8px] border border-border bg-surface p-[14px]">
          <h3 className="mb-3 text-[12px] font-extrabold">Laporan Tersedia</h3>
          <div className="flex flex-col">
            {LAPORAN_TERSEDIA.map((l) => (
              <div
                key={l.href}
                className="flex items-center justify-between gap-3 border-b border-border-soft py-3 last:border-b-0"
              >
                <div>
                  <div className="text-[12.5px] font-semibold">{l.judul}</div>
                  <div className="mt-[2px] text-[10.5px] text-ink-2">{l.deskripsi}</div>
                  <div className="mt-1 font-mono text-[10px] text-ink-3">{l.format} · digenerate saat diunduh</div>
                </div>
                {canDownload ? (
                  <a
                    href={l.href}
                    className="shrink-0 rounded-[6px] border border-accent px-3 py-[6px] text-[12px] font-bold text-accent-bright hover:bg-accent-bright/10"
                  >
                    Unduh
                  </a>
                ) : (
                  <span className="shrink-0 rounded-[6px] border border-border px-3 py-[6px] text-[12px] font-bold text-ink-3">
                    Unduh
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {canDownload && <LaporanBaruForm provinsiOptions={filterOptions.provinsi} misiOptions={filterOptions.misi} />}
      </div>
    </div>
  );
}
