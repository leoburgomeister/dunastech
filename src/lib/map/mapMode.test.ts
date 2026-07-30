import { describe, it, expect } from 'vitest';
import { resolveMapMode } from './mapMode';

describe('resolveMapMode', () => {
  it('cai para 2D quando nao ha chave do MapTiler', () => {
    expect(resolveMapMode({})).toBe('flat');
    expect(resolveMapMode({ maptilerKey: undefined })).toBe('flat');
    expect(resolveMapMode({ maptilerKey: '' })).toBe('flat');
    expect(resolveMapMode({ maptilerKey: '   ' })).toBe('flat');
  });

  it('cai para 2D quando force2d esta ligado, mesmo com chave valida', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123', force2d: true })).toBe('flat');
    expect(
      resolveMapMode({ maptilerKey: 'abc123', force2d: true, prefersReducedMotion: true })
    ).toBe('flat');
  });

  it('usa cena 3D estatica quando o usuario pede menos movimento', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123', prefersReducedMotion: true })).toBe('static3d');
  });

  it('usa cena 3D cinematografica no caminho feliz', () => {
    expect(resolveMapMode({ maptilerKey: 'abc123' })).toBe('cinematic');
    expect(
      resolveMapMode({ maptilerKey: 'abc123', force2d: false, prefersReducedMotion: false })
    ).toBe('cinematic');
  });
});
