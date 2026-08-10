import type { getStatistikAnggota } from "@/lib/overview-data";

type Statistik = Awaited<ReturnType<typeof getStatistikAnggota>>;

export function StatsPanelContent({ stats }: { stats: Statistik }) {
  const total = stats.laki + stats.perempuan;
  const lakiPct = total > 0 ? Math.round((stats.laki / total) * 100) : 0;
  const perempuanPct = 100 - lakiPct;
  const maxProv = Math.max(1, ...stats.provinsi.map((p) => p.jumlah));

  return (
    <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto px-[14px] py-3">
      <div>
        <div className="hud-label mb-2 flex items-center gap-2 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
          KOMPOSISI GENDER
        </div>
        <div className="flex h-[10px] overflow-hidden rounded-full bg-elevated">
          <div className="h-full bg-cyan" style={{ width: `${lakiPct}%` }} />
          <div className="h-full bg-[#E06BB0]" style={{ width: `${perempuanPct}%` }} />
        </div>
        <div className="mt-[6px] flex justify-between text-[10.5px] text-ink-2">
          <span>
            ● Laki-laki <b className="text-ink">{stats.laki.toLocaleString("id-ID")}</b> ({lakiPct}%)
          </span>
          <span>
            ● Perempuan <b className="text-ink">{stats.perempuan.toLocaleString("id-ID")}</b> ({perempuanPct}%)
          </span>
        </div>
      </div>

      <div className="flex gap-[10px]">
        <div className="relative flex-1 overflow-hidden rounded-[8px] border border-border bg-white/[0.02] p-[10px] before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-accent">
          <div className="hud-num font-mono text-[21px] font-extrabold">
            {stats.total.toLocaleString("id-ID")}
          </div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Total anggota terdaftar</div>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-[8px] border border-border bg-white/[0.02] p-[10px] before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-accent">
          <div className="hud-num font-mono text-[21px] font-extrabold text-accent-bright">
            {stats.aktif.toLocaleString("id-ID")}
          </div>
          <div className="mt-[2px] text-[9.5px] text-ink-2">Berstatus aktif</div>
        </div>
      </div>

      <div>
        <div className="hud-label mb-2 flex items-center gap-2 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
          PROVINSI TERBANYAK
        </div>
        {stats.provinsi.length === 0 && <div className="text-[11px] text-ink-3">Belum ada data.</div>}
        {stats.provinsi.map((p) => (
          <div key={p.nama} className="mb-[7px] flex items-center gap-2">
            <div className="w-[108px] shrink-0 truncate text-[10.5px] text-ink-2">{p.nama}</div>
            <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-[#12171a]">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-bright shadow-[0_0_10px_rgba(60,242,154,0.5)]"
                style={{ width: `${(p.jumlah / maxProv) * 100}%` }}
              />
            </div>
            <div className="w-[44px] shrink-0 text-right font-mono text-[10px]">
              {p.jumlah.toLocaleString("id-ID")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
