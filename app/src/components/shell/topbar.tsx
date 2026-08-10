"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Menu, Search, Settings, PlusCircle, LogOut } from "lucide-react";
import { COMMAND_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth-actions";

const ALL_ITEMS = COMMAND_NAV.flatMap((g) => g.items);

export function Topbar({
  onToggleSidebar,
  onBuatMisi,
  user,
}: {
  onToggleSidebar: () => void;
  onBuatMisi?: () => void;
  user: Session["user"] | null;
}) {
  const pathname = usePathname();
  const current = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
  const group = COMMAND_NAV.find((g) => g.items.includes(current!));

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-[10px] border-b border-border bg-base px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 hover:text-ink"
      >
        <Menu className="size-4" strokeWidth={1.5} />
      </button>

      <div className="flex flex-col gap-px">
        <h1 className="text-[15px] font-extrabold tracking-wide">{current?.label ?? "AI KOMCAD"}</h1>
        <div className="font-mono text-[10.5px] text-ink-3">
          {group ? `${group.label} / ${current?.label}` : "COMMAND CENTER"}
        </div>
      </div>

      <div className="ml-[10px] flex items-center gap-[5px] font-mono text-[11px] font-bold text-accent-bright">
        <span className="size-1.5 animate-pulse rounded-full bg-current shadow-[0_0_6px_currentColor]" />
        LIVE
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[6px] text-[12px] text-ink-2 sm:flex">
          Nasional
        </div>

        <button
          onClick={onBuatMisi}
          className="flex items-center gap-[6px] rounded-[6px] border border-accent px-3 py-[6px] text-[12px] font-bold tracking-wide text-accent-bright hover:bg-accent-bright/10"
        >
          <PlusCircle className="size-4" strokeWidth={1.5} />
          BUAT MISI
        </button>

        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[5px] md:flex">
          <span className="text-[9.5px] font-extrabold tracking-widest text-ink-2">READINESS</span>
          <span className="font-mono text-[15px] font-extrabold text-accent-bright">—</span>
        </div>

        <button className="flex items-center gap-[6px] rounded-[6px] border border-red bg-red/15 px-3 py-[6px] text-[12px] font-bold text-[#F5A9A5]">
          MISI AKTIF
          <span className="rounded-[4px] bg-red px-[5px] font-mono text-white">0</span>
        </button>

        <div
          className={cn(
            "hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-3 py-[6px] text-[12px] text-ink-2 lg:flex"
          )}
        >
          <Search className="size-3.5" strokeWidth={1.5} />
          Cari...
        </div>

        <button className="flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 hover:text-ink">
          <Settings className="size-4" strokeWidth={1.5} />
        </button>

        {user ? (
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-[6px] rounded-[6px] bg-accent-bright px-3 py-[6px] text-[12px] font-extrabold text-[#00170C]"
            >
              <LogOut className="size-3.5" strokeWidth={2} />
              Keluar
            </button>
          </form>
        ) : (
          <a
            href="/login"
            className="rounded-[6px] bg-accent-bright px-3 py-[6px] text-[12px] font-extrabold text-[#00170C]"
          >
            Masuk
          </a>
        )}
      </div>
    </header>
  );
}
