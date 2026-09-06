import type { BandEvaluasi, MisiEvaluasi } from "@/lib/analitik-evaluasi";

/** Warna mengikuti arti: kinerja bagus hijau, buruk amber. Kata nilainya SELALU ikut tertulis,
 * jadi warnanya bukan satu-satunya penanda. */
function warnaKinerja(rata: number) {
  return rata >= 3.5 ? "text-accent-bright" : rata >= 2.5 ? "text-ink" : "text-amber";
}

export function EvaluasiRekomendasiAi({ band, misi }: { band: BandEvaluasi[]; misi: MisiEvaluasi[] }) {
  if (band.length === 0) {
    return (
      <div className="text-[11.5px] text-ink-3">
        Belum ada Misi selesai yang personelnya sudah dinilai, jadi belum ada yang bisa dibandingkan.
      </div>
    );
  }

  const tertinggi = band[0];
  const terendah = band[band.length - 1];

  return (
    <div className="flex flex-col gap-4">
      {/* Kesimpulannya ditulis sebagai kalimat, bukan diserahkan ke pembaca untuk menyimpulkan
          sendiri dari tabel. Angkanya diambil dari data yang sama persis di bawah. */}
      <p className="text-[11.5px] leading-relaxed text-ink-2">
        Personel dengan skor rekomendasi <b className="text-ink">{tertinggi.label}</b> rata-rata dinilai{" "}
        <b className={warnaKinerja(tertinggi.rataKinerja)}>{tertinggi.rataKinerja} dari 4</b>, sedangkan yang{" "}
        <b className="text-ink">{terendah.label}</b> rata-rata{" "}
        <b className={warnaKinerja(terendah.rataKinerja)}>{terendah.rataKinerja} dari 4</b>. Selisihnya nyata, tapi
        tiap band punya pengecualian, jadi skor tinggi bukan jaminan.
      </p>

      <div className="overflow-hidden rounded-[8px] border border-border">
        <table className="hud-table-responsive w-full border-collapse text-left">
          <thead>
            <tr className="hud-head">
              {["SKOR AI", "PERSONEL", "RATA KINERJA", "BAIK ATAU LEBIH", "SEBARAN"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-[10px] text-[9px] font-extrabold tracking-[0.16em] text-ink-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {band.map((b) => (
              <tr key={b.label} className="border-b border-border-soft last:border-b-0">
                <td data-label="Skor AI" className="px-3 py-[10px] font-mono text-[12px] font-bold">
                  {b.label}
                </td>
                <td data-label="Personel" className="px-3 py-[10px] text-[12px]">
                  {b.jumlah}
                </td>
                <td data-label="Rata Kinerja" className={`px-3 py-[10px] font-mono text-[12px] font-bold ${warnaKinerja(b.rataKinerja)}`}>
                  {b.rataKinerja} / 4
                </td>
                <td data-label="Baik atau Lebih" className="px-3 py-[10px] font-mono text-[12px]">
                  {b.persenBaik}%
                </td>
                <td data-label="Sebaran" className="px-3 py-[10px] text-[11px] text-ink-2">
                  {b.sebaran.map((s) => `${s.nilai} ${s.jumlah}`).join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-border">
        <table className="hud-table-responsive w-full border-collapse text-left">
          <thead>
            <tr className="hud-head">
              {["ID MISI", "JENIS", "PERSONEL", "RATA SKOR AI", "RATA KINERJA", "DURASI", "EVALUASI"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border px-3 py-[10px] text-[9px] font-extrabold tracking-[0.16em] text-ink-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {misi.map((m) => (
              <tr key={m.kodeMisi} className="border-b border-border-soft last:border-b-0">
                <td data-label="ID Misi" className="px-3 py-[10px] font-mono text-[12px]">
                  {m.kodeMisi}
                </td>
                <td data-label="Jenis" className="px-3 py-[10px] text-[12px]">
                  {m.jenisKejadian}
                </td>
                <td data-label="Personel" className="px-3 py-[10px] text-[12px]">
                  {m.personel}
                </td>
                <td data-label="Rata Skor AI" className="px-3 py-[10px] font-mono text-[12px]">
                  {m.rataSkorAi}
                </td>
                <td
                  data-label="Rata Kinerja"
                  className={`px-3 py-[10px] font-mono text-[12px] font-bold ${m.rataKinerja === null ? "text-ink-3" : warnaKinerja(m.rataKinerja)}`}
                >
                  {m.rataKinerja === null ? "—" : `${m.rataKinerja} / 4`}
                </td>
                <td data-label="Durasi" className="px-3 py-[10px] text-[12px] text-ink-2">
                  {m.durasiHari === null ? "—" : `${m.durasiHari} hari`}
                </td>
                <td
                  data-label="Evaluasi"
                  className="px-3 py-[10px] text-[12px] text-ink-2 xl:max-w-[260px] xl:truncate"
                  title={m.hasilEvaluasi ?? undefined}
                >
                  {m.hasilEvaluasi ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
