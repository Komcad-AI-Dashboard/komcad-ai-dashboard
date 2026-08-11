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
}: {
  children: React.ReactNode;
  user: Session["user"] | null;
  kpi: TopbarKpi;
}) {
  const [collapsed, setCollapsed] = useState(false);
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

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <AutoScale>
      <div className="flex h-screen bg-base">
        <Sidebar collapsed={collapsed} user={user} kpi={kpi} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onToggleSidebar={toggle} onBuatMisi={() => setBuatMisiOpen(true)} user={user} kpi={kpi} />
          <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
        </div>
        <BuatMisiModal open={buatMisiOpen} onOpenChange={setBuatMisiOpen} />
      </div>
    </AutoScale>
  );
}
