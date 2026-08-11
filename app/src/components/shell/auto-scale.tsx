"use client";

import { useEffect, useState } from "react";

/** Command Center HUD didesain dengan ukuran px tetap (bukan responsive), pas dilihat di kanvas
 * selebar ini. Di layar yang lebih sempit, hasilnya kepotong/sesak kecuali user zoom-out manual
 * (Ctrl-). AutoScale menghitung skala itu otomatis dari lebar viewport asli, jadi user tidak perlu
 * zoom manual — efeknya sama seperti Ctrl- tapi otomatis menyesuaikan ke ukuran layar tiap orang. */
const DESIGN_WIDTH = 1600;

export function AutoScale({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    function sync() {
      // >= DESIGN_WIDTH: tidak usah dikecilin sama sekali (null = render natural, isi layout
      // fluid milik AppShell sendiri yang ngatur lebarnya, bukan dipaksa pas 1600px).
      const raw = window.innerWidth / DESIGN_WIDTH;
      setScale(raw >= 1 ? null : raw);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // Render tanpa skala dulu di render pertama (scale belum dihitung, sama antara server & client)
  // — begitu efek di atas jalan (client-only, lebar window baru bisa dibaca), skala baru diterapkan
  // kalau memang perlu (layar sempit).
  if (scale === null) return children;

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          // Dua-duanya rumus relatif (vw/vh), BUKAN width:DESIGN_WIDTH px tetap — supaya
          // lebar-setelah-transform = (100/scale)vw * scale = 100vw selalu, PERSIS identik
          // dengan tinggi, berapa pun viewport asli berubah setelahnya. Ini bikin geometrinya
          // tahan terhadap `scale` yang telat ke-update (mis. browser real zoom yang di sebagian
          // kasus tidak selalu memicu event "resize" secepat perubahannya) — pakai px tetap
          // dulu sempat bikin lebar "telat" sementara tinggi sudah benar, kelihatan seperti ada
          // bagian layar yang tidak ke-cover (dilaporkan user).
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
