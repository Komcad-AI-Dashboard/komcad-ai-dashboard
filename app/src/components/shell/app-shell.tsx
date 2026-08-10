"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const STORAGE_KEY = "komcad.sidebarCollapsed";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Session["user"] | null;
}) {
  const [collapsed, setCollapsed] = useState(false);

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
    <div className="flex h-screen bg-base">
      <Sidebar collapsed={collapsed} user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={toggle} user={user} />
        <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
      </div>
    </div>
  );
}
