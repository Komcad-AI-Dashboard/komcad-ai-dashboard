import type { Selisih, TitikTren } from "@/lib/analitik-riwayat";

/** Selisih terhadap bulan lalu.
 *
 * Warnanya ikut ARTI, bukan tanda: Readiness naik itu perbaikan, sertifikasi kedaluwarsa naik itu
 * justru kemunduran. Karena itu `naikItuBaik` dibawa dari sumber datanya, tidak disimpulkan di
 * sini dari plus/minus.
 *
 * Warna juga tidak pernah jadi satu-satunya penanda: tanda + / - dan kata "dari bulan lalu" tetap
 * tertulis, jadi tetap terbaca kalau warnanya tidak terlihat. */
export function DeltaBulanLalu({ selisih, satuan = "" }: { selisih: Selisih; satuan?: string }) {
  if (selisih === null) {
    return <span className="text-ink-3">belum ada data bulan lalu</span>;
  }
  if (selisih.nilai === 0) {
    return <span className="text-ink-3">tetap dari bulan lalu</span>;
  }
  const naik = selisih.nilai > 0;
  const baik = naik === selisih.naikItuBaik;
  const tanda = naik ? "+" : "-";
  return (
    <span className={baik ? "text-accent-bright" : "text-amber"}>
      {tanda}
      {Math.abs(selisih.nilai)}
      {satuan} dari bulan lalu
    </span>
  );
}

/** Sparkline SVG buatan sendiri. Tidak ada pustaka grafik di proyek ini dan satu garis kecil belum
 * cukup jadi alasan menambah dependensi pertama — pola yang sama dipakai ReadinessRing di Sisi
 * Anggota (components/m-shell/beranda-view.tsx). */
export function Sparkline({
  titik,
  label,
  className,
}: {
  titik: { label: string; nilai: number | null }[];
  label: string;
  className?: string;
}) {
  const terisi = titik.filter((t) => t.nilai !== null) as { label: string; nilai: number }[];
  if (terisi.length < 2) {
    return <div className="text-[10px] text-ink-3">Belum cukup data untuk menggambar tren.</div>;
  }

  const w = 100;
  const h = 28;
  const nilai = terisi.map((t) => t.nilai);
  const min = Math.min(...nilai);
  const max = Math.max(...nilai);
  // Rentang datar tetap harus tergambar sebagai garis lurus di tengah, bukan dibagi nol.
  const rentang = max - min || 1;
  const koordinat = terisi.map((t, i) => {
    const x = (i / (terisi.length - 1)) * w;
    const y = h - ((t.nilai - min) / rentang) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-[28px] w-full"
        role="img"
        aria-label={`${label}: ${terisi.map((t) => `${t.label} ${t.nilai}`).join(", ")}`}
      >
        <polyline
          points={koordinat.join(" ")}
          fill="none"
          stroke="var(--accent-bright)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={koordinat[koordinat.length - 1].split(",")[0]}
          cy={koordinat[koordinat.length - 1].split(",")[1]}
          r={2}
          fill="var(--accent-bright)"
        />
      </svg>
      {/* Angka tetap ditulis di bawah garisnya — sparkline menunjukkan bentuk, bukan nilai, dan
          tanpa ini tidak ada cara membaca titiknya.

          Nilai dan bulannya SENGAJA ditumpuk, bukan disandingkan dalam satu baris. Waktu ditulis
          "Apr 49.9" berdampingan, keduanya terbaca sebagai satu satuan (dikira tanggal), dan
          pembaca harus melihat dua kali untuk sadar 49.9 itu nilainya. Titik terakhir ditebalkan
          karena itulah angka yang sama dengan yang besar di kartu KPI di atas. */}
      <div className="mt-[6px] flex justify-between gap-1">
        {terisi.map((t, i) => {
          const terakhir = i === terisi.length - 1;
          return (
            <div key={t.label} className="flex flex-col items-center leading-tight">
              <span
                className={
                  terakhir
                    ? "font-mono text-[11px] font-bold text-accent-bright"
                    : "font-mono text-[10.5px] text-ink-2"
                }
              >
                {t.nilai}
              </span>
              <span className="mt-[1px] text-[8.5px] uppercase tracking-wide text-ink-3">{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function trenKe(titik: TitikTren[], kunci: "readiness" | "sertifikasiKedaluwarsa") {
  return titik.map((t) => ({ label: t.label, nilai: kunci === "readiness" ? t.readiness : t.sertifikasiKedaluwarsa }));
}
