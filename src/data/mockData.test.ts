import { describe, it, expect } from 'vitest';
import { calcularISA } from './mockData';
import type { Feedback } from './mockData';

describe('calcularISA', () => {
  it('should fall back to a base score plus static metrics when there are no feedbacks', () => {
    // "Ponta Negra e Morro do Careca" has investment > 3000 (+15) and saturation > 85 (-18)
    // Base is 65 => 65 + 15 - 18 = 62
    const score = calcularISA('Ponta Negra e Morro do Careca', []);
    expect(score).toBe(62);
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
