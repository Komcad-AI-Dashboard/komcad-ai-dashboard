"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { MEMBER_NAV, PRODUK_NAMA } from "@/lib/constants";
import { NavIcon } from "@/components/shell/nav-icon";
import { BrandTagline } from "@/components/shell/brand-tagline";
import { cn } from "@/lib/utils";

export function MobileShell({ children, unreadCount }: { children: React.ReactNode; unreadCount: number }) {
  const pathname = usePathname();

  return (
    <div className="flex justify-center bg-base">
      <div className="flex min-h-screen w-full max-w-[430px] flex-col bg-base">
        <header className="sticky top-0 z-50 border-b border-border bg-base px-4 py-[11px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-5 w-[26px] shrink-0 flex-col overflow-hidden rounded-[3px] border border-border">
              <div className="flex-1 bg-[#D8302A]" />
              <div className="flex-1 bg-[#F2F2F2]" />
            </div>
            <div>
              <div className="text-[14px] font-black tracking-[0.13em]">{PRODUK_NAMA}</div>
              <div className="text-[8px] font-bold tracking-[0.28em] text-accent-bright">SISI ANGGOTA</div>
            </div>
            <div className="flex-1" />
            <Link
              href="/m/notifikasi"
              className="relative flex size-8 items-center justify-center rounded-[8px] border border-border bg-elevated text-ink-2"
            >
              <Bell className="size-4" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -right-[3px] -top-[3px] size-[9px] rounded-full border-2 border-base bg-red" />
              )}
            </Link>
          </div>
          {/* Layar 430px cukup lebar untuk menampung kepanjangan dalam satu baris di 8px. */}
          <BrandTagline className="mt-[7px] border-t border-border-soft pt-[6px]" />
        </header>

        <main className="flex flex-1 flex-col gap-[14px] px-4 pb-[90px] pt-[14px]">{children}</main>

        <nav className="fixed bottom-0 left-1/2 z-[100] flex w-full max-w-[430px] -translate-x-1/2 gap-1 border-t border-border bg-base px-[6px] pb-[10px] pt-2">
          {MEMBER_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-[3px] rounded-[10px] px-[2px] py-[6px] text-ink-3",
                  active && "text-accent-bright"
                )}
              >
                <NavIcon name={item.icon} className="size-5" />
                <span className="text-[9.5px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
