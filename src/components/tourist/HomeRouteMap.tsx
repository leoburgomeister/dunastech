'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Play, Square } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';
import { cn, slugify } from '@/lib/utils';
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import {
  buildStyleUrl,
  apply3DScene,
  CINEMATIC_PITCH,
  CINEMATIC_FLY_DURATION_MS,
  PLAIN_FIT_DURATION_MS,
  GENIPABU_CENTER,
  GENIPABU_ZOOM,
  RN_BOUNDS,
  RN_OVERVIEW_PITCH,
  INTRO_HOLD_MS,
  INTRO_DIVE_MS,
  DESTINATION_ZOOM,
  DESTINATION_FLY_MS,
  overviewPadding,
  RN_CENTER,
  RN_OVERVIEW_ZOOM,
} from '@/lib/map/scene3d';
import { FLY_CURVE } from '@/lib/map/camera';
import { createMarkerElement } from '@/lib/map/marker';
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
  RN_GLOW_OUTER_LAYER_ID,
  RN_GLOW_INNER_LAYER_ID,
  RN_GLOW,
  RN_ACCENT,
  zoomRamp,
  fadeByZoom,
  RN_FADE_END_ZOOM,
} from '@/lib/map/rnHighlight';
import { createFallbackWatcher, type MapErrorLike } from '@/lib/map/fallback';
import {
  loadRouteCache,
  lookupRoute,
  osrmUrl,
  straightLine,
  OSRM_TIMEOUT_MS,
} from '@/lib/map/routeCache';
import {
  heroSpots,
  pickHeroSpot,
  HERO_SPOT_STORAGE_KEY,
  type HeroSpot,
} from '@/lib/map/heroSpots';

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
  /**
   * Destino que o usuario buscou e confirmou com Enter. Muda o alvo da camera:
   * a tomada deixa de ser Genipabu e passa a orbitar o lugar pedido.
   */
  focusTarget?: { longitude: number; latitude: number; nome: string } | null;
}

export default function HomeRouteMap({ destinations, activeDay = null, isInteractive = true, hasRoute = false, routeDestinations = SEM_ROTA, focusTarget = null }: HomeRouteMapProps) {
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
  /** Abertura concluida: so entao a orbita assume a camera. */
  const [introDone, setIntroDone] = useState(false);

  /**
   * Destino da abertura, sorteado uma vez por carregamento. Lazy initializer
   * roda so no cliente — o componente entra por dynamic(ssr:false), entao nao
   * ha risco de o servidor sortear um destino e o cliente outro.
   */
  const [heroSpot] = useState<HeroSpot | null>(() => {
    let anterior: string | null = null;
    try {
      anterior = sessionStorage.getItem(HERO_SPOT_STORAGE_KEY);
    } catch {
      // sessionStorage bloqueado (aba anonima restrita): sorteia sem memoria.
    }
    return pickHeroSpot(heroSpots(), anterior, Math.random);
  });

  // Gravar o sorteio e efeito colateral, e por isso mora num efeito e nao no
  // inicializador: em StrictMode o inicializador roda duas vezes e so um dos
  // resultados vira estado, entao gravar la deixava no storage um destino
  // diferente do que a tela mostra — e o proximo load evitaria o errado.
  useEffect(() => {
    if (!heroSpot) return;
    try {
      sessionStorage.setItem(HERO_SPOT_STORAGE_KEY, heroSpot.nome);
    } catch {
      // sem storage a home so perde a memoria entre recargas.
    }
  }, [heroSpot]);

  const heroCenter = heroSpot?.center ?? GENIPABU_CENTER;
  const heroZoom = heroSpot?.zoom ?? GENIPABU_ZOOM;

  // hasRoute so decide a camera INICIAL. Se entrasse nas dependencias do init,
  // gerar um roteiro recriaria o mapa inteiro.
  const [rotaAoMontar] = useState(hasRoute);
  // Computado uma unica vez: o componente entra via dynamic(..., { ssr: false }),
  // entao window ja existe no primeiro render. O guard cobre import direto.
  const [modoResolvido] = useState<MapMode>(() =>
    resolveMapMode({
      maptilerKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
      force2d: process.env.NEXT_PUBLIC_MAP_2D === '1',
      prefersReducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  );

  /**
   * O MapTiler falhou (chave invalida, revogada ou cota estourada) e o mapa
   * degradou para o 2D. Como styleUrl e dependencia do efeito de init, virar
   * esta chave recria o mapa no Carto e as camadas de rota e do RN sao
   * reinstaladas pelo mesmo 'load' de sempre — sem setStyle e sem restauracao
   * manual de camada nenhuma.
   */
  const [degradou, setDegradou] = useState(false);
  const mapMode: MapMode = degradou ? 'flat' : modoResolvido;
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
      // Nasce no plano aberto do estado, nao no atrativo. Com roteiro gerado
      // o fitBounds da rota assume logo em seguida.
      center: rotaAoMontar ? heroCenter : RN_CENTER,
      zoom: rotaAoMontar ? heroZoom : RN_OVERVIEW_ZOOM,
      pitch: rotaAoMontar ? CINEMATIC_PITCH : RN_OVERVIEW_PITCH,
      interactive: isInteractive,
      attributionControl: false
    });

    // Vigia de degradacao. Classificacao medida no browser: falha de estilo
    // vem sem sourceId e com error.status 403, e o 'load' nunca dispara —
    // sem isto a home ficava vazia em vez de virar o mapa 2D.
    const vigia = createFallbackWatcher((motivo) => {
      console.warn(
        `MapTiler indisponivel (${motivo}). Degradando para o mapa 2D.`
      );
      setDegradou(true);
    });
    map.on('error', (e) =>
      vigia.handle(e as unknown as MapErrorLike, !!map.isStyleLoaded())
    );

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
            paint: { 'fill-color': '#04121E', 'fill-opacity': fadeByZoom(0.55) },
          } as maplibregl.LayerSpecification, abaixoDaRota);

          map.addSource(RN_OUTLINE_SOURCE_ID, { type: 'geojson', data: buildOutlineFeature(rings) });

          // Aura: da mais larga e difusa para a mais fechada, e so entao a
          // linha nitida. A ordem importa — invertida, o borrao lava o traco.
          const halo = { 'line-join': 'round', 'line-cap': 'round' } as const;
          for (const [id, cfg] of [
            [RN_GLOW_OUTER_LAYER_ID, RN_GLOW.outer],
            [RN_GLOW_INNER_LAYER_ID, RN_GLOW.inner],
          ] as const) {
            map.addLayer({
              id,
              type: 'line',
              source: RN_OUTLINE_SOURCE_ID,
              layout: halo,
              paint: {
                'line-color': RN_ACCENT,
                'line-width': zoomRamp(cfg.width),
                'line-blur': zoomRamp(cfg.blur),
                'line-opacity': fadeByZoom(cfg.opacity),
              },
            } as maplibregl.LayerSpecification, abaixoDaRota);
          }

          map.addLayer({
            id: RN_OUTLINE_LAYER_ID,
            type: 'line',
            source: RN_OUTLINE_SOURCE_ID,
            layout: halo,
            paint: { 'line-color': RN_ACCENT, 'line-width': 1.6, 'line-opacity': fadeByZoom(0.95) },
          } as maplibregl.LayerSpecification, abaixoDaRota);
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
  }, [mounted, isInteractive, styleUrl, mapMode, heroCenter, heroZoom, rotaAoMontar]);

  // Update Markers and Fit Bounds when destinations change or mapInstance changes
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    // Limpa sempre, inclusive quando a lista esvazia — antes os marcadores
    // antigos ficavam no mapa porque o efeito saia cedo demais.
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // No hero nao ha paradas, so a cena: um pino numerado sobre a duna
    // anunciaria uma parada de roteiro que nao existe.
    if (!hasRoute || destinations.length === 0) return;

    // Add custom markers
    destinations.forEach((dest, index) => {
      const isStart = index === 0;
      const isEnd = index === destinations.length - 1;
      const markerColor = isStart ? '#10B981' : isEnd ? '#EF4444' : '#F59E0B'; // emerald, red, amber
      const markerLabel = isStart ? 'Início' : isEnd ? 'Fim' : `Dia ${dest.dia || index + 1}`;
      
      // Numeral no lugar do emoji: alem de nao depender da fonte de emoji do
      // sistema, a ordem da parada e informacao — o emoji nao era.
      const el = createMarkerElement({
        color: markerColor,
        label: String(dest.dia ?? index + 1),
      });

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
      curve: FLY_CURVE,
    };

    // Sem roteiro quem comanda a camera e a sequencia de abertura (efeito
    // abaixo): plano aberto no estado, espera, mergulho em Genipabu.
    if (!hasRoute) return;

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 13,
      ...flight,
    });
  }, [destinations, activeDay, mapInstance, mapMode, hasRoute]);

  // Padding de camera: desloca o centro otico para a area que sobra a
  // esquerda do painel. Sem isto o destino era centralizado no canvas inteiro
  // e caia sob o painel — junto com o cartao do pin, que tem ~240px. Setar no
  // mapa (em vez de opcao por voo) faz orbita, voo e fitBounds respeitarem o
  // mesmo enquadramento sem repeticao.
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    const aplicar = () => {
      const c = map.getCanvas();
      map.setPadding(overviewPadding(c.clientWidth, c.clientHeight));
    };

    aplicar();
    map.on('resize', aplicar);
    return () => {
      map.off('resize', aplicar);
    };
  }, [mapInstance]);

  /**
   * Perto o bastante para o pin do atrativo fazer sentido. Abaixo disso o
   * quadro e o estado inteiro, e um cartao de 240px sobre ele nao aponta nada
   * — e o mesmo limiar em que o destaque do RN termina de sumir.
   */
  const [zoomProximo, setZoomProximo] = useState(false);
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    const atualizar = () => {
      const perto = map.getZoom() >= RN_FADE_END_ZOOM;
      setZoomProximo((antes) => (antes === perto ? antes : perto));
    };

    map.on('zoom', atualizar);
    map.once('idle', atualizar);
    return () => {
      map.off('zoom', atualizar);
      map.off('idle', atualizar);
    };
  }, [mapInstance]);

  // Pin do atrativo sorteado, com o ISA. So existe no hero: com roteiro
  // gerado quem manda sao os marcadores numerados da rota, e com destino
  // buscado o pin apontaria para o lugar errado.
  useEffect(() => {
    const map = mapInstance;
    if (!map || !heroSpot || hasRoute || focusTarget || !zoomProximo) return;

    const el = document.createElement('div');
    el.className = 'hero-pin';
    // O conteudo vive num filho porque o MapLibre posiciona o marcador
    // escrevendo transform no elemento raiz — qualquer transform nosso ali
    // (offset ou animacao de entrada) apaga o posicionamento e o pin gruda
    // na origem do container.
    // Ancora de verdade, nao div com onclick: preserva abrir em nova aba,
    // foco por teclado e o destino visivel na barra de status.
    el.innerHTML = `
      <div class="hero-pin-inner">
        <a class="hero-pin-card" href="/destino/${slugify(heroSpot.nome)}">
          <span class="hero-pin-text">
            <strong>${heroSpot.nome}</strong>
            <small>${heroSpot.municipio}</small>
          </span>
          <span class="hero-pin-go" aria-hidden="true">→</span>
        </a>
        <span class="hero-pin-stem"></span>
        <span class="hero-pin-dot"></span>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(heroSpot.center)
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [mapInstance, heroSpot, hasRoute, focusTarget, zoomProximo]);

  // Abertura em dois tempos: plano aberto no estado inteiro, para a plateia
  // reconhecer o RN pelo contorno, e so entao o mergulho ate as dunas.
  // Sem isso a home abria colada em Genipabu e o destaque do estado — mascara
  // e contorno dourado — nunca chegava a ser visto.
  useEffect(() => {
    const map = mapInstance;
    // Se o usuario ja buscou um destino, a abertura perdeu a vez: a limpeza
    // deste efeito cancela os timers pendentes sozinha.
    if (!map || hasRoute || focusTarget) return;

    // Com movimento reduzido nao ha mergulho: vai direto ao destino final.
    // Nao mexe em introDone — fora do modo cinematografico a orbita ja sai
    // cedo e ninguem le esse estado.
    if (mapMode !== 'cinematic') {
      map.jumpTo({ center: heroCenter, zoom: heroZoom });
      return;
    }

    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let diveTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const comecar = () => {
      if (cancelled) return;

      const canvas = map.getCanvas();
      map.fitBounds(RN_BOUNDS, {
        padding: overviewPadding(canvas.clientWidth, canvas.clientHeight),
        pitch: RN_OVERVIEW_PITCH,
        bearing: 0,
        duration: 0,
      });

      holdTimer = setTimeout(() => {
        if (cancelled) return;
        map.flyTo({
          center: heroCenter,
          zoom: heroZoom,
          pitch: CINEMATIC_PITCH,
          duration: INTRO_DIVE_MS,
          curve: 1.4,
        });
        // A orbita so entra depois do mergulho: enquanto o flyTo corre, ela
        // ja fica quieta pelo isBusy, mas liberar antes deixaria a camera
        // girando no meio da descida assim que o voo terminasse cedo.
        diveTimer = setTimeout(() => {
          if (!cancelled) setIntroDone(true);
        }, INTRO_DIVE_MS);
      }, INTRO_HOLD_MS);
    };

    if (map.loaded()) comecar();
    else map.once('load', comecar);

    return () => {
      cancelled = true;
      clearTimeout(holdTimer);
      clearTimeout(diveTimer);
      map.off('load', comecar);
    };
  }, [mapInstance, mapMode, hasRoute, focusTarget, heroCenter, heroZoom]);

  // Busca confirmada com Enter: a camera voa ate o lugar pedido e a orbita
  // retoma la. Nao reagimos a cada tecla de proposito — reenquadrar a cada
  // letra digitada tornaria a tomada instavel e brigaria com a abertura.
  useEffect(() => {
    const map = mapInstance;
    if (!map || !focusTarget || hasRoute) return;

    map.flyTo({
      center: [focusTarget.longitude, focusTarget.latitude],
      zoom: DESTINATION_ZOOM,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0,
      duration: mapMode === 'cinematic' ? DESTINATION_FLY_MS : 0,
      curve: 1.3,
    });
  }, [mapInstance, mapMode, hasRoute, focusTarget]);

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
      // Com destino buscado a orbita nao espera a abertura: ela foi cancelada.
      if (ready && (introDone || !!focusTarget) && !document.hidden) {
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
  }, [mapInstance, mapMode, introDone, focusTarget]);

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
    // Sem roteiro nao ha rota: no hero a camera e um plano fixo sobre as dunas,
    // e uma linha ligando destinos cruzaria o quadro sem significar nada.
    if (!map || !hasRoute || destinations.length < 2) {
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

    /**
     * Ordem: cache estatico, depois OSRM, depois linha reta.
     *
     * O cache vem primeiro de proposito. O desenho da rota e o momento que a
     * apresentacao depende, e router.project-osrm.org e servidor publico de
     * demonstracao: sem SLA, com rate limit e fora do nosso controle. Para as
     * 18 combinacoes que a home sabe gerar, a geometria ja esta gravada — o
     * traco sai instantaneo e sem tocar a rede. So roteiro fora da tabela
     * (quando a busca injeta um destino) vai ao OSRM.
     */
    const fetchAndAnimateRoute = async () => {
      const paradas = destinations.map(
        (d) => [d.longitude, d.latitude] as Coord
      );

      const cache = await loadRouteCache();
      const cacheada = lookupRoute(cache, paradas);
      if (cacheada) {
        animateRoute(cacheada);
        return;
      }

      // Timeout explicito: sem ele uma requisicao pendurada — o que acontece
      // em rede que engole pacote em vez de recusar — deixaria a rota sem
      // desenhar para sempre, e sem erro nenhum no console.
      const abort = new AbortController();
      const relogio = setTimeout(() => abort.abort(), OSRM_TIMEOUT_MS);

      try {
        const response = await fetch(osrmUrl(paradas), { signal: abort.signal });
        if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
        const data = await response.json();
        const geo = data?.routes?.[0]?.geometry?.coordinates as Coord[] | undefined;
        animateRoute(geo && geo.length > 1 ? geo : straightLine(paradas));
      } catch (e) {
        console.warn('Rota real indisponivel, usando linha reta:', e);
        animateRoute(straightLine(paradas));
      } finally {
        clearTimeout(relogio);
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
  }, [pathDestinations, mapInstance, hasRoute]);

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

      {/* Nome do estado no plano aberto. Fica no ALTO da area visivel, nao no
          meio: centralizado ele pousava em cima do proprio contorno do estado
          e os dois competiam. Sempre montado, so mudando opacidade — assim a
          saida e um fade e nao um corte seco. */}
      {!hasRoute && (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 z-10 hidden flex-col pl-14 pt-16 lg:flex',
            'transition-opacity duration-700 ease-[cubic-bezier(0.17,0.84,0.44,1)]',
            zoomProximo ? 'opacity-0' : 'opacity-100'
          )}
          style={{ width: 'calc(100% - min(30rem, 42vw) - 3rem)' }}
          aria-hidden={zoomProximo}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
            Observatório
          </span>
          <span className="mt-1 font-[family-name:var(--font-heading)] text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.65)] xl:text-5xl">
            Rio Grande
            <br />
            do Norte
          </span>
        </div>
      )}

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
