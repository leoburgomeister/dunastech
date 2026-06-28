'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { type DestinoInfo, cadasturData } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import { Users, Activity, MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';

// Helper to determine marker styling based on partner type
function getPartnerIconStyle(tipo: string): { icon: string; color: string } {
  if (tipo === 'Hotel' || tipo === 'Pousada') {
    return { color: '#0284C7', icon: '🏠' }; // Blue
  } else if (tipo === 'Restaurante') {
    return { color: '#16A34A', icon: '🍽️' }; // Green
  } else if (tipo === 'Guia') {
    return { color: '#FBBC05', icon: '🧭' }; // Yellow
  } else if (tipo === 'Agência') {
    return { color: '#8B5CF6', icon: '🎟️' }; // Purple
  } else if (tipo === 'Centro') {
    return { color: '#FF5A5F', icon: '🌟' }; // Coral Red
  }
  return { color: '#64748B', icon: '📍' }; // Slate Gray
}

interface DestinationMapProps {
  destination: DestinoInfo;
}

export default function DestinationMap({ destination }: DestinationMapProps) {
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

  const partners = cadasturData.filter(
    (b) => b.destino === destination.nome && b.regularizado
  );

  // Suggested route connecting the top 5 highest-rated partners
  const routePartners = [...partners]
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 5);

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    const styleUrl = resolvedTheme === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [destination.longitude, destination.latitude],
      zoom: 13,
      interactive: true,
      attributionControl: false
    });

    setMapInstance(map);

    map.on('load', () => {
      // Add route source and layer for connecting partners
      map.addSource('partner-route', {
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
        id: 'partner-route-line',
        type: 'line',
        source: 'partner-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10B981', // Emerald green for Cadastur route
          'line-width': 4,
          'line-opacity': 0.75
        }
      });
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [mounted, destination.nome, resolvedTheme]);

  // Update Markers and Fit Bounds when destination, partners, or mapInstance changes
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add main center destination marker
    const centerStyle = getPartnerIconStyle('Centro');
    const centerEl = document.createElement('div');
    centerEl.className = 'marker-wrapper';

    const centerPulse = document.createElement('div');
    centerPulse.className = 'marker-pulse';
    centerPulse.style.backgroundColor = centerStyle.color;
    centerEl.appendChild(centerPulse);

    const centerPin = document.createElement('div');
    centerPin.className = 'marker-custom';
    centerPin.style.backgroundColor = centerStyle.color;
    centerEl.appendChild(centerPin);

    const centerEmoji = document.createElement('span');
    centerEmoji.className = 'marker-emoji';
    centerEmoji.innerText = centerStyle.icon;
    centerPin.appendChild(centerEmoji);

    const centerPopup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="font-family: var(--font-jakarta), sans-serif; padding: 2px;">
        <h4 style="font-weight: 850; font-size: 14px; margin: 0; color: var(--color-text);">${destination.nome}</h4>
        <p style="font-size: 11px; color: var(--color-text-secondary); margin: 4px 0 0 0;">Centro do atrativo turístico</p>
      </div>
    `);

    const centerMarker = new maplibregl.Marker({ element: centerEl, anchor: 'bottom' })
      .setLngLat([destination.longitude, destination.latitude])
      .setPopup(centerPopup)
      .addTo(map);
    markersRef.current.push(centerMarker);

    // Add partner markers
    partners.forEach((partner) => {
      const style = getPartnerIconStyle(partner.tipo);
      const el = document.createElement('div');
      el.className = 'marker-wrapper';

      const pulse = document.createElement('div');
      pulse.className = 'marker-pulse';
      pulse.style.backgroundColor = style.color;
      el.appendChild(pulse);

      const pin = document.createElement('div');
      pin.className = 'marker-custom';
      pin.style.backgroundColor = style.color;
      el.appendChild(pin);

      const emojiEl = document.createElement('span');
      emojiEl.className = 'marker-emoji';
      emojiEl.innerText = style.icon;
      pin.appendChild(emojiEl);

      const popupHtml = `
        <div style="font-family: var(--font-jakarta), sans-serif; padding: 4px; min-width: 180px; color: var(--color-text);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 850; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #10B981; border-radius: 9999px;">
              ${partner.tipo}
            </span>
            <div style="display: flex; align-items: center; gap: 2px; font-size: 11px; color: #fbbf24; font-weight: 700;">
              ⭐ ${partner.nota}
            </div>
          </div>
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; line-height: 1.3;">${partner.nome}</h4>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #10b981; margin-bottom: 6px;">
            🛡️ <span style="font-weight: 550;">Regularizado Cadastur</span>
          </div>
          ${partner.telefone ? `
            <p style="font-size: 11px; color: var(--color-text-secondary); margin: 0 0 8px 0; display: flex; align-items: center; gap: 4px;">
              📞 ${partner.telefone}
            </p>
          ` : ''}
          <div style="border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 4px;">
            <a href="/vitrine/${partner.id}" style="display: block; text-align: center; font-size: 11px; font-weight: 700; padding: 6px 12px; background: #10b981; color: white; border-radius: 8px; text-decoration: none; transition: background 0.15s ease;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
              Ver Vitrine Comercial
            </a>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([partner.longitude, partner.latitude])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds including all points
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([destination.longitude, destination.latitude]);
    partners.forEach(p => bounds.extend([p.longitude, p.latitude]));

    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 14,
      duration: 1500
    });
  }, [destination, partners, mapInstance]);

  // Fetch and animate partner connection route
  useEffect(() => {
    const map = mapInstance;
    if (!map || routePartners.length < 2) {
      if (map && map.isStyleLoaded() && map.getSource('partner-route')) {
        const source = map.getSource('partner-route') as maplibregl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
          properties: {}
        });
      }
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
          animateRoute(routeCoords);
        } else {
          // Fallback to straight lines
          const straightCoords = routePartners.map((b) => [b.longitude, b.latitude] as [number, number]);
          animateRoute(straightCoords);
        }
      } catch (e) {
        console.error('Failed to trace partner route:', e);
        // Fallback to straight lines
        const straightCoords = routePartners.map((b) => [b.longitude, b.latitude] as [number, number]);
        animateRoute(straightCoords);
      }
    };

    const animateRoute = (coordinates: [number, number][]) => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!map.getSource('partner-route')) return;
      const source = map.getSource('partner-route') as maplibregl.GeoJSONSource;

      let currentStep = 0;
      const totalSteps = 45; // Animate slightly faster for partner map
      const pointsPerStep = Math.max(1, Math.ceil(coordinates.length / totalSteps));

      const step = () => {
        if (!mapInstance || !map.getSource('partner-route')) return;

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
        }
      };

      step();
    };

    if (map.isStyleLoaded()) {
      fetchOSRMRoute();
    } else {
      map.on('style.load', fetchOSRMRoute);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [destination.nome, mapInstance]);

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-slate-200/10 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Absolute overlay edge border for refined aesthetic */}
      <div className="absolute inset-0 pointer-events-none border border-slate-800/10 rounded-2xl" />
    </div>
  );
}
