"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Menu, Search, Settings, PlusCircle, LogOut } from "lucide-react";
import { COMMAND_NAV, ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth-actions";
import type { TopbarKpi } from "./app-shell";

const ALL_ITEMS = COMMAND_NAV.flatMap((g) => g.items);

export function Topbar({
  onToggleSidebar,
  onBuatMisi,
  user,
  kpi,
}: {
  onToggleSidebar: () => void;
  onBuatMisi?: () => void;
  user: Session["user"] | null;
  kpi: TopbarKpi;
}) {
  const pathname = usePathname();
  const current = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
  const group = COMMAND_NAV.find((g) => g.items.includes(current!));

  return (
    <header className="hud-rule-x relative flex h-[52px] shrink-0 items-center gap-[10px] bg-gradient-to-b from-[#0a0d0f] to-black px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 transition-colors hover:border-accent hover:text-accent-bright hover:shadow-[0_0_14px_rgba(60,242,154,0.18)]"
      >
        <Menu className="size-4" strokeWidth={1.5} />
      </button>

      <div className="flex flex-col gap-px">
        <h1 className="text-[15px] font-extrabold tracking-wide">{current?.label ?? "SIAGA"}</h1>
        <div className="font-mono text-[10.5px] text-ink-3">
          {group ? `${group.label} / ${current?.label}` : "COMMAND CENTER"}
        </div>
      </div>

      <div className="ml-[10px] flex items-center gap-[6px] rounded-full border border-accent-bright/30 bg-accent-bright/[0.06] px-[10px] py-1 font-mono text-[9.5px] font-extrabold tracking-[0.18em] text-accent-bright">
        <span className="size-1.5 animate-pulse rounded-full bg-current shadow-[0_0_8px_currentColor]" />
        LIVE
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[6px] text-[12px] text-ink-2 sm:flex">
          Nasional
        </div>

        {(user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.OPERATOR) && (
          <button
            onClick={onBuatMisi}
            className="flex items-center gap-[6px] rounded-[6px] bg-gradient-to-b from-accent-bright to-accent px-3 py-[6px] text-[12px] font-extrabold tracking-wide text-[#00170C] shadow-[0_0_18px_rgba(60,242,154,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_0_26px_rgba(60,242,154,0.5)]"
          >
            <PlusCircle className="size-4" strokeWidth={2} />
            BUAT MISI
          </button>
        )}

        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[5px] md:flex">
          <span className="text-[9.5px] font-extrabold tracking-widest text-ink-2">READINESS</span>
          <span className="hud-num font-mono text-[15px] font-extrabold text-accent-bright">
            {kpi.readinessNasional}%
          </span>
        </div>

        <button className="flex items-center gap-[6px] rounded-[6px] border border-red bg-red/15 px-3 py-[6px] text-[12px] font-bold text-[#F5A9A5]">
          MISI AKTIF
          <span className="rounded-[4px] bg-red px-[5px] font-mono text-white">{kpi.misiAktifCount}</span>
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
