import { describe, it, expect } from 'vitest';
import { tokenDoBearer } from './api-guard';

describe('tokenDoBearer', () => {
  it('extrai o JWT de um header Bearer bem formado', () => {
    expect(tokenDoBearer('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('aceita o esquema em qualquer caixa', () => {
    expect(tokenDoBearer('bearer tok')).toBe('tok');
    expect(tokenDoBearer('BEARER tok')).toBe('tok');
  });

  it('recusa header ausente, esquema errado ou lixo extra', () => {
    expect(tokenDoBearer(null)).toBeNull();
    expect(tokenDoBearer('')).toBeNull();
    expect(tokenDoBearer('Basic abc')).toBeNull();
    expect(tokenDoBearer('Bearer')).toBeNull();
    expect(tokenDoBearer('Bearer um dois')).toBeNull();
  });
});
