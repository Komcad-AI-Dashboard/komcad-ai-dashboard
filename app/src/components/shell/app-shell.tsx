"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import type { getTopbarKpi } from "@/lib/overview-data";
import { BuatMisiModal } from "@/components/misi/buat-misi-modal";
import { AutoScale } from "./auto-scale";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const STORAGE_KEY = "siaga.sidebarCollapsed";

export type TopbarKpi = Awaited<ReturnType<typeof getTopbarKpi>>;

export function AppShell({
  children,
  user,
  kpi,
  ticker,
}: {
  children: React.ReactNode;
  user: Session["user"] | null;
  kpi: TopbarKpi;
  /** Diterima sebagai ReactNode (bukan data mentah lalu di-render di sini) supaya NewsTicker
   * tetap Server Component: waktu terbitnya diformat di server dengan zona Asia/Jakarta, dan
   * daftar berita tidak ikut terkirim ke bundle client. */
  ticker: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [buatMisiOpen, setBuatMisiOpen] = useState(false);

  useEffect(() => {
    // Baca preferensi tersimpan sekali setelah mount — localStorage tidak tersedia saat SSR,
    // jadi ini sengaja bukan derivasi dari state/props React, melainkan sync dari sistem eksternal.
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  /**
   * Satu tombol hamburger, dua perilaku: di desktop menciutkan kolom sidebar (preferensinya
   * disimpan), di HP membuka drawer melayang. Mode dicek saat KLIK lewat matchMedia, bukan saat
   * render — kalau dicek saat render, server (yang tidak punya viewport) dan client bisa
   * menyimpulkan mode berbeda dan itu memicu hydration mismatch.
   */
  function toggle() {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setCollapsed((prev) => {
        const next = !prev;
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        return next;
      });
      return;
    }
    setMobileNavOpen((prev) => !prev);
  }

  return (
    <AutoScale>
      {/* h-full (bukan h-screen) — di dalam AutoScale, elemen ini dibungkus wrapper yang
          di-transform:scale(); "100vh" tetap merujuk viewport ASLI (bukan tinggi wrapper),
          jadi kalau dipaksa h-screen konten cuma ngisi sebagian wrapper dan sisanya jadi
          celah hitam di bawah — sudah kejadian, dilaporkan user, ini fix-nya. */}
      <div className="flex h-full bg-base">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
          user={user}
          kpi={kpi}
        />
        {/* Backdrop drawer — hanya ada di bawah xl, tempat sidebar melayang di atas konten. */}
        {mobileNavOpen && (
          <button
            aria-label="Tutup menu"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-[2px] xl:hidden"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onToggleSidebar={toggle} onBuatMisi={() => setBuatMisiOpen(true)} user={user} kpi={kpi} />
          {ticker}
          <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
        </div>
        <BuatMisiModal open={buatMisiOpen} onOpenChange={setBuatMisiOpen} />
      </div>
    </AutoScale>
  );
}
