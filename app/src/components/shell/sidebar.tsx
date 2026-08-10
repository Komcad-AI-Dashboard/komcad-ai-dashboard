"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMAND_NAV } from "@/lib/constants";
import { NavIcon } from "./nav-icon";
import { cn } from "@/lib/utils";

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-base transition-[width,opacity] duration-[180ms] ease-out",
        collapsed ? "w-0 border-r-0 opacity-0" : "w-[236px] opacity-100"
      )}
    >
      <div className="flex items-center gap-[9px] border-b border-border p-4">
        <div className="flex h-[22px] w-[28px] shrink-0 flex-col overflow-hidden rounded-[3px] border border-border">
          <div className="flex-1 bg-[#D8302A]" />
          <div className="flex-1 bg-[#F2F2F2]" />
        </div>
        <div>
          <div className="text-[13.5px] font-extrabold tracking-wide">AI KOMCAD</div>
          <div className="mt-px text-[9.5px] font-semibold tracking-widest text-ink-3">
            COMMAND CENTER
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-[10px] pt-[14px]">
        {COMMAND_NAV.map((group) => (
          <div key={group.label} className="mb-[18px]">
            <div className="px-[10px] pb-[6px] text-[10px] font-extrabold tracking-widest text-ink-3">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-0.5 flex items-center gap-[10px] rounded-[6px] border border-transparent px-[10px] py-[9px] text-[12.5px] font-semibold text-ink-2 hover:bg-surface-hover hover:text-ink",
                    active && "border-accent-bright/40 bg-accent-bright/10 text-accent-bright"
                  )}
                >
                  <NavIcon name={item.icon} className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-[10px] border-t border-border p-3 px-4">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-xs">
          A
        </div>
        <div>
          <div className="text-[11.5px] font-bold">Mode Demo</div>
          <div className="text-[10px] text-ink-3">Belum masuk</div>
        </div>
      </div>
    </aside>
  );
}
