import { auth } from "@/lib/auth";
import { getRiwayatMobilisasi } from "@/lib/misi-data";
import { RiwayatTable } from "@/components/riwayat/riwayat-table";

export default async function RiwayatPage() {
  // Role dioper ke tabel karena drawer detail Misi dirender di halaman ini, dan isinya
  // bergantung role: tombol Tambah Catatan (QA-12) cuma untuk Analis & Super Admin.
  const [riwayat, session] = await Promise.all([getRiwayatMobilisasi(), auth()]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="hud-brk hud-panel overflow-hidden rounded-[10px] border border-border">
        <RiwayatTable rows={riwayat} role={session?.user?.role} />
      </div>
    </div>
  );
}
