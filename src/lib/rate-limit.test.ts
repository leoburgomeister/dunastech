import { describe, it, expect, beforeEach } from 'vitest';
import { consomeLimite, zeraLimitesParaTeste } from './rate-limit';

describe('consomeLimite', () => {
  beforeEach(() => zeraLimitesParaTeste());

  it('aceita até o máximo dentro da janela e recusa o seguinte', () => {
    const t0 = 1_000_000;
    expect(consomeLimite('a', 2, 60_000, t0)).toBe(true);
    expect(consomeLimite('a', 2, 60_000, t0 + 10)).toBe(true);
    expect(consomeLimite('a', 2, 60_000, t0 + 20)).toBe(false);
  });

  it('separa as chaves: estourar uma não trava a outra', () => {
    const t0 = 1_000_000;
    expect(consomeLimite('gemini', 1, 60_000, t0)).toBe(true);
    expect(consomeLimite('gemini', 1, 60_000, t0 + 1)).toBe(false);
    expect(consomeLimite('scraper', 1, 60_000, t0 + 1)).toBe(true);
  });

  it('libera de novo quando a janela anda', () => {
    const t0 = 1_000_000;
    expect(consomeLimite('a', 1, 1_000, t0)).toBe(true);
    expect(consomeLimite('a', 1, 1_000, t0 + 999)).toBe(false);
    expect(consomeLimite('a', 1, 1_000, t0 + 1_000)).toBe(true);
  });
});
