import { cn } from "@/lib/utils";

export function BottomPanelShell({
  title,
  badge,
  liveTag,
  flexGrow,
  onHide,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  liveTag?: React.ReactNode;
  flexGrow?: number;
  onHide: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="hud-brk hud-panel flex flex-col overflow-hidden rounded-[10px] border border-border"
      style={{ flex: flexGrow ?? 1 }}
    >
      <div className="hud-head flex shrink-0 items-center gap-[10px] border-b border-border-soft px-[14px] py-[9px]">
        <h3 className="text-[11px] font-extrabold tracking-widest">{title}</h3>
        {badge}
        <div className="flex-1" />
        {liveTag}
        <button
          onClick={onHide}
          title="Sembunyikan panel"
          aria-label={`Sembunyikan panel ${title}`}
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-[4px] border border-border bg-elevated text-[14px] font-extrabold text-ink-2 hover:border-accent hover:text-accent-bright"
          )}
        >
          −
        </button>
      </div>
      {children}
    </div>
  );
}
