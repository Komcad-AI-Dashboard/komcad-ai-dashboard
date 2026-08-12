import { requireSelfAnggotaId, getSelfNotifikasi } from "@/lib/anggota-mobile-data";
import { NotifCard } from "@/components/m-shell/notif-card";

export default async function MemberNotifikasiPage() {
  const self = await requireSelfAnggotaId();
  if ("error" in self) {
    return <div className="text-[12.5px] text-ink-2">{self.error}</div>;
  }

  const notifikasi = await getSelfNotifikasi(self.anggotaId);

  return (
    <>
      <div>
        <div className="text-[15px] font-extrabold">Notifikasi</div>
        <div className="text-[11px] text-ink-2">Riwayat notifikasi mobilisasi & sistem</div>
      </div>
      {notifikasi.length === 0 && <div className="text-[11.5px] text-ink-3">Belum ada notifikasi.</div>}
      <div className="flex flex-col gap-[14px] xl:grid xl:grid-cols-2 xl:gap-[10px]">
        {notifikasi.map((n) => (
          <NotifCard key={n.id} notif={n} />
        ))}
      </div>
    </>
  );
}
