import { getRiwayatMobilisasi } from "@/lib/misi-data";
import { RiwayatTable } from "@/components/riwayat/riwayat-table";

export default async function RiwayatPage() {
  const riwayat = await getRiwayatMobilisasi();

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
        <RiwayatTable rows={riwayat} />
      </div>
    </div>
  );
}
