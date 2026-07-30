import { describe, it, expect } from 'vitest';
import {
  limitesDeDuracao,
  MAX_DIAS_POR_TRANSPORTE,
  todasAsCombinacoes,
} from './routePresets';

describe('limitesDeDuracao', () => {
  it('teto de caminhada e 3 dias', () => {
    // A partir do 4o dia o roteiro a pe ja pedia 26,6 km entre paradas: o catalogo
    // tem 20 destinos e so 5 pares dentro dos 8 km que o planejador considera
    // caminhavel. Oferecer 15 dias de caminhada e o que produzia dia de 70 km.
    expect(limitesDeDuracao('adventure', 'hike').max).toBe(3);
  });

  it('teto de buggy e 12 dias e o de van e 15', () => {
    expect(limitesDeDuracao('adventure', 'buggy').max).toBe(12);
    expect(limitesDeDuracao('adventure', 'shuttle').max).toBe(15);
  });

  it('a Grande Rota Historica so existe a partir de 3 dias', () => {
    // cultura/van vai a Mossoro e ao Lajedo de proposito -- a copia os nomeia.
    // Em 1 dia isso vira 313 km; em 3, um destino por dia.
    expect(limitesDeDuracao('culture', 'shuttle').min).toBe(3);
  });

  it('as demais combinacoes comecam em 1 dia', () => {
    expect(limitesDeDuracao('culture', 'buggy').min).toBe(1);
    expect(limitesDeDuracao('family', 'hike').min).toBe(1);
  });

  it('normaliza estilo e transporte desconhecidos como o resto do modulo', () => {
    expect(limitesDeDuracao('estilo-que-nao-existe', 'trem')).toEqual(
      limitesDeDuracao('gastronomy', 'shuttle')
    );
  });

  it('todo minimo cabe no teto do proprio transporte', () => {
    for (const { style, transport } of todasAsCombinacoes()) {
      const { min, max } = limitesDeDuracao(style, transport);
      expect(min, `${style}/${transport}`).toBeLessThanOrEqual(max);
      expect(min).toBeGreaterThanOrEqual(1);
    }
  });

  it('todo transporte tem teto declarado', () => {
    expect(Object.keys(MAX_DIAS_POR_TRANSPORTE).sort()).toEqual(['buggy', 'hike', 'shuttle']);
  });
});
