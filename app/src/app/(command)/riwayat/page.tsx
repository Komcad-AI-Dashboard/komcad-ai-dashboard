import { getRiwayatMobilisasi } from "@/lib/misi-data";

export default async function RiwayatPage() {
  const riwayat = await getRiwayatMobilisasi();

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
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
            {riwayat.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-[11px] text-ink-3">
                  Belum ada Misi yang selesai.
                </td>
              </tr>
            )}
            {riwayat.map((r) => (
              <tr key={r.id} className="border-b border-border-soft last:border-b-0">
                <td data-label="ID Misi" className="px-3 py-[10px] font-mono text-[12px]">{r.kodeMisi}</td>
                <td data-label="Jenis" className="px-3 py-[10px] text-[12px]">{r.jenisKejadian}</td>
                <td data-label="Lokasi" className="px-3 py-[10px] text-[12px] text-ink-2">{r.lokasi}</td>
                <td data-label="Tanggal Selesai" className="px-3 py-[10px] text-[12px]">
                  {r.selesaiAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) ?? "—"}
                </td>
                <td data-label="Personel" className="px-3 py-[10px] text-[12px]">{r.personel}</td>
                <td data-label="Evaluasi" className="px-3 py-[10px] text-[12px] text-ink-2 xl:max-w-[280px] xl:truncate" title={r.hasilEvaluasi ?? undefined}>
                  {r.hasilEvaluasi ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
