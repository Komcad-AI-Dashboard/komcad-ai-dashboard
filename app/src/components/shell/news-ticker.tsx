import type { NewsHeadline } from "@/lib/news-ticker";

/** Running text berita real (RSS media nasional, lihat lib/news-ticker.ts) — bukan placeholder.
 * Server Component murni (cuma render + animasi CSS), tidak butuh "use client". */
export function NewsTicker({ headlines }: { headlines: NewsHeadline[] }) {
  if (headlines.length === 0) return null;

  // Digandakan sekali supaya animasi geser -50% terlihat menyambung tanpa jeda (teknik marquee
  // standar) — lihat .hud-ticker-track di globals.css untuk animasinya.
  const items = [...headlines, ...headlines];

  return (
    <div className="hud-ticker flex h-[26px] shrink-0 items-center border-t border-border-soft bg-black/[0.92]">
      <span className="hud-label z-10 flex h-full shrink-0 items-center gap-[6px] bg-red px-[10px] text-[9.5px] font-black tracking-[0.15em] text-white">
        <span className="hud-ticker-dot size-[6px] rounded-full bg-white" />
        LIVE
      </span>
      <div className="hud-ticker-viewport min-w-0 flex-1 overflow-hidden">
        <div className="hud-ticker-track flex w-max items-center whitespace-nowrap">
          {items.map((h, i) => (
            <a
              key={`${h.link}-${i}`}
              href={h.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-[8px] px-[18px] text-[11px] text-ink-2 hover:text-accent-bright"
            >
              <span className="font-mono text-[9px] font-bold text-ink-3">{h.sumber}</span>
              <span>{h.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
