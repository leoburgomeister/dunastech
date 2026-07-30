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

/*
 * OPENING_ZOOM (10.4) foi removida. Ficou sem consumidor quando a abertura
 * passou a ter dois tempos, e o comentario dela argumentava contra o
 * enquadramento atual: dizia que enquadrar o estado inteiro transformava a costa
 * num fio. Isso era verdade quando o plano aberto era o unico plano — hoje ele
 * dura 2,6s e existe justamente para a plateia reconhecer a FORMA do estado; a
 * cor da agua e o desenho das dunas ficam para o mergulho, que termina em
 * GENIPABU_ZOOM.
 */

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
 * Centro e zoom do estado inteiro. Fallback de `openingCamera` para quando o
 * container ainda nao tem dimensao — sem largura nao ha como descontar o
 * painel, e um fitBounds com padding maior que o canvas nao resolve.
 *
 * No caminho normal ninguem usa estes valores: quem enquadra a abertura e o
 * proprio construtor do mapa, por bounds. Antes eram o centro de partida real,
 * e era dai que vinha o defeito: o primeiro quadro pintado punha o estado em
 * 28% da largura do canvas, deslocado para a esquerda, e ficava assim ate o
 * 'load' disparar um fitBounds de duracao zero — um corte seco.
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
 * Teto do padding somado num eixo, como fracao da dimensao. Acima de ~50% o
 * `cameraForBounds` do MapLibre passa a devolver zoom absurdo e, mais adiante,
 * `undefined`. Medido no browser: num canvas de 1172px, 480px somados funcionam e
 * 600px devolvem `undefined`.
 */
const PADDING_MAX_RATIO = 0.44;

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

/**
 * Enquadramento do roteiro gerado, descontando o painel.
 *
 * O `fitBounds` da rota passava `padding: 60` uniforme, o que ANULAVA o padding do
 * mapa — justo o que existe para manter o conteudo fora de baixo do painel. A rota
 * era centrada no canvas inteiro e nascia colada no painel: num roteiro compacto
 * (5 paradas na Grande Natal, ~30 km) o trajeto caia praticamente todo atras dele.
 *
 * Por que nao simplesmente passar `overviewPadding`? Porque `cameraForBounds` do
 * MapLibre erra feio com padding horizontal grande e assimetrico: com
 * `right: 528` num canvas de 1172 ele devolve zoom 5,26 onde o certo e ~10 — e a
 * partir de ~600px somados devolve `undefined`. Medido no browser.
 *
 * A saida e separar as duas coisas que o padding fazia junto:
 *   - `padding` SIMETRICO reserva a largura do painel para o calculo do zoom, sem
 *     cair no bug (o total horizontal e a largura do painel, no maximo 42vw, entao
 *     nunca chega perto da metade do canvas);
 *   - `offset` empurra o alvo para o meio da faixa que sobra ao lado do painel.
 */
export function routeFraming(
  width: number,
  height: number
): {
  padding: { top: number; bottom: number; left: number; right: number };
  offset: [number, number];
} {
  if (width >= LG_BREAKPOINT_PX) {
    const painel = Math.round(Math.min(PANEL_MAX_W_PX, width * PANEL_VW_RATIO));
    const lateral = Math.round(painel / 2);
    return {
      padding: { top: 56, bottom: 56, left: lateral, right: lateral },
      offset: [-lateral, 0],
    };
  }

  // Mobile: o painel ocupa a parte de baixo, entao a faixa livre e o topo. A
  // reserva cheia seria 58vh e passaria da metade da altura, que e onde o calculo
  // do MapLibre quebra — o teto vem da propria restricao (somando a margem base,
  // o padding total fica sob PADDING_MAX_RATIO), nao de um numero escolhido a dedo.
  const base = 32;
  const teto = Math.floor((height * PADDING_MAX_RATIO) / 2) - base;
  const vertical = Math.max(0, Math.min(Math.round((height * (1 - PANEL_TOP_VH_RATIO)) / 2), teto));
  return {
    padding: { top: base + vertical, bottom: base + vertical, left: 32, right: 32 },
    offset: [0, -vertical],
  };
}

/**
 * Camera de partida do mapa. Segura em qualquer viewport e refinada em seguida
 * por `applyOpeningFraming` — mas se o refino nao puder acontecer (container
 * degenerado), e aqui que o mapa fica, e este quadro e legivel.
 */
export const OPENING_FALLBACK_CAMERA = {
  center: RN_CENTER,
  zoom: RN_OVERVIEW_ZOOM,
  pitch: RN_OVERVIEW_PITCH,
  bearing: 0,
} as const;

/** Subconjunto do Map do MapLibre que o enquadramento precisa. Facilita o teste. */
export interface FramingTarget {
  setPadding(padding: ReturnType<typeof overviewPadding>): unknown;
  fitBounds(
    bounds: [[number, number], [number, number]],
    options: Record<string, unknown>
  ): unknown;
}

/**
 * Enquadra o plano aberto do estado. Chamado SINCRONAMENTE logo apos construir
 * o mapa: o MapLibre so pinta no proximo frame de animacao, entao os dois
 * passos abaixo cabem antes do primeiro pixel e ninguem ve o quadro
 * intermediario. Era essa correcao que antes morava num fitBounds no evento
 * 'load' — depois do primeiro quadro, portanto, e o salto entre os dois era a
 * piscada da abertura.
 *
 * A ORDEM E O `padding: 0` NAO SAO DETALHE. O MapLibre SOMA o padding do
 * transform ao padding da opcao ao calcular o zoom:
 *
 *   availableWidth = tr.width - (edgePadding.left + edgePadding.right
 *                                + padding.left + padding.right)
 *
 * e desloca o centro por `(padding.left - padding.right) / 2` — so pelo padding
 * da OPCAO, nao pelo do transform, que ja desloca por conta propria na
 * projecao. Passar o mesmo padding nos dois lugares descontava o painel duas
 * vezes: medido no browser, o estado nascia 236px a esquerda de onde devia,
 * saindo pela borda. E o `fitBounds` do 'load' antigo era pior ainda — o efeito
 * de padding ja havia rodado, entao o desconto dobrava tambem no zoom e o
 * estado era encaixado numa faixa de ~100px. Era dai que vinha o "torto, mais
 * ao canto".
 *
 * Entao: padding no transform primeiro (que e onde ele precisa ficar de todo
 * jeito, para orbita, voo e fitBounds da rota respeitarem o painel), e o
 * fitBounds com padding zero.
 */
export function applyOpeningFraming(
  map: FramingTarget,
  width: number,
  height: number
): void {
  // Container sem dimensao: nao ha largura para descontar o painel, e o
  // cameraForBounds do MapLibre devolve undefined quando o padding cobre o
  // canvas — o fitBounds viraria no-op silencioso. Fica no quadro de partida.
  if (width <= 0 || height <= 0) return;

  map.setPadding(overviewPadding(width, height));
  map.fitBounds(RN_BOUNDS, {
    padding: 0,
    pitch: RN_OVERVIEW_PITCH,
    bearing: 0,
    duration: 0,
  });
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

/**
 * Ceu, horizonte e neblina do plano inclinado.
 *
 * `atmosphere-blend` continua aqui, mas hoje e inerte: o passe de atmosfera do
 * MapLibre so e desenhado na projecao globo, e o globo foi removido (ver
 * `applySky`). Fica declarado porque nao custa nada e volta a valer no dia em
 * que a projecao voltar — e mais honesto documentar do que apagar em silencio.
 */
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

/** Subconjunto do Map do MapLibre que o ceu precisa. Facilita o teste. */
export interface SkyTarget {
  setSky(sky: SkySpecification): unknown;
}

/** Subconjunto do Map do MapLibre que o terreno precisa. Facilita o teste. */
export interface TerrainTarget {
  getSource(id: string): unknown;
  addSource(id: string, source: RasterDEMSourceSpecification): unknown;
  getTerrain(): unknown;
  setTerrain(options: { source: string; exaggeration?: number } | null): unknown;
}

/**
 * Ceu e atmosfera. Roda no 'load' porque nao desloca geometria nenhuma: sem
 * inclinacao o ceu nem aparece, e o primeiro quadro fica identico com ou sem
 * ele.
 *
 * A projecao globo saiu daqui. Ela era ligada no 'load', ou seja, DEPOIS do
 * primeiro quadro em mercator, e a troca reprojetava o mapa inteiro de uma vez.
 * Pior: no plano aberto o estado fica fora do eixo otico (o painel empurra o
 * enquadramento para a esquerda) e no globo tudo que esta fora do eixo aparece
 * cisalhado — era o contorno do RN saindo torto. Acima de zoom ~12 o proprio
 * MapLibre converge o globo para mercator, entao no mergulho a projecao nao
 * mudava nada: o globo so tinha efeito visivel justamente onde atrapalhava.
 */
export function applySky(map: SkyTarget): void {
  map.setSky(buildSky());
}

/**
 * Relevo. Separado do ceu porque entra em outro momento: no inicio do mergulho,
 * nao na abertura. Dunas de 30-50m nao sao legiveis no plano aberto do estado,
 * e ligar o terreno junto com o resto empilhava mais um reajuste de geometria
 * no mesmo frame. Ligado no mergulho, aparece exatamente quando passa a
 * significar algo.
 */
export function applyTerrain(map: TerrainTarget, key: string): void {
  // Ja instalado: sair sem tocar em nada. O `setTerrain` do MapLibre 5.24 faz
  // `this.terrain = new Terrain(...)` no ramo de adicao sem destruir o anterior,
  // entao chamar de novo vaza um Terrain e um RenderToTexture. E chamar de novo
  // acontece de verdade: quem instala o relevo e um efeito que depende de
  // `zoomProximo`, e esse valor vai e volta — basta o usuario gerar um roteiro
  // largo (que abre o quadro) e depois um curto.
  if (map.getTerrain()) return;

  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, buildTerrainSource(key));
  }
  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
}
