'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';

// Helper to determine emoji and color based on destination
function getDestinationIcon(nome: string): { icon: string; color: string } {
  const n = nome.toLowerCase();
  if (n.includes("ponta negra") || n.includes("madeiro") || n.includes("pipa")) {
    return { icon: "🏖️", color: "#4285F4" }; // Google Blue for beaches
  }
  if (n.includes("genipabu") || n.includes("dunas")) {
    return { icon: "🐪", color: "#E28743" }; // Sandy Orange
  }
  if (n.includes("maracajaú") || n.includes("lagoa")) {
    return { icon: "🏊", color: "#00A8CC" }; // Cyan for swimming
  }
  if (n.includes("gostoso") || n.includes("cunhaú") || n.includes("galinhos")) {
    return { icon: "⛵", color: "#00B4D8" }; // Ocean Teal
  }
  if (n.includes("forte") || n.includes("castelo") || n.includes("mossoró")) {
    return { icon: "🏰", color: "#A855F7" }; // Purple for historical landmarks
  }
  if (n.includes("cajueiro") || n.includes("parque")) {
    return { icon: "🌳", color: "#22C55E" }; // Green for nature
  }
  if (n.includes("inferno")) {
    return { icon: "🚀", color: "#EF4444" }; // Red for rocket
  }
  if (n.includes("soledade") || n.includes("apertados")) {
    return { icon: "⛰️", color: "#78350F" }; // Brown for geological sites
  }
  if (n.includes("salinas") || n.includes("sal")) {
    return { icon: "🧂", color: "#94A3B8" }; // Grey/White for salt
  }
  if (n.includes("santa rita") || n.includes("monumento")) {
    return { icon: "⛪", color: "#F59E0B" }; // Golden Yellow for religious tourism
  }
  return { icon: "📍", color: "#EF4444" }; // Default Red
}

// Custom Marker design in Google Maps style
const createGoogleMarker = (name: string, active: boolean) => {
  const { icon, color } = getDestinationIcon(name);
  const activeScale = active ? 'scale(1.25)' : 'scale(1)';
  const filterId = `shadow-${name.replace(/[^a-zA-Z]/g, '')}`;

  return L.divIcon({
    html: `
      <div style="
        transform: ${activeScale};
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        width: 36px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="36" height="42" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -40]
  });
};

// Map controller to handle panning/zooming transitions
function MapController({ destinations, activeDay }: { destinations: DestinoInfo[]; activeDay: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 0) return;

    // Trigger invalidation to force redraw inside changing containers
    map.invalidateSize();

    if (destinations.length === 1) {
      map.flyTo([destinations[0].latitude, destinations[0].longitude], 12, {
        animate: true,
        duration: 1.5,
      });
    } else {
      const bounds = L.latLngBounds(destinations.map((d) => [d.latitude, d.longitude]));
      map.fitBounds(bounds, {
        padding: [60, 60],
        animate: true,
        duration: 1.5,
      });
    }
  }, [destinations, activeDay, map]);

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

interface HomeRouteMapProps {
  destinations: DestinoInfo[];
  activeDay?: number | null;
  isInteractive?: boolean;
}

export default function HomeRouteMap({ destinations, activeDay = null, isInteractive = true }: HomeRouteMapProps) {
  const [mounted, setMounted] = useState(false);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const { resolvedTheme } = useTheme();
  const [tileUrl, setTileUrl] = useState('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');

  // Dynamic Tile Styling based on active theme
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      setTileUrl('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png');
    } else {
      setTileUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real road route from OSRM
  useEffect(() => {
    if (destinations.length < 2) {
      setRoutePoints([]);
      return;
    }

    const fetchOSRMRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const coordsString = destinations
          .map((d) => `${d.longitude},${d.latitude}`)
          .join(';');

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
        );

        if (!response.ok) throw new Error('Routing API failed');

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates as [number, number][];
          // Convert from [lng, lat] to [lat, lng]
          const leafletCoords = routeCoords.map(([lng, lat]) => [lat, lng] as [number, number]);
          setRoutePoints(leafletCoords);
        } else {
          // Fallback to straight lines
          setRoutePoints(destinations.map((d) => [d.latitude, d.longitude]));
        }
      } catch (e) {
        console.error('Failed to trace real-road route:', e);
        // Fallback to straight lines
        setRoutePoints(destinations.map((d) => [d.latitude, d.longitude]));
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchOSRMRoute();
  }, [destinations]);

  if (!mounted || destinations.length === 0) {
    return (
      <div className="w-full h-full bg-[var(--color-surface-alt)] flex items-center justify-center text-[var(--color-text-muted)] text-xs border border-[var(--color-border)]">
        Carregando mapa da rota...
      </div>
    );
  }

  // Initial center
  const initialCenter: [number, number] = [destinations[0].latitude, destinations[0].longitude];

  return (
    <MapContainer
      center={initialCenter}
      zoom={10}
      className="w-full h-full"
      scrollWheelZoom={isInteractive}
      zoomControl={false}
      dragging={isInteractive}
      doubleClickZoom={isInteractive}
      touchZoom={isInteractive}
    >
      <MapController destinations={destinations} activeDay={activeDay} />
      <MapResize />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={tileUrl}
      />

      {routePoints.length > 0 && (
        <Polyline
          positions={routePoints}
          color="var(--color-primary)"
          weight={4}
          opacity={0.85}
          pathOptions={{ className: 'route-polyline-flow' }}
        />
      )}

      {destinations.map((d, index) => (
        <Marker
          key={`${d.nome}-${index}`}
          position={[d.latitude, d.longitude]}
          icon={createGoogleMarker(d.nome, activeDay !== null)}
        >
          <Popup>
            <div className="p-1 min-w-[140px] text-[var(--color-text)]">
              <h4 className="font-bold text-xs leading-snug">{d.nome}</h4>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">📍 {d.municipio}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
