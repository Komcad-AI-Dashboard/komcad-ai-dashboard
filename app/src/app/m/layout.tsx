import { requireSelfAnggotaId, getSelfUnreadNotifikasiCount } from "@/lib/anggota-mobile-data";
import { MobileShell } from "@/components/m-shell/mobile-shell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const self = await requireSelfAnggotaId();
  const unreadCount = "error" in self ? 0 : await getSelfUnreadNotifikasiCount(self.anggotaId);

  return <MobileShell unreadCount={unreadCount}>{children}</MobileShell>;
}
