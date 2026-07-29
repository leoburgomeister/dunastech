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
