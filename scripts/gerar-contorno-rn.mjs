// Gera o contorno SVG do RN a partir do geojson local (offline, sem rede).
import fs from 'node:fs';

const GEO = process.argv[2];
const OUT = process.argv[3];

const gj = JSON.parse(fs.readFileSync(GEO, 'utf8'));

// Coleta todos os anéis de todos os polígonos
const rings = [];
for (const f of gj.features) {
  const g = f.geometry;
  if (!g) continue;
  if (g.type === 'Polygon') {
    for (const r of g.coordinates) rings.push(r);
  } else if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) for (const r of poly) rings.push(r);
  }
}

if (!rings.length) throw new Error('nenhum anel encontrado no geojson');

// Bounds
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const r of rings) {
  for (const [lon, lat] of r) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
}

// Projeção equirretangular com correção de cosseno na latitude média
const midLat = (minLat + maxLat) / 2;
const kx = Math.cos((midLat * Math.PI) / 180);

const WIDTH = 1000;
const spanX = (maxLon - minLon) * kx;
const spanY = maxLat - minLat;
const scale = WIDTH / spanX;
const HEIGHT = Math.round(spanY * scale);

const project = (lon, lat) => [
  ((lon - minLon) * kx * scale),
  ((maxLat - lat) * scale),
];

const round = (n) => Math.round(n * 10) / 10;

const paths = rings.map((r) => {
  const pts = r.map(([lon, lat]) => {
    const [x, y] = project(lon, lat);
    return `${round(x)},${round(y)}`;
  });
  return 'M' + pts.join('L') + 'Z';
});

const banner = `// ============================================================
// CONTORNO DO RIO GRANDE DO NORTE — gerado de public/geo/rn.geojson
// ============================================================
// Arquivo GERADO. Não editar à mão.
// Regerar: node scripts/gerar-contorno-rn.mjs public/geo/rn.geojson src/data/rnOutline.ts
//
// Usado pelo <PlaceMap> para desenhar o mapa sem nenhuma chamada de
// rede — o pitch precisa funcionar offline.
// ============================================================
`;

const body = `${banner}
/** Bounds geográficos originais do contorno. */
export const RN_BOUNDS = {
  minLon: ${minLon},
  maxLon: ${maxLon},
  minLat: ${minLat},
  maxLat: ${maxLat},
} as const;

/** Fator de correção de longitude (cos da latitude média). */
export const RN_KX = ${kx};

/** Dimensões do viewBox em que o contorno foi projetado. */
export const RN_VIEWBOX = { width: ${WIDTH}, height: ${HEIGHT} } as const;

/** Contorno do estado como path SVG. */
export const RN_OUTLINE_PATH = ${JSON.stringify(paths.join(''))};

/**
 * Projeta uma coordenada geográfica para o espaço do viewBox do contorno.
 * Mesma projeção usada na geração do path, então os pontos caem no lugar certo.
 */
export function projectToOutline(longitude: number, latitude: number): { x: number; y: number } {
  return {
    x: (longitude - RN_BOUNDS.minLon) * RN_KX * ${scale},
    y: (RN_BOUNDS.maxLat - latitude) * ${scale},
  };
}
`;

fs.writeFileSync(OUT, body, 'utf8');

console.log(`bounds  lon ${minLon}..${maxLon}  lat ${minLat}..${maxLat}`);
console.log(`viewBox ${WIDTH}x${HEIGHT}`);
console.log(`aneis   ${rings.length}`);
console.log(`path    ${paths.join('').length} chars`);
console.log(`-> ${OUT}`);
