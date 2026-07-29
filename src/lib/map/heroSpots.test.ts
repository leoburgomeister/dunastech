import { describe, it, expect } from 'vitest';
import { heroSpots, pickHeroSpot, isaBand, ISA_BAND_COLOR, type HeroSpot } from './heroSpots';

describe('heroSpots', () => {
  const spots = heroSpots();

  it('encontra todos os nomes da curadoria em destinosInfo', () => {
    // Se um nome for renomeado no mockData, este teste cai antes de a home
    // silenciosamente perder um destino do sorteio.
    expect(spots).toHaveLength(10);
  });

  it('traz coordenadas e ISA reais, nao copiados', () => {
    const genipabu = spots.find(s => s.nome === 'Dunas de Genipabu');
    expect(genipabu).toBeDefined();
    expect(genipabu!.center).toEqual([-35.1967, -5.7089]);
    expect(genipabu!.isa).toBe(73);
    expect(genipabu!.municipio).toBe('Extremoz');
  });

  it('todo destino tem zoom de enquadramento plausivel', () => {
    for (const s of spots) {
      expect(s.zoom).toBeGreaterThan(12);
      expect(s.zoom).toBeLessThan(17);
    }
  });

  it('todo ISA esta na escala 0-100', () => {
    for (const s of spots) {
      expect(s.isa).toBeGreaterThanOrEqual(0);
      expect(s.isa).toBeLessThanOrEqual(100);
    }
  });

  it('nao repete destino na curadoria', () => {
    expect(new Set(spots.map(s => s.nome)).size).toBe(spots.length);
  });
});

describe('isaBand', () => {
  it('usa as mesmas faixas do getISABadge', () => {
    expect(isaBand(80)).toBe('saudavel');
    expect(isaBand(100)).toBe('saudavel');
    expect(isaBand(79)).toBe('atencao');
    expect(isaBand(60)).toBe('atencao');
    expect(isaBand(59)).toBe('critico');
    expect(isaBand(0)).toBe('critico');
  });

  it('tem cor para toda faixa', () => {
    for (const b of ['saudavel', 'atencao', 'critico'] as const) {
      expect(ISA_BAND_COLOR[b]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('pickHeroSpot', () => {
  const mk = (nome: string): HeroSpot => ({
    nome, municipio: 'x', center: [0, 0], zoom: 13, isa: 65,
  });
  const tres = [mk('A'), mk('B'), mk('C')];

  it('devolve null sem candidatos', () => {
    expect(pickHeroSpot([], null, () => 0)).toBeNull();
  });

  it('sorteia pelo indice proporcional ao random', () => {
    expect(pickHeroSpot(tres, null, () => 0)!.nome).toBe('A');
    expect(pickHeroSpot(tres, null, () => 0.5)!.nome).toBe('B');
    expect(pickHeroSpot(tres, null, () => 0.99)!.nome).toBe('C');
  });

  it('nunca estoura o indice quando random devolve 1', () => {
    expect(pickHeroSpot(tres, null, () => 1)!.nome).toBe('C');
  });

  it('evita repetir o destino anterior', () => {
    // sem o filtro, random 0 cairia em 'A' de novo
    expect(pickHeroSpot(tres, 'A', () => 0)!.nome).toBe('B');
  });

  it('com um candidato so, repete em vez de devolver nada', () => {
    const um = [mk('A')];
    expect(pickHeroSpot(um, 'A', () => 0)!.nome).toBe('A');
  });

  it('cobre todos os destinos ao longo de muitos sorteios', () => {
    const vistos = new Set<string>();
    let anterior: string | null = null;
    let seed = 0;
    for (let i = 0; i < 200; i++) {
      // gerador simples e deterministico, so para varrer o espaco
      seed = (seed * 9301 + 49297) % 233280;
      const escolhido: HeroSpot = pickHeroSpot(heroSpots(), anterior, () => seed / 233280)!;
      vistos.add(escolhido.nome);
      anterior = escolhido.nome;
    }
    expect(vistos.size).toBe(10);
  });

  it('nunca devolve o anterior em sequencia', () => {
    let anterior: string | null = null;
    let seed = 7;
    for (let i = 0; i < 100; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const escolhido: HeroSpot = pickHeroSpot(heroSpots(), anterior, () => seed / 233280)!;
      expect(escolhido.nome).not.toBe(anterior);
      anterior = escolhido.nome;
    }
  });
});
