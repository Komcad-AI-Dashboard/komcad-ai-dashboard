"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Maximize2, X } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { LayerVisibility } from "./situation-map";
import { LayersPanel } from "./layers-panel";
import { Legend } from "./legend";
import { TrainingPanel } from "./training-panel";
import { BottomPanelShell } from "./bottom-panel-shell";
import { StatsPanelContent } from "./stats-panel-content";
import { FeedPanelContent } from "./feed-panel-content";
import { AiPanelContent } from "./ai-panel-content";
import { SituationClock } from "./situation-clock";
import { AnggotaCvDrawerContent } from "@/components/anggota/anggota-cv-drawer-content";
import { MisiDetailDrawerContent } from "@/components/misi/misi-detail-drawer-content";
import { getAnggotaCvAction, getMisiDetailForOverviewAction } from "@/lib/overview-actions";
import type { AnggotaFull } from "@/lib/anggota-data";
import type { MisiListItem } from "@/lib/misi-data";
import type { Role } from "@/lib/constants";
import type {
  MapAnggota,
  MapMisi,
  FeedItem,
  getAktivitasPelatihanTerbaru,
  getStatistikAnggota,
  getAiMobilizationSummary,
} from "@/lib/overview-data";
import type { PosKomando } from "@/lib/pos-komando";

const SituationMap = dynamic(() => import("./situation-map").then((m) => m.SituationMap), {
  ssr: false,
});

type Aktivitas = Awaited<ReturnType<typeof getAktivitasPelatihanTerbaru>>[number];
type Statistik = Awaited<ReturnType<typeof getStatistikAnggota>>;
type AiSummary = Awaited<ReturnType<typeof getAiMobilizationSummary>>;

type PanelKey = "stats" | "feed" | "ai";
const PANEL_TITLES: Record<PanelKey, string> = {
  stats: "Statistik Anggota",
  feed: "Misi Terbaru",
  ai: "AI Mobilization",
};

type Selection =
  | { type: "anggota"; data: MapAnggota }
  | { type: "misi"; data: MapMisi }
  | { type: "training"; data: Aktivitas }
  | null;

export function OverviewView({
  anggota,
  misi,
  posKomando,
  aktivitasPelatihan,
  stats,
  feed,
  aiSummary,
  autoRefresh,
  heatzoneDefault,
  role,
}: {
  anggota: MapAnggota[];
  misi: MapMisi[];
  posKomando: PosKomando[];
  aktivitasPelatihan: Aktivitas[];
  stats: Statistik;
  feed: FeedItem[];
  aiSummary: AiSummary;
  autoRefresh: boolean;
  heatzoneDefault: boolean;
  role: Role | undefined;
}) {
  const router = useRouter();
  const [layers, setLayers] = useState<LayerVisibility>({
    anggota: true,
    siaga: true,
    misi: true,
    pos: true,
    heatzone: heatzoneDefault,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [hiddenPanels, setHiddenPanels] = useState<Set<PanelKey>>(new Set());
  const [selection, setSelection] = useState<Selection>(null);
  const [fullAnggota, setFullAnggota] = useState<AnggotaFull | null>(null);
  const [fullMisi, setFullMisi] = useState<MisiListItem | null>(null);
  const [, startDetailTransition] = useTransition();

  // Klik marker/zona di peta cuma bawa data ringkas (MapAnggota/MapMisi) — begitu drawer terbuka,
  // ambil detail penuh on-demand (bukan dimuat sekaligus di awal untuk seluruh anggota/Misi) supaya
  // drawer ini bisa menampilkan CV lengkap / detail Misi lengkap yang sama dengan menu Direktori
  // Anggota & Manajemen Misi, bukan versi ringkas terpisah.
  useEffect(() => {
    if (selection?.type === "anggota") {
      const id = selection.data.id;
      startDetailTransition(async () => {
        const data = await getAnggotaCvAction(id);
        setFullAnggota(data);
      });
    } else if (selection?.type === "misi") {
      const id = selection.data.id;
      startDetailTransition(async () => {
        const data = await getMisiDetailForOverviewAction(id);
        setFullMisi(data);
      });
    }
  }, [selection]);

  // Preferensi "Auto-refresh data peta" (menu Pengaturan) — polling revalidate data server tiap 5
  // detik, mendekati target FR-07 (≤5 detik). Ini bukan push real-time sungguhan (masih
  // request-based, jadi latensi sebenarnya sedikit di atas 5 detik tergantung waktu request), tapi
  // jauh lebih dekat ke target dibanding interval 15 detik sebelumnya.
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, router]);

  function toggleLayer(key: keyof LayerVisibility) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function hidePanel(key: PanelKey) {
    setHiddenPanels((prev) => new Set(prev).add(key));
  }

  function showPanel(key: PanelKey) {
    setHiddenPanels((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  const allHidden = hiddenPanels.size === 3;
  function toggleAllPanels() {
    setHiddenPanels(allHidden ? new Set() : new Set(["stats", "feed", "ai"]));
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-soft px-[18px] py-[9px]">
        <h2 className="text-[12px] font-extrabold tracking-widest">SITUASI KESIAPSIAGAAN NASIONAL</h2>
        <SituationClock />
        <button
          onClick={toggleAllPanels}
          className="ml-[10px] rounded-[6px] border border-accent px-3 py-[6px] text-[12px] font-bold text-accent-bright hover:bg-accent-bright/10"
        >
          {allHidden ? "Tampilkan Semua Panel ▸" : "Sembunyikan Semua Panel ▾"}
        </button>
      </div>

      <div
        className={cn(
          "relative min-h-0 flex-1 bg-base",
          fullscreen && "fixed inset-0 z-[3000]"
        )}
      >
        <SituationMap
          anggota={anggota}
          misi={misi}
          posKomando={posKomando}
          layers={layers}
          onSelectAnggota={(a) => setSelection({ type: "anggota", data: a })}
          onSelectMisi={(m) => setSelection({ type: "misi", data: m })}
        />

        <LayersPanel layers={layers} onToggle={toggleLayer} />

        <button
          onClick={() => setFullscreen((v) => !v)}
          title={fullscreen ? "Keluar layar penuh" : "Tampilan layar penuh"}
          className={cn(
            "absolute top-[14px] z-[500] flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-black/88 text-ink-2 backdrop-blur-sm hover:text-ink",
            fullscreen ? "right-[14px]" : "right-[272px]"
          )}
        >
          {fullscreen ? <X className="size-4" strokeWidth={1.5} /> : <Maximize2 className="size-4" strokeWidth={1.5} />}
        </button>

        <TrainingPanel
          items={aktivitasPelatihan}
          onSelect={(t) => setSelection({ type: "training", data: t })}
        />

        <Legend />
      </div>

      {hiddenPanels.size > 0 && (
        <div className="flex shrink-0 gap-2 border-t border-border-soft bg-base px-[14px] py-[6px]">
          {Array.from(hiddenPanels).map((key) => (
            <button
              key={key}
              onClick={() => showPanel(key)}
              className="flex items-center gap-[6px] rounded-[6px] border border-dashed border-border px-[10px] py-[5px] text-[10.5px] font-bold text-ink-2 hover:border-accent-bright hover:text-accent-bright"
            >
              <span className="text-[12px]">＋</span>
              {PANEL_TITLES[key]}
            </button>
          ))}
        </div>
      )}

      <div className="flex h-[290px] shrink-0 border-t border-border">
        {!hiddenPanels.has("stats") && (
          <BottomPanelShell
            title="STATISTIK ANGGOTA"
            flexGrow={1.1}
            liveTag={
              <span className="rounded-[10px] bg-cyan px-2 py-[2px] text-[9px] font-extrabold tracking-wide text-[#00131A]">
                NASIONAL
              </span>
            }
            onHide={() => hidePanel("stats")}
          >
            <StatsPanelContent stats={stats} />
          </BottomPanelShell>
        )}
        {!hiddenPanels.has("feed") && (
          <BottomPanelShell
            title="MISI TERBARU"
            flexGrow={1.3}
            badge={
              <span className="font-mono text-[11px] text-red">● {misi.length}</span>
            }
            onHide={() => hidePanel("feed")}
          >
            <FeedPanelContent items={feed} />
          </BottomPanelShell>
        )}
        {!hiddenPanels.has("ai") && (
          <BottomPanelShell
            title="AI MOBILIZATION"
            flexGrow={1.1}
            liveTag={
              <span className="rounded-[10px] bg-accent-bright px-2 py-[2px] text-[9px] font-extrabold tracking-wide text-[#00170C]">
                ● LIVE
              </span>
            }
            onHide={() => hidePanel("ai")}
          >
            <AiPanelContent data={aiSummary} />
          </BottomPanelShell>
        )}
      </div>

      <Drawer
        open={selection !== null}
        onOpenChange={(open) => !open && setSelection(null)}
        title={
          selection?.type === "anggota"
            ? selection.data.nama
            : selection?.type === "misi"
              ? selection.data.kodeMisi
              : selection?.type === "training"
                ? selection.data.nama
                : "Detail"
        }
      >
        {selection?.type === "anggota" && (
          fullAnggota?.id === selection.data.id ? (
            <AnggotaCvDrawerContent
              anggota={fullAnggota}
              role={role}
              onEdit={() => router.push("/anggota")}
              onDeactivated={() => {
                setSelection(null);
                router.refresh();
              }}
            />
          ) : (
            <div className="py-8 text-center text-[12px] text-ink-2">Memuat profil lengkap...</div>
          )
        )}
        {selection?.type === "misi" && (
          fullMisi?.id === selection.data.id ? (
            <MisiDetailDrawerContent misi={fullMisi} role={role} />
          ) : (
            <div className="py-8 text-center text-[12px] text-ink-2">Memuat detail Misi...</div>
          )
        )}
        {selection?.type === "training" && (
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 text-[10px] font-extrabold tracking-wide text-ink-2">LOKASI</div>
              <div className="text-[13px] font-semibold">{selection.data.lokasi}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-extrabold tracking-wide text-ink-2">TANGGAL</div>
              <div className="text-[13px] font-semibold">
                {selection.data.tanggal.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-extrabold tracking-wide text-ink-2">JUMLAH PESERTA</div>
              <div className="font-mono text-[13px] font-semibold">{selection.data.peserta} anggota</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
