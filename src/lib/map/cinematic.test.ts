import { describe, it, expect, vi } from 'vitest';
import { orbitBearingAt, createOrbitController, ORBIT_PERIOD_MS } from './cinematic';

describe('orbitBearingAt', () => {
  it('comeca no bearing inicial', () => {
    expect(orbitBearingAt(0, 40000, 0)).toBe(0);
    expect(orbitBearingAt(0, 40000, 90)).toBe(90);
  });

  it('completa uma volta em um periodo', () => {
    expect(orbitBearingAt(20000, 40000, 0)).toBe(180);
    expect(orbitBearingAt(10000, 40000, 0)).toBe(90);
  });

  it('normaliza para o intervalo 0-360', () => {
    expect(orbitBearingAt(40000, 40000, 0)).toBe(0);
    expect(orbitBearingAt(30000, 40000, 180)).toBe(90);
  });

  it('nao divide por zero quando o periodo e invalido', () => {
    expect(orbitBearingAt(1000, 0, 45)).toBe(45);
    expect(orbitBearingAt(1000, -5, 45)).toBe(45);
  });
});

/** RAF falso com relogio manual. */
function fakeClock() {
  let time = 0;
  let nextId = 1;
  const pending = new Map<number, (t: number) => void>();

  return {
    now: () => time,
    requestFrame: (cb: (t: number) => void) => {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancelFrame: (id: number) => {
      pending.delete(id);
    },
    advance(ms: number) {
      time += ms;
      const due = [...pending.entries()];
      pending.clear();
      due.forEach(([, cb]) => cb(time));
    },
    pendingCount: () => pending.size,
  };
}

function fakeMap(initialBearing = 0) {
  let bearing = initialBearing;
  return {
    getBearing: () => bearing,
    setBearing: vi.fn((b: number) => {
      bearing = b;
    }),
  };
}

describe('createOrbitController', () => {
  it('nao mexe na camera antes de start', () => {
    const clock = fakeClock();
    const map = fakeMap();
    createOrbitController(map, clock);

    clock.advance(10000);
    expect(map.setBearing).not.toHaveBeenCalled();
  });

  it('gira a camera enquanto roda', () => {
    const clock = fakeClock();
    const map = fakeMap();
    const orbit = createOrbitController(map, clock, 40000);

    orbit.start();
    expect(orbit.isRunning()).toBe(true);

    clock.advance(10000);
    expect(map.setBearing).toHaveBeenCalledWith(90);

    clock.advance(10000);
    expect(map.setBearing).toHaveBeenCalledWith(180);
  });

  it('para de girar apos stop', () => {
    const clock = fakeClock();
    const map = fakeMap();
    const orbit = createOrbitController(map, clock, 40000);

    orbit.start();
    clock.advance(10000);
    const callsAfterFirstAdvance = map.setBearing.mock.calls.length;

    orbit.stop();
    expect(orbit.isRunning()).toBe(false);

    clock.advance(10000);
    expect(map.setBearing.mock.calls.length).toBe(callsAfterFirstAdvance);
    expect(clock.pendingCount()).toBe(0);
  });

  it('retoma do bearing atual apos stop e start', () => {
    const clock = fakeClock();
    const map = fakeMap();
    const orbit = createOrbitController(map, clock, 40000);

    orbit.start();
    clock.advance(10000);
    orbit.stop();

    orbit.start();
    clock.advance(10000);
    expect(map.setBearing).toHaveBeenLastCalledWith(180);
  });

  it('start duplicado nao cria uma segunda animacao', () => {
    const clock = fakeClock();
    const map = fakeMap();
    const orbit = createOrbitController(map, clock, 40000);

    orbit.start();
    orbit.start();
    expect(clock.pendingCount()).toBe(1);
  });

  it('destroy encerra a animacao', () => {
    const clock = fakeClock();
    const map = fakeMap();
    const orbit = createOrbitController(map, clock, 40000);

    orbit.start();
    orbit.destroy();

    expect(orbit.isRunning()).toBe(false);
    expect(clock.pendingCount()).toBe(0);
  });

  it('usa 40s por volta como padrao', () => {
    expect(ORBIT_PERIOD_MS).toBe(40000);
  });
});
