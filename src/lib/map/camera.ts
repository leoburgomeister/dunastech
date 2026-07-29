import { type MapMode, is3D } from './mapMode';
import { CINEMATIC_PITCH } from './scene3d';

/**
 * Centro aproximado do Rio Grande do Norte.
 * O estado vai de ~-38.6 a ~-34.8 de longitude e ~-6.99 a ~-4.83 de latitude.
 */
export const RN_CENTER: [number, number] = [-36.7, -5.85];

/**
 * Abertura inicial: o estado inteiro no quadro, mas ja com algum zoom —
 * abrir no globo vazio faz o primeiro segundo parecer erro de carregamento.
 */
export const RN_OVERVIEW_ZOOM = 6.8;

/** Zoom de chegada quando a camera mergulha em um destino especifico. */
export const DESTINATION_ZOOM = 14.2;

/**
 * A camera chega de lado, nao de frente. Com bearing 0 e pitch 60 o relevo
 * fica achatado contra o horizonte e a cena perde a leitura de profundidade.
 */
export const DESTINATION_BEARING = -25;

/** Duracao do mergulho do estado ate o destino. */
export const DESTINATION_FLY_DURATION_MS = 6000;

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

/** Enquadramento de abertura: o estado inteiro, sempre reto. */
export function rnOverview(): CameraTarget {
  return {
    center: RN_CENTER,
    zoom: RN_OVERVIEW_ZOOM,
    pitch: 0,
    bearing: 0,
  };
}

/** Enquadramento de chegada em um destino. So inclina e gira em 3D. */
export function destinationCamera(
  longitude: number,
  latitude: number,
  mode: MapMode
): CameraTarget {
  return {
    center: [longitude, latitude],
    zoom: DESTINATION_ZOOM,
    pitch: is3D(mode) ? CINEMATIC_PITCH : 0,
    bearing: is3D(mode) ? DESTINATION_BEARING : 0,
  };
}

/**
 * So o modo cinematografico voa. Em static3d (prefers-reduced-motion) e em
 * flat a camera corta direto para o destino.
 */
export function flightDuration(mode: MapMode): number {
  return mode === 'cinematic' ? DESTINATION_FLY_DURATION_MS : 0;
}
