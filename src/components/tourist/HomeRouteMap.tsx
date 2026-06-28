'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';

// Helper to determine emoji and color based on destination
function getDestinationIcon(nome: string): { icon: string; color: string } {
  const n = nome.toLowerCase();
  if (n.includes("ponta negra") || n.includes("madeiro") || n.includes("pipa")) {
    return { icon: "🏖️", color: "#38BDF8" }; // Ocean blue
  }
  if (n.includes("genipabu") || n.includes("dunas")) {
    return { icon: "🐪", color: "#F59E0B" }; // Sandy Amber
  }
  if (n.includes("maracajaú") || n.includes("lagoa")) {
    return { icon: "🏊", color: "#06B6D4" }; // Cyan
  }
  if (n.includes("gostoso") || n.includes("cunhaú") || n.includes("galinhos")) {
    return { icon: "⛵", color: "#0EA5E9" }; // Sky
  }
  if (n.includes("forte") || n.includes("castelo") || n.includes("mossoró")) {
    return { icon: "🏰", color: "#A855F7" }; // Purple
  }
  if (n.includes("cajueiro") || n.includes("parque")) {
    return { icon: "🌳", color: "#22C55E" }; // Green
  }
  if (n.includes("inferno")) {
    return { icon: "🚀", color: "#EF4444" }; // Red
  }
  if (n.includes("soledade") || n.includes("apertados")) {
    return { icon: "⛰️", color: "#78350F" }; // Brown
  }
  if (n.includes("salinas") || n.includes("sal")) {
    return { icon: "🧂", color: "#64748B" }; // Slate
  }
  if (n.includes("santa rita") || n.includes("monumento")) {
    return { icon: "⛪", color: "#F59E0B" }; // Gold
  }
  return { icon: "📍", color: "#EF4444" }; // Red
}

interface HomeRouteMapProps {
  destinations: (DestinoInfo & { dia?: number; emoji?: string })[];
  activeDay?: number | null;
  isInteractive?: boolean;
}

export default function HomeRouteMap({ destinations, activeDay = null, isInteractive = true }: HomeRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    const initialCenter: [number, number] = destinations.length > 0 
      ? [destinations[0].longitude, destinations[0].latitude]
      : [-35.2009, -5.7945]; // Natal Central

    const styleUrl = resolvedTheme === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: initialCenter,
      zoom: 9,
      interactive: isInteractive,
      attributionControl: false
    });

    setMapInstance(map);

    map.on('load', () => {
      // Add route source and layer for animation
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          },
          properties: {}
        }
      });

      map.addLayer({
        id: 'route-line-bg',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#06B6D4', // cyan-500
          'line-width': 6,
          'line-opacity': 0.15
        }
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#06B6D4', // cyan-500
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [mounted, isInteractive, destinations.length, resolvedTheme]);

  // Update Markers and Fit Bounds when destinations change or mapInstance changes
  useEffect(() => {
    const map = mapInstance;
    if (!map || destinations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add custom markers
    destinations.forEach((dest, index) => {
      const isStart = index === 0;
      const isEnd = index === destinations.length - 1;
      const markerColor = isStart ? '#10B981' : isEnd ? '#EF4444' : '#F59E0B'; // emerald, red, amber
      const markerLabel = isStart ? 'Início' : isEnd ? 'Fim' : `Dia ${dest.dia || index + 1}`;
      
      const el = document.createElement('div');
      el.className = 'marker-wrapper';

      const pulse = document.createElement('div');
      pulse.className = 'marker-pulse';
      pulse.style.backgroundColor = markerColor;
      el.appendChild(pulse);

      const pin = document.createElement('div');
      pin.className = 'marker-custom';
      pin.style.backgroundColor = markerColor;
      el.appendChild(pin);

      const emojiEl = document.createElement('span');
      emojiEl.className = 'marker-emoji';
      emojiEl.innerText = dest.emoji || '📍';
      pin.appendChild(emojiEl);

      const popupHtml = `
        <div style="font-family: var(--font-heading), var(--font-body), sans-serif; padding: 4px; min-width: 140px; color: var(--color-text);">
          <span style="font-size: 8.5px; font-weight: 850; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; background: ${markerColor}22; color: ${markerColor}; border-radius: 9999px;">
            ${markerLabel}
          </span>
          <h4 style="font-weight: 800; font-size: 13px; margin: 4px 0 2px 0; line-height: 1.3;">${dest.nome}</h4>
          <p style="font-size: 10px; color: var(--color-text-secondary); margin: 0;">${dest.municipio}</p>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([dest.longitude, dest.latitude])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds
    const bounds = new maplibregl.LngLatBounds();
    destinations.forEach(d => bounds.extend([d.longitude, d.latitude]));
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 13,
      duration: 1500
    });
  }, [destinations, activeDay, mapInstance]);

  // Fetch and animate OSRM Route
  useEffect(() => {
    const map = mapInstance;
    if (!map || destinations.length < 2) {
      if (map && map.isStyleLoaded() && map.getSource('route')) {
        const source = map.getSource('route') as maplibregl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
          properties: {}
        });
      }
      return;
    }

    const fetchAndAnimateRoute = async () => {
      try {
        const coordsString = destinations
          .map((d) => `${d.longitude},${d.latitude}`)
          .join(';');

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
        );

        if (!response.ok) throw new Error('OSRM API failed');
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates as [number, number][];
          animateRoute(routeCoords);
        } else {
          // Fallback to straight lines
          const straightCoords = destinations.map((d) => [d.longitude, d.latitude] as [number, number]);
          animateRoute(straightCoords);
        }
      } catch (e) {
        console.error('Failed to trace real-road route:', e);
        // Fallback to straight lines
        const straightCoords = destinations.map((d) => [d.longitude, d.latitude] as [number, number]);
        animateRoute(straightCoords);
      }
    };

    const animateRoute = (coordinates: [number, number][]) => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!map.getSource('route')) return;
      const source = map.getSource('route') as maplibregl.GeoJSONSource;

      let currentStep = 0;
      const totalSteps = 60; // Animate over 60 frames (~1s)
      const pointsPerStep = Math.max(1, Math.ceil(coordinates.length / totalSteps));

      const step = () => {
        if (!mapInstance || !map.getSource('route')) return;

        currentStep++;
        const endIndex = Math.min(currentStep * pointsPerStep, coordinates.length);
        const activeCoords = coordinates.slice(0, endIndex);

        source.setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: activeCoords
          },
          properties: {}
        });

        if (endIndex < coordinates.length) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          // Finished! Trigger confetti celebration
          import('canvas-confetti').then((confettiModule) => {
            confettiModule.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#38BDF8', '#10B981']
            });
          });
        }
      };

      step();
    };

    if (map.isStyleLoaded()) {
      fetchAndAnimateRoute();
    } else {
      map.on('style.load', fetchAndAnimateRoute);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [destinations, mapInstance]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Dynamic Overlay styling for Dark Map theme */}
      <div className="absolute inset-0 pointer-events-none border border-slate-800/10 rounded-2xl" />
    </div>
  );
}
