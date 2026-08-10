const ITEMS = [
  { label: "Misi Kritis", color: "#E14C45" },
  { label: "Misi Siaga", color: "#E0A83E" },
  { label: "Anggota Siap", color: "#3CF29A" },
  { label: "Pos Komando", color: "#B08D4F" },
];

export function Legend() {
  return (
    <div className="absolute bottom-[14px] left-1/2 z-[500] flex -translate-x-1/2 gap-4 rounded-[8px] border border-border bg-black/88 px-4 py-2 text-[10.5px] text-ink-2 backdrop-blur-sm">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-[6px]">
          <span className="size-[9px] rounded-full" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
