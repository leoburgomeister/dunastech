'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import { buildStyleUrl, applySky, applyTerrain } from '@/lib/map/scene3d';
import {
  rnOverview,
  destinationCamera,
  flightDuration,
  FLY_CURVE,
} from '@/lib/map/camera';
import { createMarkerElement } from '@/lib/map/marker';
import {
  createOrbitController,
  browserOrbitDeps,
  type OrbitController,
} from '@/lib/map/cinematic';

interface DestinationHeroMapProps {
  destination: DestinoInfo;
  /** Avisa o container quando a cena aparece, para o pai cruzar o fade com a foto. */
  onReady?: () => void;
}

export default function DestinationHeroMap({ destination, onReady }: DestinationHeroMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<OrbitController | null>(null);
  const onReadyRef = useRef(onReady);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Igual a home: o componente entra via dynamic(..., { ssr: false }), entao
  // window ja existe no primeiro render. O guard cobre o import direto.
  const [mapMode] = useState<MapMode>(() =>
    resolveMapMode({
      maptilerKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
      force2d: process.env.NEXT_PUBLIC_MAP_2D === '1',
      prefersReducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  );

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    return () => orbitRef.current?.destroy();
  }, []);

  const { latitude, longitude, nome } = destination;

  // Inicializa o mapa e faz o mergulho do estado ate o destino
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    const styleUrl = is3D(mapMode) && maptilerKey
      ? buildStyleUrl(maptilerKey)
      : resolvedTheme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const opening = rnOverview();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: opening.center,
      zoom: opening.zoom,
      pitch: opening.pitch,
      bearing: opening.bearing,
      // O hero e cenario, nao ferramenta: capturar o scroll aqui prenderia a
      // pagina. O mapa navegavel do destino continua sendo o da secao de rota.
      interactive: false,
      attributionControl: false,
    });

    setMapInstance(map);

    map.on('load', () => {
      if (is3D(mapMode) && maptilerKey) {
        try {
          // Ceu e relevo juntos: aqui, diferente da home, os dois entram no
          // 'load'. O hero do destino nasce fechado e orbitando, entao o relevo
          // ja significa algo no primeiro quadro — nao ha plano aberto para ele
          // atrapalhar.
          //
          // A opcao `projection: 'mercator'` que existia nesta chamada nao e mais
          // necessaria: a projecao globo foi removida de `scene3d`. O motivo que
          // levou este arquivo a pedir mercator — "de perto o globo quebra o
          // relevo" — foi o mesmo que a levou a sair de vez, somado ao
          // cisalhamento que ela causava no plano aberto do estado.
          applySky(map);
          applyTerrain(map, maptilerKey);
        } catch (e) {
          // Sem terreno ou sem tiles seguimos com o mapa plano em vez de
          // derrubar a pagina do destino.
          console.warn('Cena 3D indisponivel, mantendo mapa plano:', e);
        }
      }

      onReadyRef.current?.();

      const arrival = destinationCamera(longitude, latitude, mapMode);
      const duration = flightDuration(mapMode);

      if (duration === 0) {
        map.jumpTo(arrival);
        return;
      }

      map.flyTo({ ...arrival, duration, curve: FLY_CURVE, essential: true });
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [mounted, mapMode, resolvedTheme, latitude, longitude]);

  // Marcador do destino
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    const element = createMarkerElement({ color: '#D4A843', glyph: '📍' });
    const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
      <div style="font-family: var(--font-heading), sans-serif; padding: 2px; color: var(--color-text);">
        <h4 style="font-weight: 800; font-size: 13px; margin: 0;">${nome}</h4>
        <p style="font-size: 11px; color: var(--color-text-secondary); margin: 2px 0 0 0;">${destination.municipio}</p>
      </div>
    `);

    const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [mapInstance, latitude, longitude, nome, destination.municipio]);

  // Orbita lenta depois da chegada. isBusy segura a orbita enquanto o voo
  // acontece: setBearing() chama jumpTo(), que cancelaria a transicao.
  useEffect(() => {
    const map = mapInstance;
    if (!map || mapMode !== 'cinematic') return;

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

  return <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />;
}
