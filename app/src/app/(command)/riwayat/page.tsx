import { getRiwayatMobilisasi } from "@/lib/misi-data";

export default async function RiwayatPage() {
  const riwayat = await getRiwayatMobilisasi();

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="overflow-hidden rounded-[8px] border border-border bg-surface">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-elevated">
              {["ID MISI", "JENIS", "LOKASI", "TANGGAL SELESAI", "PERSONEL", "EVALUASI"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-[10px] text-[10px] font-extrabold tracking-wide text-ink-2"
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
                <td className="px-3 py-[10px] font-mono text-[12px]">{r.kodeMisi}</td>
                <td className="px-3 py-[10px] text-[12px]">{r.jenisKejadian}</td>
                <td className="px-3 py-[10px] text-[12px] text-ink-2">{r.lokasi}</td>
                <td className="px-3 py-[10px] text-[12px]">
                  {r.selesaiAt?.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) ?? "—"}
                </td>
                <td className="px-3 py-[10px] text-[12px]">{r.personel}</td>
                <td className="max-w-[280px] truncate px-3 py-[10px] text-[12px] text-ink-2" title={r.hasilEvaluasi ?? undefined}>
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
