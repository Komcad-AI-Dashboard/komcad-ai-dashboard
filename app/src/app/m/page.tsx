import { requireSelfAnggotaId, getSelfProfil, getSelfQuickStats, getSelfNotifikasi } from "@/lib/anggota-mobile-data";
import { BerandaView } from "@/components/m-shell/beranda-view";

export default async function MemberHomePage() {
  const self = await requireSelfAnggotaId();
  if ("error" in self) {
    return <div className="text-[12.5px] text-ink-2">{self.error}</div>;
  }

  const [profil, stats, notifikasi] = await Promise.all([
    getSelfProfil(self.anggotaId),
    getSelfQuickStats(self.anggotaId),
    getSelfNotifikasi(self.anggotaId),
  ]);

  if (!profil) {
    return <div className="text-[12.5px] text-ink-2">Data Anggota tidak ditemukan.</div>;
  }

  return <BerandaView profil={profil} stats={stats} notifikasiTerbaru={notifikasi.slice(0, 3)} />;
}
