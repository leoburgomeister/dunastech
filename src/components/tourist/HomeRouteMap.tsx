'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { type DestinoInfo } from '@/data/mockData';

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Invalidate size on mount to fix Leaflet rendering grey background inside animated containers
function MapResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const createCustomIcon = (active: boolean) => {
  const color = '#0A6EBD'; // DunasTech Primary Blue
  const activeScale = active ? 'scale(1.2)' : '';

  return L.divIcon({
    html: `
      <div style="
        transform: ${activeScale};
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></span>
      </div>
    `,
    className: 'custom-leaflet-icon-home',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface HomeRouteMapProps {
  destinations: DestinoInfo[];
}

export default function HomeRouteMap({ destinations }: HomeRouteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || destinations.length === 0) {
    return (
      <div className="w-full h-full bg-[var(--color-surface-alt)] flex items-center justify-center text-[var(--color-text-muted)] text-xs border border-[var(--color-border)]">
        Carregando mapa da rota...
      </div>
    );
  }

  // Calculate center
  const firstDest = destinations[0];
  const center: [number, number] = [firstDest.latitude, firstDest.longitude];
  const routePoints: [number, number][] = destinations.map((d) => [d.latitude, d.longitude]);

  return (
    <MapContainer
      center={center}
      zoom={9}
      className="w-full h-full"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <ChangeView center={center} zoom={9} />
      <MapResize />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {routePoints.length > 1 && (
        <Polyline
          positions={routePoints}
          color="var(--color-primary)"
          weight={4}
          dashArray="8, 8"
        />
      )}

      {destinations.map((d) => (
        <Marker
          key={d.nome}
          position={[d.latitude, d.longitude]}
          icon={createCustomIcon(false)}
        >
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-xs text-[var(--color-text)]">{d.nome}</h4>
              <p className="text-[10px] text-[var(--color-text-muted)]">{d.municipio}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
