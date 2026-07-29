import { describe, it, expect } from 'vitest';
import { overviewPadding, RN_OVERVIEW_PITCH } from './scene3d';

describe('overviewPadding', () => {
  it('no desktop reserva a faixa do painel a direita', () => {
    const p = overviewPadding(1440, 800);
    // painel = min(480, 1440*0.42=604.8) = 480, mais 48 de folga
    expect(p.right).toBe(528);
    expect(p.left).toBe(56);
    expect(p.right).toBeGreaterThan(p.left);
  });

  it('acompanha a largura quando o painel e proporcional e nao no teto', () => {
    // 1100*0.42 = 462, abaixo do teto de 480
    expect(overviewPadding(1100, 800).right).toBe(510);
  });

  it('nunca reserva mais que o teto do painel mais a folga', () => {
    expect(overviewPadding(3000, 900).right).toBe(528);
  });

  it('no mobile reserva a metade de baixo em vez da direita', () => {
    const p = overviewPadding(390, 844);
    // painel comeca em 42vh, entao sobra 58% da altura, mais 24
    expect(p.bottom).toBe(Math.round(844 * 0.58) + 24);
    expect(p.right).toBe(32);
    expect(p.bottom).toBeGreaterThan(p.top);
  });

  it('troca de regime exatamente no breakpoint lg', () => {
    expect(overviewPadding(1023, 800).right).toBe(32);
    expect(overviewPadding(1024, 800).right).toBeGreaterThan(32);
  });

  it('devolve sempre inteiros — fitBounds nao gosta de fracao', () => {
    const p = overviewPadding(1237, 713);
    Object.values(p).forEach(v => expect(Number.isInteger(v)).toBe(true));
  });
});

describe('RN_OVERVIEW_PITCH', () => {
  it('e zero: o plano aberto existe para mostrar a forma do estado, e', () => {
    // qualquer inclinacao afunila o estado no topo e destroi a leitura.
    expect(RN_OVERVIEW_PITCH).toBe(0);
  });
});
