import { getAnalitikKpi, getReadinessPerWilayah } from "@/lib/analitik-data";
import { DeltaBulanLalu, Sparkline, trenKe } from "@/components/analitik/tren";
import { EvaluasiRekomendasiAi } from "@/components/analitik/evaluasi-ai";
import { getEvaluasiRekomendasiAi } from "@/lib/analitik-evaluasi";

function KpiCard({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="hud-brk hud-panel relative overflow-hidden rounded-[10px] border border-border p-[14px] after:absolute after:-right-8 after:-top-8 after:size-[90px] after:rounded-full after:bg-[radial-gradient(circle,rgba(60,242,154,0.14),transparent_70%)]">
      <div className="text-[9px] font-extrabold tracking-[0.16em] text-ink-3">{label}</div>
      <div className={`hud-num mt-[5px] font-mono text-[28px] font-extrabold ${valueClassName ?? ""}`}>
        {value}
      </div>
      {sub && <div className="mt-[2px] text-[10px] text-ink-3">{sub}</div>}
    </div>
  );
}

export default async function AnalitikPage() {
  const [kpi, readiness, evaluasi] = await Promise.all([
    getAnalitikKpi(),
    getReadinessPerWilayah(),
    getEvaluasiRekomendasiAi(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="READINESS NASIONAL"
          value={String(kpi.readinessNasional)}
          sub={<DeltaBulanLalu selisih={kpi.selisihReadiness} />}
          valueClassName="text-accent-bright"
        />
        <KpiCard label="MISI SELESAI (30 HARI)" value={String(kpi.misiSelesai30Hari)} />
        <KpiCard
          label="SERTIFIKASI KEDALUWARSA"
          value={String(kpi.sertifikasiKedaluwarsa)}
          sub={<DeltaBulanLalu selisih={kpi.selisihSertifikasiKedaluwarsa} />}
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

      <div className="mb-4 grid gap-3 xl:grid-cols-2">
        <div className="hud-brk hud-panel rounded-[10px] border border-border p-[16px]">
          <h3 className="hud-label mb-3 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
            TREN READINESS NASIONAL
          </h3>
          <Sparkline titik={trenKe(kpi.tren, "readiness")} label="Tren Readiness nasional" />
          {/* Disebut terang-terangan: titik yang lebih tua adalah rekonstruksi data demo, bukan
              hasil pengukuran. Jangan dihapus tanpa mengganti sumber datanya lebih dulu. */}
          <p className="mt-2 text-[9.5px] leading-relaxed text-ink-3">
            Titik sebelum bulan ini direkonstruksi dari data demo memakai formula Readiness yang
            sama. Komponen riwayat penugasan dibawa dari keadaan terkini, jadi bukan pengukuran.
          </p>
        </div>
        <div className="hud-brk hud-panel rounded-[10px] border border-border p-[16px]">
          <h3 className="hud-label mb-3 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
            TREN SERTIFIKASI KEDALUWARSA
          </h3>
          <Sparkline titik={trenKe(kpi.tren, "sertifikasiKedaluwarsa")} label="Tren sertifikasi kedaluwarsa" />
          <p className="mt-2 text-[9.5px] leading-relaxed text-ink-3">
            Dihitung dari tanggal berlaku tiap sertifikasi, bukan data buatan. Garis naik berarti
            makin banyak sertifikasi lewat masa berlaku dan belum diperpanjang.
          </p>
        </div>
      </div>

      <div className="hud-brk hud-panel rounded-[10px] border border-border p-[16px]">
        <h3 className="hud-label mb-4 flex items-center gap-2 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
          READINESS SCORE PER WILAYAH
        </h3>
        {readiness.length === 0 && (
          <div className="text-[11.5px] text-ink-3">Belum ada data provinsi anggota.</div>
        )}
        <div className="flex flex-col gap-2">
          {readiness.map((r) => (
            <div key={r.provinsi} className="flex items-center gap-3">
              <div className="w-[160px] shrink-0 text-[12px] font-semibold">{r.provinsi}</div>
              <div className="flex flex-1 items-center gap-[10px]">
                <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-[#12171a]">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-bright shadow-[0_0_10px_rgba(60,242,154,0.5)]"
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                <div className="w-[34px] shrink-0 text-right font-mono text-[13px] font-bold">{r.score}</div>
              </div>
              <div className="w-[150px] shrink-0 text-right text-[10.5px] text-ink-3">
                {r.jumlahAnggota} anggota
                {r.selisih !== null && r.selisih.nilai !== 0 && (
                  <span className={r.selisih.nilai > 0 ? " text-accent-bright" : " text-amber"}>
                    {" "}
                    ({r.selisih.nilai > 0 ? "+" : "-"}
                    {Math.abs(r.selisih.nilai)})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hud-brk hud-panel mt-4 rounded-[10px] border border-border p-[16px]">
        <h3 className="hud-label mb-1 text-[9px] font-extrabold tracking-[0.18em] text-ink-3">
          EVALUASI REKOMENDASI AI
        </h3>
        {/* Provenance ditulis di layar, bukan cuma di kode: separuh perbandingan ini nyata dan
            separuh lagi data demo, dan pembacanya berhak tahu yang mana. */}
        <p className="mb-3 text-[9.5px] leading-relaxed text-ink-3">
          Skor rekomendasi adalah angka yang benar-benar dikeluarkan AI Mobilization saat Misi
          dibuat. Penilaian kinerjanya data demo yang dibangkitkan skrip, karena sistem belum punya
          alur untuk mencatat penilaian saat Misi ditutup.
        </p>
        <EvaluasiRekomendasiAi band={evaluasi.band} misi={evaluasi.misi} />
      </div>
    </div>
  );
}
