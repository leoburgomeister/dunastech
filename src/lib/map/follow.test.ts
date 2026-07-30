import { describe, it, expect, vi } from 'vitest';
import {
  distanceBetween,
  bearingBetween,
  cumulativeDistances,
  positionAt,
  createFollowController,
  type Coord,
} from './follow';

/** RAF falso com relogio manual, igual ao usado em cinematic.test.ts. */
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
  };
}

/** Trecho reto de ~1 grau de longitude na latitude de Natal. */
const NATAL: Coord = [-35.2, -5.8];
const LESTE: Coord = [-34.2, -5.8];
const NORTE: Coord = [-35.2, -4.8];

describe('distanceBetween', () => {
  it('e zero para o mesmo ponto', () => {
    expect(distanceBetween(NATAL, NATAL)).toBe(0);
  });

  it('mede um grau de latitude como ~111 km', () => {
    const d = distanceBetween(NATAL, NORTE);
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });

  it('e simetrica', () => {
    expect(distanceBetween(NATAL, LESTE)).toBeCloseTo(distanceBetween(LESTE, NATAL), 6);
  });
});

describe('bearingBetween', () => {
  it('aponta 90 graus para leste', () => {
    expect(bearingBetween(NATAL, LESTE)).toBeCloseTo(90, 0);
  });

  it('aponta 0 grau para norte', () => {
    expect(bearingBetween(NATAL, NORTE)).toBeCloseTo(0, 0);
  });

  it('devolve sempre no intervalo 0-360', () => {
    const oeste = bearingBetween(LESTE, NATAL);
    expect(oeste).toBeGreaterThanOrEqual(0);
    expect(oeste).toBeLessThan(360);
    expect(oeste).toBeCloseTo(270, 0);
  });
});

describe('cumulativeDistances', () => {
  it('comeca em zero e cresce monotonicamente', () => {
    const c = cumulativeDistances([NATAL, LESTE, NORTE]);
    expect(c[0]).toBe(0);
    expect(c[1]).toBeGreaterThan(c[0]);
    expect(c[2]).toBeGreaterThan(c[1]);
  });

  it('tem o mesmo tamanho da polilinha', () => {
    expect(cumulativeDistances([NATAL, LESTE, NORTE])).toHaveLength(3);
  });
});

describe('positionAt', () => {
  const coords: Coord[] = [NATAL, LESTE];
  const cum = cumulativeDistances(coords);

  it('devolve o primeiro ponto no inicio e antes dele', () => {
    expect(positionAt(coords, cum, 0)).toEqual(NATAL);
    expect(positionAt(coords, cum, -500)).toEqual(NATAL);
  });

  it('devolve o ultimo ponto no fim e depois dele', () => {
    const total = cum[cum.length - 1];
    expect(positionAt(coords, cum, total)).toEqual(LESTE);
    expect(positionAt(coords, cum, total * 2)).toEqual(LESTE);
  });

  it('interpola no meio do segmento', () => {
    const meio = positionAt(coords, cum, cum[1] / 2);
    expect(meio[0]).toBeCloseTo(-34.7, 2);
    expect(meio[1]).toBeCloseTo(-5.8, 6);
  });

  it('nao quebra com polilinha de um ponto so', () => {
    expect(positionAt([NATAL], [0], 999)).toEqual(NATAL);
  });

  it('reclama de polilinha vazia em vez de devolver lixo', () => {
    expect(() => positionAt([], [], 0)).toThrow(/vazia/);
  });
});

describe('createFollowController', () => {
  const coords: Coord[] = [NATAL, LESTE];

  function setup(overrides: Partial<Parameters<typeof createFollowController>[2]> = {}) {
    const clock = fakeClock();
    const jumpTo = vi.fn();
    const controller = createFollowController({ jumpTo }, clock, {
      coordinates: coords,
      durationMs: 1000,
      pitch: 60,
      ...overrides,
    });
    return { clock, jumpTo, controller };
  }

  it('nao roda antes de start', () => {
    const { controller, jumpTo } = setup();
    expect(controller.isRunning()).toBe(false);
    expect(jumpTo).not.toHaveBeenCalled();
  });

  it('posiciona a camera no inicio da rota ao comecar', () => {
    const { controller, jumpTo } = setup();
    controller.start();
    expect(jumpTo).toHaveBeenCalledTimes(1);
    const call = jumpTo.mock.calls[0][0];
    expect(call.center[0]).toBeCloseTo(NATAL[0], 6);
    expect(call.pitch).toBe(60);
    expect(controller.progress()).toBe(0);
  });

  it('avanca o progresso conforme o relogio', () => {
    const { controller, clock } = setup();
    controller.start();
    clock.advance(500);
    expect(controller.progress()).toBeCloseTo(0.5, 2);
  });

  it('aponta o rumo na direcao da viagem', () => {
    const { controller, jumpTo } = setup();
    controller.start();
    expect(jumpTo.mock.calls[0][0].bearing).toBeCloseTo(90, 0);
  });

  it('termina no fim da rota, para sozinho e avisa uma unica vez', () => {
    const onFinish = vi.fn();
    const { controller, clock, jumpTo } = setup({ onFinish });
    controller.start();
    clock.advance(1200);
    const ultimo = jumpTo.mock.calls[jumpTo.mock.calls.length - 1][0];
    expect(ultimo.center[0]).toBeCloseTo(LESTE[0], 6);
    expect(controller.isRunning()).toBe(false);
    expect(controller.progress()).toBe(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    clock.advance(1000);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('para de mexer na camera depois de stop', () => {
    const { controller, clock, jumpTo } = setup();
    controller.start();
    clock.advance(200);
    const chamadas = jumpTo.mock.calls.length;
    controller.stop();
    clock.advance(500);
    expect(jumpTo.mock.calls.length).toBe(chamadas);
    expect(controller.isRunning()).toBe(false);
  });

  it('ignora start duplicado', () => {
    const { controller, jumpTo } = setup();
    controller.start();
    controller.start();
    expect(jumpTo).toHaveBeenCalledTimes(1);
  });

  it('nao inicia com polilinha curta demais para ter direcao', () => {
    const { controller } = setup({ coordinates: [NATAL] });
    controller.start();
    expect(controller.isRunning()).toBe(false);
  });
});
