"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "next-auth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Search, Settings, PlusCircle, LogOut, MoreVertical } from "lucide-react";
import { COMMAND_NAV, ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth-actions";
import { GlobalSearchModal } from "./global-search-modal";
import type { TopbarKpi } from "./app-shell";

const ALL_ITEMS = COMMAND_NAV.flatMap((g) => g.items);

/** Baris di dalam menu luapan (HP) — disamakan bentuknya biar tidak masing-masing. */
const menuItemClass =
  "flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[10px] text-[12.5px] font-semibold text-ink-2 outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-ink";

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
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const current = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
  const group = COMMAND_NAV.find((g) => g.items.includes(current!));
  const bisaBuatMisi = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.OPERATOR;

  return (
    <header className="hud-rule-x relative flex h-[52px] shrink-0 items-center gap-2 bg-gradient-to-b from-[#0a0d0f] to-black px-3 xl:gap-[10px] xl:px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="flex size-[30px] shrink-0 items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 transition-colors hover:border-accent hover:text-accent-bright hover:shadow-[0_0_14px_rgba(60,242,154,0.18)]"
      >
        <Menu className="size-4" strokeWidth={1.5} />
      </button>

      <div className="flex min-w-0 flex-col gap-px">
        <h1 className="truncate text-[15px] font-extrabold tracking-wide">
          {current?.label ?? "KOMCAD"}
        </h1>
        {/* Breadcrumb dilepas di HP — di lebar 390px ia memakan ruang yang lebih dibutuhkan
            tombol aksi, sementara judul di atasnya sudah menyampaikan hal yang sama. */}
        <div className="hidden font-mono text-[10.5px] text-ink-3 xl:block">
          {group ? `${group.label} / ${current?.label}` : "COMMAND CENTER"}
        </div>
      </div>

      <div className="ml-[10px] hidden items-center gap-[6px] rounded-full border border-accent-bright/30 bg-accent-bright/[0.06] px-[10px] py-1 font-mono text-[9.5px] font-extrabold tracking-[0.18em] text-accent-bright xl:flex">
        <span className="size-1.5 animate-pulse rounded-full bg-current shadow-[0_0_8px_currentColor]" />
        LIVE
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[6px] xl:flex">
          <span className="text-[9.5px] font-extrabold tracking-widest text-ink-3">CAKUPAN</span>
          <span className="text-[12px] font-bold text-ink-2">Nasional</span>
        </div>

        {bisaBuatMisi && (
          <button
            onClick={onBuatMisi}
            aria-label="Buat misi"
            className="flex items-center gap-[6px] rounded-[6px] bg-gradient-to-b from-accent-bright to-accent px-[9px] py-[7px] text-[12px] font-extrabold tracking-wide text-[#00170C] shadow-[0_0_18px_rgba(60,242,154,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_0_26px_rgba(60,242,154,0.5)] xl:px-3 xl:py-[6px]"
          >
            <PlusCircle className="size-4 shrink-0" strokeWidth={2} />
            <span className="hidden xl:inline">BUAT MISI</span>
          </button>
        )}

        <div className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-[10px] py-[5px] xl:flex">
          <span className="text-[9.5px] font-extrabold tracking-widest text-ink-2">READINESS</span>
          <span className="hud-num font-mono text-[15px] font-extrabold text-accent-bright">
            {kpi.readinessNasional}%
          </span>
        </div>

        {/* Misi aktif tetap tampil di HP: ini satu-satunya angka di topbar yang menuntut tindakan. */}
        <Link
          href="/misi?status=aktif"
          className="flex shrink-0 items-center gap-[6px] rounded-[6px] border border-red bg-red/15 px-[9px] py-[6px] text-[12px] font-bold text-[#F5A9A5] xl:px-3"
        >
          <span className="hidden xl:inline">MISI AKTIF</span>
          <span className="rounded-[4px] bg-red px-[5px] font-mono text-white">
            {kpi.misiAktifCount}
          </span>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="hidden items-center gap-2 rounded-[6px] border border-border bg-elevated px-3 py-[6px] text-[12px] text-ink-2 hover:text-ink xl:flex"
        >
          <Search className="size-3.5" strokeWidth={1.5} />
          Cari...
        </button>

        <Link
          href="/pengaturan"
          aria-label="Pengaturan"
          className="hidden size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 hover:text-ink xl:flex"
        >
          <Settings className="size-4" strokeWidth={1.5} />
        </Link>

        {user ? (
          <form action={signOutAction} className="hidden xl:block">
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
            className="hidden rounded-[6px] bg-accent-bright px-3 py-[6px] text-[12px] font-extrabold text-[#00170C] xl:block"
          >
            Masuk
          </a>
        )}

        {/* Menu luapan — menampung aksi yang di HP tidak muat di bar, supaya tidak ada yang
            hilang sama sekali dari jangkauan. Hanya ada di bawah xl. */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label="Menu lainnya"
              className="flex size-[30px] shrink-0 items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 xl:hidden"
            >
              <MoreVertical className="size-4" strokeWidth={1.5} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-[2100] w-[220px] rounded-[10px] border border-border bg-gradient-to-b from-[#0d1114] to-[#070a0b] p-[6px] shadow-[0_30px_70px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between px-[10px] py-[9px]">
                <span className="text-[9.5px] font-extrabold tracking-widest text-ink-3">
                  READINESS
                </span>
                <span className="hud-num font-mono text-[15px] font-extrabold text-accent-bright">
                  {kpi.readinessNasional}%
                </span>
              </div>
              <div className="flex items-center justify-between px-[10px] pb-[9px]">
                <span className="text-[9.5px] font-extrabold tracking-widest text-ink-3">
                  CAKUPAN
                </span>
                <span className="text-[12px] text-ink-2">Nasional</span>
              </div>
              <DropdownMenu.Separator className="my-[4px] h-px bg-border-soft" />
              <DropdownMenu.Item className={menuItemClass} onSelect={() => setSearchOpen(true)}>
                <Search className="size-4 shrink-0" strokeWidth={1.5} />
                Cari...
              </DropdownMenu.Item>
              <DropdownMenu.Item className={menuItemClass} onSelect={() => router.push("/pengaturan")}>
                <Settings className="size-4 shrink-0" strokeWidth={1.5} />
                Pengaturan
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-[4px] h-px bg-border-soft" />
              {user ? (
                <DropdownMenu.Item
                  className={cn(menuItemClass, "text-[#F5A9A5]")}
                  onSelect={() => {
                    void signOutAction();
                  }}
                >
                  <LogOut className="size-4 shrink-0" strokeWidth={2} />
                  Keluar
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item asChild>
                  <a href="/login" className={menuItemClass}>
                    <LogOut className="size-4 shrink-0" strokeWidth={2} />
                    Masuk
                  </a>
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
