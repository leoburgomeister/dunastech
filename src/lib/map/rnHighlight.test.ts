import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractRings,
  buildMaskFeature,
  buildOutlineFeature,
  MASK_BBOX,
  type Ring,
} from './rnHighlight';

const QUADRADO: Ring = [
  [-36, -6],
  [-35, -6],
  [-35, -5],
  [-36, -5],
  [-36, -6],
];

describe('extractRings', () => {
  it('le uma FeatureCollection com Polygon', () => {
    const rings = extractRings({
      type: 'FeatureCollection',
      features: [{ geometry: { type: 'Polygon', coordinates: [QUADRADO] } }],
    });
    expect(rings).toHaveLength(1);
    expect(rings[0]).toEqual(QUADRADO);
  });

  it('le um MultiPolygon pegando o anel externo de cada parte', () => {
    const rings = extractRings({
      type: 'Feature',
      geometry: { type: 'MultiPolygon', coordinates: [[QUADRADO], [QUADRADO]] },
    });
    expect(rings).toHaveLength(2);
  });

  it('ignora aneis internos do Polygon', () => {
    const buraco: Ring = [
      [-35.6, -5.6],
      [-35.4, -5.6],
      [-35.4, -5.4],
      [-35.6, -5.6],
    ];
    const rings = extractRings({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [QUADRADO, buraco] },
    });
    expect(rings).toEqual([QUADRADO]);
  });

  it('devolve vazio para geometria que nao serve', () => {
    expect(extractRings({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } })).toEqual([]);
    expect(extractRings({ type: 'FeatureCollection', features: [] })).toEqual([]);
  });
});

describe('buildMaskFeature', () => {
  const mask = buildMaskFeature([QUADRADO]);

  it('usa a caixa como anel externo', () => {
    const outer = mask.geometry.coordinates[0];
    expect(outer[0]).toEqual([MASK_BBOX.west, MASK_BBOX.south]);
    expect(outer).toHaveLength(5);
    expect(outer[0]).toEqual(outer[outer.length - 1]);
  });

  it('põe o estado como furo, com sentido invertido', () => {
    const hole = mask.geometry.coordinates[1];
    expect(hole).toHaveLength(QUADRADO.length);
    expect(hole[0]).toEqual(QUADRADO[QUADRADO.length - 1]);
    expect(hole[hole.length - 1]).toEqual(QUADRADO[0]);
  });

  it('nao muta o anel recebido', () => {
    const original: Ring = [...QUADRADO];
    buildMaskFeature([original]);
    expect(original).toEqual(QUADRADO);
  });

  it('a caixa contem o RN de verdade', () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/geo/rn.geojson'), 'utf8')
    );
    const rings = extractRings(raw);
    expect(rings).toHaveLength(1);
    for (const [lng, lat] of rings[0]) {
      expect(lng).toBeGreaterThan(MASK_BBOX.west);
      expect(lng).toBeLessThan(MASK_BBOX.east);
      expect(lat).toBeGreaterThan(MASK_BBOX.south);
      expect(lat).toBeLessThan(MASK_BBOX.north);
    }
  });
});

describe('buildOutlineFeature', () => {
  it('vira MultiLineString com os mesmos aneis', () => {
    const f = buildOutlineFeature([QUADRADO]);
    expect(f.geometry.type).toBe('MultiLineString');
    expect(f.geometry.coordinates).toEqual([QUADRADO]);
  });
});
