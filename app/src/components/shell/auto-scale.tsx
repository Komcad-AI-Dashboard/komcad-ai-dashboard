"use client";

import { useEffect, useState } from "react";

/** Command Center HUD didesain dengan ukuran px tetap (bukan responsive), pas dilihat di kanvas
 * selebar ini. Di layar yang lebih sempit, hasilnya kepotong/sesak kecuali user zoom-out manual
 * (Ctrl-). AutoScale menghitung skala itu otomatis dari lebar viewport asli, jadi user tidak perlu
 * zoom manual — efeknya sama seperti Ctrl- tapi otomatis menyesuaikan ke ukuran layar tiap orang. */
const DESIGN_WIDTH = 1600;

export function AutoScale({ children }: { children: React.ReactNode }) {
  const [dims, setDims] = useState<{ scale: number; height: number } | null>(null);

  useEffect(() => {
    function sync() {
      const scale = Math.min(1, window.innerWidth / DESIGN_WIDTH);
      setDims({ scale, height: window.innerHeight / scale });
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // Render tanpa skala dulu di render pertama (dims null, sama antara server & client) — begitu
  // efek di atas jalan (client-only, lebar window baru bisa dibaca), skala sungguhan diterapkan.
  if (!dims) return children;

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          width: DESIGN_WIDTH,
          height: dims.height,
          transform: `scale(${dims.scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
