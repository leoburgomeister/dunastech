/**
 * Cache estatico das rotas do OSRM.
 *
 * A rota da home vem de router.project-osrm.org, que e o servidor publico de
 * demonstracao do OSRM: sem SLA, com rate limit e fora do nosso controle. O
 * momento em que a rota se desenha e o climax da apresentacao, entao ele nao
 * pode depender da rede do auditorio nem da boa vontade de um servidor de
 * demo.
 *
 * As 18 combinacoes de estilo x transporte que a home sabe gerar tem a
 * geometria gravada em /routes/osrm-cache.json por scripts/gerar-cache-osrm.mts.
 * Em tempo de execucao o cache vem PRIMEIRO: acerto e instantaneo e offline.
 * So roteiro fora da tabela (quando a busca injeta um destino) vai a rede.
 */

export type Coord = [number, number];

export const ROUTE_CACHE_URL = '/routes/osrm-cache.json';

/**
 * Chave estavel para um conjunto de paradas. Mesmo formato que o OSRM recebe
 * na URL, com 4 casas decimais — precisao de ~11 m, suficiente para
 * identificar a parada e imune a ruido de ponto flutuante.
 */
export function routeKey(coords: Coord[]): string {
  return coords.map(([lng, lat]) => `${lng.toFixed(4)},${lat.toFixed(4)}`).join(';');
}

export type RouteCache = Record<string, Coord[]>;

let emCache: Promise<RouteCache> | null = null;

/** Baixa o arquivo uma vez por sessao. Falha vira cache vazio, nunca excecao. */
export function loadRouteCache(fetchImpl: typeof fetch = fetch): Promise<RouteCache> {
  if (!emCache) {
    emCache = fetchImpl(ROUTE_CACHE_URL)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return emCache;
}

/** Apenas para teste: esquece o download memorizado. */
export function resetRouteCache(): void {
  emCache = null;
}

export function lookupRoute(cache: RouteCache, coords: Coord[]): Coord[] | null {
  const rota = cache[routeKey(coords)];
  return Array.isArray(rota) && rota.length > 1 ? rota : null;
}

/**
 * Corta a espera pelo OSRM. Sem isto uma requisicao pendurada — que e o que
 * acontece numa rede que engole pacotes em vez de recusar — deixaria a rota
 * sem desenhar para sempre, sem erro nenhum no console.
 */
export const OSRM_TIMEOUT_MS = 4000;

export function osrmUrl(coords: Coord[]): string {
  const pares = coords.map(([lng, lat]) => `${lng},${lat}`).join(';');
  return `https://router.project-osrm.org/route/v1/driving/${pares}?overview=full&geometries=geojson`;
}

/** Linha reta entre as paradas: ultimo recurso, nunca deixa a tela vazia. */
export function straightLine(coords: Coord[]): Coord[] {
  return coords;
}
