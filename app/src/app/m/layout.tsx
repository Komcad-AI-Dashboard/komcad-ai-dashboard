import { requireSelfAnggotaId, getSelfUnreadNotifikasiCount } from "@/lib/anggota-mobile-data";
import { ensureReminderSertifikasi } from "@/lib/reminder-sertifikasi";
import { MobileShell } from "@/components/m-shell/mobile-shell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const self = await requireSelfAnggotaId();
  if (!("error" in self)) {
    // Cek H-30 sertifikasi diri sendiri tiap kali Sisi Anggota dibuka — lihat lib/reminder-sertifikasi.ts.
    await ensureReminderSertifikasi(self.anggotaId);
  }
  const unreadCount = "error" in self ? 0 : await getSelfUnreadNotifikasiCount(self.anggotaId);

  return <MobileShell unreadCount={unreadCount}>{children}</MobileShell>;
}
