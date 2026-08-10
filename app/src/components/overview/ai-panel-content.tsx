import type { getAiMobilizationSummary } from "@/lib/overview-data";

type AiSummary = Awaited<ReturnType<typeof getAiMobilizationSummary>>;

export function AiPanelContent({ data }: { data: AiSummary }) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-[14px] py-3">
      {data.misi ? (
        <>
          <div className="rounded-[8px] border border-cyan/30 bg-cyan/[0.07] p-[11px]">
            <div className="mb-[7px] flex items-center gap-[6px] text-[10px] font-extrabold tracking-wide text-cyan">
              ◈ RINGKASAN AI — {data.misi.kodeMisi}
            </div>
            <p className="text-[11.5px] leading-relaxed">
              {data.misi.ringkasanAI ?? (
                <>
                  Misi <b>{data.misi.lokasi}</b> ({data.misi.jenisKejadian}) berstatus Dimobilisasi
                  dengan {data.kandidat.length} personel direkomendasikan. Ringkasan AI penuh akan
                  tersedia setelah Modul AI Mobilization aktif (Fase 6).
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-[8px]">
            {data.kandidat.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-[8px] rounded-[6px] border border-border bg-surface px-[10px] py-[8px] hover:border-accent"
              >
                <div className="w-[28px] text-center font-mono text-[13px] font-extrabold text-accent-bright">
                  {c.score}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold">{c.nama}</div>
                  <div className="text-[9.5px] text-ink-2">{c.alasan}</div>
                </div>
                {c.etaMenit != null && (
                  <div className="whitespace-nowrap font-mono text-[10px] text-amber">
                    {c.etaMenit >= 60
                      ? `${Math.floor(c.etaMenit / 60)}j ${c.etaMenit % 60}m`
                      : `${c.etaMenit} mnt`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[8px] border border-border bg-surface p-[14px] text-[11.5px] text-ink-2">
          Tidak ada Misi berstatus Dimobilisasi saat ini.
        </div>
      )}

      <div className="border-t border-border pt-[10px]">
        <div className="mb-2 flex items-center gap-2">
          <h4 className="flex-1 text-[10px] font-extrabold tracking-wide">READINESS TIMELINE</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="font-mono text-[19px] font-extrabold">{data.misiAktifCount}</div>
            <div className="text-[9px] leading-tight text-ink-2">Misi aktif/kritis</div>
          </div>
          <div>
            <div className="font-mono text-[19px] font-extrabold">{data.misiSevenDaysCount}</div>
            <div className="text-[9px] leading-tight text-ink-2">Mobilisasi 7 hari</div>
          </div>
          <div>
            <div className="font-mono text-[19px] font-extrabold text-ink-3">—</div>
            <div className="text-[9px] leading-tight text-ink-2">
              Δ Readiness (belum ada data historis)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
