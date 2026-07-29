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
