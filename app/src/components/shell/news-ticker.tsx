import type { KategoriBerita, NewsHeadline } from "@/lib/news-ticker";

/** Detik per headline — kecepatan geser dihitung dari JUMLAH item (bukan durasi tetap), supaya
 * kecepatan bacanya konsisten baik saat feed lagi ramai maupun sepi. */
const DETIK_PER_HEADLINE = 11;

const WARNA_KATEGORI: Record<KategoriBerita, string> = {
  militer: "var(--accent-bright)",
  bencana: "var(--amber)",
  keamanan: "var(--red)",
};

const LABEL_KATEGORI: Record<KategoriBerita, string> = {
  militer: "PERTAHANAN",
  bencana: "BENCANA",
  keamanan: "KEAMANAN",
};

/** Running text berita real (RSS media nasional, lihat lib/news-ticker.ts) — bukan placeholder.
 * Server Component murni (cuma render + animasi CSS), tidak butuh "use client" — makanya
 * di-pass sebagai prop ReactNode dari layout, bukan di-import langsung ke AppShell yang client. */
export function NewsTicker({ headlines }: { headlines: NewsHeadline[] }) {
  if (headlines.length === 0) return null;

  // Digandakan sekali supaya animasi geser -50% terlihat menyambung tanpa jeda (teknik marquee
  // standar) — lihat .hud-ticker-track di globals.css untuk animasinya.
  const items = [...headlines, ...headlines];
  const durasi = headlines.length * DETIK_PER_HEADLINE;

  return (
    <div className="hud-ticker flex h-[34px] shrink-0 items-stretch border-b border-border bg-[#040806]">
      {/* Penanda siaran langsung — merah menyala, satu-satunya elemen "berdenyut" di bar ini. */}
      <div className="relative flex shrink-0 items-center gap-[7px] bg-red px-[12px]">
        <span className="hud-ticker-dot size-[6px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
        <span className="text-[9.5px] font-black tracking-[0.18em] text-white">LIVE</span>
      </div>

      <div className="hud-ticker-viewport relative min-w-0 flex-1 overflow-hidden">
        <div
          className="hud-ticker-track flex h-full w-max items-center whitespace-nowrap"
          style={{ animationDuration: `${durasi}s` }}
        >
          {items.map((h, i) => (
            <a
              key={`${h.link}-${i}`}
              href={h.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full shrink-0 items-center gap-[9px] px-[15px] hover:bg-white/[0.04]"
            >
              <span
                className="size-[6px] shrink-0 rounded-full"
                style={{ background: WARNA_KATEGORI[h.kategori] }}
              />
              <span
                className="text-[8.5px] font-black tracking-[0.14em]"
                style={{ color: WARNA_KATEGORI[h.kategori] }}
              >
                {LABEL_KATEGORI[h.kategori]}
              </span>
              <span className="text-[11.5px] text-ink-2 group-hover:text-ink">{h.title}</span>
              <span className="font-mono text-[9px] text-ink-3">
                {h.sumber}
                {h.waktu ? ` · ${h.waktu}` : ""}
              </span>
              <span className="text-[7px] text-border">◆</span>
            </a>
          ))}
        </div>
        {/* Gradien tepi: teks meluruh ke gelap alih-alih terpotong mendadak di kedua ujung. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[24px] bg-gradient-to-r from-[#040806] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[40px] bg-gradient-to-l from-[#040806] to-transparent" />
      </div>
    </div>
  );
}
