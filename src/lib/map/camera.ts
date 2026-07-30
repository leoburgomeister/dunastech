import { type MapMode, is3D } from './mapMode';
import { CINEMATIC_PITCH, OPENING_FALLBACK_CAMERA } from './scene3d';

/**
 * Camera do hero da pagina de destino.
 *
 * O enquadramento de abertura e o mesmo da home (scene3d), para as duas telas
 * nascerem no mesmo plano do estado. O que muda e a chegada: aqui a camera
 * fecha em um destino unico, entao desce mais que o DESTINATION_ZOOM da home,
 * que enquadra um destino buscado sem sair do contexto da rota.
 */

/** Zoom de chegada do hero. Perto o bastante para ler o lugar. */
export const HERO_DESTINATION_ZOOM = 14.2;

/**
 * A camera chega de lado, nao de frente. Com bearing 0 e pitch 60 o relevo
 * fica achatado contra o horizonte e a cena perde a leitura de profundidade.
 */
export const HERO_BEARING = -25;

/** Duracao do mergulho do estado ate o destino, no hero. */
export const HERO_FLY_DURATION_MS = 6000;

/**
 * Arco baixo: o voo sobe pouco entre origem e destino e chega macio.
 * O padrao do MapLibre (1.42) da um "salto" visivel nessa distancia.
 */
export const FLY_CURVE = 1.25;

export interface CameraTarget {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * Enquadramento de abertura: o estado inteiro, sempre reto.
 *
 * Delega para `OPENING_FALLBACK_CAMERA` em vez de remontar os mesmos quatro
 * campos. Os dois nasceram iguais e em paralelo — este arquivo e o enquadramento
 * da home — e duas copias do mesmo plano acabariam divergindo na primeira vez
 * que alguem ajustasse so uma.
 *
 * A home nao usa esta funcao: la o plano aberto tem de descontar o painel
 * flutuante, e quem faz isso e `applyOpeningFraming`. Aqui o mapa ocupa o
 * container inteiro, entao centralizar no canvas e o certo.
 */
export function rnOverview(): CameraTarget {
  const { center, zoom, pitch, bearing } = OPENING_FALLBACK_CAMERA;
  return { center: [center[0], center[1]], zoom, pitch, bearing };
}

/** Enquadramento de chegada em um destino. So inclina e gira em 3D. */
export function destinationCamera(
  longitude: number,
  latitude: number,
  mode: MapMode
): CameraTarget {
  return {
    center: [longitude, latitude],
    zoom: HERO_DESTINATION_ZOOM,
    pitch: is3D(mode) ? CINEMATIC_PITCH : 0,
    bearing: is3D(mode) ? HERO_BEARING : 0,
  };
}

/**
 * So o modo cinematografico voa. Em static3d (prefers-reduced-motion) e em
 * flat a camera corta direto para o destino.
 */
export function flightDuration(mode: MapMode): number {
  return mode === 'cinematic' ? HERO_FLY_DURATION_MS : 0;
}
