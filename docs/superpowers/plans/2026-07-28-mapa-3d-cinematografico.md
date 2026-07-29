# Mapa 3D Cinematográfico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o mapa 2D da home do POTI numa cena 3D cinematográfica (relevo + satélite + céu + globo, com câmera orbitando lentamente), preservando o mapa atual como fallback.

**Architecture:** Três unidades. `mapMode.ts` decide o modo de renderização a partir de chave/env/preferência do usuário. `scene3d.ts` monta a cena 3D num objeto `Map` do MapLibre. `cinematic.ts` controla a órbita da câmera com `requestAnimationFrame` injetável. `HomeRouteMap.tsx` apenas orquestra os três — sua API pública não muda, então `TouristHomePage.tsx` não é tocado.

**Tech Stack:** Next.js 16, React 19, TypeScript, MapLibre GL JS 5.24.0, MapTiler (satélite + terrain-RGB), Vitest.

**Spec:** [`docs/superpowers/specs/2026-07-28-mapa-3d-cinematografico-design.md`](../specs/2026-07-28-mapa-3d-cinematografico-design.md)

## Global Constraints

- MapLibre GL JS **5.24.0**, já instalado. Não adicionar Mapbox, Cesium, deck.gl ou three.js.
- Chave do MapTiler **sempre** via `process.env.NEXT_PUBLIC_MAPTILER_KEY`. Nunca hardcoded no source, nunca commitada.
- `pitch` **máximo 60°**. O `maxPitch` padrão do MapLibre é 60 e a documentação classifica valores acima como experimentais ("may result in rendering issues"). Não alterar `maxPitch`.
- Testes rodam em **Vitest com ambiente node, sem jsdom** (não existe `vitest.config`). Portanto: **nenhum teste renderiza componente React**. Toda lógica testável mora nos módulos `src/lib/map/*` e é exercitada com objetos falsos.
- Testes ficam **colocados** ao lado do source como `*.test.ts`, seguindo `src/lib/utils.test.ts` e `src/data/mockData.test.ts`.
- A API pública de `HomeRouteMap` (`destinations`, `activeDay`, `isInteractive`) **não muda**.
- Fallback obrigatório: sem chave válida, a home renderiza o mapa 2D Carto atual sem erro de console.
- No modo 3D o estilo é satélite (hybrid), portanto **não** alterna claro/escuro. A alternância de tema segue existindo apenas no fallback 2D.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/map/mapMode.ts` | Decide `'flat' \| 'static3d' \| 'cinematic'`. Função pura. |
| `src/lib/map/mapMode.test.ts` | Testes de `resolveMapMode`. |
| `src/lib/map/scene3d.ts` | URLs do MapTiler, source de terreno, céu, e `apply3DScene`. Não conhece React. |
| `src/lib/map/scene3d.test.ts` | Testes com um `Map` falso que registra chamadas. |
| `src/lib/map/cinematic.ts` | Controlador de órbita com `requestAnimationFrame` injetável. Não conhece React. |
| `src/lib/map/cinematic.test.ts` | Testes com relógio e RAF falsos. |
| `src/components/tourist/HomeRouteMap.tsx` | Orquestra os três módulos. |
| `package.json` | Remoção de `canvas-confetti` e `@types/canvas-confetti`. |

---

### Task 1: Modo de renderização + remoção do canvas-confetti

**Files:**
- Create: `src/lib/map/mapMode.ts`
- Test: `src/lib/map/mapMode.test.ts`
- Modify: `package.json:14` (remover `@types/canvas-confetti`), `package.json:17` (remover `canvas-confetti`)

**Interfaces:**
- Consumes: nada.
- Produces: `type MapMode = 'flat' | 'static3d' | 'cinematic'`; `resolveMapMode(input: MapModeInput): MapMode` onde `MapModeInput = { maptilerKey?: string; force2d?: boolean; prefersReducedMotion?: boolean }`. Consumido pela Task 4.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/map/mapMode.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveMapMode } from './mapMode';

describe('resolveMapMode', () => {
  it('cai para 2D quando nao ha chave do MapTiler', () => {
    expect(resolveMapMode({})).toBe('flat');
    expect(resolveMapMode({ maptilerKey: undefined })).toBe('flat');
    expect(resolveMapMode({ maptilerKey: '' })).toBe('flat');
    expect(resolveMapMode({ maptilerKey: '   ' })).toBe('flat');
  });

  it('cai para 2D quando force2d esta ligado, mesmo com chave valida', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123', force2d: true })).toBe('flat');
    expect(
      resolveMapMode({ maptilerKey: 'abc123', force2d: true, prefersReducedMotion: true })
    ).toBe('flat');
  });

  it('usa cena 3D estatica quando o usuario pede menos movimento', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123', prefersReducedMotion: true })).toBe('static3d');
  });

  it('usa cena 3D cinematografica no caminho feliz', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123' })).toBe('cinematic');
    expect(
      resolveMapMode({ maptilerKey: 'abc123', force2d: false, prefersReducedMotion: false })
    ).toBe('cinematic');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx vitest run src/lib/map/mapMode.test.ts
```

Esperado: FAIL — `Failed to resolve import "./mapMode"`.

- [ ] **Step 3: Implementar**

Criar `src/lib/map/mapMode.ts`:

```ts
/**
 * Modo de renderizacao do mapa da home.
 * - flat:      mapa vetorial 2D (Carto), o que ja esta em producao hoje
 * - static3d:  cena 3D sem movimento de camera (prefers-reduced-motion)
 * - cinematic: cena 3D com mergulho e orbita lenta
 */
export type MapMode = 'flat' | 'static3d' | 'cinematic';

export interface MapModeInput {
  maptilerKey?: string;
  force2d?: boolean;
  prefersReducedMotion?: boolean;
}

export function resolveMapMode({
  maptilerKey,
  force2d = false,
  prefersReducedMotion = false,
}: MapModeInput): MapMode {
  if (force2d) return 'flat';
  if (!maptilerKey || maptilerKey.trim() === '') return 'flat';
  return prefersReducedMotion ? 'static3d' : 'cinematic';
}

export function is3D(mode: MapMode): boolean {
  return mode !== 'flat';
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx vitest run src/lib/map/mapMode.test.ts
```

Esperado: PASS, 4 testes.

- [ ] **Step 5: Remover a dependencia do canvas-confetti**

O confete ja foi removido do source no commit `b0337f4`. Agora tirar as duas dependencias do `package.json` — a linha `"@types/canvas-confetti": "^1.9.0",` e a linha `"canvas-confetti": "^1.9.4",`. Depois:

```bash
npm install
```

- [ ] **Step 6: Confirmar que nada mais referencia canvas-confetti**

```bash
grep -rn "canvas-confetti\|confetti" src/ package.json
```

Esperado: nenhuma saida.

- [ ] **Step 7: Commit**

```bash
git add src/lib/map/mapMode.ts src/lib/map/mapMode.test.ts package.json package-lock.json
git commit -m "feat(map): resolve modo de renderizacao e remove canvas-confetti"
```

---

### Task 2: Cena 3D (terreno, satélite, céu, globo)

**Files:**
- Create: `src/lib/map/scene3d.ts`
- Test: `src/lib/map/scene3d.test.ts`

**Interfaces:**
- Consumes: nada da Task 1.
- Produces: `buildStyleUrl(key)`, `buildTerrainSource(key)`, `buildSky()`, `apply3DScene(map, key)`, e as constantes `TERRAIN_SOURCE_ID`, `TERRAIN_EXAGGERATION`, `CINEMATIC_PITCH`. Consumido pela Task 4.

Contexto de API, já verificado nos types instalados da 5.24.0: `map.setTerrain({ source, exaggeration })`, `map.setSky(SkySpecification)` e `map.setProjection({ type: 'globe' })` existem. Os quatro endpoints do MapTiler usados aqui responderam HTTP 200 com a chave do projeto.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/map/scene3d.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import {
  buildStyleUrl,
  buildTerrainSource,
  buildSky,
  apply3DScene,
  TERRAIN_SOURCE_ID,
  TERRAIN_EXAGGERATION,
  CINEMATIC_PITCH,
} from './scene3d';

function fakeMap({ hasSource = false } = {}) {
  return {
    getSource: vi.fn(() => (hasSource ? {} : undefined)),
    addSource: vi.fn(),
    setTerrain: vi.fn(),
    setSky: vi.fn(),
    setProjection: vi.fn(),
  };
}

describe('buildStyleUrl', () => {
  it('aponta para o estilo hybrid do MapTiler com a chave', () => {
    expect(buildStyleUrl('abc123')).toBe(
      'https://api.maptiler.com/maps/hybrid/style.json?key=abc123'
    );
  });

  it('escapa chaves com caracteres especiais', () => {
    expect(buildStyleUrl('a b&c')).toContain('key=a%20b%26c');
  });
});

describe('buildTerrainSource', () => {
  it('produz um source raster-dem do MapTiler', () => {
    const source = buildTerrainSource('abc123');
    expect(source.type).toBe('raster-dem');
    expect(source.encoding).toBe('mapbox');
    expect(source.url).toBe(
      'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=abc123'
    );
  });
});

describe('buildSky', () => {
  it('define ceu, horizonte e atmosfera', () => {
    const sky = buildSky();
    expect(sky['sky-color']).toBeTypeOf('string');
    expect(sky['horizon-color']).toBeTypeOf('string');
    expect(sky['atmosphere-blend']).toBeTypeOf('number');
  });
});

describe('apply3DScene', () => {
  it('adiciona o terreno, o ceu e a projecao globo', () => {
    const map = fakeMap();
    apply3DScene(map, 'abc123');

    expect(map.addSource).toHaveBeenCalledWith(TERRAIN_SOURCE_ID, buildTerrainSource('abc123'));
    expect(map.setTerrain).toHaveBeenCalledWith({
      source: TERRAIN_SOURCE_ID,
      exaggeration: TERRAIN_EXAGGERATION,
    });
    expect(map.setSky).toHaveBeenCalledOnce();
    expect(map.setProjection).toHaveBeenCalledWith({ type: 'globe' });
  });

  it('nao duplica o source de terreno quando ele ja existe', () => {
    const map = fakeMap({ hasSource: true });
    apply3DScene(map, 'abc123');

    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.setTerrain).toHaveBeenCalledOnce();
  });
});

describe('constantes', () => {
  it('usa exagero alto porque o relevo do RN e baixo', () => {
    expect(TERRAIN_EXAGGERATION).toBeGreaterThan(1);
  });

  it('respeita o maxPitch padrao do MapLibre', () => {
    expect(CINEMATIC_PITCH).toBeLessThanOrEqual(60);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx vitest run src/lib/map/scene3d.test.ts
```

Esperado: FAIL — `Failed to resolve import "./scene3d"`.

- [ ] **Step 3: Implementar**

Criar `src/lib/map/scene3d.ts`:

```ts
import type { RasterDEMSourceSpecification, SkySpecification } from 'maplibre-gl';

export const TERRAIN_SOURCE_ID = 'maptiler-terrain';

/**
 * O relevo do RN e baixo (dunas ~30-50m, falesias ~50m). Sem exagero,
 * a cena 3D fica visualmente identica a um mapa plano.
 */
export const TERRAIN_EXAGGERATION = 2.5;

/**
 * 60 e o maxPitch padrao do MapLibre. A documentacao classifica valores
 * acima disso como experimentais, entao nao subimos.
 */
export const CINEMATIC_PITCH = 60;

export function buildStyleUrl(key: string): string {
  return `https://api.maptiler.com/maps/hybrid/style.json?key=${encodeURIComponent(key)}`;
}

export function buildTerrainSource(key: string): RasterDEMSourceSpecification {
  return {
    type: 'raster-dem',
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${encodeURIComponent(key)}`,
    encoding: 'mapbox',
  };
}

export function buildSky(): SkySpecification {
  return {
    'sky-color': '#0EA5E9',
    'horizon-color': '#FDE68A',
    'fog-color': '#F8FAFC',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.2,
    'atmosphere-blend': 0.8,
  };
}

/** Subconjunto do Map do MapLibre que a cena 3D precisa. Facilita o teste. */
export interface Scene3DTarget {
  getSource(id: string): unknown;
  addSource(id: string, source: RasterDEMSourceSpecification): unknown;
  setTerrain(options: { source: string; exaggeration?: number } | null): unknown;
  setSky(sky: SkySpecification): unknown;
  setProjection(projection: { type: 'globe' | 'mercator' }): unknown;
}

export function apply3DScene(map: Scene3DTarget, key: string): void {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, buildTerrainSource(key));
  }
  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
  map.setSky(buildSky());
  map.setProjection({ type: 'globe' });
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx vitest run src/lib/map/scene3d.test.ts
```

Esperado: PASS, 7 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/map/scene3d.ts src/lib/map/scene3d.test.ts
git commit -m "feat(map): monta cena 3D com terreno, satelite, ceu e globo"
```

---

### Task 3: Controlador de câmera cinematográfica

**Files:**
- Create: `src/lib/map/cinematic.ts`
- Test: `src/lib/map/cinematic.test.ts`

**Interfaces:**
- Consumes: nada das Tasks 1 e 2.
- Produces: `orbitBearingAt(elapsedMs, periodMs, startBearing)`, `createOrbitController(map, deps, periodMs?)` retornando `OrbitController` com `start()`, `stop()`, `destroy()`, `isRunning()`; constante `ORBIT_PERIOD_MS`. Consumido pela Task 4.

`requestAnimationFrame` e o relógio entram por injeção (`OrbitDeps`) porque os testes rodam em ambiente node, sem browser.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/map/cinematic.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx vitest run src/lib/map/cinematic.test.ts
```

Esperado: FAIL — `Failed to resolve import "./cinematic"`.

- [ ] **Step 3: Implementar**

Criar `src/lib/map/cinematic.ts`:

```ts
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx vitest run src/lib/map/cinematic.test.ts
```

Esperado: PASS, 11 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/map/cinematic.ts src/lib/map/cinematic.test.ts
git commit -m "feat(map): controlador de camera com orbita lenta"
```

---

### Task 4: Integrar no HomeRouteMap

**Files:**
- Modify: `src/components/tourist/HomeRouteMap.tsx`

**Interfaces:**
- Consumes: `resolveMapMode`, `is3D`, `MapMode` (Task 1); `buildStyleUrl`, `apply3DScene`, `CINEMATIC_PITCH` (Task 2); `createOrbitController`, `browserOrbitDeps`, `OrbitController` (Task 3).
- Produces: nada. A API do componente não muda.

Esta task não tem teste automatizado: renderizar o componente exigiria jsdom, que o projeto não configura (ver Global Constraints). A verificação é `build` + `lint` + checagem manual no navegador, listada nos passos.

- [ ] **Step 1: Adicionar os imports e a deteccao de modo**

Em `src/components/tourist/HomeRouteMap.tsx`, logo após o import de `mockData` (linha 6), acrescentar:

```ts
import { resolveMapMode, is3D, type MapMode } from '@/lib/map/mapMode';
import { buildStyleUrl, apply3DScene, CINEMATIC_PITCH } from '@/lib/map/scene3d';
import {
  createOrbitController,
  browserOrbitDeps,
  type OrbitController,
} from '@/lib/map/cinematic';
```

Dentro do componente, junto aos outros refs (após `const [mounted, setMounted] = useState(false);`), acrescentar:

```ts
  const orbitRef = useRef<OrbitController | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('flat');
```

- [ ] **Step 2: Resolver o modo apos o mount**

Substituir o `useEffect` de mount (linhas 24-33) por:

```ts
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);

    setMapMode(
      resolveMapMode({
        maptilerKey: process.env.NEXT_PUBLIC_MAPTILER_KEY,
        force2d: process.env.NEXT_PUBLIC_MAP_2D === '1',
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      })
    );

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      orbitRef.current?.destroy();
    };
  }, []);
```

`window` é seguro aqui: o componente é `'use client'` e é carregado com `dynamic(..., { ssr: false })` em `TouristHomePage.tsx:24-27`.

- [ ] **Step 3: Escolher o estilo conforme o modo**

Substituir o bloco `const styleUrl = ...` (linhas 43-45) por:

```ts
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // No modo 3D o estilo e satelite, entao nao ha variante clara/escura.
    // A alternancia de tema segue valendo apenas no fallback 2D.
    const styleUrl = is3D(mapMode) && maptilerKey
      ? buildStyleUrl(maptilerKey)
      : resolvedTheme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
```

- [ ] **Step 4: Montar a cena 3D no load**

No handler `map.on('load', ...)` (linha 58), inserir como **primeira** instrução do callback, antes do `map.addSource('route', ...)`:

```ts
      if (is3D(mapMode) && maptilerKey) {
        try {
          apply3DScene(map, maptilerKey);
        } catch (e) {
          // Tiles ou terreno indisponiveis: seguimos com o mapa plano em vez de quebrar a home.
          console.warn('Cena 3D indisponivel, mantendo mapa plano:', e);
        }
      }
```

- [ ] **Step 5: Incluir mapMode nas dependencias do efeito de inicializacao**

O array de dependências do `useEffect` de inicialização (linha 107) passa a incluir `mapMode`:

```ts
  }, [mounted, isInteractive, destinations.length, firstLatitude, firstLongitude, resolvedTheme, mapMode]);
```

- [ ] **Step 6: Mergulho cinematografico no fitBounds**

Substituir a chamada `map.fitBounds(...)` (linhas 165-169) por:

```ts
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 13,
      duration: mapMode === 'cinematic' ? 3000 : 1500,
      pitch: is3D(mapMode) ? CINEMATIC_PITCH : 0
    });
```

E incluir `mapMode` nas dependências desse efeito (linha 170):

```ts
  }, [destinations, activeDay, mapInstance, mapMode]);
```

- [ ] **Step 7: Iniciar a orbita e pausar quando a aba perde foco**

Adicionar um `useEffect` novo, logo após o efeito de marcadores (ou seja, depois da linha 170) e antes do efeito da rota OSRM:

```ts
  // Orbita lenta: so no modo cinematografico, e so com a aba visivel.
  useEffect(() => {
    const map = mapInstance;
    if (!map || mapMode !== 'cinematic') return;

    const orbit = createOrbitController(map, browserOrbitDeps());
    orbitRef.current = orbit;

    const syncWithVisibility = () => {
      if (document.hidden) {
        orbit.stop();
      } else {
        orbit.start();
      }
    };

    syncWithVisibility();
    document.addEventListener('visibilitychange', syncWithVisibility);

    return () => {
      document.removeEventListener('visibilitychange', syncWithVisibility);
      orbit.destroy();
      orbitRef.current = null;
    };
  }, [mapInstance, mapMode]);
```

- [ ] **Step 8: Rodar a suite inteira**

```bash
npm run test
```

Esperado: PASS. Os testes de `mapMode`, `scene3d` e `cinematic` das Tasks 1-3, mais `utils` e `mockData`, que já existiam.

- [ ] **Step 9: Lint e build**

```bash
npm run lint && npm run build
```

Esperado: ambos passam, sem erro de tipo em `HomeRouteMap.tsx`.

- [ ] **Step 10: Verificacao manual no navegador**

```bash
npm run dev
```

Abrir `http://localhost:3000` e conferir, nesta ordem:

1. Com `NEXT_PUBLIC_MAPTILER_KEY` presente no `.env.local`: o mapa aparece em satélite, inclinado, com relevo e céu, girando lentamente. Nenhum confete em nenhum momento.
2. Gerar um roteiro e confirmar que a linha da rota anima e os marcadores aparecem, como antes.
3. Trocar para outra aba por ~10s e voltar: a órbita pausou e retomou, sem salto brusco de câmera.
4. Comentar a linha `NEXT_PUBLIC_MAPTILER_KEY` no `.env.local`, reiniciar o dev server: a home renderiza o mapa 2D Carto de sempre, **sem erro no console**.
5. Descomentar a chave, setar `NEXT_PUBLIC_MAP_2D=1`, reiniciar: mapa 2D de novo.
6. Remover `NEXT_PUBLIC_MAP_2D`, ativar "reduzir movimento" no SO, reiniciar: cena 3D aparece, mas **estática**.

- [ ] **Step 11: Commit**

```bash
git add src/components/tourist/HomeRouteMap.tsx
git commit -m "feat(map): integra cena 3D cinematografica na home"
```

---

---

## Ações do PO (fora do alcance do agente)

Estas duas dependem de acesso a painéis de conta e **precisam ser feitas por Leonardo**. A primeira é bloqueante para o deploy; a segunda é bloqueante para a segurança da chave.

- [ ] **Cadastrar `NEXT_PUBLIC_MAPTILER_KEY` na Vercel em Production E Preview.** As envs da integração Supabase hoje estão só em Production; repetir isso deixaria todo preview deploy sem mapa 3D — inclusive o preview usado para conferir o resultado antes do dia 30.
- [ ] **Restringir a chave por domínio no painel do MapTiler** (`dunastech.com.br` e `*.vercel.app`). Por ser `NEXT_PUBLIC_`, a chave vai no bundle do cliente e é legível por qualquer visitante; a restrição de domínio é a única proteção real da cota. A chave também foi colada em conversa de chat, o que reforça a urgência disso.

## Verificação final

- [ ] `npm run test` passa
- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] `grep -rn "confetti" src/ package.json` não retorna nada
- [ ] `git status` limpo, e `.env.local` **não** aparece como arquivo rastreado

## Critérios de aceite (da spec)

| # | Critério | Onde é coberto |
|---|---|---|
| 1 | Nenhum confete em nenhum estado da home | Task 1 steps 5-6; verificação final |
| 2 | Mapa 3D com relevo, satélite, céu e órbita | Tasks 2 e 3; Task 4 step 10.1 |
| 3 | Sem chave → mapa 2D sem erro de console | Task 1 step 3; Task 4 step 10.4 |
| 4 | `prefers-reduced-motion` → cena 3D estática | Task 1 step 3; Task 4 step 10.6 |
| 5 | `NEXT_PUBLIC_MAP_2D=1` → mapa 2D | Task 1 step 3; Task 4 step 10.5 |
| 6 | Rota e marcadores seguem funcionando | Task 4 step 10.2 |
| 7 | build, lint e test passam | Task 4 steps 8-9 |

## Fora de escopo

- `DestinationMap.tsx` continua 2D
- Google Photorealistic 3D como fase 2 pós-pitch
- Remoção de `leaflet` / `react-leaflet`, ainda no `package.json`
