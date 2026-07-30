/**
 * Destaque do Rio Grande do Norte sobre o mapa.
 *
 * Duas camadas: uma mascara que escurece tudo que esta FORA do estado, e o
 * contorno por cima. Sem isso a cena de satelite e bonita mas anonima — podia
 * ser qualquer litoral do mundo, e a plateia do CONETUR precisa reconhecer o
 * proprio estado em dois segundos.
 *
 * Malha oficial do IBGE (codarea 24), servida estatica de /public para nao
 * depender da API no dia da apresentacao.
 */

export type Ring = [number, number][];

export const RN_MASK_SOURCE_ID = 'rn-mask';
export const RN_OUTLINE_SOURCE_ID = 'rn-outline';
export const RN_MASK_LAYER_ID = 'rn-mask-fill';
export const RN_OUTLINE_LAYER_ID = 'rn-outline-line';
export const RN_GLOW_OUTER_LAYER_ID = 'rn-glow-outer';
export const RN_GLOW_INNER_LAYER_ID = 'rn-glow-inner';

/** Ouro da marca, o mesmo --color-accent do tema escuro. */
export const RN_ACCENT = '#F0C75E';

/** Azul quase preto da mascara. Escurece sem virar cinza morto. */
export const RN_MASK_COLOR = '#04121E';

/**
 * Ancora da etiqueta do estado: interior do RN, perto do centro visual da
 * malha. E rotulo de mapa, entao mora sobre a terra que nomeia — antes vivia
 * grudado no canto superior esquerdo da tela, competindo com o header do site.
 */
export const RN_LABEL_ANCHOR: [number, number] = [-36.75, -5.82];

/** Duracao do fade de entrada do destaque. */
export const RN_FADE_IN_MS = 900;

/**
 * Transicao de opacidade declarada na paint das camadas do destaque.
 *
 * A malha do estado vem por fetch, entao as camadas nascem num momento
 * imprevisivel — depois do primeiro quadro, quase sempre. Sem transicao a
 * mascara pousava direto em 0.55 e tudo fora do estado escurecia num piscar.
 * Com a transicao declarada, trocar a opacidade por setPaintProperty vira fade
 * e o MapLibre interpola sozinho.
 */
export const RN_OPACITY_TRANSITION = { duration: RN_FADE_IN_MS, delay: 0 } as const;

/**
 * Aura do contorno: duas linhas borradas por baixo da linha nitida, com
 * quedas diferentes. Uma so camada borrada da um halo chapado; duas criam
 * queda de intensidade e o brilho parece emitido pela borda.
 *
 * Largura e blur crescem com o zoom por interpolacao — em zoom baixo o estado
 * e pequeno na tela e uma aura fixa em pixels o engoliria.
 */
export const RN_GLOW = {
  outer: { width: [5, 14, 10, 46] as const, blur: [5, 12, 10, 40] as const, opacity: 0.3 },
  inner: { width: [5, 5, 10, 18] as const, blur: [5, 5, 10, 16] as const, opacity: 0.45 },
} as const;

/** Monta a expressao de interpolacao por zoom no formato do MapLibre. */
export function zoomRamp([z1, v1, z2, v2]: readonly [number, number, number, number]) {
  return ['interpolate', ['linear'], ['zoom'], z1, v1, z2, v2];
}

/**
 * Zoom em que o destaque comeca a sumir e zoom em que ja sumiu por completo.
 * O plano aberto do estado fica por volta de 6.5; o mergulho termina em 13.2.
 * Amarrar o fade ao zoom, e nao a um timer, faz o destaque desaparecer durante
 * a descida sozinho — e tambem quando o usuario busca um destino, que e o
 * outro caminho ate o zoom fechado.
 */
export const RN_FADE_START_ZOOM = 8;
export const RN_FADE_END_ZOOM = 10.5;

/** Opacidade que cai a zero conforme a camera se aproxima. */
export function fadeByZoom(maxOpacity: number) {
  return zoomRamp([RN_FADE_START_ZOOM, maxOpacity, RN_FADE_END_ZOOM, 0]);
}
export const RN_GEOJSON_URL = '/geo/rn.geojson';

/**
 * Caixa que cobre o Nordeste com folga. Nao usamos o mundo inteiro de
 * proposito: na projecao globo um poligono de -180..180 se comporta mal.
 */
export const MASK_BBOX = { west: -50, south: -20, east: -25, north: 5 } as const;

interface GeoJsonLike {
  type: string;
  features?: { geometry?: { type?: string; coordinates?: unknown } }[];
  geometry?: { type?: string; coordinates?: unknown };
  coordinates?: unknown;
}

/**
 * Aceita FeatureCollection, Feature, Polygon ou MultiPolygon e devolve os
 * aneis externos. Aneis internos (enclaves) sao ignorados: o RN nao tem, e
 * herda-los na mascara abriria buracos claros no meio do escurecimento.
 */
export function extractRings(geojson: GeoJsonLike): Ring[] {
  const geometry =
    geojson.type === 'FeatureCollection'
      ? geojson.features?.[0]?.geometry
      : geojson.type === 'Feature'
        ? geojson.geometry
        : geojson;

  const type = geometry?.type;
  const coords = geometry?.coordinates;
  if (!coords) return [];

  if (type === 'Polygon') {
    return [(coords as Ring[])[0]];
  }
  if (type === 'MultiPolygon') {
    // MultiPolygon: lista de poligonos, cada um com seus aneis. Pegamos o
    // externo de cada.
    return (coords as Ring[][]).map((polygon) => polygon[0]);
  }
  return [];
}

/**
 * Poligono com a caixa como anel externo e o estado como furo. O preenchimento
 * cai em tudo menos no RN.
 */
export function buildMaskFeature(
  rings: Ring[],
  bbox: typeof MASK_BBOX = MASK_BBOX
) {
  const outer: Ring = [
    [bbox.west, bbox.south],
    [bbox.east, bbox.south],
    [bbox.east, bbox.north],
    [bbox.west, bbox.north],
    [bbox.west, bbox.south],
  ];

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      // Furos precisam de sentido oposto ao anel externo.
      coordinates: [outer, ...rings.map((r) => [...r].reverse())],
    },
  };
}

export function buildOutlineFeature(rings: Ring[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'MultiLineString' as const,
      coordinates: rings,
    },
  };
}

/**
 * Uma camada do destaque, pronta para o addLayer.
 *
 * `paint` nasce com a opacidade em zero; a opacidade de verdade viaja separada
 * em `finalOpacity` e e aplicada depois do primeiro quadro. Sem isso a entrada
 * era um corte: a camada aparecia ja opaca no frame em que o fetch resolvia.
 */
export interface HighlightLayer {
  id: string;
  type: 'fill' | 'line';
  source: string;
  layout?: Record<string, unknown>;
  paint: Record<string, unknown>;
  /** Propriedade de opacidade desta camada, para a troca pos-primeiro-quadro. */
  opacityProp: 'fill-opacity' | 'line-opacity';
  /** Expressao de opacidade final, com o fade por zoom. */
  finalOpacity: unknown;
}

/** Halo compartilhado pelas tres linhas: junta e ponta arredondadas. */
const LINE_LAYOUT = { 'line-join': 'round', 'line-cap': 'round' } as const;

/**
 * Camadas do destaque, na ordem de pintura: mascara, aura larga, aura fechada
 * e por fim o contorno nitido. A ordem importa — invertida, o borrao lava o
 * traco.
 *
 * Declarativo em vez de montado inline no componente para o teste poder afirmar
 * sobre a paint inicial, que e onde estava o defeito.
 */
export function highlightLayers(): HighlightLayer[] {
  const auras = (
    [
      [RN_GLOW_OUTER_LAYER_ID, RN_GLOW.outer],
      [RN_GLOW_INNER_LAYER_ID, RN_GLOW.inner],
    ] as const
  ).map(([id, cfg]) => ({
    id,
    type: 'line' as const,
    source: RN_OUTLINE_SOURCE_ID,
    layout: { ...LINE_LAYOUT },
    paint: {
      'line-color': RN_ACCENT,
      'line-width': zoomRamp(cfg.width),
      'line-blur': zoomRamp(cfg.blur),
      'line-opacity': 0,
      'line-opacity-transition': RN_OPACITY_TRANSITION,
    },
    opacityProp: 'line-opacity' as const,
    finalOpacity: fadeByZoom(cfg.opacity),
  }));

  return [
    {
      id: RN_MASK_LAYER_ID,
      type: 'fill',
      source: RN_MASK_SOURCE_ID,
      paint: {
        'fill-color': RN_MASK_COLOR,
        'fill-opacity': 0,
        'fill-opacity-transition': RN_OPACITY_TRANSITION,
      },
      opacityProp: 'fill-opacity',
      finalOpacity: fadeByZoom(0.55),
    },
    ...auras,
    {
      id: RN_OUTLINE_LAYER_ID,
      type: 'line',
      source: RN_OUTLINE_SOURCE_ID,
      layout: { ...LINE_LAYOUT },
      paint: {
        'line-color': RN_ACCENT,
        'line-width': 1.6,
        'line-opacity': 0,
        'line-opacity-transition': RN_OPACITY_TRANSITION,
      },
      opacityProp: 'line-opacity',
      finalOpacity: fadeByZoom(0.95),
    },
  ];
}
