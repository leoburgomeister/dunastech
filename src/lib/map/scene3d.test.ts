import { describe, it, expect, vi } from 'vitest';
import {
  buildStyleUrl,
  buildTerrainSource,
  buildSky,
  apply3DScene,
  TERRAIN_SOURCE_ID,
  TERRAIN_EXAGGERATION,
  CINEMATIC_PITCH,
} from './scene3d';

function fakeMap({ hasSource = false } = {}) {
  return {
    getSource: vi.fn(() => (hasSource ? {} : undefined)),
    addSource: vi.fn(),
    setTerrain: vi.fn(),
    setSky: vi.fn(),
    setProjection: vi.fn(),
  };
}

describe('buildStyleUrl', () => {
  it('aponta para o estilo hybrid do MapTiler com a chave', () => {
    expect(buildStyleUrl('abc123')).toBe(
      'https://api.maptiler.com/maps/hybrid/style.json?key=abc123'
    );
  });

  it('escapa chaves com caracteres especiais', () => {
    expect(buildStyleUrl('a b&c')).toContain('key=a%20b%26c');
  });
});

describe('buildTerrainSource', () => {
  it('produz um source raster-dem do MapTiler', () => {
    const source = buildTerrainSource('abc123');
    expect(source.type).toBe('raster-dem');
    expect(source.encoding).toBe('mapbox');
    expect(source.url).toBe(
      'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=abc123'
    );
  });
});

describe('buildSky', () => {
  it('define ceu, horizonte e atmosfera', () => {
    const sky = buildSky();
    expect(sky['sky-color']).toBeTypeOf('string');
    expect(sky['horizon-color']).toBeTypeOf('string');
    expect(sky['atmosphere-blend']).toBeTypeOf('number');
  });
});

describe('apply3DScene', () => {
  it('adiciona o terreno, o ceu e a projecao globo', () => {
    const map = fakeMap();
    apply3DScene(map, 'abc123');

    expect(map.addSource).toHaveBeenCalledWith(TERRAIN_SOURCE_ID, buildTerrainSource('abc123'));
    expect(map.setTerrain).toHaveBeenCalledWith({
      source: TERRAIN_SOURCE_ID,
      exaggeration: TERRAIN_EXAGGERATION,
    });
    expect(map.setSky).toHaveBeenCalledOnce();
    expect(map.setProjection).toHaveBeenCalledWith({ type: 'globe' });
  });

  it('aceita mercator quando o enquadramento e fechado', () => {
    const map = fakeMap();
    apply3DScene(map, 'abc123', { projection: 'mercator' });

    expect(map.setProjection).toHaveBeenCalledWith({ type: 'mercator' });
    expect(map.setTerrain).toHaveBeenCalledOnce();
  });

  it('nao duplica o source de terreno quando ele ja existe', () => {
    const map = fakeMap({ hasSource: true });
    apply3DScene(map, 'abc123');

    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.setTerrain).toHaveBeenCalledOnce();
  });
});

describe('constantes', () => {
  it('usa exagero alto porque o relevo do RN e baixo', () => {
    expect(TERRAIN_EXAGGERATION).toBeGreaterThan(1);
  });

  it('respeita o maxPitch padrao do MapLibre', () => {
    expect(CINEMATIC_PITCH).toBeLessThanOrEqual(60);
  });
});
