'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Play, Square } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import {
  buildStyleUrl,
  apply3DScene,
  CINEMATIC_PITCH,
  CINEMATIC_FLY_DURATION_MS,
  PLAIN_FIT_DURATION_MS,
  GENIPABU_CENTER,
  GENIPABU_ZOOM,
} from '@/lib/map/scene3d';
import {
  createOrbitController,
  browserOrbitDeps,
  type OrbitController,
} from '@/lib/map/cinematic';
import {
  createFollowController,
  browserFollowDeps,
  type FollowController,
  type Coord,
} from '@/lib/map/follow';
import {
  extractRings,
  buildMaskFeature,
  buildOutlineFeature,
  RN_GEOJSON_URL,
  RN_MASK_SOURCE_ID,
  RN_OUTLINE_SOURCE_ID,
  RN_MASK_LAYER_ID,
  RN_OUTLINE_LAYER_ID,
} from '@/lib/map/rnHighlight';

/** Constante de modulo para nao criar array novo a cada render. */
const SEM_ROTA: DestinoInfo[] = [];

interface HomeRouteMapProps {
  destinations: (DestinoInfo & { dia?: number; emoji?: string })[];
  activeDay?: number | null;
  isInteractive?: boolean;
  /** Ha roteiro gerado. Muda o enquadramento: sem rota o mapa e cenario. */
  hasRoute?: boolean;
  /**
   * Roteiro completo. `destinations` mostra so o dia aberto — que muitas vezes
   * tem uma parada so — enquanto a linha e o voo "seguir rota" precisam da
   * viagem inteira.
   */
  routeDestinations?: DestinoInfo[];
}

export default function HomeRouteMap({ destinations, activeDay = null, isInteractive = true, hasRoute = false, routeDestinations = SEM_ROTA }: HomeRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const orbitRef = useRef<OrbitController | null>(null);
  const followRef = useRef<FollowController | null>(null);
  const followingRef = useRef(false);
  const routeCoordsRef = useRef<Coord[]>([]);
  const cameraBeforeFollowRef = useRef<{
    center: maplibregl.LngLat;
    zoom: number;
    bearing: number;
    pitch: number;
  } | null>(null);
  const [routeReady, setRouteReady] = useState(false);
  const [following, setFollowing] = useState(false);
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

  // No modo 3D o estilo e satelite, entao nao ha variante clara/escura e
  // trocar de tema tambem nao recria o mapa. A alternancia so vale no 2D.
  const styleUrl = useMemo(() => {
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (is3D(mapMode) && maptilerKey) return buildStyleUrl(maptilerKey);
    return resolvedTheme === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  }, [mapMode, resolvedTheme]);

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

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      // Abre direto em Genipabu: nao ha voo de entrada porque a home nao
      // comeca em lugar nenhum antes de chegar la.
      center: GENIPABU_CENTER,
      zoom: GENIPABU_ZOOM,
      interactive: isInteractive,
      attributionControl: false
    });

    setMapInstance(map);

    // Ponta de inspecao em dev: permite conferir terreno, sky e projecao no
    // console sem instrumentar o componente a cada investigacao.
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as { __potiMap?: maplibregl.Map }).__potiMap = map;
    }

    map.on('load', () => {
      if (is3D(mapMode) && maptilerKey) {
        try {
          apply3DScene(map, maptilerKey);
        } catch (e) {
          // Tiles ou terreno indisponiveis: seguimos com o mapa plano em vez de quebrar a home.
          console.warn('Cena 3D indisponivel, mantendo mapa plano:', e);
        }
      }

      // Destaque do RN. Assincrono, entao entra abaixo da rota via beforeId —
      // senao a mascara pousaria por cima da linha do roteiro.
      fetch(RN_GEOJSON_URL)
        .then((r) => r.json())
        .then((raw) => {
          const rings = extractRings(raw);
          if (!rings.length || !map.getStyle() || map.getSource(RN_MASK_SOURCE_ID)) return;
          const abaixoDaRota = map.getLayer('route-line-bg') ? 'route-line-bg' : undefined;

          map.addSource(RN_MASK_SOURCE_ID, { type: 'geojson', data: buildMaskFeature(rings) });
          map.addLayer({
            id: RN_MASK_LAYER_ID,
            type: 'fill',
            source: RN_MASK_SOURCE_ID,
            paint: { 'fill-color': '#04121E', 'fill-opacity': 0.55 },
          }, abaixoDaRota);

          map.addSource(RN_OUTLINE_SOURCE_ID, { type: 'geojson', data: buildOutlineFeature(rings) });
          map.addLayer({
            id: RN_OUTLINE_LAYER_ID,
            type: 'line',
            source: RN_OUTLINE_SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#F0C75E', 'line-width': 2, 'line-opacity': 0.9 },
          }, abaixoDaRota);
        })
        .catch((e) => {
          // Destaque e enfeite: sem ele o mapa segue funcionando.
          console.warn('Contorno do RN indisponivel:', e);
        });

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
  }, [mounted, isInteractive, styleUrl, mapMode]);

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

      const pin = document.createElement('div');
      pin.className = 'marker-custom';
      pin.style.backgroundColor = markerColor;
      el.appendChild(pin);

      // Numeral no lugar do emoji: alem de nao depender da fonte de emoji do
      // sistema, a ordem da parada e informacao — o emoji nao era.
      const labelEl = document.createElement('span');
      labelEl.className = 'marker-label';
      labelEl.innerText = String(dest.dia ?? index + 1);
      pin.appendChild(labelEl);

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

    const bounds = new maplibregl.LngLatBounds();
    destinations.forEach(d => bounds.extend([d.longitude, d.latitude]));

    const flight = {
      duration: mapMode === 'cinematic' ? CINEMATIC_FLY_DURATION_MS : PLAIN_FIT_DURATION_MS,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0,
      // curve baixa suaviza o arco de zoom: o voo sobe menos e chega mais macio.
      curve: 1.2,
    };

    // Sem roteiro a home nao e ferramenta, e cartao-postal: a camera fica
    // parada em Genipabu orbitando, em vez de enquadrar todos os destinos
    // (o que jogava o zoom para ~8.8 e transformava a costa num fio).
    if (!hasRoute) {
      map.flyTo({ center: GENIPABU_CENTER, zoom: GENIPABU_ZOOM, ...flight });
      return;
    }

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 13,
      ...flight,
    });
  }, [destinations, activeDay, mapInstance, mapMode, hasRoute]);

  // Orbita lenta: so no modo cinematografico, so apos o load, e so com a aba visivel.
  useEffect(() => {
    const map = mapInstance;
    if (!map || mapMode !== 'cinematic') return;

    // isBusy evita que a orbita cancele o mergulho do fitBounds: setBearing()
    // chama jumpTo(), que faz stop() em qualquer transicao em curso.
    // Enquanto a camera segue a rota, a orbita tambem cede: os dois escrevem
    // bearing no mesmo frame e o resultado seria tremor.
    const orbit = createOrbitController(map, browserOrbitDeps(), {
      isBusy: () => map.isEasing() || followingRef.current,
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

  // A linha desenhada e o caminho do voo seguem o roteiro completo; os
  // marcadores continuam sendo os do dia aberto.
  const pathDestinations = useMemo(
    () => (routeDestinations.length > 1 ? routeDestinations : destinations),
    [routeDestinations, destinations]
  );

  // Fetch and animate OSRM Route
  useEffect(() => {
    const map = mapInstance;
    const destinations = pathDestinations;
    if (!map || destinations.length < 2) {
      routeCoordsRef.current = [];
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
      // Guardadas para o voo "seguir rota": e a mesma geometria do OSRM que
      // acabou de ser desenhada, entao a camera percorre exatamente o traçado
      // que o usuario esta vendo, e nao uma reta entre paradas.
      // Trocou de roteiro no meio de um voo? O voo antigo morre aqui.
      followRef.current?.stop();
      followRef.current = null;
      followingRef.current = false;
      setFollowing(false);
      routeCoordsRef.current = coordinates;
      setRouteReady(coordinates.length > 1);

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
  }, [pathDestinations, mapInstance]);

  // Encerra o voo devolvendo a camera exatamente de onde ela saiu, em vez de
  // largar onde o ultimo ponto caiu ou reenquadrar a rota inteira — o usuario
  // pediu um voo, nao uma mudanca de enquadramento.
  const stopFollowing = useCallback(() => {
    followRef.current?.stop();
    followRef.current = null;
    followingRef.current = false;
    setFollowing(false);

    const map = mapInstance;
    const volta = cameraBeforeFollowRef.current;
    cameraBeforeFollowRef.current = null;
    if (!map || !volta) return;
    map.easeTo({ ...volta, duration: 2200 });
  }, [mapInstance]);

  const toggleFollow = useCallback(() => {
    if (following) {
      stopFollowing();
      return;
    }
    const map = mapInstance;
    if (!map || routeCoordsRef.current.length < 2) return;

    cameraBeforeFollowRef.current = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };

    const controller = createFollowController(map, browserFollowDeps(), {
      coordinates: routeCoordsRef.current,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0,
      onFinish: stopFollowing,
    });
    followRef.current = controller;
    followingRef.current = true;
    setFollowing(true);
    controller.start();
  }, [following, mapInstance, mapMode, stopFollowing]);

  useEffect(() => () => {
    followRef.current?.destroy();
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Dynamic Overlay styling for Dark Map theme */}
      <div className="absolute inset-0 pointer-events-none border border-slate-800/10 rounded-2xl" />

      {hasRoute && routeReady && pathDestinations.length > 1 && (
        <button
          type="button"
          onClick={toggleFollow}
          aria-pressed={following}
          className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-[var(--color-surface)]/92 px-3.5 py-2 text-xs font-semibold text-[var(--color-text)] shadow-lg ring-1 ring-[var(--color-border)] transition-colors hover:bg-[var(--color-surface)] cursor-pointer"
        >
          {following ? (
            <Square className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          ) : (
            <Play className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          )}
          {following ? 'Parar' : 'Seguir rota'}
        </button>
      )}
    </div>
  );
}
