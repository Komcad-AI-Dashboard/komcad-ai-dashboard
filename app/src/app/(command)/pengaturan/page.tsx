import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getPengaturanSistem } from "@/lib/pengaturan-data";
import { PengaturanView } from "@/components/pengaturan/pengaturan-view";

export default async function PengaturanPage() {
  const session = await auth();

  if (session?.user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="flex-1 p-5">
        <div className="rounded-[8px] border border-amber/40 bg-amber/10 px-3 py-2 text-[11.5px] text-amber">
          Menu Pengaturan hanya dapat diakses Super Admin.
        </div>
      </div>
    );
  }

  const pengaturan = await getPengaturanSistem();
  return <PengaturanView pengaturan={pengaturan} />;
}
