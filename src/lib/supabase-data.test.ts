import { describe, it, expect } from 'vitest';
import { mapDestinoRows, type DestinoRow } from './supabase-data';
import { destinosInfo } from '@/data/mockData';

/**
 * Este mapeamento e o contrato entre o banco e `DestinoInfo`. Ele so roda com o
 * Supabase configurado — ou seja, so em producao —, entao defeito aqui nao aparece
 * em desenvolvimento nem no build: aparece na tela do usuario. Dai a cobertura.
 */

function linha(over: Partial<DestinoRow> = {}): DestinoRow {
  return {
    nome: 'Dunas de Genipabu',
    descricao: 'Complexo de dunas moveis.',
    imagem: '/images/destinations/dunas_de_genipabu.jpg',
    latitude: -5.7089,
    longitude: -35.1967,
    hashtags: ['genipabu', 'dunas'],
    monitorado: true,
    municipios: { nome: 'Extremoz' },
    atracoes: [
      { id: 1, nome: 'Passeio de Buggy', descricao: 'Aventura pelas dunas.' },
      { id: 2, nome: 'Esquibunda', descricao: null },
    ],
    ...over,
  };
}

describe('mapDestinoRows — atrações', () => {
  it('traz as atrações da linha em vez de esvaziar a lista', () => {
    // O defeito anterior era `atracoes: []` fixo: com o Supabase ligado, todo destino
    // perdia as atracoes e a home ficava sem o passo de escolher experiencias.
    const { destinos } = mapDestinoRows([linha()]);
    expect(destinos[0].atracoes).toHaveLength(2);
    expect(destinos[0].atracoes[0].nome).toBe('Passeio de Buggy');
    expect(destinos[0].atracoes[1].descricao).toBe('');
  });

  it('converte o id numérico do banco na string que o app espera', () => {
    const { destinos } = mapDestinoRows([linha()]);
    expect(destinos[0].atracoes.map((a) => a.id)).toEqual(['1', '2']);
  });

  it('deixa parceiroId vazio para não gerar link de vitrine quebrado', () => {
    // O catalogo Cadastur ainda e estatico; um id do Supabase apontaria para uma
    // vitrine inexistente. Vazio faz DestinationDetailPage nao desenhar o link.
    const { destinos } = mapDestinoRows([linha()]);
    for (const atracao of destinos[0].atracoes) expect(atracao.parceiroId).toBe('');
  });

  it('cai no catálogo estático quando o banco não tem atração para o destino', () => {
    // A tabela `atracoes` ficou vazia até a migration 0005. Sem esta reserva, o sync
    // apagaria as 23 atrações curadas e a home perderia o passo de escolher
    // experiências — o mesmo sintoma do defeito antigo, agora causado pelo dado.
    const estaticas = destinosInfo.find((d) => d.nome === 'Dunas de Genipabu')!.atracoes;
    expect(estaticas.length).toBeGreaterThan(0);
    expect(mapDestinoRows([linha({ atracoes: null })]).destinos[0].atracoes).toEqual(estaticas);
    expect(mapDestinoRows([linha({ atracoes: [] })]).destinos[0].atracoes).toEqual(estaticas);
  });

  it('destino que o catálogo estático não conhece fica sem atrações, não quebra', () => {
    const { destinos } = mapDestinoRows([
      linha({ nome: 'Destino Novo do Gestor', atracoes: [] }),
    ]);
    expect(destinos[0].atracoes).toEqual([]);
  });

  it('atrações do banco têm precedência sobre a reserva estática', () => {
    const { destinos } = mapDestinoRows([linha()]);
    expect(destinos[0].atracoes.map((a) => a.nome)).toEqual(['Passeio de Buggy', 'Esquibunda']);
  });

  it('descarta atração sem nome em vez de renderizar item em branco', () => {
    // Todas as linhas vindas do banco são inválidas -> vale a reserva estática,
    // como se o banco não tivesse nada.
    const { destinos } = mapDestinoRows([
      linha({ atracoes: [{ id: 9, nome: null, descricao: 'orfa' }] }),
    ]);
    const estaticas = destinosInfo.find((d) => d.nome === 'Dunas de Genipabu')!.atracoes;
    expect(destinos[0].atracoes).toEqual(estaticas);
  });
});

describe('mapDestinoRows — monitorado', () => {
  it('preserva o destino monitorado', () => {
    // `monitorado` alimenta o fallback do mapa da home e o desempate do planejador.
    // Antes ele nunca era mapeado e chegava `undefined`, entao o fallback
    // `destinations.filter(d => d.monitorado)` devolvia lista vazia — mapa em branco
    // justamente no caso que o fallback existe para cobrir.
    expect(mapDestinoRows([linha({ monitorado: true })]).destinos[0].monitorado).toBe(true);
  });

  it('preserva o destino não monitorado', () => {
    expect(mapDestinoRows([linha({ monitorado: false })]).destinos[0].monitorado).toBe(false);
  });

  it('trata ausência do campo como monitorado', () => {
    // Só `false` desliga. Nulo vindo de linha antiga não pode apagar o destino do mapa.
    expect(mapDestinoRows([linha({ monitorado: null })]).destinos[0].monitorado).toBe(true);
  });
});

describe('mapDestinoRows — coordenadas', () => {
  it('deixa de fora destino sem coordenada e informa quem foi', () => {
    // `PlaceMap` chama `.toFixed()` e `haversineKm` vira NaN — e um NaN contamina o
    // totalKm do roteiro inteiro, nao so o destino defeituoso.
    const { destinos, semCoordenada } = mapDestinoRows([
      linha(),
      linha({ nome: 'Sem Coordenada', latitude: null, longitude: null }),
    ]);
    expect(destinos).toHaveLength(1);
    expect(semCoordenada).toEqual(['Sem Coordenada']);
  });

  it('trata latitude presente e longitude ausente como destino inutilizável', () => {
    const { destinos, semCoordenada } = mapDestinoRows([
      linha({ nome: 'Meia Coordenada', longitude: null }),
    ]);
    expect(destinos).toEqual([]);
    expect(semCoordenada).toEqual(['Meia Coordenada']);
  });

  it('mantém coordenada zero, que é um ponto válido', () => {
    // Guarda contra a versao falsy (`!d.latitude`): o meridiano de Greenwich e o
    // equador sao coordenadas legitimas.
    const { destinos } = mapDestinoRows([linha({ latitude: 0, longitude: 0 })]);
    expect(destinos).toHaveLength(1);
    expect(destinos[0].latitude).toBe(0);
  });
});

describe('mapDestinoRows — demais campos', () => {
  it('lê o município tanto como objeto quanto como array de um elemento', () => {
    // PostgREST devolve relacao 1-1 nos dois formatos conforme a consulta.
    expect(mapDestinoRows([linha({ municipios: { nome: 'Extremoz' } })]).destinos[0].municipio).toBe(
      'Extremoz'
    );
    expect(
      mapDestinoRows([linha({ municipios: [{ nome: 'Extremoz' }] })]).destinos[0].municipio
    ).toBe('Extremoz');
  });

  it('usa a primeira hashtag e aceita lista ausente', () => {
    expect(mapDestinoRows([linha()]).destinos[0].hashtag).toBe('genipabu');
    expect(mapDestinoRows([linha({ hashtags: null })]).destinos[0].hashtag).toBe('');
    expect(mapDestinoRows([linha({ hashtags: [] })]).destinos[0].hashtag).toBe('');
  });

  it('troca texto nulo por string vazia, nunca por "null"', () => {
    const { destinos } = mapDestinoRows([
      linha({ descricao: null, imagem: null, municipios: null }),
    ]);
    expect(destinos[0].descricao).toBe('');
    expect(destinos[0].imagem).toBe('');
    expect(destinos[0].municipio).toBe('');
  });

  it('lista vazia entra e sai vazia', () => {
    expect(mapDestinoRows([])).toEqual({ destinos: [], semCoordenada: [] });
  });
});
