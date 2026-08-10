import { auth } from "@/lib/auth";
import { getMisiListFull, getMisiKpi } from "@/lib/misi-data";
import { MisiView } from "@/components/misi/misi-view";

export default async function MisiPage() {
  const [session, misiList, kpi] = await Promise.all([auth(), getMisiListFull(), getMisiKpi()]);
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MisiView misiList={misiList} kpi={kpi} role={session?.user?.role} />
    </div>
  );
}
