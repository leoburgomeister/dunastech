'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldCheck, Star, Phone, MapPin } from 'lucide-react';
import { type DestinoInfo, cadasturData } from '@/data/mockData';
import { Card } from '@/components/ui/Card';

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Invalidate size on mount to solve Leaflet grey background issues
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

const createCustomIcon = (tipo: string, active: boolean) => {
  let color = '#0A6EBD'; // Primary Blue
  if (tipo === 'Hotel' || tipo === 'Pousada') color = '#0284C7'; // Light Blue
  if (tipo === 'Restaurante') color = '#16A34A'; // Green
  if (tipo === 'Guia') color = '#D4A843'; // Golden Accent
  if (tipo === 'Agência') color = '#8B5CF6'; // Purple

  const activeScale = active ? 'scale(1.25)' : '';
  const border = active ? 'border-2 border-white' : '';

  return L.divIcon({
    html: `
      <div style="
        transform: ${activeScale};
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
        font-size: 11px;
        ${border}
      ">
        ${tipo[0]}
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface DestinationMapProps {
  destination: DestinoInfo;
}

export default function DestinationMap({ destination }: DestinationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activePartner, setActivePartner] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-[var(--color-surface-alt)] rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] text-sm border border-[var(--color-border)]">
        Carregando mapa interativo...
      </div>
    );
  }

  const partners = cadasturData.filter(
    (b) => b.destino === destination.nome && b.regularizado
  );

  const mapCenter: [number, number] = [destination.latitude, destination.longitude];
  const routePoints: [number, number][] = partners.map((b) => [b.latitude, b.longitude]);

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md z-10">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <ChangeView center={mapCenter} zoom={13} />
        <MapResize />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Draw polyline connecting partners to form a suggested route */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="var(--color-accent)"
            weight={4}
            dashArray="10, 10"
            opacity={0.8}
          />
        )}

        {/* Map Center Marker */}
        <Marker position={mapCenter} icon={createCustomIcon('Centro', false)}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-sm text-[var(--color-text)]">{destination.nome}</h4>
              <p className="text-xs text-[var(--color-text-secondary)]">Centro do atrativo turístico</p>
            </div>
          </Popup>
        </Marker>

        {/* Partner Markers */}
        {partners.map((partner) => (
          <Marker
            key={partner.id}
            position={[partner.latitude, partner.longitude]}
            icon={createCustomIcon(partner.tipo, activePartner === partner.id)}
            eventHandlers={{
              click: () => setActivePartner(partner.id),
            }}
          >
            <Popup>
              <div className="p-2 space-y-2 min-w-48 text-[var(--color-text)]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-full">
                    {partner.tipo}
                  </span>
                  <div className="flex items-center gap-0.5 text-xs text-[var(--color-accent)] font-semibold">
                    <Star className="h-3 w-3 fill-current" />
                    {partner.nota}
                  </div>
                </div>
                <h4 className="font-bold text-sm leading-tight">{partner.nome}</h4>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  <span>Regularizado Cadastur</span>
                </div>
                {partner.telefone && (
                  <p className="text-xs flex items-center gap-1 text-[var(--color-text-secondary)]">
                    <Phone className="h-3 w-3" /> {partner.telefone}
                  </p>
                )}
                <div className="pt-1">
                  <Link
                    href={`/vitrine/${partner.id}`}
                    className="block text-center text-xs font-bold py-1.5 px-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Ver Vitrine Comercial
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
