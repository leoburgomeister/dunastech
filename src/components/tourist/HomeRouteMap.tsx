'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import {
  buildStyleUrl,
  apply3DScene,
  CINEMATIC_PITCH,
  CINEMATIC_FLY_DURATION_MS,
  PLAIN_FIT_DURATION_MS,
} from '@/lib/map/scene3d';
import { rnOverview, FLY_CURVE } from '@/lib/map/camera';
import { createMarkerElement } from '@/lib/map/marker';
import {
  createOrbitController,
  browserOrbitDeps,
  type OrbitController,
} from '@/lib/map/cinematic';

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
  const orbitRef = useRef<OrbitController | null>(null);
  // Computado uma unica vez: o componente entra via dynamic(..., { ssr: false }),
  // entao window ja existe no primeiro render. O guard cobre import direto.
  const [mapMode] = useState<MapMode>(() =>
    resolveMapMode({
      maptilerKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
      force2d: process.env.NEXT_PUBLIC_MAP_2D === '1',
      prefersReducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  );
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      orbitRef.current?.destroy();
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    // Abre no estado inteiro e so depois mergulha na rota: comecar ja em cima
    // de um destino tira do usuario a nocao de onde ele esta no RN.
    const opening = rnOverview();

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // No modo 3D o estilo e satelite, entao nao ha variante clara/escura.
    // A alternancia de tema segue valendo apenas no fallback 2D.
    const styleUrl = is3D(mapMode) && maptilerKey
      ? buildStyleUrl(maptilerKey)
      : resolvedTheme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: opening.center,
      zoom: opening.zoom,
      pitch: opening.pitch,
      bearing: opening.bearing,
      interactive: isInteractive,
      attributionControl: false
    });

    setMapInstance(map);

    map.on('load', () => {
      if (is3D(mapMode) && maptilerKey) {
        try {
          apply3DScene(map, maptilerKey);
        } catch (e) {
          // Tiles ou terreno indisponiveis: seguimos com o mapa plano em vez de quebrar a home.
          console.warn('Cena 3D indisponivel, mantendo mapa plano:', e);
        }
      }

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
    // Sem os destinos nas dependencias: trocar de filtro reenquadra a camera
    // (efeito abaixo) em vez de destruir e remontar o mapa, que cortava a
    // transicao e recarregava os tiles do zero.
  }, [mounted, isInteractive, resolvedTheme, mapMode]);

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
      
      const el = createMarkerElement({ color: markerColor, glyph: dest.emoji || '📍' });

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
      duration: mapMode === 'cinematic' ? CINEMATIC_FLY_DURATION_MS : PLAIN_FIT_DURATION_MS,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0,
      // curve baixa suaviza o arco de zoom: o voo sobe menos e chega mais macio.
      curve: FLY_CURVE
    });
  }, [destinations, activeDay, mapInstance, mapMode]);

  // Orbita lenta: so no modo cinematografico, so apos o load, e so com a aba visivel.
  useEffect(() => {
    const map = mapInstance;
    if (!map || mapMode !== 'cinematic') return;

    // isBusy evita que a orbita cancele o mergulho do fitBounds: setBearing()
    // chama jumpTo(), que faz stop() em qualquer transicao em curso.
    const orbit = createOrbitController(map, browserOrbitDeps(), {
      isBusy: () => map.isEasing(),
    });
    orbitRef.current = orbit;

    let ready = map.loaded();

    const syncOrbit = () => {
      if (ready && !document.hidden) {
        orbit.start();
      } else {
        orbit.stop();
      }
    };

    const handleLoad = () => {
      ready = true;
      syncOrbit();
    };

    if (ready) {
      syncOrbit();
    } else {
      map.once('load', handleLoad);
    }
    document.addEventListener('visibilitychange', syncOrbit);

    return () => {
      document.removeEventListener('visibilitychange', syncOrbit);
      map.off('load', handleLoad);
      orbit.destroy();
      orbitRef.current = null;
    };
  }, [mapInstance, mapMode]);

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
