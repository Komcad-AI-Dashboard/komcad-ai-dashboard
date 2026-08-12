import { after } from "next/server";
import { requireSelfAnggotaId, getSelfUnreadNotifikasiCount } from "@/lib/anggota-mobile-data";
import { ensureReminderSertifikasi } from "@/lib/reminder-sertifikasi";
import { MemberShell } from "@/components/m-shell/member-shell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const self = await requireSelfAnggotaId();
  if (!("error" in self)) {
    // Cek H-30 sertifikasi diri sendiri tiap kali Sisi Anggota dibuka — lihat lib/reminder-sertifikasi.ts.
    // after() supaya cek ini tidak menunda render halaman.
    after(() => ensureReminderSertifikasi(self.anggotaId));
  }
  const unreadCount = "error" in self ? 0 : await getSelfUnreadNotifikasiCount(self.anggotaId);

  return <MemberShell unreadCount={unreadCount}>{children}</MemberShell>;
}
