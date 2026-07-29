/**
 * Uma volta completa a cada 100s (3.6 graus/s). O mapa e cenario de fundo:
 * o movimento tem que ser percebido como "vivo", nao como camera girando.
 */
export const ORBIT_PERIOD_MS = 100000;

export interface OrbitTarget {
  getBearing(): number;
  setBearing(bearing: number): unknown;
}

/** RAF e relogio injetados: os testes rodam em node, sem browser. */
export interface OrbitDeps {
  now(): number;
  requestFrame(callback: (time: number) => void): number;
  cancelFrame(id: number): void;
}

export interface OrbitController {
  start(): void;
  stop(): void;
  destroy(): void;
  isRunning(): boolean;
}

export interface OrbitOptions {
  periodMs?: number;
  /**
   * Enquanto retornar true, a orbita nao mexe na camera.
   * Necessario porque setBearing() chama jumpTo(), que internamente faz stop()
   * e cancelaria qualquer transicao em curso — inclusive o mergulho do fitBounds.
   */
  isBusy?: () => boolean;
}

export function orbitBearingAt(
  elapsedMs: number,
  periodMs: number,
  startBearing: number
): number {
  if (periodMs <= 0) return normalizeBearing(startBearing);
  const turns = elapsedMs / periodMs;
  return normalizeBearing(startBearing + turns * 360);
}

function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

export function createOrbitController(
  map: OrbitTarget,
  deps: OrbitDeps,
  { periodMs = ORBIT_PERIOD_MS, isBusy }: OrbitOptions = {}
): OrbitController {
  let frameId: number | null = null;
  let lastAt = 0;
  let bearing = 0;

  // Acumula por delta em vez de tempo absoluto: assim o tempo passado com a
  // camera ocupada nao vira um salto de giro quando a orbita retoma.
  function tick(): void {
    const now = deps.now();
    const delta = now - lastAt;
    lastAt = now;

    if (!isBusy?.()) {
      bearing = orbitBearingAt(delta, periodMs, bearing);
      map.setBearing(bearing);
    }

    frameId = deps.requestFrame(tick);
  }

  function start(): void {
    if (frameId !== null) return;
    lastAt = deps.now();
    bearing = map.getBearing();
    frameId = deps.requestFrame(tick);
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
  };
}

/** Deps reais do browser. Usado pelo componente, nunca pelos testes. */
export function browserOrbitDeps(): OrbitDeps {
  return {
    now: () => performance.now(),
    requestFrame: (cb) => requestAnimationFrame(cb),
    cancelFrame: (id) => cancelAnimationFrame(id),
  };
}
