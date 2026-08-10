"use client";

import "leaflet/dist/leaflet.css";
import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import type { MapAnggota, MapMisi } from "@/lib/overview-data";
import type { PosKomando } from "@/lib/pos-komando";

const INDONESIA_BOUNDS = latLngBounds([-11.5, 93.5], [7, 141.5]);

export type LayerVisibility = {
  anggota: boolean;
  siaga: boolean;
  misi: boolean;
  pos: boolean;
};

function urgensiColorHex(urgensi: string) {
  if (urgensi === "Kritis") return "#E14C45";
  if (urgensi === "Tinggi") return "#E0A83E";
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
      zoomControl
      attributionControl={false}
      className="absolute inset-0 bg-base"
    >
      <ResizeHandler />
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="tactical-tiles" maxZoom={19} />

      {layers.anggota &&
        siap.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.lat, a.lng]}
            radius={6}
            pathOptions={{ color: "#3CF29A", weight: 1.5, fillColor: "#3CF29A", fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onSelectAnggota(a) }}
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
            eventHandlers={{ click: () => onSelectAnggota(a) }}
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
                eventHandlers={{ click: () => onSelectMisi(m) }}
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
