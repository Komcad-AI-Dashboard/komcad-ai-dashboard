import { requireSelfAnggotaId, getSelfProfil } from "@/lib/anggota-mobile-data";
import { ProfilView } from "@/components/m-shell/profil-view";

export default async function MemberProfilPage() {
  const self = await requireSelfAnggotaId();
  if ("error" in self) {
    return <div className="text-[12.5px] text-ink-2">{self.error}</div>;
  }

  const profil = await getSelfProfil(self.anggotaId);
  if (!profil) {
    return <div className="text-[12.5px] text-ink-2">Data Anggota tidak ditemukan.</div>;
  }

  return <ProfilView profil={profil} />;
}
