export default function MemberHomePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-3 bg-base p-6 text-center">
      <div className="flex h-5 w-[26px] shrink-0 flex-col overflow-hidden rounded-[3px] border border-border">
        <div className="flex-1 bg-[#D8302A]" />
        <div className="flex-1 bg-[#F2F2F2]" />
      </div>
      <h1 className="text-[15px] font-extrabold tracking-wide">AI KOMCAD — Sisi Anggota</h1>
      <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-2">
        Portal profil pribadi, riwayat, status kesiapan, dan notifikasi mobilisasi anggota. Belum
        dikerjakan — lihat TODO.md Fase 11 (FR-37 s.d. FR-40).
      </p>
    </div>
  );
}
