import type { RasterDEMSourceSpecification, SkySpecification } from 'maplibre-gl';

export const TERRAIN_SOURCE_ID = 'maptiler-terrain';

/**
 * O relevo do RN e baixo (dunas ~30-50m, falesias ~50m). Sem exagero,
 * a cena 3D fica visualmente identica a um mapa plano.
 */
export const TERRAIN_EXAGGERATION = 2.5;

/**
 * 60 e o maxPitch padrao do MapLibre. A documentacao classifica valores
 * acima disso como experimentais, entao nao subimos.
 */
export const CINEMATIC_PITCH = 60;

/** Duracao do mergulho ate a rota no modo cinematografico. */
export const CINEMATIC_FLY_DURATION_MS = 5500;

/** Duracao do enquadramento quando nao ha camera cinematografica. */
export const PLAIN_FIT_DURATION_MS = 1500;

export function buildStyleUrl(key: string): string {
  return `https://api.maptiler.com/maps/hybrid/style.json?key=${encodeURIComponent(key)}`;
}

export function buildTerrainSource(key: string): RasterDEMSourceSpecification {
  return {
    type: 'raster-dem',
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${encodeURIComponent(key)}`,
    encoding: 'mapbox',
  };
}

export function buildSky(): SkySpecification {
  return {
    'sky-color': '#0EA5E9',
    'horizon-color': '#FDE68A',
    'fog-color': '#F8FAFC',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.2,
    'atmosphere-blend': 0.8,
  };
}

/** Subconjunto do Map do MapLibre que a cena 3D precisa. Facilita o teste. */
export interface Scene3DTarget {
  getSource(id: string): unknown;
  addSource(id: string, source: RasterDEMSourceSpecification): unknown;
  setTerrain(options: { source: string; exaggeration?: number } | null): unknown;
  setSky(sky: SkySpecification): unknown;
  setProjection(projection: { type: 'globe' | 'mercator' }): unknown;
}

export interface Scene3DOptions {
  /**
   * O globo so compensa em enquadramento largo. De perto o MapLibre avisa
   * "terrain is not fully supported on vertical perspective projection" e o
   * relevo sai achatado — em mercator o terreno renderiza certo.
   */
  projection?: 'globe' | 'mercator';
}

export function apply3DScene(
  map: Scene3DTarget,
  key: string,
  { projection = 'globe' }: Scene3DOptions = {}
): void {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(TERRAIN_SOURCE_ID, buildTerrainSource(key));
  }
  map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
  map.setSky(buildSky());
  map.setProjection({ type: projection });
}
