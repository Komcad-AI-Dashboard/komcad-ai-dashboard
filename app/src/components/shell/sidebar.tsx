"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { COMMAND_NAV, ROLE_LABELS } from "@/lib/constants";
import { NavIcon } from "./nav-icon";
import { cn } from "@/lib/utils";
import type { TopbarKpi } from "./app-shell";

export function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
  user,
  kpi,
}: {
  collapsed: boolean;
  /** Hanya berlaku di bawah breakpoint xl, tempat sidebar jadi drawer melayang. */
  mobileOpen: boolean;
  /** Dipanggil saat menu diklik — di HP dipakai untuk menutup drawer setelah pindah halaman. */
  onNavigate: () => void;
  user: Session["user"] | null;
  kpi: TopbarKpi;
}) {
  const pathname = usePathname();
  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={cn(
        // Mobile-first: sidebar = drawer melayang di atas konten, default tersembunyi di kiri.
        // Mulai xl (samakan dengan ambang AutoScale) balik jadi kolom inline seperti semula.
        "hud-rule-y fixed inset-y-0 left-0 z-[1500] flex w-[264px] max-w-[85vw] flex-col overflow-hidden border-r border-border-soft bg-gradient-to-b from-[#070a0b] to-black transition-transform duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "xl:relative xl:z-auto xl:h-full xl:max-w-none xl:shrink-0 xl:translate-x-0 xl:transition-[width,opacity] xl:duration-[180ms]",
        collapsed ? "xl:w-0 xl:border-r-0 xl:opacity-0" : "xl:w-[236px] xl:opacity-100"
      )}
    >
      <div className="border-b border-border-soft p-4">
        <div className="flex items-center gap-[9px]">
          <div className="flex h-[22px] w-[28px] shrink-0 flex-col overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_10px_rgba(225,76,69,0.35)]">
            <div className="flex-1 bg-[#D8302A]" />
            <div className="flex-1 bg-[#F2F2F2]" />
          </div>
          <div>
            <div className="text-[15px] font-black tracking-[0.13em]">KOMCAD</div>
            <div className="mt-px text-[8.5px] font-bold tracking-[0.28em] text-accent-bright">
              COMMAND CENTER
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-[10px] pt-[14px]">
        {COMMAND_NAV.map((group) => (
          <div key={group.label} className="mb-[18px]">
            <div className="hud-label flex items-center gap-2 px-[10px] pb-[7px] text-[8.5px] font-extrabold tracking-[0.26em] text-ink-3">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              const badgeCount = item.badgeKey === "misiAktif" ? kpi.misiAktifCount : undefined;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative mb-0.5 flex items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-hover hover:text-ink",
                    active &&
                      "bg-gradient-to-r from-accent-bright/[0.14] to-accent-bright/[0.02] font-bold text-accent-bright before:absolute before:inset-y-[6px] before:left-0 before:w-[2.5px] before:rounded-[2px] before:bg-accent-bright before:shadow-[0_0_10px_var(--accent-bright)]"
                  )}
                >
                  <NavIcon name={item.icon} className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount != null && badgeCount > 0 && (
                    <span className="rounded-full bg-red px-[6px] font-mono text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-[10px] border-t border-border-soft p-3 px-4">
        <div className="flex items-center gap-[10px]">
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[7px] border border-accent-bright/35 bg-gradient-to-br from-accent-dim to-[#0a1a12] text-xs font-bold text-accent-bright">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11.5px] font-bold">{user?.name ?? "Tidak dikenal"}</div>
            <div className="truncate text-[10px] text-ink-3">
              {user ? ROLE_LABELS[user.role] : "Belum masuk"}
            </div>
          </div>
        </div>
        <div className="text-[9px] tracking-[0.06em] text-ink-3">
          STATUS SISTEM <span className="font-bold text-accent">● OPERASIONAL</span>
        </div>
      </div>
    </aside>
  );
}
