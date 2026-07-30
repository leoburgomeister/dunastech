import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  routeKey,
  lookupRoute,
  loadRouteCache,
  resetRouteCache,
  osrmUrl,
  straightLine,
  type Coord,
} from './routeCache';
import { todasAsCombinacoes, destinosDoRoteiro } from '@/lib/routePresets';
import { trechosNecessarios } from './routeCoverage';
import { destinosInfo } from '@/data/mockData';

const A: Coord = [-35.1967, -5.7089];
const B: Coord = [-35.2297, -5.6466];

describe('routeKey', () => {
  it('e estavel para as mesmas paradas', () => {
    expect(routeKey([A, B])).toBe(routeKey([A, B]));
  });

  it('depende da ordem — rota invertida e outra rota', () => {
    expect(routeKey([A, B])).not.toBe(routeKey([B, A]));
  });

  it('ignora ruido de ponto flutuante alem de 4 casas', () => {
    expect(routeKey([[-35.19670001, -5.70890002]])).toBe(routeKey([[-35.1967, -5.7089]]));
  });
});

describe('lookupRoute', () => {
  const cache = { [routeKey([A, B])]: [A, [-35.21, -5.68], B] as Coord[] };

  it('acha a rota gravada', () => {
    expect(lookupRoute(cache, [A, B])).toHaveLength(3);
  });

  it('devolve null para rota ausente', () => {
    expect(lookupRoute(cache, [B, A])).toBeNull();
  });

  it('descarta geometria degenerada', () => {
    expect(lookupRoute({ [routeKey([A])]: [A] }, [A])).toBeNull();
  });
});

describe('loadRouteCache', () => {
  beforeEach(() => resetRouteCache());

  it('baixa uma vez so e memoriza', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ x: [[0, 0], [1, 1]] }) });
    await loadRouteCache(f as unknown as typeof fetch);
    await loadRouteCache(f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('falha de rede vira cache vazio, nunca excecao', async () => {
    const f = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(loadRouteCache(f as unknown as typeof fetch)).resolves.toEqual({});
  });

  it('resposta nao-ok vira cache vazio', async () => {
    const f = vi.fn().mockResolvedValue({ ok: false });
    await expect(loadRouteCache(f as unknown as typeof fetch)).resolves.toEqual({});
  });
});

describe('osrmUrl e straightLine', () => {
  it('monta a URL no formato do OSRM', () => {
    expect(osrmUrl([A, B])).toContain('/driving/-35.1967,-5.7089;-35.2297,-5.6466');
    expect(osrmUrl([A, B])).toContain('geometries=geojson');
  });

  it('linha reta e o proprio conjunto de paradas', () => {
    expect(straightLine([A, B])).toEqual([A, B]);
  });
});

describe('cobertura do cache gravado', () => {
  const cache = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/routes/osrm-cache.json'), 'utf8')
  );

  it('TODA geometria que a home pode gerar tem rota gravada', () => {
    // Este e o teste que importa: se alguem mexer na tabela de roteiros, no
    // planejador ou nos dados dos destinos e nao rodar o gerador de novo, a
    // apresentacao volta a depender do OSRM ao vivo — e isso so apareceria no
    // palco. Mede a saida do PLANEJADOR, nao a tabela de presets: a tabela
    // sozinha nao ve as variacoes por duracao nem os trechos de cada dia.
    const faltando: string[] = [];

    for (const { coords, rotulo } of trechosNecessarios().values()) {
      if (lookupRoute(cache, coords) === null) faltando.push(rotulo);
    }

    expect(
      faltando,
      `${faltando.length} geometria(s) sem cache. Rode: npx tsx scripts/gerar-cache-osrm.mts\n` +
        faltando.slice(0, 10).join('\n')
    ).toEqual([]);
  });

  it('a tabela e a home concordam sobre os destinos', () => {
    for (const { style, transport, destinos } of todasAsCombinacoes()) {
      expect(destinosDoRoteiro(style, transport)).toEqual(destinos);
    }
  });

  it('destinosDoRoteiro devolve copia — mutar nao contamina a tabela', () => {
    const primeira = destinosDoRoteiro('adventure', 'buggy');
    primeira.push('CONTAMINADO');
    expect(destinosDoRoteiro('adventure', 'buggy')).not.toContain('CONTAMINADO');
  });

  it('todo destino da tabela existe em mockData', () => {
    for (const { destinos } of todasAsCombinacoes()) {
      for (const nome of destinos) {
        expect(destinosInfo.some((d) => d.nome === nome), `destino "${nome}" nao existe`).toBe(true);
      }
    }
  });
});
