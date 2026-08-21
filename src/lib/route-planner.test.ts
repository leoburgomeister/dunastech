import { describe, it, expect } from 'vitest';
import { destinosInfo } from '../data/mockData';
import { planRoute, optimizeOrder, haversineKm, routeLengthKm, MAX_ROUTE_DAYS } from './route-planner';
import type { PlanRouteOptions } from './route-planner';
import { destinosDoRoteiro, limitesDeDuracao } from './routePresets';
import { MAX_CACHED_DAYS } from './map/routeCoverage';

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
    for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
      for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
        const { min, max } = limitesDeDuracao(estilo, transporte);
        for (let dias = min; dias <= max; dias++) {
          const plano = planRoute({ catalogue: destinosInfo, style: estilo, transport: transporte, days: dias });
          expect(plano.days, `${estilo}/${transporte}/${dias}d`).toHaveLength(dias);
          for (const dia of plano.days) {
            expect(dia.destinations.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('nao passa do teto de duracao do transporte', () => {
    // Pedir 15 dias de caminhada devolvia 15 dias, com dia de 70 km a pe.
    expect(planRoute({ ...base, transport: 'hike', days: 15 }).days).toHaveLength(3);
    expect(planRoute({ ...base, transport: 'buggy', days: 15 }).days).toHaveLength(12);
    expect(planRoute({ ...base, transport: 'shuttle', days: 15 }).days).toHaveLength(15);
  });

  it('sobe a duracao ate o minimo da combinacao', () => {
    // cultura/van em 1 dia empilhava Forte + Mossoro + Lajedo: 313 km.
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 1,
    });
    expect(plano.days).toHaveLength(3);
    expect(plano.days.every((d) => d.destinations.length > 0)).toBe(true);
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
    const aPe = planRoute({ ...base, transport: 'hike', days: 3 });
    for (const dia of aPe.days) {
      expect(dia.destinations).toHaveLength(1);
    }
  });

  it('o preenchimento não arrasta o roteiro para fora do alcance do transporte', () => {
    // "Cultura + Buggy + 3 dias" punha Mossoro e Genipabu no MESMO dia -- 245 km de buggy.
    // A assinatura de cultura/buggy e Forte + Genipabu, os dois na Grande Natal; Mossoro
    // entrou pelo preenchimento porque a afinidade de estilo valia AFFINITY_STEP por
    // posicao na lista e superava com folga o custo da distancia. A barreira dura resolve:
    // afinidade agora decide apenas ENTRE os destinos que o transporte consegue rodar.
    const plano = planRoute({ catalogue: destinosInfo, style: 'culture', transport: 'buggy', days: 3 });
    const nomes = plano.destinations.map((d) => d.nome);

    expect(nomes).not.toContain('Cidade Histórica de Mossoró');
    expect(nomes).not.toContain('Lajedo de Soledade');
  });

  it('nenhum dia da faixa demonstrável piora o que a assinatura já pedia', () => {
    // Teto por transporte na faixa que o cache do OSRM cobre (MAX_CACHED_DAYS = 7), que e
    // a faixa que a apresentacao usa.
    //
    // Nao e teto de conforto, e trava de regressao. Os 246,2 km que sobram sao o trecho
    // Forte -> Mossoro da assinatura de cultura/van: um dia de transfer, prometido pela
    // propria copia da "Grande Rota Historica". Baixar mais que isso exige mexer na
    // tabela de presets (e regerar o cache do OSRM), nao no planejador.
    const teto: Record<'hike' | 'buggy' | 'shuttle', number> = {
      hike: 9.2,
      buggy: 54.6,
      shuttle: 246.2,
    };

    for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
      for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
        for (let dias = 1; dias <= MAX_CACHED_DAYS; dias++) {
          const plano = planRoute({
            catalogue: destinosInfo,
            style: estilo,
            transport: transporte,
            days: dias,
          });

          for (const dia of plano.days) {
            expect(
              dia.travelKm,
              `${estilo}/${transporte}/${dias}d dia ${dia.day}: ${dia.travelKm} km em ` +
                `${transporte} (${dia.destinations.map((d) => d.nome).join(' + ')})`
            ).toBeLessThanOrEqual(teto[transporte]);
          }
        }
      }
    }
  });

  it('entrega um destino por dia quando a duração alcança a assinatura', () => {
    // Um destino por dia em TODO transporte, decisao de produto. Van e buggy ja pediram 1,5
    // — dias mais cheios —, mas entao 5 dias rendiam 8 destinos e o painel deixava de
    // espelhar a duracao pedida.
    for (const estilo of ['adventure', 'relax', 'ecotourism', 'culture', 'gastronomy', 'family'] as const) {
      for (const transporte of ['buggy', 'shuttle', 'hike'] as const) {
        const assinatura = destinosDoRoteiro(estilo, transporte).length;

        for (let dias = assinatura; dias <= MAX_ROUTE_DAYS; dias++) {
          const plano = planRoute({
            catalogue: destinosInfo,
            style: estilo,
            transport: transporte,
            days: dias,
          });

          for (const dia of plano.days) {
            expect(
              dia.destinations,
              `${estilo}/${transporte}/${dias}d dia ${dia.day}: ` +
                dia.destinations.map((d) => d.nome).join(' + ')
            ).toHaveLength(1);
          }
        }
      }
    }
  });

  it('duração menor que a assinatura empilha em vez de quebrar a promessa do título', () => {
    // Aventura/buggy nomeia tres destinos na descricao. Pedindo 2 dias, um deles tem duas
    // paradas — cortar um destino para caber um por dia desmentiria a copia.
    const plano = planRoute({ catalogue: destinosInfo, style: 'adventure', transport: 'buggy', days: 2 });

    expect(plano.days).toHaveLength(2);
    expect(plano.destinations).toHaveLength(destinosDoRoteiro('adventure', 'buggy').length);
    expect(plano.days.some((d) => d.destinations.length > 1)).toBe(true);
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

describe('planRoute — duração degenerada', () => {
  it('duração não-finita cai no piso da combinação', () => {
    // O contador da home entrega `parseInt('')` = NaN sempre que o campo e limpo.
    // Sem a guarda, `splitIntoDays` roda `for (i = 0; i < NaN)` zero vezes e o painel
    // do roteiro volta vazio com a lista de destinos cheia.
    for (const [style, transport] of [
      ['adventure', 'shuttle'],
      ['culture', 'shuttle'],
      ['family', 'hike'],
    ] as const) {
      const piso = limitesDeDuracao(style, transport).min;
      expect(planRoute({ catalogue: destinosInfo, style, transport, days: NaN }).days).toHaveLength(
        piso
      );
      // Infinity tambem e nao-finito: cai no piso, nao no teto. Pedir "infinitos dias"
      // e entrada quebrada, e roteiro minimo e mais honesto que o maximo do transporte.
      expect(
        planRoute({ catalogue: destinosInfo, style, transport, days: Infinity }).days
      ).toHaveLength(piso);
      expect(
        planRoute({ catalogue: destinosInfo, style, transport, days: -Infinity }).days
      ).toHaveLength(piso);
    }
  });

  it('catálogo menor que a duração pedida encolhe os dias em vez de esvaziá-los', () => {
    const plano = planRoute({
      catalogue: destinosInfo.slice(0, 2),
      style: 'culture',
      transport: 'shuttle',
      days: 5,
    });
    expect(plano.days).toHaveLength(2);
    for (const dia of plano.days) expect(dia.destinations.length).toBeGreaterThan(0);
  });

  it('catálogo vazio devolve plano vazio sem quebrar', () => {
    const plano = planRoute({
      catalogue: [],
      style: 'adventure',
      transport: 'shuttle',
      days: 3,
    });
    expect(plano.days).toEqual([]);
    expect(plano.destinations).toEqual([]);
    expect(plano.totalKm).toBe(0);
  });
});

describe('planRoute — nenhum dia fica vazio', () => {
  it('vale para toda combinação em toda duração alcançável', () => {
    // O cabecalho do modulo promete que nenhum dia fica vazio, e TouristHomePage
    // confia nisso: `describeDay` faz `day.destinations[0].nome` sem guarda.
    const estilos = ['adventure', 'relax', 'culture', 'family', 'ecotourism', 'gastronomy'] as const;
    const transportes = ['hike', 'buggy', 'shuttle'] as const;
    for (const style of estilos) {
      for (const transport of transportes) {
        const { min, max } = limitesDeDuracao(style, transport);
        for (let dias = min; dias <= max; dias++) {
          const plano = planRoute({ catalogue: destinosInfo, style, transport, days: dias });
          for (const dia of plano.days) {
            expect(
              dia.destinations.length,
              `${style}/${transport}/${dias}d dia ${dia.day}`
            ).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it.fails('BUG: catálogo com nome repetido produz dia vazio', () => {
    // `clampDays` limita os dias por `catalogue.length`, mas `selectDestinations` deduplica
    // por `nome` — entao um catalogo com nomes repetidos rende menos destinos que dias, e
    // `splitIntoDays` emite blocos de tamanho zero. Nao e hipotetico: o schema do Supabase
    // nao tem unique em `destinos.nome`, e `supabase-data.ts` joga as linhas direto em
    // `destinosInfo`. O sintoma na home e um TypeError dentro do clique de gerar roteiro.
    //
    // `it.fails` = comportamento errado, capturado de proposito. Ao corrigir o planejador,
    // troque para `it` — o teste passa a valer como regressao.
    const catalogo = [...destinosInfo.slice(0, 5), { ...destinosInfo[0] }, { ...destinosInfo[1] }];
    const plano = planRoute({
      catalogue: catalogo,
      style: 'adventure',
      transport: 'shuttle',
      days: 7,
    });
    for (const dia of plano.days) {
      expect(dia.destinations.length, `dia ${dia.day}`).toBeGreaterThan(0);
    }
  });
});

describe('planRoute — destino vindo da busca', () => {
  it.fails('BUG: o destino buscado fura o alcance diário do transporte', () => {
    // A barreira DURA de `escolher(limiteKm)` vale so para o preenchimento. A assinatura e
    // isenta de proposito — a copia do preset promete Mossoro e o Lajedo. Mas o destino
    // vindo da busca entrou na mesma isencao sem ter a mesma justificativa: a home aceita
    // qualquer texto no campo e planta o resultado no roteiro.
    //
    // Medido no catalogo real: a pe, a pior perna sem busca e 9,2 km; com "Lajedo de
    // Soledade" na busca vira 284,5 km — um dia de caminhada de 284 km. De buggy, 48,5 km
    // viram 276,3 km. E exatamente o defeito que o commit dos presets tinha fechado.
    //
    // `it.fails` = comportamento errado, capturado de proposito. Ao corrigir, troque para `it`.
    const TETO_POR_TRANSPORTE = [
      ['hike', 24],
      ['buggy', 120],
    ] as const;
    for (const [transport, teto] of TETO_POR_TRANSPORTE) {
      for (const anchorName of destinosInfo.map((d) => d.nome)) {
        const plano = planRoute({
          catalogue: destinosInfo,
          style: 'adventure',
          transport,
          days: 3,
          anchorName,
        });
        for (const dia of plano.days) {
          expect(dia.travelKm, `${transport} com "${anchorName}" no dia ${dia.day}`).toBeLessThanOrEqual(teto);
        }
      }
    }
  });

  it('destino buscado que não existe no catálogo é ignorado sem quebrar', () => {
    const plano = planRoute({
      ...base,
      days: 3,
      anchorName: 'Destino Que Nao Existe',
    });
    expect(plano.days).toHaveLength(3);
    expect(plano.destinations.length).toBeGreaterThan(0);
  });

  it('destino buscado aparece no roteiro gerado', () => {
    const alvo = destinosInfo[7].nome;
    const plano = planRoute({ ...base, days: 3, anchorName: alvo });
    expect(plano.destinations.map((d) => d.nome)).toContain(alvo);
  });
});

// ============================================================
// ISA na geração de rotas
// ============================================================
// O ISA é o diferencial declarado do produto. Antes disto ele não participava da
// seleção em momento nenhum: um atrativo com ISA 30 tinha a mesma chance de entrar
// num roteiro que um com ISA 95 — a plataforma empurrava turista para o destino
// degradado, o oposto do que promete.

/** Mapa de ISA com todos saudáveis, para partir de um estado neutro. */
function isaTodosSaudaveis(valor = 85): Record<string, number> {
  return Object.fromEntries(destinosInfo.map((d) => [d.nome, valor]));
}

describe('planRoute — ISA como peso', () => {
  it('sem isaByDestination a rota é idêntica à de antes do ISA', () => {
    // Retrocompatibilidade: o parâmetro é opcional justamente para os testes que já
    // existiam seguirem valendo como rede de regressão, sem fixture de feedback.
    for (const style of ['adventure', 'culture', 'relax'] as const) {
      for (const dias of [1, 3, 6]) {
        const semISA = planRoute({ catalogue: destinosInfo, style, transport: 'shuttle', days: dias });
        const neutro = planRoute({
          catalogue: destinosInfo,
          style,
          transport: 'shuttle',
          days: dias,
          isaByDestination: {},
        });
        expect(neutro.destinations.map((d) => d.nome), `${style}/${dias}d`).toEqual(
          semISA.destinations.map((d) => d.nome)
        );
      }
    }
  });

  it('destino sem leitura de ISA é neutro, não penalizado', () => {
    // Sem opinião = efeito zero. Um mapa parcial não pode empurrar para baixo quem
    // ainda não foi avaliado.
    const parcial = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
      isaByDestination: { 'Praia da Pipa': 60 },
    });
    const semISA = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
    });
    expect(parcial.destinations.map((d) => d.nome)).toEqual(semISA.destinations.map((d) => d.nome));
  });

  it('ISA alto puxa um destino para dentro do roteiro', () => {
    const base = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
    });
    const deFora = destinosInfo.find((d) => !base.destinations.some((x) => x.nome === d.nome))!;

    const isa = isaTodosSaudaveis(62);
    isa[deFora.nome] = 100;
    const comISA = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
      isaByDestination: isa,
    });

    expect(comISA.destinations.map((d) => d.nome)).toContain(deFora.nome);
  });

  it('ISA baixo empurra um destino do preenchimento para fora', () => {
    const base = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
    });
    const seeds = new Set(destinosDoRoteiro('adventure', 'shuttle'));
    // O alvo tem que ser do preenchimento: assinatura entra forçada e a pontuação
    // não a alcança — para ela existe a regra de substituição, testada abaixo.
    const alvo = base.destinations.find((d) => !seeds.has(d.nome))!;

    const isa = isaTodosSaudaveis(90);
    isa[alvo.nome] = 10;
    const comISA = planRoute({
      catalogue: destinosInfo,
      style: 'adventure',
      transport: 'shuttle',
      days: 6,
      isaByDestination: isa,
    });

    expect(comISA.destinations.map((d) => d.nome)).not.toContain(alvo.nome);
  });

  it('não corta destino crítico sozinho — o ISA pesa, não veta', () => {
    // Decisão de produto: a plataforma não fecha atrativo. Quem suspende é a IGR.
    // Com todo o catálogo crítico, o roteiro sai completo do mesmo jeito.
    const isa = Object.fromEntries(destinosInfo.map((d) => [d.nome, 20]));
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'relax',
      transport: 'shuttle',
      days: 4,
      isaByDestination: isa,
    });
    expect(plano.days).toHaveLength(4);
    for (const dia of plano.days) expect(dia.destinations.length).toBeGreaterThan(0);
  });
});

describe('planRoute — substituição de destino-assinatura', () => {
  const SEEDS_CULTURA = destinosDoRoteiro('culture', 'shuttle');

  it('assinatura com ISA crítico sai e registra a troca com os três campos', () => {
    const isa = isaTodosSaudaveis(85);
    isa[SEEDS_CULTURA[0]] = 38;

    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      isaByDestination: isa,
    });

    expect(plano.destinations.map((d) => d.nome)).not.toContain(SEEDS_CULTURA[0]);
    expect(plano.replacements).toHaveLength(1);
    expect(plano.replacements[0].removed).toBe(SEEDS_CULTURA[0]);
    expect(plano.replacements[0].isa).toBe(38);
    expect(plano.replacements[0].replacedBy).toBeTruthy();
    expect(plano.destinations.map((d) => d.nome)).toContain(plano.replacements[0].replacedBy);
  });

  it('assinatura saudável fica, e replacements vem vazio', () => {
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      isaByDestination: isaTodosSaudaveis(85),
    });
    for (const seed of SEEDS_CULTURA) expect(plano.destinations.map((d) => d.nome)).toContain(seed);
    expect(plano.replacements).toEqual([]);
  });

  it('o substituto entra saudável', () => {
    const isa = isaTodosSaudaveis(85);
    isa[SEEDS_CULTURA[0]] = 20;
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      isaByDestination: isa,
    });
    expect(isa[plano.replacements[0].replacedBy]).toBeGreaterThanOrEqual(60);
  });

  it('a distância do substituto é medida até o destino REMOVIDO', () => {
    // Não até o resto do grupo: o substituto precisa cair na mesma região para a rota
    // preservar o formato e a promessa geográfica do título. Entre dois candidatos
    // igualmente saudáveis e fora da lista de afinidade, vence o mais perto do removido.
    const removido = destinosInfo.find((d) => d.nome === SEEDS_CULTURA[0])!;
    const isa = isaTodosSaudaveis(85);
    isa[SEEDS_CULTURA[0]] = 30;

    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      isaByDestination: isa,
    });

    const substituto = destinosInfo.find((d) => d.nome === plano.replacements[0].replacedBy)!;
    const kmDoRemovido = haversineKm(
      removido.latitude,
      removido.longitude,
      substituto.latitude,
      substituto.longitude
    );
    // Mesma região: o catálogo cobre o estado inteiro (Natal a Mossoró são ~246 km),
    // então um substituto a menos de 50 km do removido comprova a ancoragem local.
    expect(kmDoRemovido).toBeLessThan(50);
  });

  it('sem nenhum candidato saudável, mantém o assinatura e não registra troca', () => {
    // Roteiro degradado é melhor que roteiro vazio.
    const isa = Object.fromEntries(destinosInfo.map((d) => [d.nome, 25]));
    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      isaByDestination: isa,
    });
    for (const seed of SEEDS_CULTURA) expect(plano.destinations.map((d) => d.nome)).toContain(seed);
    expect(plano.replacements).toEqual([]);
  });

  it('o destino buscado NUNCA é substituído, mesmo crítico', () => {
    // O turista pediu aquele lugar explicitamente. Entregar outro sem ele pedir seria
    // pior do que mostrar o selo de ISA vermelho no que ele escolheu.
    const buscado = SEEDS_CULTURA[0];
    const isa = isaTodosSaudaveis(85);
    isa[buscado] = 15;

    const plano = planRoute({
      catalogue: destinosInfo,
      style: 'culture',
      transport: 'shuttle',
      days: 3,
      anchorName: buscado,
      isaByDestination: isa,
    });

    expect(plano.destinations.map((d) => d.nome)).toContain(buscado);
    expect(plano.replacements.some((r) => r.removed === buscado)).toBe(false);
  });

  it('varre todas as combinações com ISA ligado sem quebrar as garantias do planejador', () => {
    // As mesmas três promessas do cabeçalho do módulo, agora com o ISA participando:
    // dias exatos, nenhum dia vazio, nenhum destino repetido.
    const isa = isaTodosSaudaveis(85);
    // Uma assinatura crítica em cada estilo, para a substituição rodar na varredura.
    for (const style of ['adventure', 'relax', 'culture', 'family', 'ecotourism', 'gastronomy'] as const) {
      isa[destinosDoRoteiro(style, 'shuttle')[0]] = 35;
    }

    const estilos = ['adventure', 'relax', 'culture', 'family', 'ecotourism', 'gastronomy'] as const;
    const transportes = ['hike', 'buggy', 'shuttle'] as const;
    for (const style of estilos) {
      for (const transport of transportes) {
        const { min, max } = limitesDeDuracao(style, transport);
        for (let dias = min; dias <= max; dias++) {
          const rotulo = `${style}/${transport}/${dias}d`;
          const plano = planRoute({
            catalogue: destinosInfo,
            style,
            transport,
            days: dias,
            isaByDestination: isa,
          });

          expect(plano.days, rotulo).toHaveLength(dias);
          for (const dia of plano.days) {
            expect(dia.destinations.length, `${rotulo} dia ${dia.day}`).toBeGreaterThan(0);
          }
          const nomes = plano.destinations.map((d) => d.nome);
          expect(new Set(nomes).size, `${rotulo} sem repetidos`).toBe(nomes.length);
        }
      }
    }
  });
});
