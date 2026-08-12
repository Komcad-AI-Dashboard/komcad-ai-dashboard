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
    // Lebar pakai 100% (bukan 100vw) dan tinggi 100dvh:
    // - 100vw ikut menghitung palang gulir. globals.css mengecilkan scrollbar jadi 8px, jadi di
    //   setiap halaman wrapper ini jadi ~9px lebih lebar dari kotak isi <html> dan seluruh dashboard
    //   bisa digeser ke samping sedikit — terukur ovf=9 di SEMUA halaman. 100% mengikuti kotak isi,
    //   jadi selisih itu hilang.
    // - 100dvh, bukan 100vh, supaya di browser HP tinggi mengikuti area yang benar-benar terlihat
    //   dan bagian bawah aplikasi tidak tertutup bilah URL. Di desktop dvh sama dengan vh.
    <div ref={outerRef} style={{ width: "100%", height: "100dvh", overflow: "hidden" }}>
      <div
        // Persen dari wrapper di atas, bukan satuan viewport: setelah di-scale hasilnya persis
        // sebesar wrapper, dan tidak ada lagi satuan yang diam-diam diukur dari viewport asli.
        style={{
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
