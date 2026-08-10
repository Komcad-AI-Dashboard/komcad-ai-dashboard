import { requireSelfAnggotaId, getSelfProfil } from "@/lib/anggota-mobile-data";
import { RiwayatView } from "@/components/m-shell/riwayat-view";

export default async function MemberRiwayatPage() {
  const self = await requireSelfAnggotaId();
  if ("error" in self) {
    return <div className="text-[12.5px] text-ink-2">{self.error}</div>;
  }

  const profil = await getSelfProfil(self.anggotaId);
  if (!profil) {
    return <div className="text-[12.5px] text-ink-2">Data Anggota tidak ditemukan.</div>;
  }

  return <RiwayatView profil={profil} />;
}
