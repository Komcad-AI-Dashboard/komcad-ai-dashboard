"use client";

import { useEffect, useRef, useState } from "react";

const DESIGN_WIDTH = 1600;

/**
 * Lebar minimum untuk memakai mode "kecilkan desain 1600px". Di bawah ini layout
 * beralih ke mode responsif 1x (tanpa transform sama sekali).
 *
 * Angkanya SENGAJA sama persis dengan breakpoint `xl` Tailwind (1280px), dan itu yang
 * bikin seluruh pendekatan ini jalan: media query di dalam AutoScale selalu diukur dari
 * viewport ASLI, bukan dari lebar wrapper yang sudah di-transform. Karena ambangnya
 * disamakan, "viewport >= 1280" selalu berarti dua hal sekaligus — mode skala aktif DAN
 * varian `xl:` menyala. Jadi komponen cukup ditulis mobile-first: kelas dasar = layout HP,
 * varian `xl:` = layout Command Center 1600px. Kalau ambang ini diubah tanpa mengubah
 * breakpoint yang dipakai komponen, layout HP bakal bocor ke desktop (atau sebaliknya).
 */
const SCALE_MIN_WIDTH = 1280;

export function AutoScale({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width) return;
      // Di bawah ambang, JANGAN dikecilkan: di HP 390px faktornya jadi ~0.24 dan teks 15px
      // ikut mengecil ke ~3.7px (dilaporkan user: "gak terbaca sama sekali"). Layout responsif
      // 1x jauh lebih terbaca daripada Command Center utuh yang diperkecil seperempatnya.
      setScale(width < SCALE_MIN_WIDTH ? 1 : Math.min(1, width / DESIGN_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          width: `${100 / scale}vw`,
          height: `${100 / scale}vh`,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
