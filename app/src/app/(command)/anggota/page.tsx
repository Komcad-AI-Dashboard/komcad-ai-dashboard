import { auth } from "@/lib/auth";
import { getAnggotaFullList, getKpiAnggota } from "@/lib/anggota-data";
import { AnggotaDirectory } from "@/components/anggota/anggota-directory";
import { Card } from "@/components/ui/card";

export default async function AnggotaPage() {
  const [session, anggotaList, kpi] = await Promise.all([
    auth(),
    getAnggotaFullList(),
    getKpiAnggota(),
  ]);

  const cards = [
    { label: "TOTAL ANGGOTA", value: kpi.total, color: "text-ink" },
    { label: "AKTIF", value: kpi.aktif, color: "text-accent-bright" },
    { label: "SIAGA", value: kpi.siaga, color: "text-amber" },
    { label: "TIDAK TERSEDIA", value: kpi.tidakTersedia, color: "text-ink-2" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-4 gap-3 p-5 pb-0">
        {cards.map((c) => (
          <Card key={c.label} className="p-[14px]">
            <div className="mb-2 text-[10px] font-extrabold tracking-wide text-ink-2">{c.label}</div>
            <div className={`font-mono text-[26px] font-extrabold ${c.color}`}>
              {c.value.toLocaleString("id-ID")}
            </div>
          </Card>
        ))}
      </div>

      <AnggotaDirectory anggotaList={anggotaList} role={session?.user?.role} />
    </div>
  );
}
