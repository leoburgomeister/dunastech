import { describe, it, expect, vi } from 'vitest';
import {
  buildStyleUrl,
  buildTerrainSource,
  buildSky,
  applySky,
  applyTerrain,
  applyOpeningFraming,
  OPENING_FALLBACK_CAMERA,
  overviewPadding,
  TERRAIN_SOURCE_ID,
  TERRAIN_EXAGGERATION,
  CINEMATIC_PITCH,
  RN_BOUNDS,
  RN_CENTER,
  RN_OVERVIEW_ZOOM,
  RN_OVERVIEW_PITCH,
} from './scene3d';

function fakeMap({ hasSource = false, hasTerrain = false } = {}) {
  return {
    getSource: vi.fn(() => (hasSource ? {} : undefined)),
    addSource: vi.fn(),
    getTerrain: vi.fn(() => (hasTerrain ? { source: TERRAIN_SOURCE_ID } : null)),
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

describe('applySky', () => {
  it('define o ceu', () => {
    const map = fakeMap();
    applySky(map);

    expect(map.setSky).toHaveBeenCalledWith(buildSky());
  });

  // O globo era ligado no 'load', DEPOIS do primeiro quadro em mercator, e a
  // troca reprojetava o mapa inteiro de uma vez. No plano aberto o estado fica
  // fora do eixo otico (o painel empurra o enquadramento para a esquerda) e no
  // globo tudo fora do eixo aparece cisalhado — era o contorno saindo torto.
  it('nao mexe na projecao', () => {
    const map = fakeMap();
    applySky(map);

    expect(map.setProjection).not.toHaveBeenCalled();
  });

  // O relevo tem momento proprio: o inicio do mergulho, nao a abertura.
  it('nao liga o terreno', () => {
    const map = fakeMap();
    applySky(map);

    expect(map.setTerrain).not.toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
  });
});

describe('applyTerrain', () => {
  it('adiciona a fonte de relevo e liga o terreno', () => {
    const map = fakeMap();
    applyTerrain(map, 'abc123');

    expect(map.addSource).toHaveBeenCalledWith(TERRAIN_SOURCE_ID, buildTerrainSource('abc123'));
    expect(map.setTerrain).toHaveBeenCalledWith({
      source: TERRAIN_SOURCE_ID,
      exaggeration: TERRAIN_EXAGGERATION,
    });
  });

  // Chamado pelo efeito do zoom, que roda de novo a cada remontagem do mapa.
  it('nao duplica o source de terreno quando ele ja existe', () => {
    const map = fakeMap({ hasSource: true });
    applyTerrain(map, 'abc123');

    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.setTerrain).toHaveBeenCalledOnce();
  });

  /**
   * O `setTerrain` do MapLibre 5.24 faz `this.terrain = new Terrain(...)` sem
   * destruir o anterior, entao a segunda chamada vazaria um Terrain e um
   * RenderToTexture. E ela acontece: o efeito que instala o relevo depende de
   * `zoomProximo`, que vai e volta conforme o enquadramento do roteiro.
   */
  it('e idempotente: com relevo ja instalado nao mexe em nada', () => {
    let terreno: unknown = null;
    let fonte = false;
    const map = {
      getSource: vi.fn(() => (fonte ? {} : undefined)),
      addSource: vi.fn(() => {
        fonte = true;
      }),
      getTerrain: vi.fn(() => terreno),
      setTerrain: vi.fn((o: unknown) => {
        terreno = o;
      }),
    };

    applyTerrain(map, 'abc123');
    applyTerrain(map, 'abc123');
    applyTerrain(map, 'abc123');

    expect(map.addSource).toHaveBeenCalledOnce();
    expect(map.setTerrain).toHaveBeenCalledOnce();
  });

  it('sai cedo quando o relevo ja esta instalado', () => {
    const map = fakeMap({ hasSource: true, hasTerrain: true });
    applyTerrain(map, 'abc123');

    expect(map.setTerrain).not.toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
  });
});

function fakeFraming() {
  return { setPadding: vi.fn(), fitBounds: vi.fn() };
}

describe('OPENING_FALLBACK_CAMERA', () => {
  it('abre no estado inteiro, reto e sem rotacao', () => {
    expect(OPENING_FALLBACK_CAMERA).toEqual({
      center: RN_CENTER,
      zoom: RN_OVERVIEW_ZOOM,
      pitch: RN_OVERVIEW_PITCH,
      bearing: 0,
    });
  });
});

describe('applyOpeningFraming', () => {
  it('poe o padding no transform e enquadra o estado', () => {
    const map = fakeFraming();
    applyOpeningFraming(map, 1594, 835);

    expect(map.setPadding).toHaveBeenCalledWith(overviewPadding(1594, 835));
    expect(map.fitBounds).toHaveBeenCalledWith(RN_BOUNDS, {
      padding: 0,
      pitch: RN_OVERVIEW_PITCH,
      bearing: 0,
      duration: 0,
    });
  });

  /**
   * O teste que guarda o defeito medido: o MapLibre soma o padding do transform
   * ao padding da opcao no calculo do zoom, e desloca o centro pelo padding da
   * opcao. Passar o padding do painel nos DOIS lugares descontava o painel duas
   * vezes — o estado nascia 236px a esquerda e, no fitBounds do 'load' antigo,
   * era encaixado numa faixa de ~100px. Dai o "torto, mais ao canto".
   */
  it('nao passa o padding do painel para o fitBounds: so para o transform', () => {
    const map = fakeFraming();
    applyOpeningFraming(map, 1594, 835);

    const [, opcoes] = map.fitBounds.mock.calls[0];
    expect(opcoes.padding).toBe(0);

    const [padding] = map.setPadding.mock.calls[0];
    expect(padding.right).toBeGreaterThan(0);
  });

  it('poe o padding ANTES de enquadrar', () => {
    const ordem: string[] = [];
    const map = {
      setPadding: vi.fn(() => ordem.push('padding')),
      fitBounds: vi.fn(() => ordem.push('fit')),
    };

    applyOpeningFraming(map, 1594, 835);

    expect(ordem).toEqual(['padding', 'fit']);
  });

  it('enquadra sem animacao: o quadro tem que estar pronto no primeiro paint', () => {
    const map = fakeFraming();
    applyOpeningFraming(map, 1594, 835);

    expect(map.fitBounds.mock.calls[0][1].duration).toBe(0);
  });

  it('acompanha o viewport', () => {
    const largo = fakeFraming();
    const estreito = fakeFraming();
    applyOpeningFraming(largo, 1594, 835);
    applyOpeningFraming(estreito, 1100, 700);

    expect(largo.setPadding.mock.calls[0][0]).not.toEqual(
      estreito.setPadding.mock.calls[0][0]
    );
  });

  // Container degenerado: o cameraForBounds do MapLibre devolve undefined
  // quando o padding cobre o canvas, e o fitBounds vira no-op silencioso. Nao
  // tocar em nada deixa o mapa no OPENING_FALLBACK_CAMERA, que e legivel.
  it.each([
    ['largura zero', 0, 835],
    ['altura zero', 1594, 0],
    ['ambos zero', 0, 0],
  ])('nao mexe na camera com %s', (_caso, largura, altura) => {
    const map = fakeFraming();
    applyOpeningFraming(map, largura, altura);

    expect(map.setPadding).not.toHaveBeenCalled();
    expect(map.fitBounds).not.toHaveBeenCalled();
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
