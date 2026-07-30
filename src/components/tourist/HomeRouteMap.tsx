'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Play, Square } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type DestinoInfo } from '@/data/mockData';
import { slugify } from '@/lib/utils';
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import {
  buildStyleUrl,
  applySky,
  applyTerrain,
  applyOpeningFraming,
  OPENING_FALLBACK_CAMERA,
  CINEMATIC_PITCH,
  CINEMATIC_FLY_DURATION_MS,
  PLAIN_FIT_DURATION_MS,
  GENIPABU_CENTER,
  GENIPABU_ZOOM,
  INTRO_HOLD_MS,
  INTRO_DIVE_MS,
  DESTINATION_ZOOM,
  DESTINATION_FLY_MS,
  overviewPadding,
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
  highlightLayers,
  RN_GEOJSON_URL,
  RN_MASK_SOURCE_ID,
  RN_OUTLINE_SOURCE_ID,
  RN_LABEL_ANCHOR,
  RN_FADE_END_ZOOM,
  type Ring,
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

/**
 * Chave do MapTiler. Constante de modulo porque o Next inlineia
 * process.env.NEXT_PUBLIC_* no build: ler em tres lugares diferentes so
 * espalhava a mesma string literal pelo arquivo.
 */
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

/**
 * Malha do RN, buscada uma vez e compartilhada por qualquer instancia do mapa.
 *
 * Antes o fetch morava dentro do 'load', ou seja, so COMECAVA depois de o
 * estilo inteiro do MapTiler chegar — e as camadas do destaque pousavam num
 * momento imprevisivel, sempre depois do primeiro quadro. Disparado no mount,
 * o arquivo (estatico, em /public) quase sempre ja chegou quando o 'load'
 * acontece, e o destaque nasce junto com o mapa.
 */
let malhaRN: Promise<Ring[]> | null = null;

function carregarMalhaRN(): Promise<Ring[]> {
  malhaRN ??= fetch(RN_GEOJSON_URL)
    .then((r) => r.json())
    .then(extractRings)
    .catch((e) => {
      // Destaque e enfeite: sem ele o mapa segue funcionando. Zera o cache
      // para uma falha de rede momentanea nao condenar a sessao inteira — uma
      // promise rejeitada memoizada faria toda tentativa seguinte falhar.
      console.warn('Contorno do RN indisponivel:', e);
      malhaRN = null;
      return [];
    });
  return malhaRN;
}

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
   * O evento 'load' do mapa ja passou.
   *
   * Estado proprio porque nao ha como perguntar isso ao MapLibre: `loaded()` e
   * `isStyleLoaded()` voltam false enquanto houver tile em voo, e nao apenas
   * antes do estilo ficar pronto. Usar um dos dois como porta num efeito e
   * armadilha — quando a condicao e falsa o efeito desiste, e se as
   * dependencias nao mudarem mais ele nunca roda de novo.
   */
  const [estiloCarregado, setEstiloCarregado] = useState(false);

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
      maptilerKey: MAPTILER_KEY,
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
    if (is3D(mapMode) && MAPTILER_KEY) return buildStyleUrl(MAPTILER_KEY);
    return resolvedTheme === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  }, [mapMode, resolvedTheme]);

  /**
   * Da para criar o mapa sem que styleUrl mude logo depois?
   *
   * No 2D o estilo depende do tema, e resolvedTheme nasce `undefined` no
   * primeiro render do cliente: criar o mapa ali significava recriar o mapa
   * inteiro alguns milissegundos depois, quando o next-themes resolvesse — um
   * flash. No 3D o estilo e satelite e nao olha o tema, entao nao ha o que
   * esperar. Booleano em vez de resolvedTheme na dependencia do init de
   * proposito: a string muda no 3D tambem, e isso recriaria o mapa a troco de
   * nada.
   */
  const styleReady = is3D(mapMode) || !!resolvedTheme;

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);

    // Adiantado de proposito: o destaque do RN depende deste arquivo e o mapa
    // ainda vai levar centenas de milissegundos para carregar o estilo.
    carregarMalhaRN();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      orbitRef.current?.destroy();
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!mounted || !styleReady || !container) return;

    const map = new maplibregl.Map({
      container,
      style: styleUrl,
      // Com roteiro gerado a camera nasce no atrativo e o fitBounds da rota
      // assume logo em seguida. Sem roteiro nasce no plano aberto do estado —
      // quadro de partida seguro, refinado na linha seguinte.
      ...(rotaAoMontar
        ? { center: heroCenter, zoom: heroZoom, pitch: CINEMATIC_PITCH, bearing: 0 }
        : OPENING_FALLBACK_CAMERA),
      interactive: isInteractive,
      attributionControl: false
    });

    // Sincrono, antes do primeiro paint: o padding do painel vai para o
    // transform e o estado e enquadrado na area que sobra. Isso ANTES ficava
    // num fitBounds dentro do 'load', ou seja, depois do primeiro quadro — e o
    // salto entre um quadro e outro era a piscada da abertura.
    if (!rotaAoMontar) {
      applyOpeningFraming(map, container.clientWidth, container.clientHeight);
    }

    /**
     * O mapa foi destruido? Os callbacks assincronos abaixo (fetch da malha e o
     * requestAnimationFrame do fade) podem chegar depois do unmount, e tocar em
     * getStyle/addLayer num mapa removido estoura.
     */
    let removido = false;

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
      setEstiloCarregado(true);

      // Ceu e atmosfera. O terreno NAO entra aqui: ele so faz sentido perto e
      // ligado agora empilharia um reajuste de geometria no primeiro quadro.
      // Quem liga e o efeito do relevo, quando a camera chega.
      if (is3D(mapMode) && MAPTILER_KEY) {
        try {
          applySky(map);
        } catch (e) {
          // Ceu indisponivel: seguimos com o mapa sem atmosfera em vez de
          // quebrar a home.
          console.warn('Ceu indisponivel, seguindo sem atmosfera:', e);
        }
      }

      // Destaque do RN. Assincrono, entao entra abaixo da rota via beforeId —
      // senao a mascara pousaria por cima da linha do roteiro.
      carregarMalhaRN().then((rings) => {
        if (removido || !rings.length) return;
        if (!map.getStyle() || map.getSource(RN_MASK_SOURCE_ID)) return;
        const abaixoDaRota = map.getLayer('route-line-bg') ? 'route-line-bg' : undefined;

        map.addSource(RN_MASK_SOURCE_ID, { type: 'geojson', data: buildMaskFeature(rings) });
        map.addSource(RN_OUTLINE_SOURCE_ID, { type: 'geojson', data: buildOutlineFeature(rings) });

        const camadas = highlightLayers();
        for (const { id, type, source, layout, paint } of camadas) {
          map.addLayer(
            { id, type, source, ...(layout ? { layout } : {}), paint } as maplibregl.LayerSpecification,
            abaixoDaRota
          );
        }

        // Opacidade real so no quadro seguinte. As camadas nascem em zero com a
        // transicao declarada na paint, entao esta troca vira um fade de 900ms
        // — antes a mascara pousava opaca de uma vez e tudo fora do estado
        // escurecia num piscar.
        requestAnimationFrame(() => {
          if (removido || !map.getStyle()) return;
          for (const { id, opacityProp, finalOpacity } of camadas) {
            if (map.getLayer(id)) map.setPaintProperty(id, opacityProp, finalOpacity);
          }
        });
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
      removido = true;
      map.remove();
      setMapInstance(null);
      // O mapa que renasce (degradacao para 2D, troca de estilo) dispara o seu
      // proprio 'load'. Sem zerar aqui, o efeito do relevo veria o flag do mapa
      // anterior e tentaria ligar terreno num estilo ainda sem fontes.
      setEstiloCarregado(false);
    };
  }, [mounted, styleReady, isInteractive, styleUrl, mapMode, heroCenter, heroZoom, rotaAoMontar]);

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

  /**
   * Relevo. Entra quando a camera chega perto, nao no 'load'.
   *
   * O relevo do RN e baixo (dunas de 30-50m, falesias de ~50m) e simplesmente
   * nao e legivel no plano aberto do estado. Ligado junto com o resto no 'load',
   * ele so servia para deslocar a geometria do primeiro quadro — parte do
   * "torto" que aparecia na abertura.
   *
   * Amarrado ao mesmo limiar do fade do destaque (RN_FADE_END_ZOOM): um conceito
   * unico de "perto o bastante para o relevo significar algo", e isso cobre de
   * graca todos os caminhos de camera — abertura, destino buscado, roteiro
   * gerado e o modo de movimento reduzido, que salta direto para o destino.
   */
  /**
   * Instala o relevo, se ainda nao estiver instalado.
   *
   * Chamado ANTES de cada voo que termina perto — nao no meio dele. O MapLibre
   * so fixa a referencia de elevacao se `map.terrain` ja existir quando a
   * transicao comeca: `flyTo` faz `if (this.terrain) this._prepareElevation(targetCenter)`.
   * Ligar o terreno com o voo em curso cai no auto-conserto de
   * `_updateElevation`, que chama `_prepareElevation(transform.center)` — o
   * centro INSTANTANEO da camera em vez do destino — e a altura da camera passa a
   * convergir para a elevacao de um ponto de passagem, nao a do lugar onde ela
   * vai parar.
   *
   * Idempotente pelo guard de `applyTerrain`, entao pode ser chamado de varios
   * lugares sem alocar Terrain duas vezes.
   */
  // Depende so de mapMode de proposito. `estiloCarregado` fora das dependencias
  // porque esta funcao entra nas dependencias de EFEITOS, e uma identidade que
  // muda quando o estilo carrega faria o efeito de abertura remontar no meio da
  // propria abertura. Quem chama garante que o estilo ja esta pronto; se nao
  // estiver, applyTerrain lanca e o catch registra. mapMode so muda junto com a
  // recriacao do mapa, quando remontar e o certo.
  const garantirRelevo = useCallback((map: maplibregl.Map) => {
    if (!is3D(mapMode) || !MAPTILER_KEY) return;
    try {
      applyTerrain(map, MAPTILER_KEY);
    } catch (e) {
      // Estilo ainda cru ou tiles de terreno indisponiveis: seguimos com o mapa
      // plano. A rede de seguranca abaixo tenta de novo quando o zoom fecha.
      console.warn('Relevo indisponivel, mantendo o mapa plano:', e);
    }
  }, [mapMode]);

  // Rede de seguranca: os caminhos que nao passam por um voo nosso — roteiro ja
  // gerado ao montar, movimento reduzido (que salta direto) — chegam perto sem
  // nunca ter chamado garantirRelevo. Aqui o limiar de zoom cobre todos eles.
  useEffect(() => {
    const map = mapInstance;
    if (!map || !estiloCarregado || !zoomProximo) return;
    garantirRelevo(map);
  }, [mapInstance, estiloCarregado, zoomProximo, garantirRelevo]);

  /**
   * Etiqueta do estado, ancorada na terra que ela nomeia.
   *
   * Era um overlay fixo em `pl-14 pt-16`, ou seja, grudado no canto superior
   * esquerdo da tela: colava no header do site e competia com o logo, e ficava
   * parado enquanto o mapa se movia embaixo. Como marcador, ele desliza junto
   * com o terreno no mergulho, que e como rotulo de mapa se comporta.
   */
  const rnLabelRef = useRef<HTMLDivElement | null>(null);
  const zoomProximoRef = useRef(false);

  /**
   * Saida da etiqueta no mergulho.
   *
   * Efeito separado do que cria o marcador porque `zoomProximo` nas dependencias
   * da criacao recriaria o elemento a cada virada — e elemento novo nasce no
   * estado final, sem transicao, o que e justamente o corte que queremos evitar.
   * Aqui a classe muda no elemento que JA existe e o CSS anima.
   *
   * Declarado ANTES da criacao de proposito: no mesmo commit os efeitos rodam na
   * ordem de declaracao, entao o espelho em `zoomProximoRef` esta sempre fresco
   * quando a criacao o le. Sem esse espelho a etiqueta renascia opaca por cima
   * do close: basta o usuario gerar um roteiro (marcador desmontado, camera em
   * zoom fechado) e clicar em "Refazer", que zera o roteiro e remonta a etiqueta
   * com `zoomProximo` ja em true.
   */
  useEffect(() => {
    zoomProximoRef.current = zoomProximo;
    rnLabelRef.current?.classList.toggle('rn-label--out', zoomProximo);
  }, [zoomProximo]);

  useEffect(() => {
    const map = mapInstance;
    // So sobre satelite. A etiqueta e branca porque a imagem de satelite do RN
    // e escura (agua, mata, asfalto); no fallback 2D o estilo do Carto e claro e
    // ela sumiria. Ali o contorno dourado do estado e o badge do painel ja dizem
    // onde estamos.
    if (!map || hasRoute || !is3D(mapMode)) return;

    const el = document.createElement('div');
    el.className = 'rn-label';
    // Decorativo: o nome do estado ja esta no badge do painel, e um leitor de
    // tela anunciando-o de novo aqui seria repeticao.
    el.setAttribute('aria-hidden', 'true');
    // O texto mora num filho porque o raiz e territorio do MapLibre: ele escreve
    // transform (posicao) e opacity (Marker._updateOpacity) inline ali a cada
    // movimento do mapa, e inline vence classe — a saida nao aconteceria.
    const texto = document.createElement('span');
    texto.className = 'rn-label-text';
    texto.textContent = 'Rio Grande do Norte';
    el.appendChild(texto);
    // Nasce no estado que a camera pede, nao sempre visivel.
    el.classList.toggle('rn-label--out', zoomProximoRef.current);
    rnLabelRef.current = el;

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(RN_LABEL_ANCHOR)
      .addTo(map);

    return () => {
      marker.remove();
      rnLabelRef.current = null;
    };
  }, [mapInstance, hasRoute, mapMode]);

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
    // Espera o estilo pelo ESTADO, nao por evento. Este efeito rodava
    // `if (map.loaded()) comecar(); else map.once('load', comecar)`, e as duas
    // metades tinham defeito: `loaded()` volta false enquanto houver tile em voo,
    // e o `once('load')` de uma reexecucao posterior nunca dispara, porque o
    // 'load' aconteceu uma vez so, no comeco. Com `estiloCarregado` na dependencia
    // o efeito simplesmente roda de novo quando o estilo fica pronto.
    if (!map || !estiloCarregado || hasRoute || focusTarget) return;

    // Com movimento reduzido nao ha mergulho: vai direto ao destino final.
    // Nao mexe em introDone — fora do modo cinematografico a orbita ja sai
    // cedo e ninguem le esse estado.
    if (mapMode !== 'cinematic') {
      garantirRelevo(map);
      map.jumpTo({ center: heroCenter, zoom: heroZoom });
      return;
    }

    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let diveTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    // O enquadramento do plano aberto nao e feito aqui: o construtor do mapa ja
    // nasceu nos bounds do estado. O fitBounds de duracao zero que morava neste
    // ponto era exatamente o corte seco da abertura — dois quadros diferentes,
    // um no lugar do outro, sem transicao. Agora a abertura faz uma coisa so:
    // esperar a plateia ler o contorno e mergulhar.
    const comecar = () => {
      holdTimer = setTimeout(() => {
        if (cancelled) return;
        // Relevo ANTES do voo: e o unico momento em que o MapLibre calcula a
        // elevacao do DESTINO. E o salto de geometria fica escondido pelo
        // proprio inicio do movimento, no mesmo frame.
        garantirRelevo(map);
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

    comecar();

    return () => {
      cancelled = true;
      clearTimeout(holdTimer);
      clearTimeout(diveTimer);
    };
  }, [
    mapInstance,
    estiloCarregado,
    mapMode,
    hasRoute,
    focusTarget,
    heroCenter,
    heroZoom,
    garantirRelevo,
  ]);

  // Busca confirmada com Enter: a camera voa ate o lugar pedido e a orbita
  // retoma la. Nao reagimos a cada tecla de proposito — reenquadrar a cada
  // letra digitada tornaria a tomada instavel e brigaria com a abertura.
  useEffect(() => {
    const map = mapInstance;
    if (!map || !focusTarget || hasRoute) return;

    // Mesmo motivo do mergulho: o relevo entra antes, para a elevacao ser medida
    // no destino pedido e nao num ponto do caminho.
    garantirRelevo(map);
    map.flyTo({
      center: [focusTarget.longitude, focusTarget.latitude],
      zoom: DESTINATION_ZOOM,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0,
      duration: mapMode === 'cinematic' ? DESTINATION_FLY_MS : 0,
      curve: 1.3,
    });
  }, [mapInstance, mapMode, hasRoute, focusTarget, garantirRelevo]);

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

    // Prontidao vem de `estiloCarregado`, nao de `map.loaded()` + once('load').
    // O par antigo tinha a mesma armadilha dos outros efeitos: `loaded()` volta
    // false enquanto houver tile em voo, e este efeito reexecuta quando
    // `introDone` vira — numa reexecucao o `once('load')` nunca dispara, porque o
    // 'load' ja passou, e a orbita nunca comecava.
    const syncOrbit = () => {
      // Com destino buscado a orbita nao espera a abertura: ela foi cancelada.
      if (estiloCarregado && (introDone || !!focusTarget) && !document.hidden) {
        orbit.start();
      } else {
        orbit.stop();
      }
    };

    syncOrbit();
    document.addEventListener('visibilitychange', syncOrbit);

    return () => {
      document.removeEventListener('visibilitychange', syncOrbit);
      orbit.destroy();
      orbitRef.current = null;
    };
  }, [mapInstance, estiloCarregado, mapMode, introDone, focusTarget]);

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
    if (!map || !estiloCarregado || !hasRoute || destinations.length < 2) {
      routeCoordsRef.current = [];
      // getSource em vez de isStyleLoaded: apagar a linha antiga nao pode
      // depender de nao haver tile em voo, que e o que isStyleLoaded mede. Com
      // esse guard, trocar de roteiro enquanto tiles carregavam deixava o traco
      // anterior no mapa.
      if (map && estiloCarregado && map.getSource('route')) {
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

    // O efeito so chega aqui com `estiloCarregado` verdadeiro, entao as fontes e
    // camadas de rota criadas no 'load' ja existem e da para desenhar direto.
    //
    // Antes isto era `if (map.isStyleLoaded()) desenha(); else map.on('style.load',
    // desenha)`, e as duas metades tinham defeito. `isStyleLoaded()` volta false
    // enquanto QUALQUER tile esta em voo, nao apenas antes do estilo ficar
    // pronto — entao gerar um roteiro com a rede ocupada caia no else. E o else
    // era pior: 'style.load' dispara uma vez so, na criacao do mapa, e nessa
    // altura ja passou — o handler nunca rodava (e nunca era removido na
    // limpeza). Resultado: roteiro gerado e nenhuma linha desenhada, sem erro
    // nenhum no console.
    fetchAndAnimateRoute();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pathDestinations, mapInstance, estiloCarregado, hasRoute]);

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

      {/* A etiqueta do estado nao vive mais aqui: virou um marcador ancorado na
          malha do RN, montado no efeito acima. Como overlay fixo ela colava no
          header do site e ficava parada enquanto o mapa se movia. */}

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
