import { describe, it, expect } from 'vitest';
import {
  rnOverview,
  destinationCamera,
  flightDuration,
  RN_CENTER,
  RN_OVERVIEW_ZOOM,
  DESTINATION_ZOOM,
  DESTINATION_FLY_DURATION_MS,
} from './camera';
import { CINEMATIC_PITCH } from './scene3d';

describe('rnOverview', () => {
  it('abre centrado no Rio Grande do Norte', () => {
    expect(rnOverview().center).toEqual(RN_CENTER);
  });

  it('abre reto, sem inclinacao nem giro', () => {
    const camera = rnOverview();
    expect(camera.pitch).toBe(0);
    expect(camera.bearing).toBe(0);
  });

  it('abre com o estado no quadro, nao no globo', () => {
    expect(rnOverview().zoom).toBeGreaterThan(5);
    expect(rnOverview().zoom).toBeLessThan(9);
  });
});

describe('destinationCamera', () => {
  it('centraliza nas coordenadas do destino', () => {
    expect(destinationCamera(-35.2, -5.79, 'cinematic').center).toEqual([-35.2, -5.79]);
  });

  it('inclina e gira a camera nos modos 3D', () => {
    for (const mode of ['cinematic', 'static3d'] as const) {
      const camera = destinationCamera(-35.2, -5.79, mode);
      expect(camera.pitch).toBe(CINEMATIC_PITCH);
      expect(camera.bearing).not.toBe(0);
    }
  });

  it('mantem a camera reta no fallback 2D', () => {
    const camera = destinationCamera(-35.2, -5.79, 'flat');
    expect(camera.pitch).toBe(0);
    expect(camera.bearing).toBe(0);
  });

  it('chega perto o bastante para ler o lugar', () => {
    expect(DESTINATION_ZOOM).toBeGreaterThan(RN_OVERVIEW_ZOOM);
    expect(destinationCamera(-35.2, -5.79, 'cinematic').zoom).toBe(DESTINATION_ZOOM);
  });
});

describe('flightDuration', () => {
  it('so voa no modo cinematografico', () => {
    expect(flightDuration('cinematic')).toBe(DESTINATION_FLY_DURATION_MS);
  });

  it('corta direto quando o usuario pediu menos movimento', () => {
    expect(flightDuration('static3d')).toBe(0);
  });

  it('corta direto no fallback 2D', () => {
    expect(flightDuration('flat')).toBe(0);
  });
});
