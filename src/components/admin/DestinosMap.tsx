'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import { type DestinoInfo, fluxoData, calcularISA } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import { Users, Activity, MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';

// Helper to update map view
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Invalidate size on mount to fix Leaflet rendering grey background
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

const createCustomIcon = (isaScore: number) => {
  let color = '#10B981'; // Green (Healthy >= 80)
  if (isaScore < 60) color = '#EF4444'; // Red (Critical < 60)
  else if (isaScore < 80) color = '#F59E0B'; // Orange (Warning 60-79)

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        border: 2px solid white;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        <span style="font-weight: 900; font-size: 10px; color: white; font-family: monospace;">${isaScore}</span>
      </div>
    `,
    className: 'custom-leaflet-icon-destinos',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface DestinosMapProps {
  destinations: DestinoInfo[];
}

export default function DestinosMap({ destinations }: DestinosMapProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted || destinations.length === 0) {
    return (
      <div className="w-full h-80 bg-[var(--color-surface-alt)] rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] text-sm border border-[var(--color-border)]">
        Carregando mapa dos destinos...
      </div>
    );
  }

  // Centering at Rio Grande do Norte geographical center
  const center: [number, number] = [-5.75, -36.2];

  const tileUrl = resolvedTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div key={resolvedTheme} className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl z-10">
      <MapContainer
        center={center}
        zoom={8}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <ChangeView center={center} zoom={8} />
        <MapResize />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        {destinations.map((d) => {
          // Compute real-time ISA score (since feedbacks is not loaded in child, calculation falls back gracefully)
          const isa = calcularISA(d.nome, []);
          const fluxo = fluxoData.find((f) => f.destino === d.nome);
          const slug = slugify(d.nome);

          return (
            <Marker
              key={d.nome}
              position={[d.latitude, d.longitude]}
              icon={createCustomIcon(isa)}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-56 text-[var(--color-text)]">
                  <div className="relative h-20 w-full rounded-lg overflow-hidden">
                    <img src={d.imagem} alt={d.nome} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5">
                      <Badge variant={isa >= 80 ? 'success' : isa >= 60 ? 'warning' : 'danger'} size="sm">
                        ISA: {isa}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight text-[var(--color-text)] m-0">{d.nome}</h4>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-semibold flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                      {d.municipio}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[var(--color-border-light)] text-[10px]">
                    <div>
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase block font-bold">Fluxo/Mês</span>
                      <span className="font-bold flex items-center gap-0.5 mt-0.5 text-[var(--color-text)]">
                        <Users className="w-3 h-3 text-[var(--color-primary)]" />
                        {fluxo ? (fluxo.fluxo_visitantes_mes / 1000).toFixed(0) + 'k' : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase block font-bold">Saturação</span>
                      <span className="font-bold flex items-center gap-0.5 mt-0.5 text-[var(--color-text)]">
                        <Activity className="w-3 h-3 text-[var(--color-accent)]" />
                        {fluxo ? fluxo.saturacao_turistica + '%' : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 text-right border-t border-[var(--color-border-light)]">
                    <a
                      href={`#${slug}`}
                      className="inline-flex items-center gap-0.5 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(slug);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      Focar Detalhes &darr;
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
