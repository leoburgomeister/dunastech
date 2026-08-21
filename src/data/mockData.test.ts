import { describe, it, expect } from 'vitest';
import { calcularISA, destinosInfo } from './mockData';
import type { Feedback } from './mockData';

describe('calcularISA', () => {
  it('should fall back to a base score plus static metrics when there are no feedbacks', () => {
    // "Ponta Negra e Morro do Careca": investimento 5400 mil => bônus 21,6 limitado ao teto 21.
    // Saturação 88 => penalidade (88 - 70) * 0,5 = 9. Base 74 => 74 + 21 - 9 = 86.
    const score = calcularISA('Ponta Negra e Morro do Careca', []);
    expect(score).toBe(86);
  });

  it('should cap the investment bonus so the static baseline never passes 95', () => {
    // Nenhum destino pode ultrapassar 74 + 21 = 95 sem feedbacks, por mais que se invista.
    for (const destino of destinosInfo) {
      const score = calcularISA(destino.nome, []);
      expect(score).toBeLessThanOrEqual(95);
    }
  });

  it('should keep every destination healthy on the static baseline (calibração do pitch)', () => {
    // Calibração de palco: todos entre 82 e 95, ninguém com selo de "Atenção" (<80).
    for (const destino of destinosInfo) {
      const score = calcularISA(destino.nome, []);
      expect(score).toBeGreaterThanOrEqual(82);
    }
  });

  it('should still penalize saturation above 70', () => {
    // Ponta Negra (saturação 88) tem investimento no teto, mas fica abaixo de um destino
    // igualmente bem investido e menos saturado — a pressão turística tem que aparecer.
    const pontaNegra = calcularISA('Ponta Negra e Morro do Careca', []);
    const genipabu = calcularISA('Dunas de Genipabu', []);
    expect(pontaNegra).toBeLessThan(genipabu);
  });

  it('should calculate ISA based on positive feedback bonus and rating star factor', () => {
    const feedbacks: Feedback[] = [
      {
        id: 'test-1',
        destino: 'Praia da Pipa',
        nota_geral: 5,
        limpo: true,
        sinalizado: true,
        preservado: true,
        acessibilidade: true,
        seguranca: true,
        custo_beneficio: true,
        conservacao: true,
        superlotado: false,
        comentario: 'Excelente!',
        timestamp: Date.now(),
      },
    ];

    const score = calcularISA('Praia da Pipa', feedbacks);
    // Nota da avaliação: (90 / 90) * 80 = 80, starFactor (5-3)*5 = +10, sem
    // superlotação => 90.
    // A nota não substitui mais o baseline: entra numa média ponderada com ele
    // (K = 3). Baseline da Pipa = 88 => (88*3 + 90) / 4 = 88,5 => 88.
    expect(score).toBe(88);
  });

  it('should penalize the ISA score if there is overcrowding and poor ratings', () => {
    const feedbacks: Feedback[] = [
      {
        id: 'test-2',
        destino: 'Praia da Pipa',
        nota_geral: 1,
        limpo: false,
        sinalizado: false,
        preservado: false,
        acessibilidade: false,
        seguranca: false,
        custo_beneficio: false,
        conservacao: false,
        superlotado: true,
        comentario: 'Muito ruim!',
        timestamp: Date.now(),
      },
    ];

    const score = calcularISA('Praia da Pipa', feedbacks);
    // Nota da avaliação: 0 - 10 (estrelas) - 15 (superlotado) = -25, travada em 0.
    // Uma avaliação sozinha NÃO zera mais o destino: baseline 88 com peso 3 =>
    // (88*3 + 0) / 4 = 66. O destino cai de "saudável" para "atenção", que é a
    // reação proporcional a um voto só.
    expect(score).toBe(66);
  });

  it('não deixa uma única avaliação apagar o baseline', () => {
    // O defeito que a suavização corrige: antes, `baseScore = soma / n` substituía o
    // baseline inteiro, e a primeira avaliação de qualquer destino o jogava para a
    // faixa de 0–30 — em produção, não só na demo.
    const pessima: Feedback = {
      id: 'unica', destino: 'Dunas de Genipabu', nota_geral: 1,
      limpo: false, sinalizado: false, preservado: false, acessibilidade: false,
      seguranca: false, custo_beneficio: false, conservacao: false, superlotado: true,
      comentario: '', timestamp: Date.now(),
    };
    expect(calcularISA('Dunas de Genipabu', [pessima])).toBeGreaterThan(60);
  });

  it('leva o destino a crítico com duas avaliações ruins', () => {
    // Curva da spec para um destino principal (baseline 90): 90 / 68 / 54 / 45.
    // Duas avaliações ruins têm que cruzar o limiar de crítico (<60) — o indicador
    // continua respondendo rápido a problema real, só não é decidido por um voto.
    const ruim = (id: string): Feedback => ({
      id, destino: 'Dunas de Genipabu', nota_geral: 1,
      limpo: false, sinalizado: false, preservado: false, acessibilidade: false,
      seguranca: false, custo_beneficio: false, conservacao: false, superlotado: true,
      comentario: '', timestamp: Date.now(),
    });
    expect(calcularISA('Dunas de Genipabu', [])).toBe(90);
    expect(calcularISA('Dunas de Genipabu', [ruim('a')])).toBe(68);
    expect(calcularISA('Dunas de Genipabu', [ruim('a'), ruim('b')])).toBe(54);
    expect(calcularISA('Dunas de Genipabu', [ruim('a'), ruim('b'), ruim('c')])).toBe(45);
  });

  it('não estoura 100 nem com muitas avaliações ótimas', () => {
    const otima = (id: string): Feedback => ({
      id, destino: 'Praia da Pipa', nota_geral: 5,
      limpo: true, sinalizado: true, preservado: true, acessibilidade: true,
      seguranca: true, custo_beneficio: true, conservacao: true, superlotado: false,
      comentario: '', timestamp: Date.now(),
    });
    const muitas = Array.from({ length: 20 }, (_, i) => otima(`o${i}`));
    const score = calcularISA('Praia da Pipa', muitas);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThan(calcularISA('Praia da Pipa', []));
  });

  it('ignora avaliação de outro destino', () => {
    const daPipa: Feedback = {
      id: 'p1', destino: 'Praia da Pipa', nota_geral: 1,
      limpo: false, sinalizado: false, preservado: false, acessibilidade: false,
      seguranca: false, custo_beneficio: false, conservacao: false, superlotado: true,
      comentario: '', timestamp: Date.now(),
    };
    expect(calcularISA('Dunas de Genipabu', [daPipa])).toBe(
      calcularISA('Dunas de Genipabu', [])
    );
  });
});
