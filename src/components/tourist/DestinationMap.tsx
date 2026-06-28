'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { ShieldCheck, Star, Phone } from 'lucide-react';
import { type DestinoInfo, cadasturData } from '@/data/mockData';

// Custom Marker design in Google Maps style
const createGoogleMarker = (tipo: string, active: boolean) => {
  let color = '#4285F4'; // Blue
  let icon = '📍';
  
  if (tipo === 'Hotel' || tipo === 'Pousada') {
    color = '#0284C7'; // Google Blue/Sky Blue
    icon = '🏠';
  } else if (tipo === 'Restaurante') {
    color = '#16A34A'; // Google Green
    icon = '🍽️';
  } else if (tipo === 'Guia') {
    color = '#FBBC05'; // Google Yellow
    icon = '🧭';
  } else if (tipo === 'Agência') {
    color = '#8B5CF6'; // Purple
    icon = '🎟️';
  } else if (tipo === 'Centro') {
    color = '#FF5A5F'; // Coral Accent
    icon = '🌟';
  }

  const activeScale = active ? 'scale(1.25)' : 'scale(1)';
  const filterId = `shadow-${tipo.replace(/[^a-zA-Z]/g, '')}`;

  return L.divIcon({
    html: `
      <div style="
        transform: ${activeScale};
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        width: 32px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="32" height="38" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="${filterId}">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M20 2C11.16 2 4 9.16 4 18C4 29 20 46 20 46C20 46 36 29 36 18C36 9.16 28.84 2 20 2Z"
            fill="${color}" stroke="#FFFFFF" stroke-width="1.8" style="filter: url(#${filterId});" />
          <circle cx="20" cy="18" r="9.5" fill="rgba(255,255,255,0.22)"/>
          <text x="20" y="22" text-anchor="middle" font-size="12" fill="#fff" font-family="system-ui, sans-serif" font-weight="bold">${icon}</text>
        </svg>
      </div>
    `,
    className: 'custom-leaflet-icon-google-style',
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -36]
  });
};

// Map controller to handle panning/zooming transitions
function MapController({ center, zoom, bounds }: { center: [number, number]; zoom: number; bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
        duration: 1.5,
      });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

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

interface DestinationMapProps {
  destination: DestinoInfo;
}

export default function DestinationMap({ destination }: DestinationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

  useEffect(() => {
    setMounted(true);
  }, []);

  const partners = cadasturData.filter(
    (b) => b.destino === destination.nome && b.regularizado
  );

  const mapCenter: [number, number] = [destination.latitude, destination.longitude];

  // Suggest a route connecting the top 5 highest-rated partners
  const routePartners = [...partners]
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 5);

  const pointsToRoute: [number, number][] = routePartners.map((b) => [b.latitude, b.longitude]);

  // Fetch real road route from OSRM
  useEffect(() => {
    if (pointsToRoute.length < 2) {
      setRoutePoints([]);
      return;
    }

    const fetchOSRMRoute = async () => {
      try {
        const coordsString = routePartners
          .map((b) => `${b.longitude},${b.latitude}`)
          .join(';');

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
        );

        if (!response.ok) throw new Error('OSRM routing failed');

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates as [number, number][];
          const leafletCoords = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
          setRoutePoints(leafletCoords);
        } else {
          setRoutePoints(pointsToRoute);
        }
      } catch (e) {
        console.error('Failed to trace partner route:', e);
        setRoutePoints(pointsToRoute);
      }
    };

    fetchOSRMRoute();
  }, [destination.nome]);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-[var(--color-surface-alt)] rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] text-sm border border-[var(--color-border)]">
        Carregando mapa interativo...
      </div>
    );
  }

  // Calculate bounds including destination center and all partner markers
  let mapBounds: L.LatLngBounds | null = null;
  if (partners.length > 0) {
    const allCoords = [mapCenter, ...partners.map((b) => [b.latitude, b.longitude] as [number, number])];
    mapBounds = L.latLngBounds(allCoords);
  }

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md z-10">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={13} bounds={mapBounds} />
        <MapResize />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        {/* Real road route line connecting partners */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="var(--color-accent)"
            weight={4}
            opacity={0.8}
            pathOptions={{ className: 'route-polyline-flow' }}
          />
        )}

        {/* Map Center Marker */}
        <Marker position={mapCenter} icon={createGoogleMarker('Centro', false)}>
          <Popup>
            <div className="p-1 min-w-[140px] text-[var(--color-text)]">
              <h4 className="font-bold text-sm">{destination.nome}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Centro do atrativo turístico</p>
            </div>
          </Popup>
        </Marker>

        {/* Partner Markers */}
        {partners.map((partner) => (
          <Marker
            key={partner.id}
            position={[partner.latitude, partner.longitude]}
            icon={createGoogleMarker(partner.tipo, activePartner === partner.id)}
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
