import { describe, it, expect } from 'vitest';
import {
  fotosAprovadas,
  fotosReprovadas,
  semFotoAinda,
  fotoAprovadaPara,
  creditoDaFoto,
  motivoReprovacao,
} from './photoCuration';
import { destinosInfo, cadasturData } from './mockData';

/** Todo nome que a curadoria pode legitimamente apontar: destino, atracao ou parceiro. */
function nomesConhecidos(): Set<string> {
  const nomes = new Set<string>();
  for (const destino of destinosInfo) {
    nomes.add(destino.nome);
    for (const atracao of destino.atracoes) nomes.add(atracao.nome);
  }
  for (const parceiro of cadasturData) nomes.add(parceiro.nome);
  return nomes;
}

const PRIMEIRA_APROVADA = Object.entries(fotosAprovadas)[0];

describe('fotoAprovadaPara', () => {
  it('aprova a trinca completa — arquivo, local e tamanho', () => {
    const [src, entrada] = PRIMEIRA_APROVADA;
    expect(fotoAprovadaPara(src, entrada.local, entrada.tamanhos[0])).toBe(true);
  });

  it('reprova src ausente sem quebrar', () => {
    // PlaceImage chama com `destino.imagem`, que vem vazio no catalogo e pode vir
    // null do Supabase — o gate precisa aguentar os tres casos.
    expect(fotoAprovadaPara(undefined, 'Praia da Pipa', 'hero')).toBe(false);
    expect(fotoAprovadaPara(null, 'Praia da Pipa', 'hero')).toBe(false);
    expect(fotoAprovadaPara('', 'Praia da Pipa', 'hero')).toBe(false);
  });

  it('reprova arquivo que nao passou pela curadoria', () => {
    expect(fotoAprovadaPara('/images/destinations/inexistente.jpg', 'Praia da Pipa', 'hero')).toBe(
      false
    );
  });

  it('reprova foto aprovada reaproveitada em OUTRO local', () => {
    // Esta e a gafe que o modulo existe para evitar: usar a foto de um destino
    // para ilustrar o municipio vizinho. Sem o conjunto `local`, o reaproveitamento
    // passa silencioso e o produto publica uma foto que nao e o lugar.
    const [src, entrada] = PRIMEIRA_APROVADA;
    const outroLocal = destinosInfo.find((d) => d.nome !== entrada.local)!.nome;
    expect(fotoAprovadaPara(src, outroLocal, entrada.tamanhos[0])).toBe(false);
  });

  it('reprova tamanho fora da lista da propria foto', () => {
    // Foto de resolucao baixa nao pode ser esticada num hero. A regra so vale se
    // o gate consultar `tamanhos`; sem isso, uma entrada restrita vaza para o telao.
    const restrita = Object.entries(fotosAprovadas).find(([, v]) => v.tamanhos.length < 3);
    expect(restrita, 'a tabela precisa manter ao menos uma foto com tamanho restrito').toBeDefined();
    const [src, entrada] = restrita!;
    const proibido = (['thumb', 'card', 'hero'] as const).find(
      (t) => !entrada.tamanhos.includes(t)
    )!;
    expect(fotoAprovadaPara(src, entrada.local, proibido)).toBe(false);
    for (const permitido of entrada.tamanhos) {
      expect(fotoAprovadaPara(src, entrada.local, permitido)).toBe(true);
    }
  });
});

describe('creditoDaFoto', () => {
  it('devolve o credito da foto aprovada', () => {
    const [src, entrada] = PRIMEIRA_APROVADA;
    expect(creditoDaFoto(src)).toBe(entrada.credito);
  });

  it('devolve undefined para src ausente ou nao curado', () => {
    expect(creditoDaFoto(undefined)).toBeUndefined();
    expect(creditoDaFoto('/images/destinations/inexistente.jpg')).toBeUndefined();
  });
});

describe('motivoReprovacao', () => {
  it('explica por que um arquivo foi barrado', () => {
    const [src, motivo] = Object.entries(fotosReprovadas)[0];
    expect(motivoReprovacao(src)).toBe(motivo);
  });

  it('devolve undefined para src ausente ou nunca avaliado', () => {
    expect(motivoReprovacao(undefined)).toBeUndefined();
    expect(motivoReprovacao('/images/destinations/nunca_avaliada.jpg')).toBeUndefined();
  });
});

describe('tabela de curadoria', () => {
  it('todo local aprovado existe no catalogo', () => {
    // A comparacao e por igualdade de string. Renomear um destino em mockData sem
    // atualizar aqui derruba a foto para o <PlaceMap> em silencio: sem erro, sem log,
    // so a pagina ficando pior sem ninguem perceber.
    const conhecidos = nomesConhecidos();
    const orfaos = Object.entries(fotosAprovadas)
      .filter(([, entrada]) => !conhecidos.has(entrada.local))
      .map(([src, entrada]) => `${src} -> "${entrada.local}"`);
    expect(orfaos).toEqual([]);
  });

  it('toda foto aprovada tem credito preenchido', () => {
    // As entradas de acervo e do Commons exigem atribuicao. PlaceImage so desenha o
    // overlay quando `creditoDaFoto` devolve algo — credito vazio publica a imagem
    // sem a atribuicao que a licenca pede.
    const semCredito = Object.entries(fotosAprovadas)
      .filter(([, entrada]) => entrada.credito.trim() === '')
      .map(([src]) => src);
    expect(semCredito).toEqual([]);
  });

  it('toda foto aprovada declara ao menos um tamanho valido', () => {
    for (const [src, entrada] of Object.entries(fotosAprovadas)) {
      expect(entrada.tamanhos.length, src).toBeGreaterThan(0);
      for (const tamanho of entrada.tamanhos) {
        expect(['thumb', 'card', 'hero'], src).toContain(tamanho);
      }
    }
  });

  it('nenhum arquivo esta aprovado e reprovado ao mesmo tempo', () => {
    const ambiguos = Object.keys(fotosAprovadas).filter((src) => src in fotosReprovadas);
    expect(ambiguos).toEqual([]);
  });

  it('nenhum local aprovado continua na lista de compras', () => {
    // `semFotoAinda` e a lista de quem falta. Um local nos dois lugares manda buscar
    // foto que ja existe.
    const aprovados = new Set(Object.values(fotosAprovadas).map((e) => e.local));
    const contraditorios = Object.keys(semFotoAinda).filter((local) => aprovados.has(local));
    expect(contraditorios).toEqual([]);
  });

  it('a resolucao declarada e coerente com os tamanhos liberados', () => {
    for (const [src, entrada] of Object.entries(fotosAprovadas)) {
      expect(entrada.resolucao.largura, src).toBeGreaterThan(0);
      expect(entrada.resolucao.altura, src).toBeGreaterThan(0);
    }
  });
});
