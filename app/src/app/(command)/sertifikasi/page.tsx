import { getAllSertifikasi } from "@/lib/anggota-data";
import { SertifikasiTable } from "@/components/sertifikasi/sertifikasi-table";

export default async function SertifikasiPage() {
  const rows = await getAllSertifikasi();
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SertifikasiTable rows={rows} />
    </div>
  );
}
