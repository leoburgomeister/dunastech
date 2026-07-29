/** Uma volta completa a cada 40s: perceptivel como "vivo", nunca como enjoativo. */
export const ORBIT_PERIOD_MS = 40000;

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
  periodMs: number = ORBIT_PERIOD_MS
): OrbitController {
  let frameId: number | null = null;
  let startedAt = 0;
  let startBearing = 0;

  function tick(): void {
    const elapsed = deps.now() - startedAt;
    map.setBearing(orbitBearingAt(elapsed, periodMs, startBearing));
    frameId = deps.requestFrame(tick);
  }

  function start(): void {
    if (frameId !== null) return;
    startedAt = deps.now();
    startBearing = map.getBearing();
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
