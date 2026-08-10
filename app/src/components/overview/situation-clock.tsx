"use client";

import { useEffect, useState } from "react";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function format(date: Date) {
  const hari = HARI[date.getDay()];
  const tanggal = String(date.getDate()).padStart(2, "0");
  const bulan = BULAN[date.getMonth()];
  const tahun = date.getFullYear();
  const jam = date.toLocaleTimeString("id-ID", { hour12: false });
  return `${hari.toUpperCase()}, ${tanggal} ${bulan.toUpperCase()} ${tahun} · ${jam} WIB`;
}

export function SituationClock() {
  // Lazy-init dengan waktu render saat ini (server & client masing-masing render sekali dengan
  // timestamp masing-masing) — mismatch satu detik disembunyikan via suppressHydrationWarning,
  // lalu interval di bawah langsung menyinkronkan ke waktu client sesungguhnya.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-[11.5px] text-ink-2" suppressHydrationWarning>
      {format(now)}
    </span>
  );
}
