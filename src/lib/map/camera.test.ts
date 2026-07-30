import { describe, it, expect } from 'vitest';
import {
  rnOverview,
  destinationCamera,
  flightDuration,
  HERO_DESTINATION_ZOOM,
  HERO_FLY_DURATION_MS,
} from './camera';
import { CINEMATIC_PITCH, RN_CENTER, RN_OVERVIEW_ZOOM } from './scene3d';

describe('rnOverview', () => {
  it('abre no mesmo plano do estado que a home', () => {
    const camera = rnOverview();
    expect(camera.center).toEqual(RN_CENTER);
    expect(camera.zoom).toBe(RN_OVERVIEW_ZOOM);
  });

  it('abre reto: qualquer pitch afunila o estado e a forma deixa de ser lida', () => {
    const camera = rnOverview();
    expect(camera.pitch).toBe(0);
    expect(camera.bearing).toBe(0);
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

  it('desce mais que o plano de abertura', () => {
    expect(HERO_DESTINATION_ZOOM).toBeGreaterThan(RN_OVERVIEW_ZOOM);
    expect(destinationCamera(-35.2, -5.79, 'cinematic').zoom).toBe(HERO_DESTINATION_ZOOM);
  });
});

describe('flightDuration', () => {
  it('so voa no modo cinematografico', () => {
    expect(flightDuration('cinematic')).toBe(HERO_FLY_DURATION_MS);
  });

  it('corta direto quando o usuario pediu menos movimento', () => {
    expect(flightDuration('static3d')).toBe(0);
  });

  it('corta direto no fallback 2D', () => {
    expect(flightDuration('flat')).toBe(0);
  });
});
