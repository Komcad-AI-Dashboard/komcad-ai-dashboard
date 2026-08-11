"use client";

import "leaflet/dist/leaflet.css";
import { Fragment, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { divIcon, latLngBounds, type LeafletEvent, type Path } from "leaflet";
import type { MapAnggota, MapMisi } from "@/lib/overview-data";
import type { PosKomando } from "@/lib/pos-komando";

const INDONESIA_BOUNDS = latLngBounds([-11.5, 93.5], [7, 141.5]);

export type LayerVisibility = {
  anggota: boolean;
  siaga: boolean;
  misi: boolean;
  pos: boolean;
  heatzone: boolean;
};

function urgensiColorHex(urgensi: string) {
  if (urgensi === "Kritis") return "#E14C45";
  if (urgensi === "Tinggi") return "#E0A83E";
  return "#3FA9C9";
}

/** Kepadatan anggota per grid ~1° (kasar, cukup untuk visual "zona padat" tanpa perlu library
 * heatmap tambahan) — dihitung di client dari titik lokasi yang sudah dimuat, bukan query terpisah. */
function computeHeatBins(anggota: MapAnggota[]) {
  const bins = new Map<string, { sumLat: number; sumLng: number; count: number }>();
  for (const a of anggota) {
    const key = `${Math.round(a.lat)}_${Math.round(a.lng)}`;
    const bin = bins.get(key);
    if (bin) {
      bin.sumLat += a.lat;
      bin.sumLng += a.lng;
      bin.count += 1;
    } else {
      bins.set(key, { sumLat: a.lat, sumLng: a.lng, count: 1 });
    }
  }
  return Array.from(bins.entries()).map(([key, b]) => ({
    key,
    lat: b.sumLat / b.count,
    lng: b.sumLng / b.count,
    count: b.count,
  }));
}

const DELAY_CLASSES = ["", "hud-delay-1", "hud-delay-2", "hud-delay-3"];
/** Kelas delay animasi "napas" marker, di-hash dari id supaya stabil per titik yang sama
 * (bukan dari posisi array, biar gak ikut geser tiap filter/urut ulang list). */
function breatheClass(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ["hud-marker-breathe", DELAY_CLASSES[hash % DELAY_CLASSES.length]].filter(Boolean);
}

/** pathOptions.className react-leaflet TIDAK selalu ke-apply ke elemen DOM (dikonfirmasi hilang
 * total di production build lokal — kebetulan kepasang di dev karena timing render yang beda).
 * ref callback JUGA tidak cukup — dipanggil React sebelum Leaflet sempat bikin elemen DOM path-nya
 * (`getElement()` masih undefined). Event Leaflet "add" (bukan React) baru nembak SETELAH layer
 * benar-benar ditambahkan ke map & elemen DOM-nya pasti sudah ada — ini yang dijamin jalan. */
function attachBreathe(id: string) {
  return (e: LeafletEvent) => {
    const el = (e.target as Path).getElement?.();
    if (el) el.classList.add(...breatheClass(id));
  };
}

function heatColor(count: number) {
  if (count >= 6) return "#E14C45";
  if (count >= 3) return "#E0A83E";
  return "#3FA9C9";
}

/** Auto invalidateSize saat container berubah ukuran (mode layar penuh, toggle sidebar, dll) — FR-19/NFR-10. */
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

const posIcon = divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border:2px solid #B08D4F;background:rgba(176,141,79,0.35);transform:rotate(45deg);"></div>`,
  iconSize: [14, 14],
});

export function SituationMap({
  anggota,
  misi,
  posKomando,
  layers,
  onSelectAnggota,
  onSelectMisi,
}: {
  anggota: MapAnggota[];
  misi: MapMisi[];
  posKomando: PosKomando[];
  layers: LayerVisibility;
  onSelectAnggota: (a: MapAnggota) => void;
  onSelectMisi: (m: MapMisi) => void;
}) {
  const siap = anggota.filter((a) => a.statusSiaga === "Aktif");
  const siaga = anggota.filter((a) => a.statusSiaga === "Siaga");

  return (
    <MapContainer
      bounds={INDONESIA_BOUNDS}
      maxBounds={INDONESIA_BOUNDS.pad(0.25)}
      minZoom={5}
      maxZoom={12}
      zoomControl={false}
      attributionControl={false}
      className="absolute inset-0 bg-base"
    >
      <ResizeHandler />
      {/* Kontrol zoom dipindah ke kanan-bawah: posisi bawaan (kiri-atas) tertimbun panel Layers. */}
      <ZoomControl position="bottomright" />
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="tactical-tiles" maxZoom={19} />

      {layers.heatzone &&
        computeHeatBins(anggota).map((b) => (
          <Circle
            key={b.key}
            center={[b.lat, b.lng]}
            radius={18000 + Math.min(b.count, 10) * 6000}
            pathOptions={{
              color: heatColor(b.count),
              weight: 1,
              fillColor: heatColor(b.count),
              fillOpacity: Math.min(0.12 + b.count * 0.03, 0.35),
            }}
            interactive={false}
          />
        ))}

      {layers.anggota &&
        siap.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.lat, a.lng]}
            radius={6}
            pathOptions={{ color: "#3CF29A", weight: 1.5, fillColor: "#3CF29A", fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onSelectAnggota(a), add: attachBreathe(a.id) }}
          >
            <Popup>
              <b>{a.nama}</b>
              <br />
              {a.kodeAnggota} · {a.statusSiaga}
              <br />
              Readiness: {a.readinessScore}
              <br />
              {a.kompetensi}
            </Popup>
          </CircleMarker>
        ))}

      {layers.siaga &&
        siaga.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.lat, a.lng]}
            radius={6}
            pathOptions={{ color: "#E0A83E", weight: 1.5, fillColor: "#E0A83E", fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onSelectAnggota(a), add: attachBreathe(a.id) }}
          >
            <Popup>
              <b>{a.nama}</b>
              <br />
              {a.kodeAnggota} · {a.statusSiaga}
              <br />
              Readiness: {a.readinessScore}
              <br />
              {a.kompetensi}
            </Popup>
          </CircleMarker>
        ))}

      {layers.misi &&
        misi.map((m) => {
          const color = urgensiColorHex(m.urgensi);
          return (
            <Fragment key={m.id}>
              <Circle
                center={[m.lat, m.lng]}
                radius={15000}
                pathOptions={{ color, weight: 1.5, fillColor: color, fillOpacity: 0.16 }}
                eventHandlers={{ click: () => onSelectMisi(m) }}
              />
              <CircleMarker
                center={[m.lat, m.lng]}
                radius={8}
                pathOptions={{ color, weight: 2, fillColor: "#000", fillOpacity: 0.9 }}
                eventHandlers={{ click: () => onSelectMisi(m), add: attachBreathe(m.id) }}
              >
                <Popup>
                  <b>{m.kodeMisi}</b>
                  <br />
                  {m.jenisKejadian} — {m.lokasi}
                  <br />
                  Status: {m.status} · Urgensi: {m.urgensi}
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}

      {layers.pos &&
        posKomando.map((p) => (
          <Marker key={p.nama} position={[p.lat, p.lng]} icon={posIcon}>
            <Popup>
              <b>{p.nama}</b>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
