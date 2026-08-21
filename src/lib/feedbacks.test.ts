import { describe, it, expect } from 'vitest';
import { isErroDeAutorizacao } from './feedbacks';

describe('isErroDeAutorizacao', () => {
  it('reconhece recusa de RLS, JWT e o teto de frequência', () => {
    expect(isErroDeAutorizacao({ code: '42501' })).toBe(true);
    expect(isErroDeAutorizacao({ code: 'PGRST301' })).toBe(true);
    expect(isErroDeAutorizacao({ code: 'P0001' })).toBe(true);
    expect(isErroDeAutorizacao({ message: 'Row-level security policy violated' })).toBe(true);
    expect(isErroDeAutorizacao({ status: 401 })).toBe(true);
    expect(isErroDeAutorizacao({ status: 403 })).toBe(true);
  });

  it('não trata falha de rede como recusa de autorização', () => {
    expect(isErroDeAutorizacao({ message: 'Failed to fetch' })).toBe(false);
    expect(isErroDeAutorizacao({ code: 'PGRST116' })).toBe(false);
    expect(isErroDeAutorizacao({})).toBe(false);
  });
});
