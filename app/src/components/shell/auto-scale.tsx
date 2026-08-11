"use client";

import { useEffect, useRef, useState } from "react";

/** Command Center HUD didesain dengan ukuran px tetap (bukan responsive), pas dilihat di kanvas
 * selebar ini. Di layar yang lebih sempit, hasilnya kepotong/sesak kecuali user zoom-out manual
 * (Ctrl-). AutoScale menghitung skala itu otomatis dari lebar viewport asli, jadi user tidak perlu
 * zoom manual — efeknya sama seperti Ctrl- tapi otomatis menyesuaikan ke ukuran layar tiap orang. */
const DESIGN_WIDTH = 1600;

export function AutoScale({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  // Default 1 (bukan null) — wrapper SELALU dirender sama persis di server & client pertama kali
  // (scale(1) di lebar viewport berapa pun = visual identik dengan tanpa wrapper), jadi tidak ada
  // celah hydration mismatch, dan tidak ada lagi cabang "kadang ada wrapper, kadang tidak".
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    // ResizeObserver, BUKAN window "resize" — window resize di sebagian kasus tidak menembak
    // secepat/sesering perubahan browser zoom sungguhan (beda dari resize jendela biasa), jadi
    // skalanya bisa nyangkut di nilai lama. ResizeObserver melacak ukuran KOTAK yang dirender
    // (bukan event dari OS/browser), jadi ikut berubah persis mengikuti zoom, resize window,
    // maupun perubahan sidebar DevTools sekalipun.
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width) return;
      setScale(Math.min(1, width / DESIGN_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          // Rumus relatif (vw/vh), BUKAN px tetap — lebar/tinggi-setelah-transform selalu
          // = (100/scale) * scale = 100vw/100vh, PERSIS, berapa pun nilai scale saat itu
          // (termasuk kalau kebetulan sesaat belum sempat ke-update ke nilai terbaru).
          width: `${100 / scale}vw`,
          height: `${100 / scale}vh`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
