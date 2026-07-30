import { describe, it, expect } from 'vitest';
import { overviewPadding, routeFraming, RN_OVERVIEW_PITCH } from './scene3d';

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

describe('routeFraming', () => {
  /** Onde o alvo do fitBounds cai na tela, dado padding + offset. */
  const centroNaTela = (largura: number, altura: number) => {
    const { padding, offset } = routeFraming(largura, altura);
    return {
      x: (padding.left + (largura - padding.right)) / 2 + offset[0],
      y: (padding.top + (altura - padding.bottom)) / 2 + offset[1],
    };
  };

  it('no desktop centra a rota na faixa livre ao lado do painel', () => {
    const largura = 1172;
    const painel = Math.round(Math.min(480, largura * 0.42)); // 480
    const faixaLivre = largura - painel; // 692
    const { x } = centroNaTela(largura, 604);

    // Antes, com padding uniforme, o alvo caia no centro do canvas (586) — dentro
    // da area coberta pelo painel, que comeca em 692.
    expect(x).toBeCloseTo(faixaLivre / 2, 0);
    expect(x).toBeLessThan(faixaLivre);
  });

  it('reserva a largura do painel no calculo do zoom', () => {
    const { padding } = routeFraming(1172, 604);
    const painel = 480;
    expect(padding.left + padding.right).toBe(painel);
  });

  it('nunca soma padding horizontal perto da metade do canvas', () => {
    // Acima disso o cameraForBounds do MapLibre devolve zoom absurdo ou undefined.
    for (const largura of [1024, 1280, 1440, 1920, 2560, 3840]) {
      const { padding } = routeFraming(largura, 900);
      expect(padding.left + padding.right).toBeLessThan(largura * 0.5);
    }
  });

  it('no mobile tira a rota de baixo do painel, empurrando para cima', () => {
    const { offset, padding } = routeFraming(390, 844);
    expect(offset[0]).toBe(0);
    expect(offset[1]).toBeLessThan(0);
    expect(padding.top + padding.bottom).toBeLessThan(844 * 0.5);
  });

  it('devolve sempre inteiros — fitBounds nao gosta de fracao', () => {
    for (const [w, h] of [[1237, 713], [390, 844], [1024, 600]] as const) {
      const { padding, offset } = routeFraming(w, h);
      Object.values(padding).forEach(v => expect(Number.isInteger(v)).toBe(true));
      offset.forEach(v => expect(Number.isInteger(v)).toBe(true));
    }
  });
});

describe('RN_OVERVIEW_PITCH', () => {
  it('e zero: o plano aberto existe para mostrar a forma do estado, e', () => {
    // qualquer inclinacao afunila o estado no topo e destroi a leitura.
    expect(RN_OVERVIEW_PITCH).toBe(0);
  });
});
