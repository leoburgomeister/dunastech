import type { RasterDEMSourceSpecification, SkySpecification } from 'maplibre-gl';

export const TERRAIN_SOURCE_ID = 'maptiler-terrain';

/**
 * O relevo do RN e baixo (dunas ~30-50m, falesias ~50m). Sem exagero,
 * a cena 3D fica visualmente identica a um mapa plano.
 */
export const TERRAIN_EXAGGERATION = 2.5;

/**
 * 60 e o maxPitch padrao do MapLibre. A documentacao classifica valores
 * acima disso como experimentais, entao nao subimos.
 */
export const CINEMATIC_PITCH = 60;

/**
 * Zoom de abertura. Em 9 a camera enquadrava o estado inteiro e a costa virava
 * um fio: o que vende o RN e a cor da agua e o desenho das dunas, e isso so
 * aparece mais perto.
 */
export const OPENING_ZOOM = 10.4;

/**
 * Alvo fixo da abertura: Dunas de Genipabu (Extremoz), as mesmas coordenadas
 * do destino em mockData. E o cartao-postal mais reconhecivel do RN, e a
 * unica coisa na home que a plateia do CONETUR identifica sem legenda.
 */
export const GENIPABU_CENTER: [number, number] = [-35.1967, -5.7089];

/** Perto o bastante para o campo de dunas preencher o quadro. */
export const GENIPABU_ZOOM = 13.2;

/**
 * Caixa do estado, da malha do IBGE em public/geo/rn.geojson com folga.
 * Constante em vez de calculada do arquivo: o enquadramento de abertura nao
 * pode depender de um fetch terminar.
 */
export const RN_BOUNDS: [[number, number], [number, number]] = [
  [-38.62, -7.02],
  [-34.93, -4.79],
];

/**
 * Centro e zoom de partida do mapa. O mapa PRECISA nascer aqui, nao no
 * atrativo sorteado: antes ele abria fechado no destino e, quando o 'load'
 * finalmente disparava, saltava para o estado inteiro para so entao mergulhar
 * de volta. O usuario via um close, um estouro e um mergulho — a leitura era
 * de mapa torto. O fitBounds do 'load' refina este enquadramento; estes
 * valores so precisam ser proximos o bastante para o salto sumir.
 */
export const RN_CENTER: [number, number] = [-36.775, -5.905];
export const RN_OVERVIEW_ZOOM = 6.4;

/**
 * No plano aberto a camera olha de cima, sem inclinacao nenhuma. O objetivo
 * deste plano e uma coisa so: a plateia reconhecer o contorno do RN. Qualquer
 * pitch aplica perspectiva, o estado afunila no topo e a forma — que e o
 * unico conteudo do plano — deixa de ser reconhecivel. A inclinacao entra
 * depois, no mergulho, onde ela serve para mostrar relevo.
 */
export const RN_OVERVIEW_PITCH = 0;

/** Largura maxima do painel no desktop (lg:w-[min(30rem,42vw)]). */
const PANEL_MAX_W_PX = 480;
const PANEL_VW_RATIO = 0.42;
/** Onde o painel comeca no mobile (top-[42vh]). */
const PANEL_TOP_VH_RATIO = 0.42;
/** Breakpoint lg do Tailwind. */
const LG_BREAKPOINT_PX = 1024;

/**
 * Padding do enquadramento de abertura descontando o painel flutuante.
 * Sem isso o fitBounds centraliza o estado no canvas inteiro e metade dele
 * nasce atras do painel — inclusive a faixa costeira, que e o que interessa.
 */
export function overviewPadding(
  width: number,
  height: number
): { top: number; bottom: number; left: number; right: number } {
  if (width >= LG_BREAKPOINT_PX) {
    const painel = Math.min(PANEL_MAX_W_PX, width * PANEL_VW_RATIO);
    return { top: 56, bottom: 56, left: 56, right: Math.round(painel) + 48 };
  }
  return {
    top: 40,
    bottom: Math.round(height * (1 - PANEL_TOP_VH_RATIO)) + 24,
    left: 32,
    right: 32,
  };
}

/** Tempo parado no plano aberto, para a plateia ler o estado antes do mergulho. */
export const INTRO_HOLD_MS = 2600;

/** Duracao do mergulho do estado ate as dunas. */
export const INTRO_DIVE_MS = 5200;

/** Enquadramento de um destino buscado. Mesma altura da abertura. */
export const DESTINATION_ZOOM = 13.2;

/** Voo ate o destino buscado. Mais curto que a abertura: aqui o usuario pediu. */
export const DESTINATION_FLY_MS = 3400;

/** Duracao do mergulho ate a rota no modo cinematografico. */
export const CINEMATIC_FLY_DURATION_MS = 5500;

/** Duracao do enquadramento quando nao ha camera cinematografica. */
export const PLAIN_FIT_DURATION_MS = 1500;

export function buildStyleUrl(key: string): string {
  return `https://api.maptiler.com/maps/hybrid/style.json?key=${encodeURIComponent(key)}`;
}

export function buildTerrainSource(key: string): RasterDEMSourceSpecification {
  return {
    type: 'raster-dem',
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${encodeURIComponent(key)}`,
    encoding: 'mapbox',
  };
}

export function buildSky(): SkySpecification {
  return {
    'sky-color': '#0EA5E9',
    'horizon-color': '#FDE68A',
    'fog-color': '#F8FAFC',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.2,
    'atmosphere-blend': 0.8,
  };
}

/** Subconjunto do Map do MapLibre que a cena 3D precisa. Facilita o teste. */
export interface Scene3DTarget {
  getSource(id: string): unknown;
  addSource(id: string, source: RasterDEMSourceSpecification): unknown;
  setTerrain(options: { source: string; exaggeration?: number } | null): unknown;
  setSky(sky: SkySpecification): unknown;
  setProjection(projection: { type: 'globe' | 'mercator' }): unknown;
}

export function apply3DScene(map: Scene3DTarget, key: string): void {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, buildTerrainSource(key));
  }
  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
  map.setSky(buildSky());
  map.setProjection({ type: 'globe' });
}
