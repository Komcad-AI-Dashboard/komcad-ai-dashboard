import { cn } from "@/lib/utils";

export function BottomPanelShell({
  title,
  badge,
  liveTag,
  flexGrow,
  onHide,
  className,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  liveTag?: React.ReactNode;
  flexGrow?: number;
  onHide: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // Pembagian ruang `flex` hanya berlaku mulai xl, tempat ketiga panel berbagi satu baris dengan
    // tinggi tetap. Di HP mereka bertumpuk di kolom setinggi isinya — kalau flex-basis:0 dari
    // flexGrow ikut kepakai di situ, ketiganya menciut jadi nol tinggi. Tinggi tetap di HP juga
    // dibutuhkan karena isi tiap panel memakai `flex-1 overflow-y-auto`, yang perlu batas atas.
    <div
      className={cn(
        "hud-brk hud-panel flex h-[300px] flex-col overflow-hidden rounded-[10px] border border-border xl:h-auto xl:flex-[var(--panel-flex)]",
        className
      )}
      style={{ "--panel-flex": flexGrow ?? 1 } as React.CSSProperties}
    >
      <div className="hud-head flex shrink-0 items-center gap-[10px] border-b border-border-soft px-[14px] py-[9px]">
        <h3 className="text-[11px] font-extrabold tracking-widest">{title}</h3>
        {badge}
        <div className="flex-1" />
        {liveTag}
        {/* Sembunyikan-panel adalah afordans desktop (mengatur baris yang berebut ruang dengan
            peta); di HP panel tinggal di-scroll, jadi tombolnya tidak perlu ada. */}
        <button
          onClick={onHide}
          title="Sembunyikan panel"
          aria-label={`Sembunyikan panel ${title}`}
          className={cn(
            "hidden size-[30px] shrink-0 items-center justify-center rounded-[4px] border border-border bg-elevated text-[14px] font-extrabold text-ink-2 hover:border-accent hover:text-accent-bright xl:flex"
          )}
        >
          −
        </button>
      </div>
      {children}
    </div>
  );
}
