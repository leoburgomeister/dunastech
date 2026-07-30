import { describe, it, expect } from 'vitest';
import { destinosInfo } from '../data/mockData';
import { planRoute, optimizeOrder, haversineKm, routeLengthKm, MAX_ROUTE_DAYS } from './route-planner';
import type { PlanRouteOptions } from './route-planner';
import { destinosDoRoteiro } from './routePresets';

const base = {
  catalogue: destinosInfo,
  style: 'adventure',
  transport: 'shuttle',
} satisfies Omit<PlanRouteOptions, 'days'>;

describe('planRoute — duração', () => {
  it('entrega exatamente a quantidade de dias pedida', () => {
    for (let dias = 1; dias <= MAX_ROUTE_DAYS; dias++) {
      expect(planRoute({ ...base, days: dias }).days).toHaveLength(dias);
    }
  });

  it('regressão: 6 dias pedidos não podem virar 3 dias exibidos', () => {
    const plano = planRoute({ ...base, days: 6 });
    expect(plano.days).toHaveLength(6);
    expect(plano.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('nunca devolve um dia sem destino', () => {
    for (let dias = 1; dias <= MAX_ROUTE_DAYS; dias++) {
      for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
        for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
          const plano = planRoute({ catalogue: destinosInfo, style: estilo, transport: transporte, days: dias });
          expect(plano.days).toHaveLength(dias);
          for (const dia of plano.days) {
            expect(dia.destinations.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('numera os dias em sequência, sem buracos', () => {
    const plano = planRoute({ ...base, days: 9 });
    expect(plano.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('limita durações inválidas ou maiores que o catálogo', () => {
    expect(planRoute({ ...base, days: 0 }).days).toHaveLength(1);
    expect(planRoute({ ...base, days: -4 }).days).toHaveLength(1);
    expect(planRoute({ ...base, days: 1.6 }).days).toHaveLength(2);
    expect(planRoute({ ...base, days: 999 }).days).toHaveLength(
      Math.min(MAX_ROUTE_DAYS, destinosInfo.length)
    );
  });

  it('devolve um plano vazio quando não há catálogo', () => {
    const plano = planRoute({ ...base, catalogue: [], days: 5 });
    expect(plano.days).toHaveLength(0);
    expect(plano.destinations).toHaveLength(0);
  });
});

describe('planRoute — seleção de destinos', () => {
  it('mantém os destinos-assinatura prometidos pelo título traduzido', () => {
    const plano = planRoute({ ...base, days: 6 });
    const nomes = plano.destinations.map((d) => d.nome);
    expect(nomes).toContain('Ponta Negra e Morro do Careca');
    expect(nomes).toContain('Dunas de Genipabu');
    expect(nomes).toContain('Praia da Pipa');
  });

  it('nunca repete o mesmo destino no roteiro', () => {
    const plano = planRoute({ ...base, days: 12 });
    const nomes = plano.destinations.map((d) => d.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('não acrescenta destino que o título não prometeu quando a assinatura já cobre os dias', () => {
    // O título e a descrição de cada combinação nomeiam exatamente os destinos-assinatura.
    // Enquanto a duração couber neles, o roteiro não pode inventar parada: "Roteiro Buggy
    // Litoral NORTE" chegou a abrir com Praia da Pipa, 100 km ao SUL, porque o preenchimento
    // por afinidade rodava mesmo sem precisar.
    for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
      for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
        const assinatura = destinosDoRoteiro(estilo, transporte);
        for (let dias = 1; dias <= assinatura.length; dias++) {
          const nomes = planRoute({
            catalogue: destinosInfo,
            style: estilo,
            transport: transporte,
            days: dias,
          }).destinations.map((d) => d.nome);

          expect([...nomes].sort()).toEqual([...assinatura].sort());
        }
      }
    }
  });

  it('cresce o número de destinos junto com a duração', () => {
    const curto = planRoute({ ...base, days: 2 });
    const longo = planRoute({ ...base, days: 8 });
    expect(longo.destinations.length).toBeGreaterThan(curto.destinations.length);
    expect(longo.destinations.length).toBeGreaterThanOrEqual(8);
  });

  it('distribui todos os destinos escolhidos entre os dias', () => {
    const plano = planRoute({ ...base, days: 5 });
    const naAgenda = plano.days.flatMap((d) => d.destinations.map((x) => x.nome));
    expect(naAgenda.sort()).toEqual(plano.destinations.map((d) => d.nome).sort());
  });
});

describe('planRoute — otimização geográfica', () => {
  it('desfaz o zigue-zague do roteiro-assinatura de aventura', () => {
    // Ordem atual do produto: Natal -> litoral norte -> litoral sul, voltando 60 km sobre o
    // próprio caminho. Reordenar o mesmo trio tem que encurtar o trajeto.
    const ingenuo = ['Ponta Negra e Morro do Careca', 'Dunas de Genipabu', 'Praia da Pipa']
      .map((nome) => destinosInfo.find((d) => d.nome === nome)!);

    expect(routeLengthKm(optimizeOrder(ingenuo))).toBeLessThan(routeLengthKm(ingenuo));
  });

  it('não deixa uma ordem pior que a ordem bruta de seleção', () => {
    const plano = planRoute({ ...base, days: 3 });
    const mesmoConjunto = [...plano.destinations].sort((a, b) => a.nome.localeCompare(b.nome));

    expect(routeLengthKm(plano.destinations)).toBeLessThanOrEqual(routeLengthKm(mesmoConjunto));
  });

  it('começa pelo ponto de partida buscado pelo usuário', () => {
    const plano = planRoute({ ...base, days: 4, anchorName: 'Praia da Pipa' });
    expect(plano.destinations[0]?.nome).toBe('Praia da Pipa');
    expect(plano.days[0].destinations[0]?.nome).toBe('Praia da Pipa');
  });

  it('ignora um ponto de partida inexistente sem quebrar o plano', () => {
    const plano = planRoute({ ...base, days: 4, anchorName: 'Marte' });
    expect(plano.days).toHaveLength(4);
  });

  it('contabiliza a quilometragem total do trajeto', () => {
    const plano = planRoute({ ...base, days: 4 });
    expect(plano.totalKm).toBeGreaterThan(0);
    expect(plano.totalKm).toBeCloseTo(routeLengthKm(plano.destinations), 1);
  });
});

describe('planRoute — coerência com o transporte', () => {
  it('mantém as pernas curtas quando o passeio é a pé', () => {
    const aPe = planRoute({ ...base, transport: 'hike', days: 4 });
    const deVan = planRoute({ ...base, transport: 'shuttle', days: 4 });
    expect(routeLengthKm(aPe.destinations)).toBeLessThan(routeLengthKm(deVan.destinations));
  });

  it('não empilha destinos no mesmo dia quando o passeio é a pé', () => {
    const aPe = planRoute({ ...base, transport: 'hike', days: 5 });
    for (const dia of aPe.days) {
      expect(dia.destinations).toHaveLength(1);
    }
  });

  it('aproveita a van para visitar mais de um destino por dia', () => {
    const deVan = planRoute({ ...base, transport: 'shuttle', days: 5 });
    expect(deVan.destinations.length).toBeGreaterThan(deVan.days.length);
    expect(deVan.days.some((d) => d.destinations.length > 1)).toBe(true);
  });
});

describe('haversineKm', () => {
  it('mede zero entre um ponto e ele mesmo', () => {
    expect(haversineKm(-5.8811, -35.1711, -5.8811, -35.1711)).toBe(0);
  });

  it('mede a distância conhecida entre Ponta Negra e Pipa', () => {
    // ~41 km em linha reta entre Natal e Tibau do Sul (por estrada dá bem mais)
    const dist = haversineKm(-5.8811, -35.1711, -6.2275, -35.0475);
    expect(dist).toBeGreaterThan(38);
    expect(dist).toBeLessThan(44);
  });
});
