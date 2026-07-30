import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractRings,
  buildMaskFeature,
  buildOutlineFeature,
  highlightLayers,
  MASK_BBOX,
  type Ring,
  fadeByZoom,
  RN_FADE_START_ZOOM,
  RN_FADE_END_ZOOM,
  RN_OPACITY_TRANSITION,
  RN_LABEL_ANCHOR,
  RN_MASK_SOURCE_ID,
  RN_OUTLINE_SOURCE_ID,
  RN_MASK_LAYER_ID,
  RN_OUTLINE_LAYER_ID,
  RN_GLOW_OUTER_LAYER_ID,
  RN_GLOW_INNER_LAYER_ID,
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

describe('fadeByZoom', () => {
  it('monta a rampa do zoom aberto ate o zoom fechado', () => {
    expect(fadeByZoom(0.55)).toEqual([
      'interpolate', ['linear'], ['zoom'],
      RN_FADE_START_ZOOM, 0.55,
      RN_FADE_END_ZOOM, 0,
    ]);
  });

  it('some antes de a camera chegar em Genipabu', () => {
    // o mergulho termina em GENIPABU_ZOOM 13.2 — o destaque tem que ja ter
    // acabado bem antes, senao escurece o oceano na tomada fechada.
    expect(RN_FADE_END_ZOOM).toBeLessThan(13.2);
  });

  it('esta inteiro no plano aberto do estado (~zoom 6.5)', () => {
    expect(RN_FADE_START_ZOOM).toBeGreaterThan(6.5);
  });
});

describe('highlightLayers', () => {
  const camadas = highlightLayers();

  it('pinta na ordem mascara, aura larga, aura fechada, contorno', () => {
    // Invertida, o borrao lavaria o traco nitido.
    expect(camadas.map((c) => c.id)).toEqual([
      RN_MASK_LAYER_ID,
      RN_GLOW_OUTER_LAYER_ID,
      RN_GLOW_INNER_LAYER_ID,
      RN_OUTLINE_LAYER_ID,
    ]);
  });

  // O defeito que estas camadas corrigem: a malha vem por fetch, entao elas
  // nascem depois do primeiro quadro. Pintadas ja opacas, tudo fora do estado
  // escurecia num piscar.
  it('nasce com opacidade zero', () => {
    for (const camada of camadas) {
      expect(camada.paint[camada.opacityProp]).toBe(0);
    }
  });

  it('declara a transicao de opacidade, para a troca virar fade', () => {
    for (const camada of camadas) {
      expect(camada.paint[`${camada.opacityProp}-transition`]).toEqual(
        RN_OPACITY_TRANSITION
      );
    }
  });

  it('guarda a opacidade final como rampa de zoom, nao como numero', () => {
    for (const camada of camadas) {
      expect(camada.finalOpacity).toEqual(
        expect.arrayContaining(['interpolate', ['linear'], ['zoom']])
      );
    }
  });

  it('some por completo no zoom fechado: nenhuma camada sobrevive ao mergulho', () => {
    for (const camada of camadas) {
      const rampa = camada.finalOpacity as unknown[];
      expect(rampa[rampa.length - 2]).toBe(RN_FADE_END_ZOOM);
      expect(rampa[rampa.length - 1]).toBe(0);
    }
  });

  it('liga cada camada a fonte certa', () => {
    const porId = new Map(camadas.map((c) => [c.id, c.source]));
    expect(porId.get(RN_MASK_LAYER_ID)).toBe(RN_MASK_SOURCE_ID);
    expect(porId.get(RN_GLOW_OUTER_LAYER_ID)).toBe(RN_OUTLINE_SOURCE_ID);
    expect(porId.get(RN_GLOW_INNER_LAYER_ID)).toBe(RN_OUTLINE_SOURCE_ID);
    expect(porId.get(RN_OUTLINE_LAYER_ID)).toBe(RN_OUTLINE_SOURCE_ID);
  });

  it('usa fill na mascara e line no contorno', () => {
    const porId = new Map(camadas.map((c) => [c.id, c]));
    expect(porId.get(RN_MASK_LAYER_ID)?.type).toBe('fill');
    expect(porId.get(RN_MASK_LAYER_ID)?.opacityProp).toBe('fill-opacity');
    expect(porId.get(RN_OUTLINE_LAYER_ID)?.type).toBe('line');
    expect(porId.get(RN_OUTLINE_LAYER_ID)?.opacityProp).toBe('line-opacity');
  });

  it('devolve objetos novos a cada chamada', () => {
    // O componente chama duas vezes — uma para addLayer, outra para o
    // setPaintProperty do frame seguinte — e mutar a paint compartilhada
    // vazaria a opacidade final para a proxima montagem do mapa.
    const outra = highlightLayers();
    expect(outra[0]).not.toBe(camadas[0]);
    expect(outra[0].paint).not.toBe(camadas[0].paint);
  });
});

describe('RN_LABEL_ANCHOR', () => {
  it('cai dentro da caixa do estado', () => {
    const [lng, lat] = RN_LABEL_ANCHOR;
    expect(lng).toBeGreaterThan(-38.62);
    expect(lng).toBeLessThan(-34.93);
    expect(lat).toBeGreaterThan(-7.02);
    expect(lat).toBeLessThan(-4.79);
  });
});
