/**
 * Destinos que a home pode abrir. A cada carregamento a camera mergulha num
 * deles, para o site nao ser sempre a mesma imagem — quem volta ao POTI ve
 * outro pedaco do estado.
 *
 * A curadoria e visual, nao comercial: sao os atrativos que se leem de cima,
 * em imagem de satelite com relevo. Um museu ou um casario nao rende nada a
 * 700m de altitude, por mais importante que seja.
 */

import { destinosInfo, calcularISA } from '@/data/mockData';

export interface HeroSpot {
  nome: string;
  municipio: string;
  center: [number, number];
  /** Ajustado por atrativo: duna pede perto, salina e peninsula pedem longe. */
  zoom: number;
  /** 0-100, mesma escala do resto do app. */
  isa: number;
}

/** Faixas iguais as de getISABadge, para o pin nao contar outra historia. */
export type IsaBand = 'saudavel' | 'atencao' | 'critico';

export function isaBand(score: number): IsaBand {
  if (score >= 80) return 'saudavel';
  if (score >= 60) return 'atencao';
  return 'critico';
}

export const ISA_BAND_COLOR: Record<IsaBand, string> = {
  saudavel: '#22C55E',
  atencao: '#F0C75E',
  critico: '#F87171',
};

/**
 * Nome exato em destinosInfo e o zoom que enquadra bem cada um.
 * Ordem nao importa: o sorteio e uniforme.
 */
const CURADORIA: ReadonlyArray<{ nome: string; zoom: number }> = [
  // Campo de dunas moveis — o cartao-postal do estado.
  { nome: 'Dunas de Genipabu', zoom: 13.4 },
  // Recifes de coral: manchas turquesa em mar aberto, espetaculares de cima.
  { nome: 'Parrachos de Maracajaú', zoom: 13.0 },
  // Lagoa de agua doce cercada de duna branca, contraste altissimo.
  { nome: 'Lagoa de Pitangui', zoom: 13.8 },
  // Falesias e enseadas recortadas.
  { nome: 'Praia da Pipa', zoom: 13.6 },
  // Peninsula de areia entrando no mar — a forma faz o quadro.
  { nome: 'Galinhos', zoom: 12.6 },
  // Tanques de evaporacao: geometria e cor que so existem vistas de cima.
  { nome: 'Salinas e Indústria Salineira de Macau', zoom: 12.4 },
  // Duna encostada na cidade, silhueta reconhecivel na hora.
  { nome: 'Ponta Negra e Morro do Careca', zoom: 14.0 },
  // Relevo de verdade, onde o exagero de terreno 2.5x aparece.
  { nome: 'Canyon dos Apertados', zoom: 13.8 },
  // Litoral de vento, faixa de praia longa e limpa.
  { nome: 'São Miguel do Gostoso', zoom: 13.2 },
];

/**
 * Monta a lista a partir de destinosInfo — coordenadas e ISA nunca sao
 * copiados aqui, para nao divergirem da fonte. Nome que nao casar e
 * descartado em silencio: um item a menos no sorteio nao quebra a home.
 */
export function heroSpots(): HeroSpot[] {
  const out: HeroSpot[] = [];
  for (const { nome, zoom } of CURADORIA) {
    const d = destinosInfo.find((x) => x.nome === nome);
    if (!d) continue;
    out.push({
      nome: d.nome,
      municipio: d.municipio,
      center: [d.longitude, d.latitude],
      zoom,
      isa: calcularISA(d.nome, []),
    });
  }
  return out;
}

/**
 * Sorteia evitando repetir o anterior — sem isso, com 9 opcoes, recarregar
 * duas vezes cai no mesmo lugar com frequencia alta o bastante para parecer
 * que o sorteio nao existe.
 */
export function pickHeroSpot(
  spots: HeroSpot[],
  previousNome: string | null,
  random: () => number
): HeroSpot | null {
  if (spots.length === 0) return null;
  const pool =
    spots.length > 1 && previousNome
      ? spots.filter((s) => s.nome !== previousNome)
      : spots;
  const alvo = pool.length > 0 ? pool : spots;
  const i = Math.min(alvo.length - 1, Math.floor(random() * alvo.length));
  return alvo[i];
}

export const HERO_SPOT_STORAGE_KEY = 'poti_hero_spot_anterior';
