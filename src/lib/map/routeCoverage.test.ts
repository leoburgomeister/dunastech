import { describe, it, expect } from 'vitest';
import { trechosNecessarios, MAX_CACHED_DAYS } from './routeCoverage';
import { routeKey } from './routeCache';
import { TRAVEL_STYLES, TRANSPORTS, limitesDeDuracao } from '@/lib/routePresets';
import { planRoute } from '@/lib/route-planner';
import { destinosInfo } from '@/data/mockData';

/**
 * routeCache.test.ts ja compara o cache gravado contra esta enumeracao, mas aquela
 * asserção ("nada faltando") passa de graca se a enumeracao vier vazia ou curta.
 * Os testes aqui prendem o tamanho e a forma do conjunto, para que o cache nao
 * possa encolher em silencio e levar o traco da rota de volta ao OSRM publico.
 */

const trechos = trechosNecessarios();

describe('trechosNecessarios', () => {
  it('enumera um conjunto nao vazio', () => {
    expect(trechos.size).toBeGreaterThan(0);
  });

  it('cobre toda combinacao alcancavel pela home', () => {
    // Uma combinacao pode nao aparecer como rotulo proprio quando sua geometria
    // coincide com a de outra ja registrada (o dedup por chave guarda o primeiro
    // rotulo). O que nao pode e a combinacao nao ter chave NENHUMA no conjunto:
    // isso significa rota que a home desenha e o cache nao cobre.
    const semCobertura: string[] = [];
    for (const style of TRAVEL_STYLES) {
      for (const transport of TRANSPORTS) {
        const { min, max } = limitesDeDuracao(style, transport);
        const teto = Math.min(max, MAX_CACHED_DAYS);
        for (let days = min; days <= teto; days++) {
          const plano = planRoute({ catalogue: destinosInfo, style, transport, days });
          const coords = plano.destinations.map(
            (d) => [d.longitude, d.latitude] as [number, number]
          );
          if (coords.length < 2) continue;
          if (!trechos.has(routeKey(coords))) semCobertura.push(`${style}/${transport}/${days}d`);
        }
      }
    }
    expect(semCobertura).toEqual([]);
  });

  it('nunca registra trecho que o mapa nao consegue desenhar', () => {
    // HomeRouteMap nao desenha linha com menos de duas paradas. Trecho de uma
    // coordenada so no cache e peso morto no asset.
    for (const [chave, trecho] of trechos) {
      expect(trecho.coords.length, `${chave} (${trecho.rotulo})`).toBeGreaterThanOrEqual(2);
    }
  });

  it('a chave de cada trecho e a chave das suas proprias coordenadas', () => {
    // O gerador do cache grava por esta chave e a home busca pela mesma funcao.
    // Se as duas divergirem, o cache erra 100% das buscas sem nenhum erro visivel.
    for (const [chave, trecho] of trechos) {
      expect(routeKey(trecho.coords), trecho.rotulo).toBe(chave);
    }
  });

  it('nao enumera duracao fora da faixa da combinacao', () => {
    // Duracao inalcancavel pela home viraria geometria orfa dentro do asset.
    for (const trecho of trechos.values()) {
      const [style, transport, duracao] = trecho.rotulo.split('/');
      const dias = Number.parseInt(duracao, 10);
      const { min, max } = limitesDeDuracao(style, transport);
      expect(dias, trecho.rotulo).toBeGreaterThanOrEqual(min);
      expect(dias, trecho.rotulo).toBeLessThanOrEqual(Math.min(max, MAX_CACHED_DAYS));
    }
  });

  it('respeita o teto de dias cacheados', () => {
    // MAX_CACHED_DAYS existe para segurar o asset perto de 1 MB. Subir esse numero
    // sem medir o arquivo devolve o problema que o cache veio resolver.
    expect(MAX_CACHED_DAYS).toBe(7);
  });
});
