"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { MEMBER_NAV } from "@/lib/constants";
import { NavIcon } from "@/components/shell/nav-icon";
import { BrandTagline } from "@/components/shell/brand-tagline";
import { signOutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

/**
 * Shell Sisi Anggota — dua bentuk sepenuhnya berbeda dipilih lewat breakpoint CSS `xl` (bukan
 * device-detection JS), pola sama seperti Command Center: kelas dasar = HP (bottom tab bar, kartu
 * sempit di-center, TIDAK diubah dari desain awal), varian `xl:` = desktop (sidebar kiri, konten
 * reading-width). Nama file diganti dari mobile-shell.tsx -> member-shell.tsx karena sekarang
 * merender keduanya, bukan cuma mobile.
 */
export function MemberShell({ children, unreadCount }: { children: React.ReactNode; unreadCount: number }) {
  const pathname = usePathname();

  return (
    <div className="flex justify-center bg-base xl:block">
      <div className="hud-mnav-shell flex min-h-screen w-full max-w-[430px] flex-col bg-base xl:max-w-none xl:flex-row">
        {/* Header mobile: brand ringkas + lonceng notifikasi. Disembunyikan di desktop — brand
            pindah ke sidebar, lonceng digantikan badge unread di item nav "Notifikasi". */}
        <header className="sticky top-0 z-50 border-b border-border bg-base px-4 py-[11px] xl:hidden">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/brand/logo-komcad.png"
              alt="Lambang Komponen Cadangan"
              width={30}
              height={30}
              className="size-[30px] shrink-0 object-contain"
            />
            <div>
              <div className="text-[14px] font-black tracking-[0.13em]">KOMCAD</div>
              <div className="text-[8px] font-bold tracking-[0.28em] text-accent-bright">SISI ANGGOTA</div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-[6px]">
              <Link
                href="/m/notifikasi"
                className="relative flex size-8 items-center justify-center rounded-[8px] border border-border bg-elevated text-ink-2"
              >
                <Bell className="size-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -right-[3px] -top-[3px] size-[9px] rounded-full border-2 border-base bg-red" />
                )}
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  aria-label="Keluar"
                  className="flex size-8 items-center justify-center rounded-[8px] border border-border bg-elevated text-ink-2"
                >
                  <LogOut className="size-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
          {/* Layar 430px cukup lebar untuk menampung kepanjangan dalam satu baris di 8px. */}
          <BrandTagline className="mt-[7px] border-t border-border-soft pt-[6px]" />
        </header>

        {/* Sidebar desktop — meniru bahasa visual Sidebar Command Center (src/components/shell/
            sidebar.tsx: gradient tipis + garis aksen kiri + glow saat aktif) supaya SIAGA terasa
            satu produk konsisten, bukan bikin paradigma nav ketiga (tab atas). */}
        <aside className="hidden shrink-0 flex-col border-r border-border-soft bg-gradient-to-b from-[#070a0b] to-black xl:flex xl:w-[220px]">
          <div className="flex items-center gap-[9px] border-b border-border-soft p-4">
            <Image
              src="/brand/logo-komcad.png"
              alt="Lambang Komponen Cadangan"
              width={32}
              height={32}
              className="size-8 shrink-0 object-contain"
            />
            <div>
              <div className="text-[15px] font-black tracking-[0.13em]">KOMCAD</div>
              <div className="mt-px text-[8.5px] font-bold tracking-[0.28em] text-accent-bright">
                SISI ANGGOTA
              </div>
            </div>
          </div>

          <nav className="flex-1 p-[10px] pt-[14px]">
            {MEMBER_NAV.map((item) => {
              const active = pathname === item.href;
              const showBadge = item.href === "/m/notifikasi" && unreadCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative mb-0.5 flex items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-hover hover:text-ink",
                    active &&
                      "bg-gradient-to-r from-accent-bright/[0.14] to-accent-bright/[0.02] font-bold text-accent-bright before:absolute before:inset-y-[6px] before:left-0 before:w-[2.5px] before:rounded-[2px] before:bg-accent-bright before:shadow-[0_0_10px_var(--accent-bright)]"
                  )}
                >
                  <NavIcon name={item.icon} className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="rounded-full bg-red px-[6px] font-mono text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border-soft p-[10px]">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-[9px] text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <LogOut className="size-4 shrink-0" strokeWidth={1.5} />
                Keluar
              </button>
            </form>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-[14px] px-4 pb-[calc(90px+env(safe-area-inset-bottom))] pt-[14px] xl:mx-auto xl:w-full xl:max-w-[880px] xl:px-8 xl:pb-10 xl:pt-10">
          {children}
        </main>

        {/* Bottom tab bar mobile — digantikan sidebar di desktop. */}
        <nav className="fixed bottom-0 left-1/2 z-[100] flex w-full max-w-[430px] -translate-x-1/2 gap-1 border-t border-border bg-base px-[6px] pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 xl:hidden">
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
