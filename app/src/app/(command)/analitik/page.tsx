import { getAnalitikKpi, getReadinessPerWilayah } from "@/lib/analitik-data";

function KpiCard({ label, value, sub, valueClassName }: { label: string; value: string; sub?: string; valueClassName?: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface p-3">
      <div className="text-[10px] font-extrabold tracking-wide text-ink-2">{label}</div>
      <div className={`mt-1 text-[22px] font-extrabold ${valueClassName ?? ""}`}>{value}</div>
      {sub && <div className="mt-[2px] text-[10.5px] text-ink-3">{sub}</div>}
    </div>
  );
}

export default async function AnalitikPage() {
  const [kpi, readiness] = await Promise.all([getAnalitikKpi(), getReadinessPerWilayah()]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 grid grid-cols-4 gap-3">
        <KpiCard label="READINESS NASIONAL" value={String(kpi.readinessNasional)} valueClassName="text-accent-bright" />
        <KpiCard label="MISI SELESAI (30 HARI)" value={String(kpi.misiSelesai30Hari)} />
        <KpiCard
          label="SERTIFIKASI KEDALUWARSA"
          value={String(kpi.sertifikasiKedaluwarsa)}
          sub={kpi.sertifikasiKedaluwarsa > 0 ? "butuh tindak lanjut" : undefined}
          valueClassName={kpi.sertifikasiKedaluwarsa > 0 ? "text-amber" : ""}
        />
        <KpiCard
          label="AI MOBILIZATION UPTIME"
          value={kpi.aiUptimePersen === null ? "—" : `${kpi.aiUptimePersen}%`}
          sub={
            kpi.totalGenerateAi === 0
              ? "belum ada data (belum pernah generate Misi)"
              : `dari ${kpi.totalGenerateAi} kali generate rekomendasi`
          }
          valueClassName="text-accent-bright"
        />
      </div>

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-3 text-[12px] font-extrabold">Readiness Score per Wilayah</h3>
        {readiness.length === 0 && (
          <div className="text-[11.5px] text-ink-3">Belum ada data provinsi anggota.</div>
        )}
        <div className="flex flex-col gap-2">
          {readiness.map((r) => (
            <div key={r.provinsi} className="flex items-center gap-3">
              <div className="w-[160px] shrink-0 text-[12px] font-semibold">{r.provinsi}</div>
              <div className="flex flex-1 items-center gap-[10px]">
                <div className="h-2 flex-1 overflow-hidden rounded-[4px] bg-elevated">
                  <div className="h-full bg-accent-bright" style={{ width: `${r.score}%` }} />
                </div>
                <div className="w-[34px] shrink-0 text-right font-mono text-[13px] font-bold">{r.score}</div>
              </div>
              <div className="w-[90px] shrink-0 text-right text-[10.5px] text-ink-3">{r.jumlahAnggota} anggota</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
