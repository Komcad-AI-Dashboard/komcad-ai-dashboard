import { getAllPelatihan } from "@/lib/anggota-data";
import { PelatihanTable } from "@/components/pelatihan/pelatihan-table";

export default async function PelatihanPage() {
  const rows = await getAllPelatihan();
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PelatihanTable rows={rows} />
    </div>
  );
}
