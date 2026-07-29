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
    // score / count = 90 / 90 * 80 = 80
    // starFactor = (5 - 3) * 5 = +10
    // overcrowdingPenalty = 0
    // Total = 80 + 10 = 90
    expect(score).toBe(90);
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
    // score = 0
    // starFactor = (1 - 3) * 5 = -10
    // overcrowdingPenalty = -15
    // Total = 0 - 10 - 15 = -25 => clamped to min 0
    expect(score).toBe(0);
  });
});
