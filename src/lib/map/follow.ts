/**
 * Camera que percorre a rota gerada, em vez de orbitar parada.
 *
 * A geometria vive em funcoes puras aqui embaixo para poder ser testada em
 * node, sem browser e sem MapLibre — mesmo arranjo de cinematic.ts.
 */

export type Coord = [number, number]; // [lng, lat]

/** Duracao padrao da travessia. Longa o bastante para ler como voo, curta o
 *  bastante para caber num pitch de 3 minutos. */
export const FOLLOW_DURATION_MS = 14000;

/** Mais perto que a abertura: seguindo a rota o interesse e o chao, nao o estado. */
export const FOLLOW_ZOOM = 12.4;

/**
 * Quanto a camera olha a frente para calcular o rumo. Usar o proximo ponto
 * cru faz o rumo tremer, porque a polilinha do OSRM tem vertices a poucos
 * metros um do outro e cada curva minima vira uma guinada.
 */
export const LOOK_AHEAD_METERS = 400;

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function distanceBetween(a: Coord, b: Coord): number {
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Rumo em graus, 0 = norte, crescendo para leste. */
export function bearingBetween(a: Coord, b: Coord): number {
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const dLon = toRad(b[0] - a[0]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Distancia acumulada ate cada vertice. Sempre comeca em 0. */
export function cumulativeDistances(coords: Coord[]): number[] {
  const out: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    out.push(out[i - 1] + distanceBetween(coords[i - 1], coords[i]));
  }
  return out;
}

/**
 * Ponto da polilinha a `distance` metros do inicio. Interpola linearmente
 * dentro do segmento — a distorcao e irrelevante em segmentos de dezenas de
 * metros nesta latitude.
 */
export function positionAt(
  coords: Coord[],
  cumulative: number[],
  distance: number
): Coord {
  if (coords.length === 0) throw new Error('positionAt: polilinha vazia');
  if (coords.length === 1) return coords[0];

  const total = cumulative[cumulative.length - 1];
  if (distance <= 0) return coords[0];
  if (distance >= total) return coords[coords.length - 1];

  let hi = 1;
  while (hi < cumulative.length && cumulative[hi] < distance) hi++;
  const lo = hi - 1;

  const span = cumulative[hi] - cumulative[lo];
  const t = span === 0 ? 0 : (distance - cumulative[lo]) / span;
  const a = coords[lo];
  const b = coords[hi];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export interface FollowTarget {
  jumpTo(options: {
    center: Coord;
    bearing: number;
    pitch: number;
    zoom: number;
  }): unknown;
}

export interface FollowDeps {
  now(): number;
  requestFrame(callback: (time: number) => void): number;
  cancelFrame(id: number): void;
}

export interface FollowOptions {
  coordinates: Coord[];
  durationMs?: number;
  pitch: number;
  zoom?: number;
  lookAheadMeters?: number;
  /** Chamado uma unica vez ao chegar ao fim, para devolver a camera a orbita. */
  onFinish?: () => void;
}

export interface FollowController {
  start(): void;
  stop(): void;
  destroy(): void;
  isRunning(): boolean;
  /** Progresso 0..1, util para barra de progresso e para teste. */
  progress(): number;
}

export function createFollowController(
  map: FollowTarget,
  deps: FollowDeps,
  {
    coordinates,
    durationMs = FOLLOW_DURATION_MS,
    pitch,
    zoom = FOLLOW_ZOOM,
    lookAheadMeters = LOOK_AHEAD_METERS,
    onFinish,
  }: FollowOptions
): FollowController {
  const cumulative = cumulativeDistances(coordinates);
  const total = cumulative[cumulative.length - 1] ?? 0;

  let frameId: number | null = null;
  let startedAt = 0;
  let ratio = 0;
  let finished = false;
  let lastBearing =
    coordinates.length > 1 ? bearingBetween(coordinates[0], coordinates[1]) : 0;

  function frame(): void {
    const elapsed = deps.now() - startedAt;
    ratio = durationMs <= 0 ? 1 : Math.min(1, Math.max(0, elapsed / durationMs));

    const travelled = total * ratio;
    const center = positionAt(coordinates, cumulative, travelled);
    const ahead = positionAt(
      coordinates,
      cumulative,
      Math.min(total, travelled + lookAheadMeters)
    );

    // No ultimo metro `center` e `ahead` coincidem e o rumo ficaria indefinido;
    // nesse caso segura o rumo anterior em vez de dar um giro seco.
    const bearing =
      center[0] === ahead[0] && center[1] === ahead[1]
        ? lastBearing
        : bearingBetween(center, ahead);
    lastBearing = bearing;

    map.jumpTo({ center, bearing, pitch, zoom });

    if (ratio >= 1) {
      stop();
      if (!finished) {
        finished = true;
        onFinish?.();
      }
      return;
    }

    frameId = deps.requestFrame(frame);
  }

  function start(): void {
    if (frameId !== null || coordinates.length < 2) return;
    finished = false;
    startedAt = deps.now();
    frame();
  }

  function stop(): void {
    if (frameId === null) return;
    deps.cancelFrame(frameId);
    frameId = null;
  }

  return {
    start,
    stop,
    destroy: stop,
    isRunning: () => frameId !== null,
    progress: () => ratio,
  };
}

/** Deps reais do browser. Usado pelo componente, nunca pelos testes. */
export function browserFollowDeps(): FollowDeps {
  return {
    now: () => performance.now(),
    requestFrame: (cb) => requestAnimationFrame(cb),
    cancelFrame: (id) => cancelAnimationFrame(id),
  };
}
