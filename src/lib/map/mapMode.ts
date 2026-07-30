/**
 * Modo de renderizacao do mapa da home.
 * - flat:      mapa vetorial 2D (Carto), o que ja esta em producao hoje
 * - static3d:  cena 3D sem movimento de camera (prefers-reduced-motion)
 * - cinematic: cena 3D com mergulho e orbita lenta
 */
export type MapMode = 'flat' | 'static3d' | 'cinematic';

export interface MapModeInput {
  maptilerKey?: string;
  force2d?: boolean;
  prefersReducedMotion?: boolean;
}

export function resolveMapMode({
  maptilerKey,
  force2d = false,
  prefersReducedMotion = false,
}: MapModeInput): MapMode {
  if (force2d) return 'flat';
  if (!maptilerKey || maptilerKey.trim() === '') return 'flat';
  return prefersReducedMotion ? 'static3d' : 'cinematic';
}

export function is3D(mode: MapMode): boolean {
  return mode !== 'flat';
}
