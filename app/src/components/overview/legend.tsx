const ITEMS = [
  { label: "Misi Kritis", color: "#E14C45" },
  { label: "Misi Siaga", color: "#E0A83E" },
  { label: "Anggota Siap", color: "#3CF29A" },
  { label: "Pos Komando", color: "#B08D4F" },
];

export function Legend() {
  return (
    // Disembunyikan di HP: warnanya sudah dijelaskan panel Layers yang di HP jadi kartu tersendiri,
    // dan di lebar 390px legend ini menutupi bagian peta yang justru sedang dilihat.
    <div className="absolute bottom-[14px] left-1/2 z-[500] hidden -translate-x-1/2 gap-4 rounded-[10px] border border-border bg-black/[0.86] px-4 py-2 text-[10px] font-semibold text-ink-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-[10px] xl:flex">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-[6px]">
          <span
            className="size-[9px] rounded-full"
            style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
